import e from "express";
import mongoose, { Mongoose } from "mongoose";
import userSchema from "../models/user.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/tokenGen.util.js";
import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import verifyToken from "../utils/tokenVerify.util.js";
import restaurantSchema from "../models/restaurant.model.js";
import orderSchema from "../models/order.model.js";

const router = e.Router();

// Create User Model
const User = mongoose.model("User", userSchema);
const Order = mongoose.model("Order", orderSchema);
const Restaurant = mongoose.model("Restaurant", restaurantSchema);

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
    const hashedPassword = await bcrypt.hash(password, 10);
    if (role === "owner") {
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        address,
        role,
      });
      await newUser.save();
      const newRestaurant = new Restaurant({
        name: `${name}'s Restaurant`,
        owner: newUser._id,
        menu: [],
      });
      await newRestaurant.save();
      newUser.restaurant = newRestaurant._id;
      await newUser.save();
      return res.status(201).json({
        message: "Owner registered successfully with restaurant",
      });
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      address,
      role,
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in POST /register (user.route):", error);
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

router.patch('/deliveredOrder/:orderId', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const orderId = req.params.orderId;
        const {orderStatus} = req.body.orderStatus;
        const order = await Order.findOne({
            _id: orderId,
            customer: userId
        });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        order.status = orderStatus || "delivered";
        await order.save();
        res.status(200).json({ message: "Order marked as delivered", order });
    }
    catch (error) {
        console.error("Error in PATCH /deliveredOrder/:orderId:", error);
        res.status(500).json({ message: "Server error", error: error.message });
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

router.get('/getOrders',protect,async(req,res)=>{
    try{
        const userId = req.user._id;
        const user = await User.findById(userId).populate('orders');
        res.status(200).json(user)
    }catch(error){
        console.error("Error in GET /orders (user.route):", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
})

router.get('/trackOrder/:orderId', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const orderId = req.params.orderId;

        const order = await Order.findOne({
            _id: orderId,
            customer: userId
        }).populate('items.food');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);

    } catch (error) {
        console.error("Error in GET /trackOrder/:orderId:", error);
        res.status(500).json({ message: "Server error", error: error.message });
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

    // تأكد favorites array
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

// router.get("/getOwnerOrders", protect, async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const orders = await Order.find({ restaurantOwner: userId }).populate('customer').populate('items.food');
//     res.status(200).json(orders);
//   } catch (error) {
//     console.error("Error in GET /getOwnerOrders:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });


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
