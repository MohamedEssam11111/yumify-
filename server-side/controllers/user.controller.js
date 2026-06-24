import mongoose from "mongoose";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import Restaurant from "../models/restaurant.model.js";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import Staff from "../models/staff.model.js";
import Food from "../models/food.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.util.js";
import generateToken from "../utils/tokenGen.util.js";
import verifyToken from "../utils/tokenVerify.util.js";
import { verificationEmailTemplate } from "../utils/emailTemplates.util.js";
import { resetPasswordTemplate } from "../utils/emailTemplates.util.js";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"; // Default to localhost if CLIENT_URL is not set

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verifyToken: token,
      verifyTokenExpiry: tokenExpiration,
    });

    await newUser.save();

    // Create default restaurant for owners
    if (role === "owner") {
      const newRestaurant = new Restaurant({
        name: `${name}'s Restaurant`,
        owner: newUser._id,
        menu: [],
      });

      await newRestaurant.save();

      newUser.restaurant = newRestaurant._id;
      await newUser.save();
    }

    const verificationUrl = `${CLIENT_URL}/verify-email/${token}`;

    // Email sending should NOT break registration
    try {
      await sendEmail(
        email,
        "Verify Your Yumify Account",
        verificationEmailTemplate(name, verificationUrl),
      );

      console.log("Verification email sent successfully");
    } catch (emailError) {
      console.error("EMAIL ERROR:", emailError.message);

      // Optional debug logs
      console.log("EMAIL:", process.env.EMAIL);
      console.log("EMAIL_PASS EXISTS:", !!process.env.EMAIL_PASS);
    }

    return res.status(201).json({
      message: "User registered successfully",
      emailSent: true,
    });
  } catch (error) {
    console.error("Error in POST /register:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const modifyUser = async (req, res) => {
  try {
    const { name, address } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    user.name = name || user.name;
    user.address = address || user.address;
    if (!name && !address) {
      return res.status(400).json({
        message: "Nothing to update",
      });
    }
    await user.save();

    return res.status(200).json({ message: "User data updated successfully" });
  } catch (error) {
    console.error("Error in PATCH /modifyUserData:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      verifyToken: token,
    });

    // Invalid token
    if (!user) {
      return res.status(404).json({
        success: false,
        status: "invalid",
        message: "The verification link is invalid or has already been used.",
      });
    }

    // Already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        status: "already-verified",
        message: "Your email has already been verified. You can login now.",
      });
    }

    // Token expired
    if (user.verifyTokenExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        status: "expired",
        message:
          "Your verification link has expired. Please request a new verification email.",
      });
    }

    // Verify user
    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      status: "verified",
      message:
        "Email verified successfully. You can now login to your account.",
    });
  } catch (error) {
    console.error("Error in GET /verify/:token:", error);

    return res.status(500).json({
      success: false,
      status: "server-error",
      message: "Something went wrong. Please try again later.",
    });
  }
};

