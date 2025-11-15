import e from "express";
import mongoose from "mongoose";
import foodSchema from "../models/food.model.js";
import restaurantSchema from "../models/restaurant.model.js";
import upload from "../middlewares/upload.middleware.js";
import { verifyToken } from "../utils/tokenVerify.util.js";
import reviewSchema from "../models/review.model.js";

const router = e.Router();

// Create Food Model
const Food = mongoose.model("Food", foodSchema);
const Restaurant = mongoose.model("Restaurant",restaurantSchema);
const Review = mongoose.model("Review",reviewSchema) 

// Route to get all food items
// Note: paths here are relative to where the router is mounted (e.g. /api/foods)
router.get("/", async (req, res) => {
    try {
        const foods = await Food.find(); // FEtch all food items from the database
        res.json(foods); // Return the list of food items as JSON
    } catch (error) {
        console.error("Error in GET / (food.route):", error); // log for debugging
        res.status(500).json({ message: "Server error", error: error.message }); // Handle server errors
    }
});
router.get("/random-products", async (req, res) => {
  try {
    const {foodid} = req.params; 
const randomProducts = await Food.aggregate([
  { $match: { _id: { $ne: new mongoose.Types.ObjectId(foodid) } } },
  { $sample: { size: 4 } } 
]);
res.json(randomProducts);

  } catch (error) {
    console.error("Error fetching random products:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/search", async (req, res) => {
  try {
    let query = req.query.q;

    console.log("my query is:", query);
    if (!query || typeof query !== "string" || query.trim() === "") {
      const foods = await Food.find();
      return res.json(foods);
    }

    query = query.trim();
    const results = await Food.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });

    res.json(results);
  } catch (error) {
    console.error("Error in GET /search (food.route):", error);
    res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

router.get("/get/:foodId", async (req, res) => {
    const { foodId } = req.params;
    try {
        const foodItem = await Food.findById(foodId).populate('reviews');
        if (!foodItem) {
            return res.status(404).json({ message: "Food item not found" });
        }
        res.json(foodItem); 
    } catch (error) {
        console.error("Error in GET /:foodId (food.route):", error);
        res.status(500).json({ message: "Server error", error: error.message }); // Handle server errors
    }
});


// Route to add a new food by an owner
router.post("/add", upload.single('image'), async (req, res) => {
    const { name, description, price, category } = req.body;
    const token = verifyToken(req.cookies.token);
    if (!token || token.role !== 'owner') {
        return res.status(403).json({ message: "Forbidden: Only owners can add food items" });
    }
    try {
        const restaurant = await Restaurant.findOne({ owner: token.id });
        console.log("Found restaurant for owner:", restaurant);
        if (!restaurant) {
            console.log("No restaurant found for owner with ID:", token.id);
            return res.status(404).json({ message: "Restaurant not found for this owner" });
        }
        const imageUrl = req.file ? req.file.filename : null;
        console.log("Received new food data:", req.body, "Image file:", req.file);
        const newFood = new Food({
            name,
            description,
            price,
            category,
            imageUrl,
            restaurant: restaurant._id
        });



        await newFood.save();
        await restaurant.updateOne({ $push: { menu: newFood._id } });
        res.status(201).json(newFood);
    } catch (error) {
        console.error("Error in POST /add (food.route):", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


//Route to modify existing food item
router.put("/modify/:foodId", async (req, res) => {
    const { foodId } = req.params;
    const { name, description, price, category, imageUrl } = req.body;
    try {
        const updatedFood = await Food.findByIdAndUpdate(foodId, { name, description, price, category, imageUrl }, { new: true });
        if (!updatedFood) {
            return res.status(404).json({ message: "Food item not found" });
        }
        res.json(updatedFood); // Return the updated food item
    } catch (error) {
        console.error("Error in PUT /:foodId (food.route):", error);
        res.status(500).json({ message: "Server error", error: error.message }); // Handle server errors
    }
});

// Route to delete a food item
router.delete("/delete/:foodId", async (req, res) => {
    const { foodId } = req.params;
    try {
        const deletedFood = await Food.findByIdAndDelete(foodId);
        if (!deletedFood) {
            return res.status(404).json({ message: "Food item not found" });
        }
        res.json({ message: "Food item deleted successfully" });
    } catch (error) {
        console.error("Error in DELETE /:foodId (food.route):", error);
        res.status(500).json({ message: "Server error", error: error.message }); // Handle server errors
    }
});



router.get("/getReviews/:foodId", async (req, res) => {
    const { foodId } = req.params;
    try {
        const reviews = await Review.find({ food: foodId }).populate('customer', '-password'); // Populate customer details excluding password
        res.json(reviews);
    } catch (error) {
        console.error("Error in GET /getReviews/:foodId (food.route):", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


export default router;