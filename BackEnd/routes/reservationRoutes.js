// routes/reservationRoutes.js
import { Router } from "express";
import verifyJwt from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";
import {
  createReservation,
  getReservationsByUser,
  getReservationByNumber,
  cancelReservation,
  deleteReservation,
  completeReservation,
  listReservations,
  // New CRUD functions
  getAllReservations,
  updateReservation,
  getGuestReservations,
  getGuestReservation,
  updateGuestReservation,
  getReservationById,
  checkPendingPayments,
} from "../controller/reservationController.js";

const reservationRouter = Router();

// Admin Routes (must come before wildcard routes)
// Get all reservations (admin only)
reservationRouter.get("/admin", verifyJwt, adminMiddleware, getAllReservations);

// Admin update reservation (full access)
reservationRouter.put("/admin/:reservationId", verifyJwt, adminMiddleware, updateReservation);

// Admin delete reservation
reservationRouter.delete("/admin/:reservationId", verifyJwt, adminMiddleware, deleteReservation);

// Admin cancel reservation
reservationRouter.put("/admin/cancel/:reservationId", verifyJwt, adminMiddleware, cancelReservation);

// Legacy admin route
reservationRouter.get("/admin/list/all", verifyJwt, listReservations);

// Guest Routes
// Check for pending payments before creating new reservation
reservationRouter.get("/check-pending", verifyJwt, checkPendingPayments);

// Create Reservation (protected)
reservationRouter.post("/reserve", verifyJwt, createReservation);

// Get current user's reservations (guest)
reservationRouter.get("/guest", verifyJwt, getGuestReservations);

// Get single guest reservation
reservationRouter.get("/guest/:reservationId", verifyJwt, getGuestReservation);

// Update guest reservation (limited fields)
reservationRouter.put("/guest/:reservationId", verifyJwt, updateGuestReservation);

// Guest cancel reservation
reservationRouter.put("/guest/cancel/:reservationId", verifyJwt, cancelReservation);

// Legacy routes for backward compatibility
reservationRouter.get("/", verifyJwt, getReservationsByUser);
reservationRouter.put("/complete/:reservationNumber", verifyJwt, completeReservation);
reservationRouter.put("/cancel/:reservationId", verifyJwt, cancelReservation);
reservationRouter.delete("/:reservationId", verifyJwt, deleteReservation);

// Get reservation by ObjectId (for admin/guest details pages)
reservationRouter.get("/by-id/:reservationId", verifyJwt, getReservationById);

// Wildcard route (must be last)
reservationRouter.get("/:reservationNumber", verifyJwt, getReservationByNumber);

export default reservationRouter;
