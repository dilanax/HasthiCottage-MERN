// models/Reservation.js
import mongoose from "mongoose";
import Counter from "./Counter.js";

const { Schema } = mongoose;

const reservationSchema = new Schema(
  {
    reservationNumber: { type: Number, unique: true, sparse: true },

    guest: {
      firstName: { type: String, required: true, trim: true },
      lastName:  { type: String, required: true, trim: true },
      email:     { type: String, required: true, lowercase: true, index: true },
      phone:     { type: String, default: "" },
      country:   { type: String, default: "" },
      countryCode: { type: String, default: "" }, // Phone country code
      phoneNumber: { type: String, default: "" }, // Phone number without country code
    },

    package: {
      type: Schema.Types.ObjectId,
      ref: "PackageDetails",
      required: false, // Made optional for admin reservations
      index: true,
    },

    reservedRooms: [{ type: Schema.Types.ObjectId, ref: "Room" }],

    checkIn:  { type: Date, required: true, index: true },
    checkOut: { type: Date, required: true, index: true },

    roomsWanted: { type: Number, required: true, min: 1 },
    adults:      { type: Number, required: true, min: 1 },
    children:    { type: Number, default: 0 },

    travellingWithPet: { type: Boolean, default: false },
    safariRequested:   { type: Boolean, default: false },
    arrivalWindow:     { type: String, default: "unknown" }, // Expected arrival time window

    status: {
      type: String,
      enum: ["booked", "pending", "cancelled"],
      default: "booked",
      index: true,
    },

    totalAmount:  { type: Number, default: 0, min: 0 },
    currency:     { type: String, default: "LKR" },
    paymentStatus:{ type: String, default: "pending" },

    // NEW: store PI id for reconciliation
    paymentIntentId: { type: String, default: "" },

    // Admin reservation details for custom packages
    adminReservation: {
      roomId: { type: String },
      customPricePerNight: { type: Number },
      adultsIncluded: { type: Number, default: 2 }
    },

    // Idempotency key to prevent duplicate submissions
    idempotencyKey: { type: String, sparse: true, index: true },
  },
  { timestamps: true }
);

// prevent duplicate (same guest + same date range + same package)
reservationSchema.index({ 
  "guest.email": 1, 
  checkIn: 1, 
  checkOut: 1, 
  package: 1 
}, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: {
    paymentStatus: { $in: ['pending', 'processing', 'completed'] }
  }
});

// Index for idempotency key
reservationSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

reservationSchema.pre("save", async function (next) {
  if (this.isNew && !this.reservationNumber) {
    const counter = await Counter.findOneAndUpdate(
      { id: "reservationNumber" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.reservationNumber = counter.seq;
  }
  next();
});

export default mongoose.model("Reservation", reservationSchema);
