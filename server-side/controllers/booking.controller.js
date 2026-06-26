import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import Notification from "../models/notification.model.js";

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
    const {
      restaurant,
      date,
      time,
      numberOfGuests,
      locationPreference,
      notes,
    } = req.body;
    // Prevent booking in the past
    const selectedDate = new Date(date);

    const bookingDateTime = new Date(
      `${selectedDate.toISOString().split("T")[0]}T${time}:00`,
    );

    if (bookingDateTime < new Date()) {
      return res.status(400).json({
        message: "You cannot book in the past",
      });
    }
    const restaurantExists = await Restaurant.findById(restaurant);

    if (!restaurantExists) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      restaurant,
      date,
      time,
      status: {
        $nin: ["Cancelled"],
      },
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "You already have a reservation at this time",
      });
    }
    const newBooking = new Booking({
      user: req.user._id,
      restaurant,
      date,
      time,
      numberOfGuests,
      locationPreference,
      notes,
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
    const { date, time, numberOfGuests, locationPreference, notes } = req.body;
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
    if (notes !== undefined) booking.notes = notes;

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
    const cancellationReason = req.body?.cancellationReason || "";
    const booking = await Booking.findById(bookingId)
      .populate("user", "name")
      .populate({
        path: "restaurant",
        select: "name owner",
      });
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      booking.status === "Completed" ||
      booking.status === "Cancelled" ||
      booking.status === "No Show"
    ) {
      return res.status(400).json({
        message: `Cannot cancel a ${booking.status} reservation`,
      });
    }

    // customer authorization
    if (
      req.user.role === "customer" &&
      booking.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    // owner authorization
    console.log("REQ USER ID:", req.user._id.toString());
    console.log("RESTAURANT OWNER ID:", booking.restaurant.owner.toString());
    console.log("REQ USER ROLE:", req.user.role);
    if (
      req.user.role === "owner" &&
      booking.restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    booking.status = "Cancelled";
    booking.cancellationReason = cancellationReason || "";

    await booking.save();

    // notify restaurant owner if customer cancelled
    if (req.user.role === "customer") {
      const restaurant = await Restaurant.findById(booking.restaurant._id);

      if (restaurant?.owner) {
        console.log("OWNER ID:", restaurant.owner);
        console.log("CUSTOMER:", booking.user.name);
        console.log("REASON:", cancellationReason);
        await Notification.create({
          user: restaurant.owner,
          message: `${booking.user.name} cancelled reservation on ${new Date(
            booking.date,
          ).toLocaleDateString()} at ${
            booking.time
          }.\nReason: ${cancellationReason || "No reason provided"}`,
        });
      }
    }

    return res.status(200).json({
      message: "Reservation cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    booking.status = status;

    await booking.save();

    return res.status(200).json({
      message: "Status updated successfully",
      booking,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

export const searchReservations = async (req, res) => {
  try {
    const { search = "", status, date, restaurantId } = req.query;

    const query = {};

    // Filter by restaurant
    if (restaurantId) {
      query.restaurant = restaurantId;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date
    if (date) {
      query.date = date;
    }

    let bookings = await Booking.find(query)
      .populate("user", "name email phone")
      .populate("restaurant", "name")
      .sort({ date: -1 });

    // Search customer name/email
    if (search.trim()) {
      const keyword = search.toLowerCase();

      bookings = bookings.filter((booking) => {
        const user = booking.user;

        return (
          user?.name?.toLowerCase().includes(keyword) ||
          user?.email?.toLowerCase().includes(keyword)
        );
      });
    }

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error searching reservations:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Reservation Notes
export const updateReservationNotes = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { notes } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    booking.notes = notes || "";

    await booking.save();

    return res.status(200).json({
      message: "Reservation notes updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Error updating notes:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
// Get single booking details
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("restaurant")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// rebook
export const rebookReservation = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const oldBooking = await Booking.findById(bookingId);

    if (!oldBooking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Customer can only rebook his own reservations
    if (oldBooking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const newBooking = new Booking({
      user: req.user._id,
      restaurant: oldBooking.restaurant,
      date: oldBooking.date,
      time: oldBooking.time,
      numberOfGuests: oldBooking.numberOfGuests,
      locationPreference: oldBooking.locationPreference,
      notes: oldBooking.notes,
      status: "Pending",
    });

    await newBooking.save();

    const populatedBooking = await Booking.findById(newBooking._id)
      .populate("restaurant", "name address")
      .populate("user", "name email");

    return res.status(201).json({
      message: "Reservation rebooked successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Error in POST /:bookingId/rebook:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
