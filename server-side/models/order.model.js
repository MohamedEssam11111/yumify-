import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  items: [
    {
      food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
      quantity: { type: Number, required: true, min: 1 , default: 1  },
      request: { type: String }
    }
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["confirmed", "cooking", "on the way", "delivered", "cancelled"],
    default: "confirmed",
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card"],
    default: "cash",
  },
  deliveryAddress: { type: String },
}, { timestamps: true });

export default orderSchema;
