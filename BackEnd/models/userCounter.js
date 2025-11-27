// models/counter.js
import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g., "employeeId"
    seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Counter", counterSchema);
