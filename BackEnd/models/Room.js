import mongoose from "mongoose";
const { Schema } = mongoose;

const roomSchema = new Schema({
  room_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  roomType: {
    type: String,
    required: true,
    index: true,
  },
  bedLabel: { 
    type: String, 
    required: true
  },
  sizeSqm: { 
    type: Number, 
    required: true 
  },
  capacityAdults: { 
    type: Number, 
    default: 2 
  },
  capacityChildren: { 
    type: Number, 
    default: 0 
  },
  features: {
    freeWifi: { type: Boolean, default: true },
    airConditioning: { type: Boolean, default: false },
    patio: { type: Boolean, default: false },
    bidet: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false },
    dishwasher: { type: Boolean, default: false },
  },
  perks: {
    gardenView: { type: Boolean, default: false },
    landmarkView: { type: Boolean, default: false },
    innerCourtyardView: { type: Boolean, default: false },
    privateBathroom: { type: Boolean, default: true },
    privatePool: { type: Boolean, default: false },
  },
  imageGallery: [
  { url: String, position: Number }
  ],// Azure blob URLs
  active: { type: Boolean, default: true },
  availableCount: { type: Number, default: 1 },
  status: { 
    type: String, 
    enum: ["available", "reserved", "maintenance"], 
    default: "available" 
  }
}, { timestamps: true });

const Room = mongoose.model("Room", roomSchema);
export default Room;
