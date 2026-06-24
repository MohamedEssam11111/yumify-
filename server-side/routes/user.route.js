import e from "express";
import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import validateRegister from "../middlewares/validateRegister.js";
import ownerMiddleware from "../middlewares/ownerMiddleware.js";

import {
  registerUser,
  modifyUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  getResetPassword,
  postResetPassword,
  loginUser,
  addUserData,
  updatePassword,
  getOwnerRestaurant,
  getRestaurantDashboardDetails,
  getUserProfile,
  addProfilePic,
  getAuthUser,
  getUserFavorites,
  addUserFavorite,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  logoutUser,
  deleteUserAccount,
} from "../controllers/user.controller.js";

const router = e.Router();

/* ================= AUTH ================= */

router.post("/register", validateRegister, registerUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.get("/authUser", getAuthUser);

router.get("/verify/:token", verifyEmail);

router.post("/resend-verification", resendVerificationEmail);

router.post("/forgot-password", forgotPassword);

router.get("/reset-password/:token", getResetPassword);

router.post("/reset-password/:token", postResetPassword);

/* ================= USER PROFILE ================= */

router.get("/profile", protect, getUserProfile);

router.patch("/modifyUserData", protect, modifyUser);

router.patch("/addUserData", protect, addUserData);

router.put("/updatePassword", protect, updatePassword);

router.put("/addUserProfile", protect, upload.single("profile"), addProfilePic);

router.delete("/delete-account", protect, deleteUserAccount);

/* ================= OWNER ================= */

router.get("/owner/restaurant", protect, ownerMiddleware, getOwnerRestaurant);

router.get(
  "/dashboard/:restaurantId",
  protect,
  ownerMiddleware,
  getRestaurantDashboardDetails,
);

/* ================= FAVORITES ================= */

router.get("/userFavourites", protect, getUserFavorites);

router.post("/toggleFavourites", protect, addUserFavorite);

/* ================= NOTIFICATIONS ================= */

router.get("/getNotification", protect, getUserNotifications);

router.patch("/markAsRead", protect, markNotificationAsRead);

router.patch("/markAllAsRead", protect, markAllNotificationsAsRead);

export default router;
