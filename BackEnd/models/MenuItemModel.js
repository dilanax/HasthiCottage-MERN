// Models/MenuItemModel.js
import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    isAvailable: { type: Boolean, default: true }, // quick on/off
    daysOfWeek: {
      // 0=Sun ... 6=Sat (optional granular control)
      type: [Number],
      default: undefined,
      validate: {
        validator: arr => !arr || arr.every(n => n >= 0 && n <= 6),
        message: "daysOfWeek must be numbers 0-6",
      },
    },
    timeWindows: [
      {
        start: { type: String }, // "06:30" (HH:mm)
        end: { type: String },   // "10:30"
      },
    ],
    seasons: {
      // e.g., ["HIGH", "LOW", "SUMMER", "WINTER"] – use what makes sense for you
      type: [String],
      default: undefined,
    },
  },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "BREAKFAST",
        "LUNCH",
        "DINNER",
        "SNACKS",
        "BEVERAGE",
        "DESSERT",
        "OTHER",
      ],
    },
    price: { type: Number, required: true, min: 0 },
    image: { type: String }, // file path from multer
    tags: { type: [String], default: [] }, // e.g. ["vegan","gluten-free"]
    spicyLevel: { type: Number, min: 0, max: 3, default: 0 }, // optional
    available: availabilitySchema,
    isArchived: { type: Boolean, default: false }, // optional soft-hide
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);
