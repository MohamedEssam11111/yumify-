import express from "express";
import Order from "../models/order.model.js";
import { protect } from "../middlewares/auth.middleware.js";
import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";

const router = express.Router();

// Get all orders (for admin/owner to see their restaurant's orders)
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    let orders;
    if (user.role === "owner") {
      // Owner sees only orders for their restaurant
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      orders = await Order.find({ "subOrders.restaurant": restaurant._id })
        .populate("customer", "name email phone")
        .populate("subOrders.items.food")
        .populate("subOrders.restaurant", "name")
        .sort({ createdAt: -1 });
    } else {
      // Admin sees all orders
      orders = await Order.find()
        .populate("customer", "name email phone")
        .populate("subOrders.items.food")
        .populate("subOrders.restaurant", "name")
        .sort({ createdAt: -1 });
    }
    
    res.json(orders);
  } catch (error) {
    console.error("Error in GET / (order.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get customer's orders
router.get('/getOrders', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ customer: userId })
      .populate("subOrders.items.food")
      .populate("subOrders.restaurant", "name logoUrl")
      .sort({ createdAt: -1 });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error in GET /getOrders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Track specific order
router.get('/trackOrder/:orderId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const orderId = req.params.orderId;

    const order = await Order.findOne({
      _id: orderId,
      customer: userId
    })
      .populate("subOrders.items.food")
      .populate("subOrders.restaurant", "name logoUrl phone address")
      .populate("customer", "name email phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error in GET /trackOrder/:orderId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update sub-order status (for restaurant owners)
router.patch('/subOrder/:orderId/:subOrderId/status', protect, async (req, res) => {
  try {
    const { orderId, subOrderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const subOrder = order.subOrders.id(subOrderId);
    if (!subOrder) {
      return res.status(404).json({ message: "Sub-order not found" });
    }

    // Verify owner owns this restaurant
    const restaurant = await Restaurant.findById(subOrder.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    subOrder.status = status;
    order.updateOverallStatus();
    await order.save();

    res.status(200).json({ message: "Sub-order status updated", order });
  } catch (error) {
    console.error("Error in PATCH /subOrder/:orderId/:subOrderId/status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Customer marks order as delivered (for entire order)
router.patch('/deliveredOrder/:orderId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const orderId = req.params.orderId;

    const order = await Order.findOne({
      _id: orderId,
      customer: userId
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Mark all sub-orders as delivered
    order.subOrders.forEach(subOrder => {
      subOrder.status = "delivered";
    });
    order.overallStatus = "completed";
    
    await order.save();

    res.status(200).json({ message: "Order marked as delivered", order });
  } catch (error) {
    console.error("Error in PATCH /deliveredOrder/:orderId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Cancel sub-order (customer can cancel before confirmed)
router.patch('/cancelSubOrder/:orderId/:subOrderId', protect, async (req, res) => {
  try {
    const { orderId, subOrderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({
      _id: orderId,
      customer: userId
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const subOrder = order.subOrders.id(subOrderId);
    if (!subOrder) {
      return res.status(404).json({ message: "Sub-order not found" });
    }

    if (!['pending', 'confirmed'].includes(subOrder.status)) {
      return res.status(400).json({ 
        message: "Cannot cancel order - already in progress" 
      });
    }

    subOrder.status = "cancelled";
    order.updateOverallStatus();
    await order.save();

    res.status(200).json({ message: "Sub-order cancelled", order });
  } catch (error) {
    console.error("Error in PATCH /cancelSubOrder:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get orders for a specific restaurant (owner view)
router.get('/restaurant/:restaurantId', protect, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Verify owner owns this restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const orders = await Order.find({ "subOrders.restaurant": restaurantId })
      .populate("customer", "name email phone")
      .populate("subOrders.items.food")
      .sort({ createdAt: -1 });

    // Filter to show only this restaurant's sub-orders
    const filteredOrders = orders.map(order => ({
      ...order.toObject(),
      subOrders: order.subOrders.filter(
        sub => sub.restaurant.toString() === restaurantId
      )
    }));

    res.status(200).json(filteredOrders);
  } catch (error) {
    console.error("Error in GET /restaurant/:restaurantId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;