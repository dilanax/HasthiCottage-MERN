import mongoose from 'mongoose';
const { Schema } = mongoose;

// QUICK SAFE WRAPPER: uses your existing collection as-is (no strict checks)
const orderSchema = new Schema({}, { strict: false, timestamps: true, collection: 'orders' });
// ↑ change 'orders' to your real collection name if different.

export default mongoose.model('GenericOrder', orderSchema);