export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000;

    user.verifyToken = token;
    user.verifyTokenExpiry = tokenExpiration;
    await user.save();

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    await sendEmail(
      email,
      "Verify Your Yumify Account",
      verificationEmailTemplate(user.name, verificationUrl),
    );

    return res.status(200).json({
      message: "Verification email resent successfully",
    });
  } catch (error) {
    console.error("Error in POST /resend-verification:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    console.log("STEP 2 - TOKEN GENERATED");

    user.passwordResetToken = token;
    user.passwordResetTokenExpiry = tokenExpiration;

    await user.save();
    console.log("STEP 3 - USER SAVED");

    const savedUser = await User.findById(user._id);

    console.log("TOKEN IN DB:", savedUser.passwordResetToken);
    console.log("EXPIRY IN DB:", savedUser.passwordResetTokenExpiry);

    const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    console.log("RESET URL:", resetPasswordUrl);
    console.log("Sending verification email to:", user.email);
    await sendEmail(
      user.email,
      "Reset Your Yumify Password",
      resetPasswordTemplate(user.name, resetPasswordUrl),
    );
    console.log("STEP 4 - EMAIL SENT");

    return res.status(200).json({
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Error in POST /forgot-password:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getResetPassword = async (req, res) => {
  console.log("ROUTE HIT");
  const { token } = req.params;

  console.log("========== RESET PASSWORD ==========");
  console.log("TOKEN:", token);

  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpiry: { $gt: Date.now() },
    });

    console.log("FOUND USER:", user);

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    console.log("TOKEN IS VALID");
    res.status(200).json({
      message: "Token is valid",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const postResetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // مسح التوكن بعد الاستخدام
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }); // Find user by email
    if (!user) {
      // User not found
      return res.status(400).json({ message: "Invalid email or password" }); //invalid credentials
    }
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first ,check your inbox",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password); // Compare passwords provided and stored
    if (!isPasswordValid) {
      // Passwords do not match
      return res.status(400).json({ message: "Invalid email or password" });
    }
    let tokenGenerated = generateToken(res, user);
    res
      .status(200)
      .json({ message: "Login successful", tokenGenerated, role: user.role });
  } catch (error) {
    // Handle server errors
    console.error("Error in POST /login (user.route):", error);
    res.status(500).json({ message: "Server error", error: error.message }); // Handle server errors
  }
};

export const addUserData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { phone, address } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.phone = phone || user.phone;
    user.address = address || user.address;
    await user.save();
    res.status(200).json({ message: "User data updated successfully", user });
  } catch (error) {
    console.error("Error in PATCH /addUserData:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    const token = verifyToken(req.cookies.token);
    const user = await User.findById(token.id);
    if (!password || !newPassword) {
      return res.status(400).json({ message: "please send both passwords" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "password is incorrect" });
    }
    const newPasswordHashed = await bcrypt.hash(newPassword, 10);
    await user.updateOne({ $set: { password: newPasswordHashed } });
    console.log("done");
    res.status(200).json("password have changed correctly");
  } catch (error) {
    console.error("Error in PUT /updtaePassword", error);
    res.status(500);
  }
};

