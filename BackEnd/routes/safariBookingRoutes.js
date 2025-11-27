import express from "express";
import { 
  createSafariBooking, 
  getAllSafariBookings, 
  updateSafariBookingStatus, 
  getPendingSafariBookingsCount,
  getSafariBookingAnalytics,
  getUserSafariBookings
} from "../controller/safariBookingController.js";
import verifyJwt from "../middleware/auth.js";
import verifyAdmin from "../middleware/admin.js";

const router = express.Router();

// Public routes
router.post("/create", createSafariBooking);

// User routes (require authentication)
router.get("/user", verifyJwt, getUserSafariBookings);

// Admin routes (require admin authentication)
router.get("/admin/all", verifyJwt, verifyAdmin, getAllSafariBookings);
router.put("/admin/:id/status", verifyJwt, verifyAdmin, updateSafariBookingStatus);
router.get("/admin/pending-count", verifyJwt, verifyAdmin, getPendingSafariBookingsCount);
router.get("/analytics", verifyJwt, verifyAdmin, getSafariBookingAnalytics);

export default router;
