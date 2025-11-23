import express from "express";
import Notification from "../models/notification.model.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get all notifications for current user
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in GET / (notification.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get unread notifications count
router.get("/unread-count", protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error in GET /unread-count:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create a notification (typically called by system/admin)
router.post("/create", protect, async (req, res) => {
  try {
    const { userId, message } = req.body;

    const newNotification = new Notification({
      user: userId || req.user._id,
      message,
    });

    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    console.error("Error in POST /create:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Mark notification as read
router.patch("/:notificationId/read", protect, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error in PATCH /:notificationId/read:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Mark all notifications as read
router.patch("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error in PATCH /read-all:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete notification
router.delete("/:notificationId", protect, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /:notificationId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;