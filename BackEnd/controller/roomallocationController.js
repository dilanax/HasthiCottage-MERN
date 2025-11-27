import RoomAllocation from "../models/roomallocation.js";
import Room from "../models/Room.js";  // Assuming you've created this Room model
import Reservation from "../models/Reservation.js";  // Assuming you've created this Reservation model

const allocateRoom = async (roomId, reservationId, checkIn, checkOut) => {
  try {
    const roomAllocation = new RoomAllocation({
      room: roomId,
      reservation: reservationId,
      checkIn: checkIn,
      checkOut: checkOut,
    });
    
    await roomAllocation.save();
    console.log("Room allocated successfully");
  } catch (err) {
    console.error("Error allocating room:", err.message);
  }
};
