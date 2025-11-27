import mongoose from "mongoose";

const roomAllocationSchema = new mongoose.Schema({
  room: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Room", // References the Room model
    required: true 
  },
  reservation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Reservation", // References the Reservation model
    required: true 
  },
  checkIn: { 
    type: Date, 
    required: true 
  },
  checkOut: { 
    type: Date, 
    required: true 
  }
});

const RoomAllocation = mongoose.model("RoomAllocation", roomAllocationSchema);

export default RoomAllocation;
