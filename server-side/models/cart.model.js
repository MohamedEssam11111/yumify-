import mongoose from "mongoose";


const cartSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
      quantity: { type: Number, required: true, min: 1 },
      request: { type: String }
    }
  ]
}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);