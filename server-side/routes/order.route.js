import e from "express";
import Order from "../models/order.model.js";
import { protect } from "../middlewares/auth.middleware.js";
import User from "../models/user.model.js";



const router = e.Router();


// Route to get all orders
router.get("/", protect, async (req, res) => {
    try {
        const orders = await Order.find().populate("customer").populate("items.food");
        res.json(orders);
    } catch (error) {
        console.error("Error in GET / (order.route):", error);
        res.status(500).json({ message: "Server error", error: error.message });
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
        }).populate("items.food").populate("customer");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);

    } catch (error) {
        console.error("Error in GET /trackOrder/:orderId:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;