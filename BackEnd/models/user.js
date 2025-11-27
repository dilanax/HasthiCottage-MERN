import mongoose from "mongoose";
import Counter from "./Counter.js";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: { type: String, enum: ["user", "admin", "teacher", "student"], default: "user" },
    password: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true }, // not required but unique when provided
    employeeId: { type: String, unique: true, index: true }, // short ID for UI
  },
  { timestamps: true }
);

// Generate employeeId once on create. Includes a fallback so it NEVER 500s here.
userSchema.pre("save", async function (next) {
  if (!this.isNew || this.employeeId) return next();
  try {
    const c = await Counter.findOneAndUpdate(
      { id: "employeeId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.employeeId = `EMP${String(c.seq).padStart(4, "0")}`; // EMP0001…
    return next();
  } catch (err) {
    // Fallback: still allow user creation (prevents 500), but logs error
    console.error("employeeId counter error:", err);
    this.employeeId = `EMP${Date.now().toString().slice(-6)}`; // TEMP fallback
    return next();
  }
});

export default mongoose.models.User || mongoose.model("User", userSchema);
