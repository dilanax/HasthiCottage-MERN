import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: String,
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package" }, // <- change
  name: String,
  phone: String,
  email: String,
  visitors: Number,
  price: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Booking", bookingSchema);
