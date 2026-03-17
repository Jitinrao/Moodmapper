const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Add place to favorites
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { placeId, placeName, placeDetails } = req.body;
    const userId = req.user.userId;

    if (!placeId || !placeName) {
      return res.status(400).json({ error: 'Place ID and name are required' });
    }

    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    if (isMongoConnected) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if place is already in favorites
      const existingFavorite = user.savedPlaces.find(
        place => place.placeId === placeId
      );

      if (existingFavorite) {
        return res.status(400).json({ error: 'Place already in favorites' });
      }

      // Add to favorites
      user.savedPlaces.push({
        placeId,
        placeName,
        placeDetails: placeDetails || {},
        savedAt: new Date()
      });

      // Update stats
      user.stats.totalPlacesSaved = user.savedPlaces.length;

      await user.save();

      res.json({
        message: 'Place added to favorites',
        favorites: user.savedPlaces,
        totalFavorites: user.savedPlaces.length
      });
    } else {
      // Fallback to in-memory storage (for development)
      res.status(503).json({ 
        error: 'Database not available. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Get user's favorites
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    const isMongoConnected = mongoose.connection.readyState === 1;
    
    if (isMongoConnected) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Sort by most recently saved
      const sortedFavorites = user.savedPlaces
        .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedFavorites = sortedFavorites.slice(startIndex, endIndex);

      res.json({
        favorites: paginatedFavorites,
        totalFavorites: sortedFavorites.length,
        currentPage: parseInt(page),
        totalPages: Math.ceil(sortedFavorites.length / limit),
        hasNext: endIndex < sortedFavorites.length,
        hasPrev: page > 1
      });
    } else {
      res.status(503).json({ 
        error: 'Database not available. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Remove place from favorites
router.delete('/remove/:placeId', authenticateToken, async (req, res) => {
  try {
    const { placeId } = req.params;
    const userId = req.user.userId;

    const isMongoConnected = mongoose.connection.readyState === 1;
    
    if (isMongoConnected) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove from favorites
      user.savedPlaces = user.savedPlaces.filter(
        place => place.placeId !== placeId
      );

      // Update stats
      user.stats.totalPlacesSaved = user.savedPlaces.length;

      await user.save();

      res.json({
        message: 'Place removed from favorites',
        favorites: user.savedPlaces,
        totalFavorites: user.savedPlaces.length
      });
    } else {
      res.status(503).json({ 
        error: 'Database not available. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// Check if place is in favorites
router.get('/check/:placeId', authenticateToken, async (req, res) => {
  try {
    const { placeId } = req.params;
    const userId = req.user.userId;

    const isMongoConnected = mongoose.connection.readyState === 1;
    
    if (isMongoConnected) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isFavorite = user.savedPlaces.some(
        place => place.placeId === placeId
      );

      res.json({
        isFavorite,
        placeId
      });
    } else {
      res.status(503).json({ 
        error: 'Database not available. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

// Get favorite statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const isMongoConnected = mongoose.connection.readyState === 1;
    
    if (isMongoConnected) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Calculate statistics
      const totalFavorites = user.savedPlaces.length;
      const recentFavorites = user.savedPlaces.filter(
        place => new Date(place.savedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;

      // Group by month for analytics
      const monthlyStats = {};
      user.savedPlaces.forEach(place => {
        const month = new Date(place.savedAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        monthlyStats[month] = (monthlyStats[month] || 0) + 1;
      });

      res.json({
        totalFavorites,
        recentFavorites,
        monthlyStats,
        stats: user.stats
      });
    } else {
      res.status(503).json({ 
        error: 'Database not available. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Error fetching favorite stats:', error);
    res.status(500).json({ error: 'Failed to fetch favorite statistics' });
  }
});

module.exports = router;
