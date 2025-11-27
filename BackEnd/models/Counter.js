// models/Counter.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const counterSchema = new Schema( 
  {
    id: { type: String, required: true, unique: true }, // e.g. "employeeId", "paymentOrderNo"
    seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// IMPORTANT: cache model to avoid OverwriteModelError on reload
const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

export default Counter;
