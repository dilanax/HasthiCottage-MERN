import mongoose from "mongoose";

const FoodBookingSchema = new mongoose.Schema({
  // Food item details
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  itemPrice: {
    type: Number,
    required: true
  },
  itemImage: {
    type: String
  },
  
  // Customer details
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make it optional for backward compatibility
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  
  // Booking details
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Special requests
  specialRequests: {
    type: String,
    default: ""
  },
  
  // Booking status
  status: {
    type: String,
    enum: ['pending', 'preparing', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Timestamps
  bookingDate: {
    type: Date,
    default: Date.now
  },
  preparedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  
  // Admin notes
  adminNotes: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

// Index for better query performance
FoodBookingSchema.index({ status: 1, bookingDate: -1 });
FoodBookingSchema.index({ customerEmail: 1 });

export default mongoose.model("FoodBooking", FoodBookingSchema);

