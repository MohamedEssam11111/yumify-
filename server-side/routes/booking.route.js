import express from "express";
import Booking from "../models/booking.model.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get all bookings (for owners to see their restaurant bookings)
router.get("/", protect, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email phone") // Populate user details and just poplating the name of the user and email
      .populate("restaurant", "name");
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error in GET / (booking.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get bookings by user (customer's bookings)
router.get("/my-bookings", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("restaurant", "name address phone")
      .sort({ date: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error in GET /my-bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get bookings by restaurant (for owners)
router.get("/restaurant/:restaurantId", protect, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const bookings = await Booking.find({ restaurant: restaurantId })
      .populate("user", "name email phone")
      .sort({ date: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error in GET /restaurant/:restaurantId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create a new booking
router.post("/create", protect, async (req, res) => {
  try {
    const { restaurant, date, time, numberOfGuests, locationPreference } =
      req.body;

    const newBooking = new Booking({
      user: req.user._id,
      restaurant,
      date,
      time,
      numberOfGuests,
      locationPreference,
    });

    await newBooking.save();

    const populatedBooking = await Booking.findById(newBooking._id).populate(
      "restaurant",
      "name address"
    );

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error("Error in POST /create:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update booking
router.patch("/:bookingId", protect, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { date, time, numberOfGuests, locationPreference } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (date) booking.date = date;
    if (time) booking.time = time;
    if (numberOfGuests) booking.numberOfGuests = numberOfGuests;
    if (locationPreference !== undefined)
      booking.locationPreference = locationPreference;

    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error in PATCH /:bookingId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Cancel/Delete booking
router.delete("/:bookingId", protect, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOneAndDelete({
      _id: bookingId,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error in DELETE /:bookingId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
