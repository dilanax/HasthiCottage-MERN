// controller/reservationController.js
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Stripe from 'stripe';
import Reservation from "../models/Reservation.js";
import User from "../models/user.js";
import Room from "../models/Room.js";
import Payment from "../models/PaymentModel.js";
import PackageDetails from "../models/Package.js";

import { toDateOnly, nightsBetween } from "../utils/reservationHelpers.js";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: process.env.STRIPE_API_VERSION || '2023-10-16',
});

// helper: normalize price + currency from various fields
function pickPriceAndCurrency(pkg) {
  const tryFields = [
    ["nightlyPrice", pkg?.nightlyPrice],
    ["pricePerNight", pkg?.pricePerNight],
    ["priceLKR", pkg?.priceLKR],
    ["priceUSD", pkg?.priceUSD],
    ["price", pkg?.price],
  ];

  let price = 0;
  let src = "";
  for (const [key, val] of tryFields) {
    const n = Number(val);
    if (!Number.isNaN(n) && n > 0) {
      price = n;
      src = key.toLowerCase();
      break;
    }
  }

  let currency = pkg?.currency || "LKR";
  if (src.includes("usd")) currency = "USD";
  return { pricePerNight: price, currency };
}

export const createReservation = async (req, res) => {
  const {
    firstName: bodyFirstName,
    lastName: bodyLastName,
    email: bodyEmail,
    phone,
    country,
    countryCode,
    phoneNumber,
    packageId,
    checkIn,
    checkOut,
    roomsWanted,
    adults,
    children,
    travellingWithPet = false,
    safariRequested = false,
    arrivalWindow = "unknown",
    currency: currencyFromBody,
    idempotencyKey,
    paymentIntentId,
  } = req.body;

  let ownerEmail; // Declare outside try block for error handling

  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ ok: false, error: "Missing auth token" });

    const secret = process.env.JWT_SECRET || process.env.JWT_KEY;
    const decoded = jwt.verify(token, secret);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    // ✅ owner email: admin can override with bodyEmail, otherwise token email
    ownerEmail = decoded.role === "admin" && bodyEmail ? String(bodyEmail).toLowerCase() : decoded.email;

    // Check if user has any pending payments that need to be completed first
    const pendingPaymentReservation = await Reservation.findOne({
      "guest.email": ownerEmail,
      paymentStatus: { $in: ['pending', 'processing'] }
    });

    if (pendingPaymentReservation) {
      console.log("BLOCKING: User has pending payment reservation:", {
        reservationNumber: pendingPaymentReservation.reservationNumber,
        email: ownerEmail,
        paymentStatus: pendingPaymentReservation.paymentStatus
      });
      return res.status(409).json({ 
        ok: false, 
        error: "Please complete your pending payment before making a new reservation. You have a reservation with pending payment.",
        pendingReservation: {
          reservationNumber: pendingPaymentReservation.reservationNumber,
          createdAt: pendingPaymentReservation.createdAt,
          totalAmount: pendingPaymentReservation.totalAmount,
          currency: pendingPaymentReservation.currency
        }
      });
    }

    // Check for duplicate reservation using multiple strategies
    const inDate = toDateOnly(checkIn);
    const outDate = toDateOnly(checkOut);
    
    // Strategy 1: Check by idempotency key
    if (idempotencyKey) {
      const existingReservation = await Reservation.findOne({ 
        idempotencyKey: idempotencyKey
      });
      
      if (existingReservation) {
        console.log("Duplicate reservation detected with idempotency key, returning existing reservation");
        return res.status(200).json({ ok: true, reservation: existingReservation });
      }
    }

    // Strategy 2: Check for recent duplicate reservations (same guest, dates, package within 10 minutes)
    const recentDuplicate = await Reservation.findOne({ 
      'guest.email': ownerEmail,
      checkIn: inDate,
      checkOut: outDate,
      package: packageId === "admin-reservation" ? null : packageId,
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // Within last 10 minutes
    });
    
    if (recentDuplicate) {
      console.log("Recent duplicate reservation detected, returning existing reservation");
      return res.status(200).json({ ok: true, reservation: recentDuplicate });
    }

    // Strategy 3: Check for any pending reservation with same details (broader check)
    // Note: This is redundant with our earlier check, but keeping for specific date/package combinations
    const pendingDuplicate = await Reservation.findOne({ 
      'guest.email': ownerEmail,
      checkIn: inDate,
      checkOut: outDate,
      package: packageId === "admin-reservation" ? null : packageId,
      paymentStatus: { $in: ['pending', 'processing'] }
    });
    
    if (pendingDuplicate) {
      console.log("BLOCKING: Found pending reservation with same details:", {
        reservationNumber: pendingDuplicate.reservationNumber,
        email: ownerEmail,
        paymentStatus: pendingDuplicate.paymentStatus
      });
      return res.status(409).json({ 
        ok: false, 
        error: "You already have a pending reservation with similar details. Please complete your payment first.",
        pendingReservation: {
          reservationNumber: pendingDuplicate.reservationNumber,
          createdAt: pendingDuplicate.createdAt,
          totalAmount: pendingDuplicate.totalAmount,
          currency: pendingDuplicate.currency
        }
      });
    }

    // ✅ Names: prefer body; fallback to token; then validate
    const finalFirstName = bodyFirstName || decoded.firstName || "";
    const finalLastName  = bodyLastName  || decoded.lastName  || "";

    if (!finalFirstName || !finalLastName) {
      return res.status(400).json({ ok: false, error: "Missing guest name" });
    }
    if (!packageId) {
      return res.status(400).json({ ok: false, error: "packageId is required" });
    }
    if (!checkIn || !checkOut) {
      return res.status(400).json({ ok: false, error: "checkIn/checkOut required" });
    }
    if (!roomsWanted || roomsWanted < 1) {
      return res.status(400).json({ ok: false, error: "roomsWanted must be >= 1" });
    }
    if (!adults || adults < 1) {
      return res.status(400).json({ ok: false, error: "adults must be >= 1" });
    }

    // ✅ Handle admin reservation with custom package
    let pkg;
    if (packageId === "admin-reservation") {
      // Handle admin reservation with custom package details
      const { customPackage } = req.body;
      if (!customPackage) {
        return res.status(400).json({ ok: false, error: "Custom package details required for admin reservation" });
      }
      
      // Create a virtual package object for admin reservations
      pkg = {
        _id: "admin-reservation",
        roomId: customPackage.roomId,
        priceUSD: customPackage.pricePerNight,
        priceLKR: customPackage.pricePerNight * 300, // Approximate conversion
        adultsIncluded: customPackage.adultsIncluded || 2,
        isActive: true,
        isAdminReservation: true
      };
      
      console.log("Admin reservation package created:", pkg);
    } else {
      // ✅ Load the package by ID from the correct collection
      pkg = await PackageDetails.findById(packageId);
      if (!pkg) {
        return res.status(400).json({ ok: false, error: "Package not found" });
      }
      
      console.log("Package found:", {
        id: pkg._id,
        description: pkg.description,
        priceLKR: pkg.priceLKR,
        priceUSD: pkg.priceUSD,
        price: pkg.price,
        nightlyPrice: pkg.nightlyPrice,
        pricePerNight: pkg.pricePerNight,
        currency: pkg.currency
      });
      
      // Check if package is active
      if (!pkg.isActive) {
        return res.status(400).json({ ok: false, error: "Package not active" });
      }
    }

    // price & currency from package (fallback to request currency if provided)
    let { pricePerNight, currency: currencyFromPkg } = pickPriceAndCurrency(pkg);
    const currency = (currencyFromBody || currencyFromPkg || "USD").toUpperCase();
    
    console.log("Price calculation:", {
      pricePerNight,
      currency,
      currencyFromBody,
      currencyFromPkg
    });

    // Ensure minimum price for Stripe compatibility
    const minimumPricePerNight = currency === 'USD' ? 1 : 120;
    if (pricePerNight < minimumPricePerNight) {
      console.log(`Price per night ${pricePerNight} ${currency} is below minimum ${minimumPricePerNight}. Adjusting to minimum.`);
      pricePerNight = minimumPricePerNight;
    }

    // Check room availability based on availableCount (skip for admin reservations)
    if (!pkg.isAdminReservation) {
      const room = await Room.findOne({ room_id: pkg.roomId });
      if (!room) {
        return res.status(400).json({ ok: false, error: "Room not found" });
      }
      
      if (room.availableCount < roomsWanted) {
        return res.status(400).json({ 
          ok: false, 
          error: `Only ${room.availableCount} room(s) available. Requested: ${roomsWanted}` 
        });
      }
    }

    const session = await mongoose.startSession();
    let reservation;

    try {
      await session.withTransaction(async () => {
        // FINAL SAFETY CHECK: Double-check for pending payments before creating reservation
        const finalPendingCheck = await Reservation.findOne({
          "guest.email": ownerEmail,
          paymentStatus: { $in: ['pending', 'processing'] }
        }).session(session);

        if (finalPendingCheck) {
          throw new Error("Cannot create reservation: User has pending payment that must be completed first");
        }

        const inDate = toDateOnly(checkIn);
        const outDate = toDateOnly(checkOut);
        const nights = nightsBetween(inDate, outDate);
        if (nights < 1) throw new Error("checkOut must be after checkIn");

        // upsert profile with latest details
        await User.findOneAndUpdate(
          { email: ownerEmail },
          { firstName: finalFirstName, lastName: finalLastName, phone, country },
          { new: true, upsert: true, setDefaultsOnInsert: true, session }
        );

        // total
        const totalAmount = Number((pricePerNight * nights * roomsWanted).toFixed(2));
        if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
          throw new Error("Invalid price calculation");
        }

        const created = await Reservation.create(
          [
            {
              guest: {
                firstName: finalFirstName,
                lastName: finalLastName,
                email: ownerEmail,
                phone,
                country,
                countryCode: countryCode || "",
                phoneNumber: phoneNumber || "",
              },
              package: pkg.isAdminReservation ? null : pkg._id, // No package reference for admin reservations
              checkIn: inDate,
              checkOut: outDate,
              roomsWanted,
              adults,
              children: children ?? 0,
              travellingWithPet,
              safariRequested,
              arrivalWindow,
              status: "booked",
              totalAmount,
              currency,
              paymentStatus: paymentIntentId ? "processing" : "pending",
              paymentIntentId, // Store payment intent ID if provided
              idempotencyKey, // Store idempotency key
              // Store admin reservation details
              ...(pkg.isAdminReservation && {
                adminReservation: {
                  roomId: pkg.roomId,
                  customPricePerNight: pkg.priceUSD,
                  adultsIncluded: pkg.adultsIncluded
                }
              })
            },
          ],
          { session }
        );
        reservation = created[0];

        // Decrement available count for the room (skip for admin reservations)
        if (!pkg.isAdminReservation) {
          await Room.findOneAndUpdate(
            { room_id: pkg.roomId },
            { $inc: { availableCount: -roomsWanted } },
            { session }
          );
        }
      });
    } finally {
      await session.endSession();
    }

    if (!reservation?.reservationNumber) {
      throw new Error("Reservation number not generated");
    }

    res.status(201).json({ ok: true, reservation });
  } catch (err) {
    console.error("Reservation creation error:", err);
    
    if (err?.code === 11000) {
      const keys = Object.keys(err?.keyPattern || {});
      const isDateDup =
        keys.includes("guest.email") && keys.includes("checkIn") && keys.includes("checkOut");
      return res.status(409).json({
        ok: false,
        error: isDateDup
          ? "You already have a reservation for these dates."
          : "Duplicate reservation detected.",
      });
    }
    
    // Handle pending payment error from final check
    if (err.message && err.message.includes("Cannot create reservation: User has pending payment") && ownerEmail) {
      // Fetch the pending reservation to return details
      const pendingReservation = await Reservation.findOne({
        "guest.email": ownerEmail,
        paymentStatus: { $in: ['pending', 'processing'] }
      });
      
      return res.status(409).json({ 
        ok: false, 
        error: "Please complete your pending payment before making a new reservation. You have a reservation with pending payment.",
        pendingReservation: pendingReservation ? {
          reservationNumber: pendingReservation.reservationNumber,
          createdAt: pendingReservation.createdAt,
          totalAmount: pendingReservation.totalAmount,
          currency: pendingReservation.currency
        } : null
      });
    }
    
    res.status(400).json({ ok: false, error: err.message });
  }
};


