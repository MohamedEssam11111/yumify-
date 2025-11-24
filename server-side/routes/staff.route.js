import express from "express";
import Staff from "../models/staff.model.js";
import Restaurant from "../models/restaurant.model.js";
import { protect } from "../middlewares/auth.middleware.js";
import { verifyToken } from "../utils/tokenVerify.util.js";
import mongoose from "mongoose";

const router = express.Router();

// Get all staff for owner's restaurant
router.get("/", protect, async (req, res) => {
  try {
    const token = verifyToken(req.cookies.token);
    
    // Find owner's restaurant
    const restaurant = await Restaurant.findOne({ owner: token.id });
    
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const staff = await Staff.find({ restaurant: restaurant._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json(staff);
  } catch (error) {
    console.error("Error in GET / (staff.route):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get staff by ID
router.get("/:staffId", protect, async (req, res) => {
  try {
    const { staffId } = req.params;
    
    const staff = await Staff.findById(staffId).populate("restaurant", "name");
    
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.status(200).json(staff);
  } catch (error) {
    console.error("Error in GET /:staffId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add new staff member
router.post("/add", protect, async (req, res) => {
  try {
    const { name, role, phone, shift, salary, email } = req.body;
    const token = verifyToken(req.cookies.token);

    if (token.role !== "owner") {
      return res.status(403).json({ message: "Only owners can add staff" });
    }

    // Find owner's restaurant
    const restaurant = await Restaurant.findOne({ owner: token.id });
    
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const newStaff = new Staff({
      name,
      role,
      restaurant: restaurant._id,
      phone,
      shift,
      salary,
      email,
    });

    await newStaff.save();
    
    res.status(201).json(newStaff);
  } catch (error) {
    console.error("Error in POST /add:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update staff member
router.patch("/:staffId", protect, async (req, res) => {
  try {
    const { staffId } = req.params;
    const { name, role, phone, shift, status, salary, email } = req.body;
    const token = verifyToken(req.cookies.token);

    if (token.role !== "owner") {
      return res.status(403).json({ message: "Only owners can update staff" });
    }
    // console.log("Staff ID:", staffId);
    const STAFF_ID = new mongoose.Types.ObjectId(staffId);
    const staff = await Staff.findById(STAFF_ID);
    
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Update fields
    if (name) staff.name = name;
    if (role) staff.role = role;
    if (phone) staff.phone = phone;
    if (shift) staff.shift = shift;
    if (status) staff.status = status;
    if (salary !== undefined) staff.salary = salary;
    if (email) staff.email = email;

    await staff.save();

    res.status(200).json(staff);
  } catch (error) {
    console.error("Error in PATCH /:staffId:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete staff member
router.delete("/:staffId", protect, async (req, res) => {
  try {
    const { staffId } = req.params;
    const token = verifyToken(req.cookies.token);

    if (token.role !== "owner") {
      return res.status(403).json({ message: "Only owners can delete staff" });
    }

    const staff = await Staff.findByIdAndDelete(staffId);
    
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.status(200).json({ message: "Staff member deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /:staffId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;