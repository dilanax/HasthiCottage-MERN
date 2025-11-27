import mongoose from 'mongoose';

const roomTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
roomTypeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const RoomType = mongoose.model('RoomType', roomTypeSchema);

export default RoomType;

