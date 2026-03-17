const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  profile: {
    avatar: String,
    bio: String,
    phone: String,
    dateOfBirth: Date,
    address: String,
    preferences: {
      favoriteMoods: [String],
      searchRadius: {
        type: Number,
        default: 2000
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto'
      },
      notifications: {
        email: {
          type: Boolean,
          default: true
        },
        push: {
          type: Boolean,
          default: true
        }
      },
      privacy: {
        showProfile: {
          type: Boolean,
          default: true
        },
        showActivity: {
          type: Boolean,
          default: true
        }
      }
    }
  },
  stats: {
    totalSearches: {
      type: Number,
      default: 0
    },
    totalPlacesSaved: {
      type: Number,
      default: 0
    },
    totalPlacesVisited: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    }
  },
  searchHistory: [{
    query: String,
    location: {
      lat: Number,
      lng: Number
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    resultsCount: Number,
    mood: String
  }],
  recentlyViewed: [{
    placeId: {
      type: String,
      required: true
    },
    placeName: {
      type: String,
      required: true
    },
    placeDetails: {
      types: [String],
      address: String,
      rating: Number,
      priceLevel: Number,
      photos: [String]
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  savedPlaces: [{
    placeId: {
      type: String,
      required: true
    },
    placeName: {
      type: String,
      required: true
    },
    placeDetails: {
      types: [String],
      address: String,
      rating: Number,
      priceLevel: Number,
      photos: [String],
      website: String,
      phone: String
    },
    savedAt: {
      type: Date,
      default: Date.now
    },
    notes: String,
    tags: [String]
  }],
  reviews: [{
    placeId: String,
    placeName: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    photos: [String],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last login method
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Add to search history method
userSchema.methods.addToSearchHistory = function(query, location, resultsCount, mood) {
  // Remove existing same query from today
  const today = new Date().toDateString();
  this.searchHistory = this.searchHistory.filter(search => 
    new Date(search.timestamp).toDateString() !== today || search.query !== query
  );
  
  // Add new search to beginning
  this.searchHistory.unshift({
    query,
    location,
    resultsCount,
    mood,
    timestamp: new Date()
  });
  
  // Keep only last 100 searches
  this.searchHistory = this.searchHistory.slice(0, 100);
  
  // Update stats
  this.stats.totalSearches += 1;
  
  return this.save();
};

// Add to recently viewed method
userSchema.methods.addToRecentlyViewed = function(placeId, placeName, placeDetails) {
  // Remove if already exists
  this.recentlyViewed = this.recentlyViewed.filter(
    place => place.placeId !== placeId
  );
  
  // Add to beginning
  this.recentlyViewed.unshift({
    placeId,
    placeName,
    placeDetails,
    timestamp: new Date()
  });
  
  // Keep only last 50 items
  this.recentlyViewed = this.recentlyViewed.slice(0, 50);
  
  // Update stats
  this.stats.totalPlacesVisited = this.recentlyViewed.length;
  
  return this.save();
};

// Add to saved places method
userSchema.methods.addToSavedPlaces = function(placeId, placeName, placeDetails, notes, tags) {
  // Check if already saved
  const existing = this.savedPlaces.find(
    place => place.placeId === placeId
  );
  
  if (existing) {
    throw new Error('Place already saved');
  }
  
  // Add to saved places
  this.savedPlaces.push({
    placeId,
    placeName,
    placeDetails,
    notes,
    tags,
    savedAt: new Date()
  });
  
  // Update stats
  this.stats.totalPlacesSaved = this.savedPlaces.length;
  
  return this.save();
};

// Remove from saved places method
userSchema.methods.removeFromSavedPlaces = function(placeId) {
  this.savedPlaces = this.savedPlaces.filter(
    place => place.placeId !== placeId
  );
  
  // Update stats
  this.stats.totalPlacesSaved = this.savedPlaces.length;
  
  return this.save();
};

// Virtual for user's public profile
userSchema.virtual('publicProfile').get(function() {
  return {
    name: this.name,
    avatar: this.profile?.avatar,
    bio: this.profile?.bio,
    stats: this.stats,
    joinDate: this.createdAt
  };
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'savedPlaces.placeId': 1 });
userSchema.index({ 'recentlyViewed.placeId': 1 });
userSchema.index({ 'searchHistory.timestamp': -1 });

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
