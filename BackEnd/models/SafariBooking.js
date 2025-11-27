import mongoose from 'mongoose';
const { Schema } = mongoose;

const safariBookingSchema = new mongoose.Schema({
  // Package details
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  packageName: {
    type: String,
    required: true
  },
  packagePrice: {
    type: Number,
    required: true
  },
  packageImage: {
    type: String
  },
  packageType: {
    type: String,
    required: true
  },
  packageDestination: {
    type: String,
    required: true
  },
  packageDate: {
    type: String,
    required: true
  },
  packagePeriod: {
    type: String,
    required: true
  },
  packageVisitors: {
    type: Number,
    required: true
  },

  // Customer details
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
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Booking details
  bookingDate: {
    type: Date,
    default: Date.now
  },
  totalAmount: {
    type: Number,
    required: true
  },
  numberOfPeople: {
    type: Number,
    required: true,
    default: 1
  },

  // Special requests
  specialRequests: {
    type: String,
    default: ""
  },

  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },

  // Payment details
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'hotel_payment'
  },

  // Admin notes
  adminNotes: {
    type: String,
    default: ""
  },

  // Timestamps
  confirmedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
safariBookingSchema.index({ status: 1, bookingDate: -1 });
safariBookingSchema.index({ customerEmail: 1 });
safariBookingSchema.index({ packageId: 1 });

export default mongoose.model('SafariBooking', safariBookingSchema);
