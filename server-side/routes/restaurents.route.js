import express from "express";
import Restaurant from "../models/restaurant.model.js";
import { verifyToken } from "../utils/tokenVerify.util.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.json(restaurants);
    } catch (error) {
        console.error("Error in GET / (restaurant.route):", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.put("/modify", upload.single('logo'), async (req, res) => {
    const { name } = req.body;
    const token = verifyToken(req.cookies.token);
    if (!token || token.role !== 'owner') {
        return res.status(403).json({ message: "Forbidden: Only owners can modify restaurant details" });
    }
    try {
        const restaurant = await Restaurant.findOne({ owner: token.id });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found for this owner" });
        }
        if (name) {
            restaurant.name = name;
        }
        if (req.file) {
            restaurant.logoUrl = req.file.filename;
        }
        await restaurant.save();
        res.status(200).json({ message: "Restaurant details updated successfully", restaurant });
    } catch (error) {
        console.error("Error in PUT /modify (restaurant.route):", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});



export default router;