import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  qty: { type: Number, required: true, min: 1 },
  spicyLevel: { type: Number, default: 0 },
  tags: { type: [String], default: [] }
}, { _id: false });

const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  note: { type: String, default: "" }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: customerSchema,
  items: { type: [orderItemSchema], validate: v => v.length > 0 },
  type: { type: String, enum: ["DINE_IN","TAKEAWAY","DELIVERY"], default: "TAKEAWAY" },
  status: { type: String, enum: ["PENDING","PREPARING","READY","COMPLETED","CANCELLED"], default: "PENDING" },
  total: { type: Number, min: 0, required: true },
  paid: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
