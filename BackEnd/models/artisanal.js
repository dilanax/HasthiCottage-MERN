import mongoose from "mongoose";

const artisanalSchema = new mongoose.Schema(
  {
    artisanalId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

const Artisanal = mongoose.model("Artisanal", artisanalSchema);
export default Artisanal;
