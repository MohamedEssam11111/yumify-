import express from "express";
import {
  createPromo,
  getPromos,
  validatePromo,
  deletePromo,
  togglePromoStatus,
} from "../controllers/promo.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import ownerOnly from "../middlewares/ownerMiddleware.js";

const router = express.Router();

// Owner Routes
router.post("/", protect, ownerOnly, createPromo);

router.get("/", protect, ownerOnly, getPromos);

router.delete("/:id", protect, ownerOnly, deletePromo);

router.patch("/:id/toggle", protect, ownerOnly, togglePromoStatus);

// Customer Cart Route
router.post("/validate", protect, validatePromo);

export default router;
