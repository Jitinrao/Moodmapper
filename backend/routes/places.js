const express = require('express');
const router = express.Router();
const { getNearbyPlaces, getPlaceDetails, calculateDistance } = require('../services/placesService');

// Health check endpoint
router.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'nearby-tracker-api'
  });
});

// Get mood-based recommendations
router.get('/recommend', async (req, res) => {
  // Set timeout for the entire request
  req.setTimeout(15000); // 15 second timeout
  
  try {
    const { mood, location, radius } = req.query;

    if (!mood || !location) {
      return res.status(400).json({ 
        error: 'mood and location are required',
        code: 'MISSING_PARAMS'
      });
    }

    // Parse location - handle both JSON string and direct object
    let parsedLocation;
    try {
      parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    } catch (parseError) {
      return res.status(400).json({
        error: 'Invalid location format. Expected JSON object with lat and lng',
        code: 'INVALID_LOCATION'
      });
    }

    // Validate location has required coordinates
    if (!parsedLocation.lat || !parsedLocation.lng) {
      return res.status(400).json({
        error: 'Location must include lat and lng coordinates',
        code: 'INVALID_COORDINATES'
      });
    }

    // Parse and validate radius
    let radiusMeters = parseInt(radius) || 2000; // Default 2km
    if (radiusMeters > 50000) {
      radiusMeters = 50000; // Max 50km for Google API
    }

    console.log('🎯 Backend route received radius:', radiusMeters, 'meters');
    console.log('🎯 Processing request:', {
      mood: mood,
      location: parsedLocation,
      radius: radiusMeters
    });

    // Call the places service with parsed location and timeout
    let result;
    try {
      result = await Promise.race([
        getNearbyPlaces(parsedLocation, mood, radiusMeters),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Backend timeout')), 25000) // Increased to 25 seconds
        )
      ]);
    } catch (error) {
      console.error('❌ Promise.race failed:', error.message);
      result = { places: [], error: error.message, source: 'timeout_error' };
    }
    
    // Return location in response for frontend verification
    res.json({
      ...result,
      requestLocation: parsedLocation,
      requestRadius: radiusMeters,
      requestMood: mood,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in /recommend endpoint:', error);
    
    // Handle timeout specifically
    if (error.message === 'Backend timeout') {
      return res.status(408).json({
        error: 'Request timeout. Please try again.',
        code: 'TIMEOUT'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch places. Please try again.',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Get place details
router.get('/details/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    
    if (!placeId) {
      return res.status(400).json({ 
        error: 'Place ID is required' 
      });
    }

    const placeDetails = await getPlaceDetails(placeId);
    res.json(placeDetails);
    
  } catch (error) {
    console.error('❌ Error fetching place details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch place details.' 
    });
  }
});

// Search places
router.get('/search', async (req, res) => {
  try {
    const { query, location, radius } = req.query;

    if (!query || !location) {
      return res.status(400).json({ 
        error: 'query and location are required' 
      });
    }

    // Convert radius to meters if provided, otherwise use default
    const radiusMeters = radius ? parseInt(radius) : 2000;

    // Parse location from query string
    let parsedLocation;
    try {
      parsedLocation = JSON.parse(location);
    } catch (e) {
      return res.status(400).json({ 
        error: 'Invalid location format. Expected JSON string.' 
      });
    }

    console.log('🔍 Processing search request:', { query, location: parsedLocation, radius: radiusMeters });

    // For search, use establishment type to get all types
    const placesData = await getNearbyPlaces(parsedLocation, 'establishment', radiusMeters);
    
    // Filter results based on query
    if (placesData.places && query) {
      const searchQuery = query.toLowerCase();
      placesData.places = placesData.places.filter(place => 
        place.name.toLowerCase().includes(searchQuery) ||
        place.vicinity.toLowerCase().includes(searchQuery) ||
        place.types.some(type => type.toLowerCase().includes(searchQuery))
      );
    }
    
    res.json(placesData);
    
  } catch (error) {
    console.error('❌ Error in /search endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to search places. Please try again.' 
    });
  }
});

module.exports = router;
