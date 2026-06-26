import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getAllNotifications,
  getUnreadNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Get all notifications for current user
router.get("/", protect, getAllNotifications);

// Get unread notifications count
router.get("/unread-count", protect, getUnreadNotifications);

// Create a notification (typically called by system/admin)
router.post("/create", protect, createNotification);

// Mark notification as read
router.patch("/:notificationId/read", protect, markNotificationAsRead);

// Mark all notifications as read
router.patch("/read-all", protect, markAllNotificationsAsRead);

// Delete notification
router.delete("/:notificationId", protect, deleteNotification);

// clear all notifications
router.delete("/clear-all", protect, clearAllNotifications);
export default router;
