import Notification from "../models/notification.model.js";
import { protect } from "../middlewares/auth.middleware.js";

// Get all notifications for current user
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in GET / (notification.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get unread notifications count
export const getUnreadNotifications = async (req, res) => {
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
};

// Create a notification (typically called by system/admin)
export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type = "system" } = req.body;

    const newNotification = new Notification({
      user: userId || req.user._id,
      title,
      message,
      type,
    });

    await newNotification.save();

    res.status(201).json(newNotification);
  } catch (error) {
    console.error("Error in POST /create:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
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
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true },
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error in PATCH /read-all:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
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
};

// clear all notifications
export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({
      user: req.user._id,
    });

    res.status(200).json({
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /clear-all:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
