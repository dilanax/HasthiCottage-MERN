import express from "express";

import {
  createFoodBooking,
  getAllFoodBookings,
  updateBookingStatus,
  getPendingBookingsCount,
  testBookings,
  populateCustomerIds

} from "../controller/FoodBookingController.js";

import verifyJwt from "../middleware/auth.js";
import verifyAdmin from "../middleware/admin.js";

const router = express.Router();

// Public routes
router.post("/create", createFoodBooking);

// Test route (no auth required)
router.get("/test", testBookings);

// Test route for getting all bookings (no auth required for testing)
router.get("/test-all", getAllFoodBookings);

// Migration route to populate customerId for existing bookings
router.post("/admin/populate-customer-ids", populateCustomerIds);

// Admin routes (protected)
router.get("/admin/all", getAllFoodBookings); // Temporarily removed verifyJwt for testing
router.put("/admin/:id/status", verifyJwt, updateBookingStatus); // Temporarily removed verifyAdmin
router.get("/admin/pending-count", getPendingBookingsCount); // Temporarily removed verifyJwt for testing

export default router;
