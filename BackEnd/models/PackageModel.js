import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: String, required: true },
    period: { type: String, required: true },
    visitors: { type: Number, required: true },
    price: { type: Number, required: true },
    type: { type: String, required: true },
    image: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Package", packageSchema);
