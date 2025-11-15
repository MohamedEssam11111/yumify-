import e from "express";
import mongoose from "mongoose";
import cartSchema from "../models/cart.model.js";
import userSchema from "../models/user.model.js";
import orderSchema from "../models/order.model.js";
import { protect } from "../middlewares/auth.middleware.js";


const router = e.Router();

// Create Cart Model
const Cart = mongoose.model("Cart", cartSchema);
const User = mongoose.model("User", userSchema);
const Order = mongoose.model("Order", orderSchema);

// Route to get cart by customer ID
router.get("/", protect ,async (req, res) => {
    try {
        // gets food details => gets the customer's cart => populates food details
        const cart = await Cart.findOne({ customer: req.user._id }).populate("items.food"); 
        if (!cart) {
            // If no cart found return empty cart message
            return res.status(404).json({ message: "Cart not found" });
        }
        res.json(cart); // Return the cart details
    } catch (error) {
        res.status(500).json({ message: "Server error", error }); //handle server errors
    }
});

// Route to add item to cart
router.post("/addToCart",protect, async (req, res) => {
    const { foodId, quantity , request } = req.body;
    try {
        const userId = req.user._id; // Verify token and get user ID
        console.log("User ID from token:", userId);
        let cart = await Cart.findOne({ customer: userId }); // Find cart by customer ID
        if (!cart) { // If no cart exists, create a new one
            cart = new Cart({ customer: userId, items: [] });
        }
        // Check if item already exists in cart and update quantity if it does and add new item if it doesn't
        const itemIndex = cart.items.findIndex(item => item.food.toString() === foodId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ food: foodId, quantity: quantity , request: request });
        }
        // Save the updated cart
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Save cart into user's cart field
        user.cart = cart._id;
        await cart.save();

        await user.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// route to reset cart and create an order to store past orders
router.post("/checkout", protect ,async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ customer: userId }).populate("items.food");
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        // Calculate total price
        const totalPrice = cart.items.reduce((total, item) => total + item.food.price * item.quantity, 0);
        // Create new order
        const newOrder = new Order({
            customer: userId,
            items: cart.items,
            totalPrice: totalPrice,
            deliveryAddress: req.body.deliveryAddress,
        });
        await newOrder.save();
        // Add order to user's orders array
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.orders.push(newOrder._id);
        await user.save();
        // Clear cart
        cart.items = [];
        await cart.save();
        res.json({ message: "Checkout successful, cart cleared." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Route to remove item from cart
router.post("/removeFromCart", protect ,async (req, res) => {
    const { foodId } = req.body;
    try { //same as above but removes item from cart

        const cart = await Cart.findOne({ customer: req.user._id }).populate("items.food");
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        cart.items = cart.items.filter(item => item.food._id.toString() !== foodId);
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});



export default router;