export const getReservationsByUser = async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.header("Authorization").replace("Bearer ", ""),
      process.env.JWT_KEY
    );
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const reservations = await Reservation.find({ "guest.email": decoded.email }).sort({ createdAt: -1 });
    if (!reservations.length) return res.status(404).json({ message: "No reservations found for this user" });

    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reservations", error: err.message });
  }
};

export const getReservationById = async (req, res) => {
  const { reservationId } = req.params;
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(reservationId)) {
      return res.status(400).json({ message: "Invalid reservation ID format" });
    }

    // For non-admin users, only show their own reservations
    if (req.user.role !== "admin") {
      const reservation = await Reservation.findOne({
        _id: reservationId,
        "guest.email": req.user.email,
      }).populate('package');
      
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found for this user" });
      }
      return res.status(200).json({ data: reservation });
    }

    // Admin can see any reservation
    const reservation = await Reservation.findOne({ _id: reservationId }).populate('package');
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    return res.status(200).json({ data: reservation });
  } catch (err) {
    console.error("Error fetching reservation by ID:", err);
    res.status(500).json({ message: "Error fetching reservation", error: err.message });
  }
};

export const getReservationByNumber = async (req, res) => {
  const { reservationNumber } = req.params;
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const rn = Number(reservationNumber);
    if (isNaN(rn)) {
      return res.status(400).json({ message: "Invalid reservation number" });
    }

    // For non-admin users, only show their own reservations
    if (req.user.role !== "admin") {
      const reservation = await Reservation.findOne({
        reservationNumber: rn,
        "guest.email": req.user.email,
      }).populate('package');
      
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found for this user" });
      }
      return res.status(200).json({ data: reservation });
    }

    // Admin can see any reservation
    const reservation = await Reservation.findOne({ reservationNumber: rn }).populate('package');
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    return res.status(200).json({ data: reservation });
  } catch (err) {
    console.error("Error fetching reservation:", err);
    res.status(500).json({ message: "Error fetching reservation", error: err.message });
  }
};

