
import e from "express";
import mongoose from "mongoose";
import reviewSchema from "../models/review.model.js";
import { verifyToken } from "../utils/tokenVerify.util.js";
const router = e.Router();

// Create Review Model
const Review = mongoose.model("Review", reviewSchema);

router.post("/add", async (req, res) => {
    const { foodId, customerId, rating, comment } = req.body;
    try {
        const newReview = new Review({ food: foodId, customer: customerId, rating, comment });
        await newReview.save();
        res.status(201).json(newReview); // Return the newly created review
    } catch (error) {
        console.error("Error in POST /add (review.route):", error);
        res.status(500).json({ message: "Server error", error: error.message }); // Handle server errors
    }
});

router.delete('/:reviewId', async (req, res) => {
    const { reviewId } = req.params;
    try {
        const deletedReview = await Review.findByIdAndDelete(reviewId);
        if (!deletedReview) {
            return res.status(404).json({ message: "Review not found" });
        }
        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error in DELETE /:reviewId (review.route):", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.patch('/:reviewId', async (req, res) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    try {
        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            { rating, comment },
            { new: true } // Return the updated document and replace old one with it
        );
        if (!updatedReview) {
            return res.status(404).json({ message: "Review not found" });
        }
        res.json(updatedReview);
    } catch (error) {
        console.error("Error in PATCH /:reviewId (review.route):", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;