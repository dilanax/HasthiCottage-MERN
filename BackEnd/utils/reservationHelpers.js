// utils/reservationHelpers.js
import mongoose from "mongoose";
import Room from "../models/Room.js";
import RoomAllocation from "../models/roomallocation.js";

/**
 * Converts a date to only the date part (removes time).
 * Ensures the time is set to midnight (00:00) to avoid time-zone issues.
 *
 * @param {String|Date} date - The date to be converted.
 * @returns {Date} - The normalized date with time set to midnight.
 */
export function toDateOnly(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Calculates the number of nights between check-in and check-out dates.
 * Excludes the check-out date in the calculation.
 *
 * @param {Date} checkIn - The check-in date.
 * @param {Date} checkOut - The check-out date.
 * @returns {number} - The number of nights between the two dates.
 */
export function nightsBetween(checkIn, checkOut) {
  const msInOneDay = 24 * 60 * 60 * 1000;
  return Math.round((checkOut - checkIn) / msInOneDay);
}

/**
 * Returns true if two date ranges overlap.
 * Ranges are [start, end) — checkOut is exclusive.
 */
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Finds available rooms for the given package, dates, and required number of rooms.
 * This function checks existing RoomAllocation records and the Room.status to avoid double-booking.
 *
 * @param {Object} params
 * @param {String|ObjectId} params.packageId
 * @param {Date} params.checkIn
 * @param {Date} params.checkOut
 * @param {Number} params.roomsWanted
 * @param {Object} session - optional mongoose session for transactions
 * @returns {Array} - Array of available Room documents (length <= roomsWanted)
 */
export async function findAvailableRooms({ packageId, checkIn, checkOut, roomsWanted }, session = null) {
  if (!packageId) throw new Error("packageId required");
  if (!checkIn || !checkOut) throw new Error("checkIn and checkOut required");

  const inDate = toDateOnly(checkIn);
  const outDate = toDateOnly(checkOut);

  // find candidate rooms for the package that are available
  const candidateQuery = {
    package: packageId,
    status: { $ne: "reserved" }, // we prefer rooms not already reserved
    availableCount: { $gt: 0 } // only rooms with available count > 0
  };

  // Use a cursor / find then filter by allocations to avoid complicated aggregation
  const query = Room.find(candidateQuery);
  if (session) query.session(session);
  const candidates = await query.exec();

  const available = [];

  for (const room of candidates) {
    if (available.length >= roomsWanted) break;

    // Check allocations overlapping with desired date range
    const allocQuery = {
      room: room._id,
      // find allocations where allocation.checkIn < outDate AND allocation.checkOut > inDate
      checkIn: { $lt: outDate },
      checkOut: { $gt: inDate }
    };
    let allocQ = RoomAllocation.findOne(allocQuery);
    if (session) allocQ = allocQ.session(session);
    const overlapping = await allocQ.exec();

    // if there is no overlapping allocation, room is available
    if (!overlapping) {
      available.push(room);
    }
  }

  // If we found enough rooms, return exactly roomsWanted (or fewer if not enough)
  return available.slice(0, roomsWanted);
}

/**
 * Allocate a room by creating a RoomAllocation record (and return it).
 * If session provided, uses the session (for transactions).
 *
 * @param {ObjectId|String} roomId
 * @param {ObjectId|String} reservationId
 * @param {Date} checkIn
 * @param {Date} checkOut
 * @param {ClientSession|null} session
 * @returns {Promise<Document>} the created RoomAllocation document
 */
export async function allocateRoom(roomId, reservationId, checkIn, checkOut, session = null) {
  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new Error("Invalid roomId");
  }
  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    throw new Error("Invalid reservationId");
  }

  const allocation = {
    room: roomId,
    reservation: reservationId,
    checkIn: toDateOnly(checkIn),
    checkOut: toDateOnly(checkOut),
  };

  // Decrement the availableCount for the room
  const roomUpdateQuery = { $inc: { availableCount: -1 } };
  let roomUpdate = Room.findByIdAndUpdate(roomId, roomUpdateQuery, { new: true });
  if (session) roomUpdate = roomUpdate.session(session);
  await roomUpdate.exec();

  // Create the room allocation
  if (session) {
    const created = await RoomAllocation.create([allocation], { session });
    return created[0];
  } else {
    return await RoomAllocation.create(allocation);
  }
}

/**
 * Release a room allocation by incrementing the availableCount back.
 * This is used when reservations are cancelled.
 *
 * @param {ObjectId|String} roomId
 * @param {ObjectId|String} reservationId
 * @param {ClientSession|null} session
 * @returns {Promise<Document>} the updated Room document
 */
export async function releaseRoom(roomId, reservationId, session = null) {
  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new Error("Invalid roomId");
  }
  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    throw new Error("Invalid reservationId");
  }

  // Increment the availableCount for the room
  const roomUpdateQuery = { $inc: { availableCount: 1 } };
  let roomUpdate = Room.findByIdAndUpdate(roomId, roomUpdateQuery, { new: true });
  if (session) roomUpdate = roomUpdate.session(session);
  const updatedRoom = await roomUpdate.exec();

  // Remove the room allocation
  const allocationQuery = { room: roomId, reservation: reservationId };
  let allocationDelete = RoomAllocation.deleteOne(allocationQuery);
  if (session) allocationDelete = allocationDelete.session(session);
  await allocationDelete.exec();

  return updatedRoom;
}

export default {
  toDateOnly,
  nightsBetween,
  findAvailableRooms,
  allocateRoom,
  releaseRoom,
};
