import express from "express";
import Review from "../models/review.model.js";
import Food from "../models/food.model.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get all reviews (optional: with filters)
router.get("/", async (req, res) => {
  try {
    const { foodId, restaurantId } = req.query;

    let filter = {};
    if (foodId) filter.food = foodId;
    if (restaurantId) filter.restaurant = restaurantId;

    const reviews = await Review.find(filter)
      .populate("user", "name imageUrl")
      .populate("food", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error in GET / (review.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get reviews by food ID
router.get("/food/:foodId", async (req, res) => {
  try {
    const { foodId } = req.params;

    const reviews = await Review.find({ food: foodId })
      .populate("user", "name imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error in GET /food/:foodId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get reviews by restaurant
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const reviews = await Review.find({ restaurant: restaurantId })
      .populate("user", "name imageUrl")
      .populate("food", "name imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error in GET /restaurant/:restaurantId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create a review
router.post("/add", protect, async (req, res) => {
  try {
    const { foodId, restaurantId, rating, comment } = req.body;

    // Check if user already reviewed this food
    const existingReview = await Review.findOne({
      user: req.user._id,
      food: foodId,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this item" });
    }

    const newReview = new Review({
      user: req.user._id,
      food: foodId,
      restaurant: restaurantId,
      rating,
      comment,
    });

    await newReview.save();

    // Add review to food's reviews array
    await Food.findByIdAndUpdate(foodId, {
      $push: { reviews: newReview._id },
    });

    const populatedReview = await Review.findById(newReview._id).populate(
      "user",
      "name imageUrl"
    );

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error("Error in POST /add:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update review
router.patch("/:reviewId", protect, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({
      _id: reviewId,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    res.status(200).json(review);
  } catch (error) {
    console.error("Error in PATCH /:reviewId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete review
router.delete("/:reviewId", protect, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Remove review from food's reviews array
    await Food.findByIdAndUpdate(review.food, {
      $pull: { reviews: reviewId },
    });

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /:reviewId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
