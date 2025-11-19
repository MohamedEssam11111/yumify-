import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: ["Starter", "MainDish", "Appetizer", "Dessert", "Drink"],
      required: true,
    },
    // Accept imageUrl to match client payload. Keep backwards compatibility if needed.
    imageUrl: { type: String }, // URL or path to the image
    // can add more fields like ingredients, calories, availability
    // Make owner optional so test POSTs without authentication can create items.
    restaurant: {
      // reference to the restaurant that offers this food item
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true, // set to false to allow test data without restaurant
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    ingredients : [{ type: String }],
    availability: { type: Boolean, default: true },
  },
  { timestamps: true }
);


export default mongoose.model("Food", foodSchema);
