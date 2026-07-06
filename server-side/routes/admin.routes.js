import express from "express";

import { protect } from "../middlewares/auth.middleware.js";
import adminProtect from "../middlewares/adminProtect.js";

import {
  getDashboard,
  getUsers,
  getRestaurants,
  getOrders,
  getReservations,
  getReviews,
  getPromotions,
  getSettings,
} from "../controllers/admin.controller.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                              Dashboard Overview                            */
/* -------------------------------------------------------------------------- */

router.get("/dashboard", protect, adminProtect, getDashboard);

/* -------------------------------------------------------------------------- */
/*                                  Users                                     */
/* -------------------------------------------------------------------------- */

router.get("/users", protect, adminProtect, getUsers);

/* -------------------------------------------------------------------------- */
/*                               Restaurants                                  */
/* -------------------------------------------------------------------------- */

router.get("/restaurants", protect, adminProtect, getRestaurants);

/* -------------------------------------------------------------------------- */
/*                                  Orders                                    */
/* -------------------------------------------------------------------------- */

router.get("/orders", protect, adminProtect, getOrders);

/* -------------------------------------------------------------------------- */
/*                               Reservations                                 */
/* -------------------------------------------------------------------------- */

router.get("/reservations", protect, adminProtect, getReservations);

/* -------------------------------------------------------------------------- */
/*                                  Reviews                                   */
/* -------------------------------------------------------------------------- */

router.get("/reviews", protect, adminProtect, getReviews);

/* -------------------------------------------------------------------------- */
/*                                Promotions                                  */
/* -------------------------------------------------------------------------- */

router.get("/promotions", protect, adminProtect, getPromotions);

/* -------------------------------------------------------------------------- */
/*                                 Settings                                   */
/* -------------------------------------------------------------------------- */

router.get("/settings", protect, adminProtect, getSettings);

export default router;
