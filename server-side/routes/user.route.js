import e from "express";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/tokenGen.util.js";
import { protect } from "../middlewares/auth.middleware.js";
import Notification from "../models/notification.model.js";
import upload from "../middlewares/upload.middleware.js";
import verifyToken from "../utils/tokenVerify.util.js";
import Restaurant from "../models/restaurant.model.js";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import Staff from "../models/staff.model.js";
import Food from "../models/food.model.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.util.js";


const router = e.Router();


// Route to register a new user
router.post("/register", async (req, res) => {
  const { name, email, password, address, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      address,
      role,
      isVerified: false,
      verifyToken: token,
      verifyTokenExpiry: tokenExpiration
    });

    await newUser.save();

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


    const verificationUrl = `http://localhost:5000/api/user/verify/${token}`;
    await sendEmail(
      email,
      "Email Verification",
      `Please verify your email by clicking here : ${verificationUrl}`
    );

    return res.status(201).json({
      message: "Registered successfully, verification email sent",
    });
  } catch (error) {
    console.error("Error in POST /register:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.patch('/modifyUserData', protect, async (req, res) => {
  try {
    const { name, email, address } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.address = address || user.address;
    await user.save();

    return res.status(200).json({ message: "User data updated successfully" });
  } catch (error) {
    console.error("Error in PATCH /modifyUserData:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
})


router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verifyToken: token });

    if (!user) {
      return res.status(404).json({ message: "Invalid verification token" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (user.verifyTokenExpiry < Date.now()) {
      return res.status(400).json({ message: "Verification token expired" });
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error in GET /verify/:token:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/resend-verification", async (req, res) => {
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

    const verificationUrl = `http://localhost:5000/api/user/verify/${token}`;

    await sendEmail(
      user.email,
      "Resend Email Verification",
      `Please verify your email by clicking here: ${verificationUrl}`
    );

    return res.status(200).json({ 
      message: "Verification email resent successfully" 
    });

  } catch (error) {
    console.error("Error in POST /resend-verification:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000;

    user.passwordResetToken = token;
    user.passwordResetTokenExpiry = tokenExpiration;
    await user.save();

    const resetPasswordUrl = `http://localhost:5000/api/user/reset-password/${token}`;

    await sendEmail(
      user.email,
      "Reset Password",
      `Please reset your password by clicking here: ${resetPasswordUrl}`
    );


    return res.status(200).json({ 
      message: "Password reset email sent successfully" 
    });

  } catch (error) {
    console.error("Error in POST /forgot-password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
})

router.get("/reset-password/:token", async (req, res) => {
  const { token } = req.params;

  try {

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // مسح التوكن بعد الاستخدام
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }); // Find user by email
    if (!user) {
      // User not found
      return res.status(400).json({ message: "Invalid email or password" }); //invalid credentials
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
});



router.patch('/addUserData', protect, async (req, res) => {
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
    }
    catch (error) {
        console.error("Error in PATCH /addUserData:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.put("/updatePassword", protect, async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    const token = verifyToken(req.cookies.token);
    const user = await User.findById(token.id);
    if (!password && !newPassword) {
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
});

router.get('/owner/restaurant', protect, async (req, res) => {
  try {
      const user = req.user;
      const restaurant = await Restaurant.findOne({ owner: user._id });
      if (!restaurant) {
          return res.status(404).json({ message: "Restaurant not found" });
      }
      res.status(200).json(restaurant);
  }
  catch (error) {
      console.error("Error in GET /profile (user.route):", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/dashboard/:restaurantId", async (req, res) => {
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
          (sub) => sub.restaurant.toString() === restaurantId
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
        (sub) => sub.restaurant.toString() === restaurantId
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
          (7 * 24 * 60 * 60 * 1000)
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
      })
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
        (sub) => sub.restaurant.toString() === restaurantId
      )
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
});


router.get("/profile", protect, async (req, res) => {
  try {
    const token = verifyToken(req.cookies.token);
    const user = await User.findById(token.id).select("-password").populate('restaurant');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in GET /profile (user.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// route to add profile pic
router.put("/addUserProfile", upload.single("profile"), async (req, res) => {
  try {
    const imageUrl = req.file ? req.file.filename : null;
    let token = verifyToken(req.cookies.token);
    console.log("sent profile:", imageUrl);
    const user = await User.findByIdAndUpdate(
      token.id,
      { $set: { imageUrl: imageUrl } },
      { new: true }
    );
    res.status(200).json({ message: "profile has been uploead for", user });
  } catch (error) {
    console.error("Error in POST /addUserProfile  (user.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/authUser", (req, res) => {
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
});

router.get("/userFavourites", protect,  async (req, res) => {
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
});

// add a food item to user's favorites
router.post("/toggleFavourites", protect, async (req, res) => {
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

    const index = user.favourites.findIndex(fav => fav.equals(foodObjId));

    if (index !== -1) {
      user.favourites.splice(index, 1); // remove
      await user.save();
      return res.status(200).json({ message: "Food removed from favourites", favourites: user.favourites });
    }

    user.favourites.push(foodObjId); // add
    await user.save();

    res.status(200).json({ message: "Food added to favourites", favourites: user.favourites });

  } catch (error) {
    console.error("Error in POST /toggleFavourites:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get('/getNotification', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('notifications');
    res.status(200).json(user)
  } catch (error) {
    console.error("Error in GET /getNotification (user.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
})
router.patch('/markAsRead',(req, res) => {
  try {
    const { notificationId } = req.body;
    const notification = Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.isRead = true;
    notification.save();
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error in POST /markAsRead (user.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
})

router.patch('/markAllAsRead', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.notifications.forEach((notification) => {
      notification.isRead = true;
    });
    await user.save();
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error in POST /markAllAsRead (user.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
})


// user logout route
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logout successful" });
});

export default router;
