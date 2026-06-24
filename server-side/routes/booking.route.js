import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import ownerMiddleware from "../middlewares/ownerMiddleware.js";

import {
  getAllBooking,
  getBookingsByUser,
  getBookingsByRestaurant,
  createNewBooking,
  updateBooking,
  deleteBooking,
} from "../controllers/booking.controller.js";

const router = express.Router();

// Owner: get all bookings
router.get("/", protect, ownerMiddleware, getAllBooking);

// Customer: get own bookings
router.get("/my-bookings", protect, getBookingsByUser);

// Owner: get bookings for restaurant
router.get(
  "/restaurant/:restaurantId",
  protect,
  ownerMiddleware,
  getBookingsByRestaurant,
);

// Customer: create booking
router.post("/create", protect, createNewBooking);

// Customer: update own booking
router.patch("/:bookingId", protect, updateBooking);

// Customer or owner: delete booking
router.delete("/:bookingId", protect, deleteBooking);

export default router;
