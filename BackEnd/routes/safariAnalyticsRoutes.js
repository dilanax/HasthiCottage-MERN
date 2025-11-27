import express from "express";
import { 
  getSafariAnalytics, 
  getBookingDetails, 
  exportSafariAnalyticsPdf 
} from "../controller/safariAnalyticsController.js";
import verifyJwt from "../middleware/auth.js";

const router = express.Router();

// Get safari package analytics overview
router.get("/overview", verifyJwt, getSafariAnalytics);

// Get detailed booking data for tables
router.get("/bookings", verifyJwt, getBookingDetails);

// Export analytics as PDF
router.get("/export/pdf", verifyJwt, exportSafariAnalyticsPdf);

export default router;
