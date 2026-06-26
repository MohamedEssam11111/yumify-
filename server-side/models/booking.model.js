import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    locationPreference: {
      type: String,
      default: "Any Available",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Seated",
        "Completed",
        "Cancelled",
        "No Show",
      ],
      default: "Pending",
    },

    cancellationReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Booking", bookingSchema); // "Booking" is the model name
