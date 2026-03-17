const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  placeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  vicinity: {
    type: String,
    required: true
  },
  geometry: {
    location: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  types: [{
    type: String
  }],
  icon: String,
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  userRatingsTotal: {
    type: Number,
    default: 0
  },
  priceLevel: {
    type: Number,
    min: 0,
    max: 4
  },
  openingHours: {
    openNow: {
      type: Boolean,
      default: false
    },
    periods: [{
      open: {
        day: Number,
        time: String
      },
      close: {
        day: Number,
        time: String
      }
    }],
    weekdayText: [String]
  },
  photos: [{
    reference: String,
    height: Number,
    width: Number,
    htmlAttributions: [String]
  }],
  reviews: [{
    authorName: String,
    rating: Number,
    text: String,
    time: Number
  }],
  formattedAddress: String,
  formattedPhoneNumber: String,
  internationalPhoneNumber: String,
  website: String,
  url: String,
  moodScores: {
    work: {
      type: Number,
      default: 0
    },
    date: {
      type: Number,
      default: 0
    },
    'quick-bite': {
      type: Number,
      default: 0
    },
    budget: {
      type: Number,
      default: 0
    }
  },
  popularity: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalSaves: {
      type: Number,
      default: 0
    },
    totalVisits: {
      type: Number,
      default: 0
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for better performance
placeSchema.index({ 'geometry.location': '2dsphere' });
placeSchema.index({ types: 1 });
placeSchema.index({ rating: -1 });
placeSchema.index({ moodScores: 1 });

module.exports = mongoose.model('Place', placeSchema);