export async function listReservations(req, res) {
  try {
    const { email, status } = req.query;
    const q = {};
    if (email) q["guest.email"] = email.toLowerCase();
    if (status) q.status = status;
    const docs = await Reservation.find(q).sort({ createdAt: -1 });
    res.json({ ok: true, reservations: docs });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
}

export async function cancelReservation(req, res) {
  const { reservationId } = req.params;
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(reservationId)) {
      return res.status(400).json({ ok: false, error: "Invalid reservation ID format" });
    }

    const session = await mongoose.startSession();
    let updated;
    await session.withTransaction(async () => {
      const reservation = await Reservation.findById(reservationId).session(session);
      if (!reservation) throw new Error("Reservation not found");
      if (reservation.status === "cancel") throw new Error("Already cancelled");

      // Check if user is authorized to cancel this reservation
      if (req.user && req.user.role !== "admin") {
        if (reservation.guest.email !== req.user.email) {
          throw new Error("Unauthorized: You can only cancel your own reservations");
        }
      }

      // Check payment status - only block if payment is actually paid
      if (reservation.paymentStatus === "paid") {
        throw new Error("Cannot cancel: Payment has already been completed. Please contact support for refund.");
      }

      // For pending/processing payments, allow cancellation
      if (reservation.paymentStatus === "processing") {
        console.log("Cancelling reservation with processing payment status");
      }

      // Get package details to find room (only for non-admin reservations)
      if (reservation.package && !reservation.adminReservation) {
        const packageDetails = await PackageDetails.findById(reservation.package).session(session);
        if (packageDetails) {
          // Increment available count back for the room
          await Room.findOneAndUpdate(
            { room_id: packageDetails.roomId },
            { $inc: { availableCount: reservation.roomsWanted } },
            { session }
          );
        }
      } else if (reservation.adminReservation) {
        // Handle admin reservations - increment room count back
        const room = await Room.findOne({ room_id: reservation.adminReservation.roomId }).session(session);
        if (room) {
          await Room.findOneAndUpdate(
            { room_id: reservation.adminReservation.roomId },
            { $inc: { availableCount: reservation.roomsWanted } },
            { session }
          );
        }
      }

      reservation.status = "cancel";
      reservation.paymentStatus = "cancelled";
      updated = await reservation.save({ session });
    });

    res.json({ ok: true, reservation: updated });
  } catch (err) {
    console.error("Reservation cancellation error:", err);
    res.status(400).json({ ok: false, error: err.message });
  }
}

