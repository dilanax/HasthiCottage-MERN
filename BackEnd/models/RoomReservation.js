import mongoose from 'mongoose';
const { Schema } = mongoose;

const roomSchema = new Schema({}, { strict: false, timestamps: true, collection: 'room_reservations' });
// ↑ change to your actual collection name.

export default mongoose.model('RoomReservation', roomSchema);
