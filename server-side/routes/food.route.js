import e from "express";
import upload from "../middlewares/upload.middleware.js";
import ownerMiddleware from "../middlewares/ownerMiddleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getMenuForChatBot,
  getAllFood,
  getRandomProducts,
  searchFood,
  getFoodById,
  addNewFood,
  updateFoodItem,
  deleteFoodItem,
  getFoodReview,
  getRestaurantMenu,
} from "../controllers/food.controller.js";
const router = e.Router();

router.get("/getMenuForChatBot", getMenuForChatBot);

// Route to get all food items
// Note: paths here are relative to where the router is mounted (e.g. /api/foods)
router.get("/", getAllFood);
// get random products
router.get("/random-products", getRandomProducts);
// search food
router.get("/search", searchFood);
// get food by id
router.get("/get/:foodId", getFoodById);

// Route to add a new food by an owner
router.post(
  "/add",
  protect,
  ownerMiddleware,
  upload.single("image"),
  addNewFood,
);

//Route to modify existing food item
router.put("/modify/:foodId", updateFoodItem);

// Route to delete a food item
router.delete("/delete/:foodId", deleteFoodItem);

// get food review
router.get("/getReviews/:foodId", getFoodReview);

// get restaurant menu
router.get("/owner/menu", getRestaurantMenu);
export default router;