export async function deleteReservation(req, res) {
  const { reservationId } = req.params;
  try {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const reservation = await Reservation.findById(reservationId).session(session);
      if (!reservation) throw new Error("Reservation not found");

      // Get package details to find room
      const packageDetails = await PackageDetails.findById(reservation.package).session(session);
      if (packageDetails && reservation.status !== "cancel") {
        // Increment available count back for the room only if not already cancelled
        await Room.findOneAndUpdate(
          { room_id: packageDetails.roomId },
          { $inc: { availableCount: reservation.roomsWanted } },
          { session }
        );
      }

      await Payment.deleteMany({ reservation: reservation._id }).session(session);
      await reservation.deleteOne({ session });
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
}

export const completeReservation = async (req, res) => {
  const { reservationNumber } = req.params;
  const { paymentIntentId } = req.body;

  try {
    const rn = Number(reservationNumber);
    const reservation = await Reservation.findOne({ reservationNumber: rn });
    if (!reservation) throw new Error("Reservation not found");

    reservation.paymentIntentId = paymentIntentId || reservation.paymentIntentId;
    reservation.paymentStatus = "paid";
    await reservation.save();

    // Update Stripe payment intent description with reservation number
    if (reservation.paymentIntentId) {
      try {
        await stripe.paymentIntents.update(reservation.paymentIntentId, {
          description: `New Room Reservation (${reservationNumber})`
        });
        console.log(`Updated Stripe payment intent ${reservation.paymentIntentId} description with reservation number ${reservationNumber}`);
      } catch (stripeError) {
        console.error("Failed to update Stripe payment intent description:", stripeError);
        // Don't fail the whole operation if Stripe update fails
      }
    }

    res.json({ ok: true, reservation });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
};

// Admin CRUD operations
export const getAllReservations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      email, 
      reservationNumber, 
      from, 
      to, 
      status, 
      paymentStatus,
      roomId,
      amountMin,
      amountMax,
      sort = "createdAt:desc" 
    } = req.query;

    const filter = {};
    const emailFilter = {};
    
    if (email) {
      // Search by email or name (partial match)
      emailFilter.$or = [
        { "guest.email": { $regex: email, $options: 'i' } },
        { "guest.firstName": { $regex: email, $options: 'i' } },
        { "guest.lastName": { $regex: email, $options: 'i' } }
      ];
    }
    
    if (reservationNumber) filter.reservationNumber = Number(reservationNumber);
    if (from || to) {
      filter.checkIn = {};
      if (from) filter.checkIn.$gte = new Date(from);
      if (to) filter.checkIn.$lte = new Date(to);
    }
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (amountMin || amountMax) {
      filter.totalAmount = {};
      if (amountMin) filter.totalAmount.$gte = Number(amountMin);
      if (amountMax) filter.totalAmount.$lte = Number(amountMax);
    }
    
    // Combine email filter with other filters
    if (Object.keys(emailFilter).length > 0) {
      if (Object.keys(filter).length > 0) {
        // Create a new filter object to avoid reference issues
        const otherFilters = { ...filter };
        filter = {
          $and: [
            emailFilter,
            otherFilters
          ]
        };
      } else {
        Object.assign(filter, emailFilter);
      }
    }
    
    // Debug logging
    console.log('Admin reservations filter:', JSON.stringify(filter, null, 2));

    const skip = (Number(page) - 1) * Number(limit);
    const sortField = sort.split(':')[0];
    const sortOrder = sort.split(':')[1] === 'asc' ? 1 : -1;

    // Handle roomId filtering by finding packages with matching roomId first
    let packageFilter = {};
    if (roomId) {
      const packages = await PackageDetails.find({ roomId: roomId }).select('_id');
      const packageIds = packages.map(pkg => pkg._id);
      if (packageIds.length > 0) {
        filter.package = { $in: packageIds };
      } else {
        // If no packages found with this roomId, return empty results
        filter.package = { $in: [] };
      }
    }

    const [reservations, total] = await Promise.all([
      Reservation.find(filter)
        .populate({
          path: 'package',
          select: 'roomId priceUSD priceLKR wasPriceUSD taxesAndChargesUSD adultsIncluded',
          options: { strictPopulate: false }
        })
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Reservation.countDocuments(filter)
    ]);

    res.json({
      ok: true,
      data: reservations,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

export const updateReservation = async (req, res) => {
  const { reservationId } = req.params;
  const updates = req.body;

  try {
    // Admin access is already verified by the admin middleware

    const session = await mongoose.startSession();
    let updated;
    
    await session.withTransaction(async () => {
      const reservation = await Reservation.findById(reservationId).session(session);
      if (!reservation) throw new Error("Reservation not found");

      // If changing room count or dates, update room availability
      if (updates.roomsWanted || updates.checkIn || updates.checkOut) {
        const packageDetails = await PackageDetails.findById(reservation.package).session(session);
        if (packageDetails) {
          // Increment back the old count
          await Room.findOneAndUpdate(
            { room_id: packageDetails.roomId },
            { $inc: { availableCount: reservation.roomsWanted } },
            { session }
          );

          // Check new availability
          const newRoomsWanted = updates.roomsWanted || reservation.roomsWanted;
          const room = await Room.findOne({ room_id: packageDetails.roomId }).session(session);
          
          if (room.availableCount < newRoomsWanted) {
            throw new Error(`Only ${room.availableCount} room(s) available. Requested: ${newRoomsWanted}`);
          }

          // Decrement the new count
          await Room.findOneAndUpdate(
            { room_id: packageDetails.roomId },
            { $inc: { availableCount: -newRoomsWanted } },
            { session }
          );
        }
      }

      // Admin can update all fields
      const allowedFields = [
        'status', 'checkIn', 'checkOut', 'adults', 'children', 'roomsWanted',
        'travellingWithPet', 'safariRequested', 'arrivalWindow',
        'totalAmount', 'currency', 'paymentStatus',
        'guest', 'adminReservation'
      ];

      // Update basic fields
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          if (field === 'guest' && typeof updates[field] === 'object') {
            // Update guest information
            Object.assign(reservation.guest, updates[field]);
          } else if (field === 'adminReservation' && typeof updates[field] === 'object') {
            // Update admin reservation details
            if (!reservation.adminReservation) {
              reservation.adminReservation = {};
            }
            Object.assign(reservation.adminReservation, updates[field]);
          } else {
            reservation[field] = updates[field];
          }
        }
      }

      // Validate dates if they're being updated
      if (updates.checkIn || updates.checkOut) {
        const checkIn = new Date(updates.checkIn || reservation.checkIn);
        const checkOut = new Date(updates.checkOut || reservation.checkOut);
        
        if (checkIn >= checkOut) {
          throw new Error("Check-out date must be after check-in date");
        }
      }

      // Validate numbers
      if (updates.adults !== undefined && updates.adults < 1) {
        throw new Error("At least 1 adult is required");
      }
      if (updates.children !== undefined && updates.children < 0) {
        throw new Error("Children count cannot be negative");
      }
      if (updates.roomsWanted !== undefined && updates.roomsWanted < 1) {
        throw new Error("At least 1 room is required");
      }
      if (updates.totalAmount !== undefined && updates.totalAmount < 0) {
        throw new Error("Total amount cannot be negative");
      }

      updated = await reservation.save({ session });
    });

    res.json({ ok: true, reservation: updated });
  } catch (err) {
    console.error("Error updating reservation:", err);
    res.status(400).json({ ok: false, error: err.message });
  }
};

// Guest CRUD operations
export const getGuestReservations = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ ok: false, error: "Authentication required" });
    }

    const { page = 1, limit = 10, status } = req.query;
    const filter = { "guest.email": req.user.email };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [reservations, total] = await Promise.all([
      Reservation.find(filter)
        .populate({
          path: 'package',
          select: 'roomId priceUSD priceLKR wasPriceUSD taxesAndChargesUSD adultsIncluded',
          options: { strictPopulate: false }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Reservation.countDocuments(filter)
    ]);

    res.json({
      ok: true,
      data: reservations,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

export const getGuestReservation = async (req, res) => {
  const { reservationId } = req.params;
  
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ ok: false, error: "Authentication required" });
    }

    const reservation = await Reservation.findOne({
      _id: reservationId,
      "guest.email": req.user.email
    }).populate({
      path: 'package',
      select: 'roomId priceUSD priceLKR wasPriceUSD taxesAndChargesUSD adultsIncluded',
      options: { strictPopulate: false }
    });

    if (!reservation) {
      return res.status(404).json({ ok: false, error: "Reservation not found" });
    }

    res.json({ ok: true, data: reservation });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

export const updateGuestReservation = async (req, res) => {
  const { reservationId } = req.params;
  const updates = req.body;

  console.log('updateGuestReservation called with:', {
    reservationId,
    updates,
    userEmail: req.user?.email
  });

  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ ok: false, error: "Authentication required" });
    }

    // Allow guests to update more fields, but with restrictions
    const allowedUpdates = [
      'adults', 'children', 'travellingWithPet', 'safariRequested', 
      'arrivalWindow', 'roomsWanted', 'checkIn', 'checkOut',
      'specialRequests', 'dietaryRequirements', 'accessibilityNeeds'
    ];
    const filteredUpdates = {};
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    // Handle nested guest object updates
    if (updates.guest && typeof updates.guest === 'object') {
      const allowedGuestFields = ['firstName', 'lastName', 'email', 'phone', 'country'];
      for (const field of allowedGuestFields) {
        if (updates.guest[field] !== undefined) {
          if (!filteredUpdates.guest) filteredUpdates.guest = {};
          filteredUpdates.guest[field] = updates.guest[field];
        }
      }
    }

    // Handle direct guest field updates (for backward compatibility)
    const directGuestFields = ['firstName', 'lastName', 'email', 'phone'];
    for (const field of directGuestFields) {
      if (updates[field] !== undefined) {
        if (!filteredUpdates.guest) filteredUpdates.guest = {};
        filteredUpdates.guest[field] = updates[field];
      }
    }

    console.log('Filtered updates:', filteredUpdates);

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ ok: false, error: "No valid updates provided" });
    }

    const session = await mongoose.startSession();
    let updated;
    
    await session.withTransaction(async () => {
      const reservation = await Reservation.findOne({
        _id: reservationId,
        "guest.email": req.user.email
      }).session(session);

      console.log('Found reservation:', reservation ? 'Yes' : 'No');
      
      if (!reservation) throw new Error("Reservation not found");
      if (reservation.status === "cancel") throw new Error("Cannot update cancelled reservation");

      Object.assign(reservation, filteredUpdates);
      updated = await reservation.save({ session });
      console.log('Reservation updated successfully');
    });

    res.json({ ok: true, reservation: updated });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
};

// Check for pending payments before allowing new reservation
export const checkPendingPayments = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ ok: false, error: "Authentication required" });
    }

    const userEmail = req.user.email;

    // Check if user has any pending payments
    const pendingPaymentReservation = await Reservation.findOne({
      "guest.email": userEmail,
      paymentStatus: { $in: ['pending', 'processing'] }
    });

    if (pendingPaymentReservation) {
      return res.status(409).json({ 
        ok: false, 
        hasPendingPayment: true,
        error: "Please complete your pending payment before making a new reservation. You have a reservation with pending payment.",
        pendingReservation: {
          reservationNumber: pendingPaymentReservation.reservationNumber,
          createdAt: pendingPaymentReservation.createdAt,
          totalAmount: pendingPaymentReservation.totalAmount,
          currency: pendingPaymentReservation.currency
        }
      });
    }

    res.status(200).json({ 
      ok: true, 
      hasPendingPayment: false,
      message: "No pending payments found. User can proceed with new reservation."
    });

  } catch (err) {
    console.error("Error checking pending payments:", err);
    res.status(500).json({ ok: false, error: "Failed to check pending payments" });
  }
};

