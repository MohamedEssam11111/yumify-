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




router.get("/profile", protect, async (req, res) => {
  try {
    const token = verifyToken(req.cookies.token);
    const user = await User.findById(token.id).select("-password");
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
