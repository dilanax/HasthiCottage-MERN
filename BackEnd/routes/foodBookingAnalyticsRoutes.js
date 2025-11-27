import express from "express";
import { getFoodBookingAnalytics } from "../controller/foodBookingAnalyticsController.js";
import verifyJwt from "../middleware/auth.js";

const router = express.Router();

// Analytics routes (protected)
router.get("/analytics", verifyJwt, getFoodBookingAnalytics);

export default router;
