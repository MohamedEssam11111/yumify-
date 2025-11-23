import express from "express";
import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Food from "../models/food.model.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get cart by customer ID
router.get("/", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id }).populate("items.food");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Add item to cart
router.post("/addToCart", protect, async (req, res) => {
  const { foodId, quantity, request } = req.body;
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ customer: userId });
    
    if (!cart) {
      cart = new Cart({ customer: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.food.toString() === foodId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
      if (request) cart.items[itemIndex].request = request;
    } else {
      cart.items.push({ food: foodId, quantity: quantity, request: request });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = cart._id;
    await cart.save();
    await user.save();
    
    // Populate before sending response
    await cart.populate("items.food");
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Checkout - Create order with sub-orders grouped by restaurant
router.post("/checkout", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { deliveryAddress, paymentMethod } = req.body;

    if (!deliveryAddress) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    const cart = await Cart.findOne({ customer: userId }).populate("items.food");
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Group cart items by restaurant
    const restaurantGroups = {};
    
    for (const item of cart.items) {
      // Skip if food item is null or doesn't exist
      if (!item || !item.food || !item.food._id) {
        continue;
      }

      const food = await Food.findById(item.food._id).populate("restaurant");
      if (!food || !food.restaurant || !food.restaurant._id) {
        continue; // Skip items without restaurant
      }

      const restaurantId = food.restaurant._id.toString();
      
      if (!restaurantGroups[restaurantId]) {
        restaurantGroups[restaurantId] = {
          restaurant: food.restaurant._id,
          items: [],
          subtotal: 0
        };
      }

      restaurantGroups[restaurantId].items.push({
        food: item.food._id,
        quantity: item.quantity || 1,
        request: item.request || ""
      });

      restaurantGroups[restaurantId].subtotal += (food.price || 0) * (item.quantity || 1);
    }

    // Check if we have any valid items after filtering
    if (Object.keys(restaurantGroups).length === 0) {
      return res.status(400).json({ 
        message: "No valid items in cart. Some items may no longer be available." 
      });
    }

    // Create sub-orders array
    const subOrders = Object.values(restaurantGroups);

    // Calculate total price
    const totalPrice = subOrders.reduce((sum, subOrder) => sum + (subOrder.subtotal || 0), 0);

    // Create new order with sub-orders
    const newOrder = new Order({
      customer: userId,
      subOrders: subOrders,
      totalPrice: totalPrice,
      deliveryAddress: deliveryAddress,
      paymentMethod: paymentMethod || "cash",
      overallStatus: "pending"
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

    // Populate order before sending response
    await newOrder.populate("subOrders.items.food");
    await newOrder.populate("subOrders.restaurant", "name logoUrl");

    res.status(201).json({ 
      message: "Checkout successful, order created", 
      order: newOrder 
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Remove item from cart
router.post("/removeFromCart", protect, async (req, res) => {
  const { foodId } = req.body;
  try {
    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    cart.items = cart.items.filter(item => item.food.toString() !== foodId);
    await cart.save();
    
    // Populate before sending response
    await cart.populate("items.food");
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;