import mongoose from "mongoose";
import Food from "../models/food.model.js";
import Restaurant from "../models/restaurant.model.js";
import { verifyToken } from "../utils/tokenVerify.util.js";
import Review from "../models/review.model.js";
import uploadFile from "../services/storage/uploadFile.js";
import deleteFile from "../services/storage/deleteFile.js";
// get menu for chatbot
export const getMenuForChatBot = async (req, res) => {
  try {
    const foods = await Food.find()
      .select("name category price description restaurant")
      .populate("restaurant", "name");
    res.json(foods);
  } catch (error) {
    console.error("Error in GET /getMenuForChatBot (food.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Route to get all food items
// Note: paths here are relative to where the router is mounted (e.g. /api/foods)
export const getAllFood = async (req, res) => {
  try {
    const foods = await Food.find().populate("restaurant"); // FEtch all food items from the database
    res.json(foods); // Return the list of food items as JSON
  } catch (error) {
    console.error("Error in GET / (food.route):", error); // log for debugging
    res.status(500).json({ message: "Server error", error: error.message }); // Handle server errors
  }
};

// get random products
export const getRandomProducts = async (req, res) => {
  try {
    const { foodid } = req.params;
    const randomProducts = await Food.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(foodid) } } },
      { $sample: { size: 4 } },
    ]);
    res.json(randomProducts);
  } catch (error) {
    console.error("Error fetching random products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// search food
export const searchFood = async (req, res) => {
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get food by id
export const getFoodById = async (req, res) => {
  const { foodId } = req.params;
  try {
    const foodItem = await Food.findById(foodId).populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "-password",
      },
    });
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }
    res.json(foodItem);
  } catch (error) {
    console.error("Error in GET /:foodId (food.route):", error);
    res.status(500).json({ message: "Server error", error: error.message }); // Handle server errors
  }
};

// Route to add a new food by an owner
export const addNewFood = async (req, res) => {
  const { name, description, price, category } = req.body;
  const token = verifyToken(req.cookies.token);
  if (!token || token.role !== "owner") {
    return res
      .status(403)
      .json({ message: "Forbidden: Only owners can add food items" });
  }
  try {
    const restaurant = await Restaurant.findOne({ owner: token.id });
    console.log("Found restaurant for owner:", restaurant);
    if (!restaurant) {
      console.log("No restaurant found for owner with ID:", token.id);
      return res
        .status(404)
        .json({ message: "Restaurant not found for this owner" });
    }
    const imageUrl = await uploadFile(req.file, "foods");
    console.log("Received new food data:", req.body, "Image file:", req.file);
    const newFood = new Food({
      name,
      description,
      price,
      category,
      imageUrl,
      restaurant: restaurant._id,
    });

    await newFood.save();
    await restaurant.updateOne({ $push: { menu: newFood._id } });
    res.status(201).json(newFood);
  } catch (error) {
    console.error("Error in POST /add (food.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//Route to modify existing food item
export const updateFoodItem = async (req, res) => {
  const { foodId } = req.params;
  const { name, description, price, category, availability } = req.body;

  try {
    const FOODID = new mongoose.Types.ObjectId(foodId);

    console.log("FOODID:", FOODID);

    const food = await Food.findById(FOODID);

    if (!food) {
      return res.status(404).json({
        message: "Food item not found",
      });
    }

    let imageUrl = food.imageUrl;

    // Upload new image if one was selected
    if (req.file) {
      // Delete old image (works for local & S3)
      if (food.imageUrl) {
        await deleteFile(food.imageUrl);
      }

      imageUrl = await uploadFile(req.file, "foods");
    }

    const updatedFood = await Food.findByIdAndUpdate(
      FOODID,
      {
        name,
        description,
        price,
        category,
        availability,
        imageUrl,
      },
      { new: true },
    );

    return res.status(200).json(updatedFood);
  } catch (error) {
    console.error("Error updating food:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Route to delete a food item
export const deleteFoodItem = async (req, res) => {
  const { foodId } = req.params;

  try {
    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({
        message: "Food item not found",
      });
    }

    // Delete image from storage (Local or S3)
    if (food.imageUrl) {
      await deleteFile(food.imageUrl);
    }

    // Remove food from restaurant menu
    await Restaurant.updateOne(
      { _id: food.restaurant },
      {
        $pull: {
          menu: food._id,
        },
      },
    );

    // Delete food document
    await Food.findByIdAndDelete(foodId);

    return res.status(200).json({
      message: "Food item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting food:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// get food review
export const getFoodReview = async (req, res) => {
  const { foodId } = req.params;
  try {
    const reviews = await Review.find({ food: foodId }).populate(
      "customer",
      "-password",
    ); // Populate customer details excluding password
    res.json(reviews);
  } catch (error) {
    console.error("Error in GET /getReviews/:foodId (food.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get restaurant menu
export const getRestaurantMenu = async (req, res) => {
  try {
    const token = verifyToken(req.cookies.token);

    if (!token || token.role !== "owner") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const restaurant = await Restaurant.findOne({
      owner: token.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    const foods = await Food.find({
      restaurant: restaurant._id,
    }).populate("restaurant");

    return res.status(200).json(foods);
  } catch (error) {
    console.error("Error in GET /owner/menu:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
