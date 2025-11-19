import mongoose from "mongoose";
const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  logoUrl: { type: String, default: "restaurant-default.png" },
  rating: { type: Number, default: 0 },
  menu: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Food" } // list of food items in the restaurant's menu
    ]
}, { timestamps: true });

export default mongoose.model("Restaurant", restaurantSchema);