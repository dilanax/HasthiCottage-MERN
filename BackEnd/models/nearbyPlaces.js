import mongoose from 'mongoose';

const nearbyPlacesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Wildlife Safari', 'Conservation Center', 'Scenic Viewpoint', 'Bird Sanctuary', 'Religious Site', 'Cultural Site', 'Adventure Activity', 'Restaurant', 'Shopping']
  },
  distance: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  activities: [{
    type: String,
    trim: true
  }],
  bestTime: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: false
  },
  website: {
    type: String,
    required: false
  },
  images: [{
    type: String,
    url: String
  }],
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  entryFee: {
    adult: {
      type: Number,
      default: 0
    },
    child: {
      type: Number,
      default: 0
    },
    foreigner: {
      type: Number,
      default: 0
    }
  },
  facilities: [{
    type: String,
    trim: true
  }],
  openingHours: {
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String,
    sunday: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['nature', 'wildlife', 'culture', 'adventure', 'religious', 'dining', 'shopping'],
    required: true
  }
}, {
  timestamps: true
});

// Index for better search performance
nearbyPlacesSchema.index({ name: 'text', description: 'text', activities: 'text' });
nearbyPlacesSchema.index({ category: 1 });
nearbyPlacesSchema.index({ featured: 1, isActive: 1 });

const NearbyPlaces = mongoose.model('NearbyPlaces', nearbyPlacesSchema);

export default NearbyPlaces;
