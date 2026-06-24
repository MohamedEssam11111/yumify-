import Booking from "../models/booking.model.js";

// Get all bookings for owner's restaurant
export const getAllBooking = async (req, res) => {
  try {
    const bookings = await Booking.find({
      restaurant: req.user.restaurant,
    })
      .populate("user", "name email phone")
      .populate("restaurant", "name");

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error in GET / (booking.route):", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get bookings by logged-in customer
export const getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate("restaurant", "name address phone")
      .sort({ date: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error in GET /my-bookings:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get bookings for a specific restaurant (owner only)
export const getBookingsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (req.user.restaurant.toString() !== restaurantId) {
      return res.status(403).json({
        message: "Not authorized to access this restaurant bookings",
      });
    }

    const bookings = await Booking.find({
      restaurant: restaurantId,
    })
      .populate("user", "name email phone")
      .sort({ date: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error in GET /restaurant/:restaurantId:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Create new booking
export const createNewBooking = async (req, res) => {
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
      "name address",
    );

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error("Error in POST /create:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update booking (customer only updates own bookings)
export const updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { date, time, numberOfGuests, locationPreference } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
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
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete booking
export const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Customer can only delete their own booking
    if (req.user.role === "customer") {
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "Not authorized",
        });
      }
    }

    // Owner can only delete bookings of their own restaurant
    if (req.user.role === "owner") {
      if (booking.restaurant.toString() !== req.user.restaurant.toString()) {
        return res.status(403).json({
          message: "Not authorized",
        });
      }
    }

    await booking.deleteOne();

    res.status(200).json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /:bookingId:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