export const getOwnerRestaurant = async (req, res) => {
  try {
    const user = req.user;
    const restaurant = await Restaurant.findOne({ owner: user._id });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.status(200).json(restaurant);
  } catch (error) {
    console.error("Error in GET /profile (user.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRestaurantDashboardDetails = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Get restaurant with populated data
    const restaurant = await Restaurant.findById(restaurantId)
      .populate("owner", "name email phone")
      .populate("menu")
      .lean();

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Get all orders containing this restaurant's sub-orders
    const allOrders = await Order.find({
      "subOrders.restaurant": restaurantId,
    })
      .populate("customer", "name email")
      .lean();

    // Calculate date ranges
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Filter orders for today
    const ordersToday = allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today && orderDate < tomorrow;
    });

    // Calculate statistics from sub-orders
    let totalOrders = 0;
    let completedOrders = 0;
    let pendingOrders = 0;
    let totalRevenue = 0;

    allOrders.forEach((order) => {
      order.subOrders.forEach((subOrder) => {
        if (subOrder.restaurant.toString() === restaurantId) {
          totalOrders++;
          if (subOrder.status === "delivered") {
            completedOrders++;
            totalRevenue += subOrder.subtotal || 0;
          }
          if (subOrder.status === "pending") {
            pendingOrders++;
          }
        }
      });
    });

    // Calculate today's revenue
    let revenueToday = 0;
    ordersToday.forEach((order) => {
      order.subOrders.forEach((subOrder) => {
        if (
          subOrder.restaurant.toString() === restaurantId &&
          subOrder.status === "delivered"
        ) {
          revenueToday += subOrder.subtotal || 0;
        }
      });
    });

    // Get recent orders (last 10) that contain this restaurant's sub-orders
    const recentOrders = allOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((order) => {
        // Find this restaurant's sub-order
        const restaurantSubOrder = order.subOrders.find(
          (sub) => sub.restaurant.toString() === restaurantId,
        );
        return {
          _id: order._id,
          customer: order.customer,
          items: restaurantSubOrder?.items || [],
          subtotal: restaurantSubOrder?.subtotal || 0,
          status: restaurantSubOrder?.status || "pending",
          createdAt: order.createdAt,
        };
      });

    // Orders by hour (last 24 hours)
    const ordersByHour = Array.from({ length: 24 }, () => 0);
    ordersToday.forEach((order) => {
      const hasRestaurantOrder = order.subOrders.some(
        (sub) => sub.restaurant.toString() === restaurantId,
      );
      if (hasRestaurantOrder) {
        const hour = new Date(order.createdAt).getHours();
        ordersByHour[hour]++;
      }
    });

    // Get last 12 hours
    const last12Hours = [];
    for (let i = 11; i >= 0; i--) {
      const hour = (now.getHours() - i + 24) % 24;
      last12Hours.push(ordersByHour[hour]);
    }

    // Revenue by day (last 7 days)
    const revenueByDay = [];
    const revenueLabels = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const label = date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      revenueLabels.push(label);

      let dayRevenue = 0;
      allOrders.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        if (orderDate >= date && orderDate < nextDate) {
          order.subOrders.forEach((subOrder) => {
            if (
              subOrder.restaurant.toString() === restaurantId &&
              subOrder.status === "delivered"
            ) {
              dayRevenue += subOrder.subtotal || 0;
            }
          });
        }
      });
      revenueByDay.push(Math.round(dayRevenue));
    }

    // Weekly revenue (last 5 weeks)
    const weeklyRevenue = [];
    const weeklyLabels = [];
    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekNumber = Math.ceil(
        (weekStart - new Date(weekStart.getFullYear(), 0, 1)) /
          (7 * 24 * 60 * 60 * 1000),
      );
      weeklyLabels.push(`Wk ${weekNumber}`);

      let weekRevenue = 0;
      allOrders.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        if (orderDate >= weekStart && orderDate < weekEnd) {
          order.subOrders.forEach((subOrder) => {
            if (
              subOrder.restaurant.toString() === restaurantId &&
              subOrder.status === "delivered"
            ) {
              weekRevenue += subOrder.subtotal || 0;
            }
          });
        }
      });
      weeklyRevenue.push(Math.round(weekRevenue));
    }

    // Top items (by quantity)
    const itemCount = new Map();
    allOrders.forEach((order) => {
      order.subOrders.forEach((subOrder) => {
        if (subOrder.restaurant.toString() === restaurantId) {
          subOrder.items.forEach((item) => {
            const foodId = item.food.toString();
            const quantity = item.quantity || 1;
            itemCount.set(foodId, (itemCount.get(foodId) || 0) + quantity);
          });
        }
      });
    });

    const topItemIds = Array.from(itemCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topItems = await Promise.all(
      topItemIds.map(async ([foodId, qty]) => {
        const food = await Food.findById(foodId).select("name").lean();
        return { name: food?.name || "Unknown", qty };
      }),
    );

    // Order status distribution
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      "on the way": 0,
      delivered: 0,
      cancelled: 0,
    };

    allOrders.forEach((order) => {
      order.subOrders.forEach((subOrder) => {
        if (subOrder.restaurant.toString() === restaurantId) {
          if (statusCounts[subOrder.status] !== undefined) {
            statusCounts[subOrder.status]++;
          }
        }
      });
    });

    const orderStatusDistribution = Object.entries(statusCounts)
      .filter(([_, value]) => value > 0)
      .map(([label, value]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value,
      }));

    // Get staff count
    const allStaff = await Staff.find({ restaurant: restaurantId }).lean();
    const activeStaff = allStaff.filter((s) => s.status === "active");

    // Staff on duty (based on shift and current time)
    const currentHour = now.getHours();
    const staffOnDuty = activeStaff.filter((s) => {
      if (s.shift === "full_day" || s.shift === "flexible") return true;
      if (s.shift === "morning") return currentHour >= 6 && currentHour < 15;
      if (s.shift === "evening") return currentHour >= 15 && currentHour < 24;
      return false;
    }).length;

    // Get reviews
    const reviews = await Review.find({ restaurant: restaurantId })
      .populate("user", "name")
      .populate("food", "name")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const allReviews = await Review.find({ restaurant: restaurantId }).lean();
    const totalReviews = allReviews.length;
    const averageRating =
      totalReviews > 0
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews
        : 0;

    const positiveReviews = allReviews.filter((r) => r.rating >= 4).length;
    const positivePercentage =
      totalReviews > 0 ? (positiveReviews / totalReviews) * 100 : 0;

    // Latest review time
    let latestReviewTime = "";
    if (reviews.length > 0) {
      const timeDiff = Date.now() - new Date(reviews[0].createdAt).getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      if (hours > 0) {
        latestReviewTime = `${hours} hour${hours > 1 ? "s" : ""} ago`;
      } else if (minutes > 0) {
        latestReviewTime = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
      } else {
        latestReviewTime = "Just now";
      }
    }

    // Average order value (today)
    const todaySubOrders = ordersToday.flatMap((order) =>
      order.subOrders.filter(
        (sub) => sub.restaurant.toString() === restaurantId,
      ),
    );
    const avgOrderValue =
      todaySubOrders.length > 0
        ? todaySubOrders.reduce((sum, sub) => sum + (sub.subtotal || 0), 0) /
          todaySubOrders.length
        : 0;

    res.status(200).json({
      success: true,
      data: {
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          logoUrl: restaurant.logoUrl,
          rating: restaurant.rating,
          owner: restaurant.owner,
          createdAt: restaurant.createdAt,
        },
        statistics: {
          ordersToday: ordersToday.length,
          pendingOrders,
          revenue: Math.round(revenueToday * 100) / 100,
          totalOrders,
          completedOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          staff: {
            total: allStaff.length,
            active: activeStaff.length,
            inactive: allStaff.length - activeStaff.length,
            onDuty: staffOnDuty,
          },
          menu: {
            total: restaurant.menu.length,
          },
          reviews: {
            total: totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            positivePercentage: Math.round(positivePercentage * 10) / 10,
            latestReviewTime,
          },
        },
        charts: {
          ordersByHour: last12Hours,
          revenueByDay,
          revenueLabels,
          weeklyRevenue,
          weeklyLabels,
          orderStatusDistribution,
        },
        topItems,
        recentOrders,
        recentReviews: reviews.slice(0, 3),
      },
    });
  } catch (error) {
    console.error("Error fetching restaurant dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant dashboard",
      error: error.message,
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const token = verifyToken(req.cookies.token);
    const user = await User.findById(token.id)
      .select("-password")
      .populate("restaurant");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in GET /profile (user.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// route to add profile pic
export const addProfilePic = async (req, res) => {
  try {
    const imageUrl = req.file ? req.file.filename : null;
    let token = verifyToken(req.cookies.token);
    console.log("sent profile:", imageUrl);
    const user = await User.findByIdAndUpdate(
      token.id,
      { $set: { imageUrl: imageUrl } },
      { new: true },
    );
    res.status(200).json({ message: "profile has been uploead for", user });
  } catch (error) {
    console.error("Error in POST /addUserProfile  (user.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAuthUser = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "not authed" });
  }
  try {
    const tokenDecod = verifyToken(token);
    return res.json(tokenDecod);
  } catch (err) {
    return res.status(401).json({ message: "invalid Token" });
  }
};

export const getUserFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favourites");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ favourites: user.favourites });
  } catch (error) {
    console.error("Error in GET /userFavourites:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// add a food item to user's favorites
export const addUserFavorite = async (req, res) => {
  try {
    const { foodId } = req.body;
    if (!foodId) return res.status(400).json({ message: "foodId is required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!Array.isArray(user.favourites)) user.favourites = [];

    let foodObjId;
    try {
      foodObjId = new mongoose.Types.ObjectId(foodId);
    } catch {
      return res.status(400).json({ message: "Invalid foodId" });
    }

    const index = user.favourites.findIndex((fav) => fav.equals(foodObjId));

    if (index !== -1) {
      user.favourites.splice(index, 1); // remove
      await user.save();
      return res.status(200).json({
        message: "Food removed from favourites",
        favourites: user.favourites,
      });
    }

    user.favourites.push(foodObjId); // add
    await user.save();

    res.status(200).json({
      message: "Food added to favourites",
      favourites: user.favourites,
    });
  } catch (error) {
    console.error("Error in POST /toggleFavourites:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("notifications");
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in GET /getNotification (user.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// mark as red
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error in POST /markAsRead (user.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// mark all notification as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await Notification.updateMany(
      { _id: { $in: user.notifications } },
      { $set: { isRead: true } },
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error in PATCH /markAllAsRead:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// user logout route
export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ message: "Logout successful" });
};

// delete user account
export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Customer
    if (user.role === "customer") {
      await User.findByIdAndDelete(userId);

      res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      return res.status(200).json({
        message: "Account deleted successfully",
      });
    }

    // Owner
    if (user.role === "owner") {
      const restaurant = await Restaurant.findOne({
        owner: userId,
      });

      if (restaurant) {
        return res.status(400).json({
          code: "RESTAURANT_EXISTS",
          message:
            "You must delete your restaurant before deleting your account",
        });
      }

      await User.findByIdAndDelete(userId);

      res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      return res.status(200).json({
        message: "Account deleted successfully",
      });
    }

    return res.status(403).json({
      message: "Invalid user role",
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
