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

// Add place to recently viewed
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { placeId, placeName, placeDetails } = req.body;
    const userId = req.user.userId;

    if (!placeId || !placeName) {
      return res.status(400).json({ error: 'Place ID and name are required' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;
    
    if (isMongoConnected) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove if already exists (to move to top)
      user.recentlyViewed = user.recentlyViewed.filter(
        place => place.placeId !== placeId
      );

      // Add to beginning with timestamp
      user.recentlyViewed.unshift({
        placeId,
        placeName,
        placeDetails: placeDetails || {},
        timestamp: new Date()
      });

      // Keep only last 50 items
      user.recentlyViewed = user.recentlyViewed.slice(0, 50);

      // Update stats
      user.stats.totalPlacesVisited = user.recentlyViewed.length;

      await user.save();

      res.json({
        message: 'Place added to recently viewed',
        recentlyViewed: user.recentlyViewed,
        totalRecentlyViewed: user.recentlyViewed.length
      });
    } else {
      res.status(503).json({ 
        error: 'Database not available. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Error adding to recently viewed:', error);
    res.status(500).json({ error: 'Failed to add to recently viewed' });
  }
});

// Get user's recently viewed places
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

      // Sort by most recently viewed (already sorted by unshift)
      const sortedRecentlyViewed = user.recentlyViewed;

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedRecentlyViewed = sortedRecentlyViewed.slice(startIndex, endIndex);

      res.json({
        recentlyViewed: paginatedRecentlyViewed,
        totalRecentlyViewed: sortedRecentlyViewed.length,
        currentPage: parseInt(page),
        totalPages: Math.ceil(sortedRecentlyViewed.length / limit),
        hasNext: endIndex < sortedRecentlyViewed.length,
        hasPrev: page > 1
      });
    } else {
      res.status(503).json({ 
        error: 'Database not available. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Error fetching recently viewed:', error);
    res.status(500).json({ error: 'Failed to fetch recently viewed' });
  }
});

// Clear recently viewed history
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const isMongoConnected = mongoose.connection.readyState === 1;
    
    if (isMongoConnected) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Clear recently viewed
      user.recentlyViewed = [];

      // Update stats
      user.stats.totalPlacesVisited = 0;

      await user.save();

      res.json({
        message: 'Recently viewed history cleared',
        recentlyViewed: user.recentlyViewed,
        totalRecentlyViewed: 0
      });
    } else {
      res.status(503).json({ 
        error: 'Database not available. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Error clearing recently viewed:', error);
    res.status(500).json({ error: 'Failed to clear recently viewed' });
  }
});

// Remove specific place from recently viewed
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

      // Remove from recently viewed
      user.recentlyViewed = user.recentlyViewed.filter(
        place => place.placeId !== placeId
      );

      // Update stats
      user.stats.totalPlacesVisited = user.recentlyViewed.length;

      await user.save();

      res.json({
        message: 'Place removed from recently viewed',
        recentlyViewed: user.recentlyViewed,
        totalRecentlyViewed: user.recentlyViewed.length
      });
    } else {
      res.status(503).json({ 
        error: 'Database not available. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Error removing from recently viewed:', error);
    res.status(500).json({ error: 'Failed to remove from recently viewed' });
  }
});

// Get recently viewed statistics
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
      const totalRecentlyViewed = user.recentlyViewed.length;
      const recentViews = user.recentlyViewed.filter(
        place => new Date(place.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;

      // Group by day for analytics
      const dailyStats = {};
      user.recentlyViewed.forEach(place => {
        const day = new Date(place.timestamp).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        dailyStats[day] = (dailyStats[day] || 0) + 1;
      });

      // Most viewed place types
      const placeTypes = {};
      user.recentlyViewed.forEach(place => {
        const types = place.placeDetails?.types || [];
        types.forEach(type => {
          placeTypes[type] = (placeTypes[type] || 0) + 1;
        });
      });

      res.json({
        totalRecentlyViewed,
        recentViews,
        dailyStats,
        placeTypes,
        stats: user.stats
      });
    } else {
      res.status(503).json({ 
        error: 'Database not available. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Error fetching recently viewed stats:', error);
    res.status(500).json({ error: 'Failed to fetch recently viewed statistics' });
  }
});

module.exports = router;
