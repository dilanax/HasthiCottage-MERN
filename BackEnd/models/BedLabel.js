import mongoose from 'mongoose';

const bedLabelSchema = new mongoose.Schema({
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
bedLabelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const BedLabel = mongoose.model('BedLabel', bedLabelSchema);

export default BedLabel;









