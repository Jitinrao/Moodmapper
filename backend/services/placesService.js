const axios = require('axios');

// Mood to Google Places API type mapping
const moodToPlacesTypes = {
  work: ['coworking_space', 'office', 'business_center', 'library'],
  relax: ['spa', 'park', 'beauty_salon', 'wellness_center'],
  food: ['restaurant', 'cafe', 'bakery', 'bar', 'food', 'meal_delivery'],
  social: ['bar', 'nightclub', 'casino', 'bowling_alley', 'movie_theater'],
  nature: ['park', 'tourist_attraction', 'campground', 'hiking_area', 'zoo'],
  fitness: ['gym', 'fitness_center', 'yoga_studio', 'swimming_pool', 'sports_complex'],
  culture: ['museum', 'art_gallery', 'theater', 'concert_hall', 'cultural_center'],
  entertainment: ['movie_theater', 'amusement_park', 'bowling_alley', 'casino', 'arcade'],
  learning: ['library', 'bookstore', 'school', 'university', 'course'],
  shopping: ['shopping_mall', 'clothing_store', 'supermarket', 'electronics_store', 'department_store'],
  clinic: ['hospital', 'clinic', 'doctor', 'pharmacy', 'dentist', 'veterinary_care']
};

const calculateDistance = (point1, point2) => {
  if (!point1 || !point2 || !point1.lat || !point1.lng || !point2.lat || !point2.lng) {
    return 0;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

const generateMockPlaces = (location, mood, radius) => {
  console.log(`🎲 Generating mock places for location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}, mood: ${mood}, radius: ${radius}m`);
  
  const placeTemplates = {
    work: [
      { name: 'CoWorking Space', type: 'coworking_space', rating: 4.3 },
      { name: 'Business Center', type: 'business_center', rating: 4.0 },
      { name: 'Office Hub', type: 'establishment', rating: 3.8 },
      { name: 'Startup Incubator', type: 'establishment', rating: 4.1 },
      { name: 'Executive Suites', type: 'establishment', rating: 4.2 },
      { name: 'Shared Office', type: 'coworking_space', rating: 3.9 }
    ],
    relax: [
      { name: 'City Park', type: 'park', rating: 4.4 },
      { name: 'Relaxation Center', type: 'spa', rating: 4.1 },
      { name: 'Quiet Garden', type: 'park', rating: 4.6 },
      { name: 'Meditation Studio', type: 'establishment', rating: 4.2 },
      { name: 'Wellness Spa', type: 'spa', rating: 4.3 },
      { name: 'Peaceful Garden', type: 'park', rating: 4.0 }
    ],
    food: [
      { name: 'Local Restaurant', type: 'restaurant', rating: 4.2 },
      { name: 'Street Food Corner', type: 'restaurant', rating: 4.5 },
      { name: 'Family Cafe', type: 'cafe', rating: 4.1 },
      { name: 'Quick Bites', type: 'restaurant', rating: 3.9 },
      { name: 'Pizza Palace', type: 'restaurant', rating: 4.3 },
      { name: 'Burger Joint', type: 'restaurant', rating: 4.0 },
      { name: 'Sushi Bar', type: 'restaurant', rating: 4.6 },
      { name: 'Coffee House', type: 'cafe', rating: 4.4 }
    ]
  };
  
  const templates = placeTemplates[mood] || placeTemplates.food;
  const places = [];
  
  // Generate more places based on radius
  const placeCount = Math.min(Math.floor(radius / 200), 50); // 1 place per 200m, max 50
  
  for (let i = 0; i < placeCount; i++) {
    const template = templates[i % templates.length];
    // Generate random location near user with better randomness
    const seed = Date.now() + i * 1000;
    const random = Math.sin(seed) * 10000;
    const offset = 0.002 + (random % (radius / 1000000)); // Scale with radius
    const angle = (i * 2 * Math.PI) / placeCount + random;
    const placeLocation = {
      lat: location.lat + Math.cos(angle) * offset,
      lng: location.lng + Math.sin(angle) * offset
    };
    
    places.push({
      place_id: `mock_${mood}_${Date.now()}_${i}`,
      name: `${template.name} ${i + 1}`,
      vicinity: `${template.type} • ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      rating: template.rating + (Math.random() - 0.5), // Slight rating variation
      user_ratings_total: Math.floor(Math.random() * 500) + 50,
      price_level: Math.floor(Math.random() * 3) + 1,
      types: [template.type],
      geometry: { location: placeLocation },
      distance: (offset * 111).toFixed(2), // Convert to km
      photos: []
    });
  }
  
  console.log(`🎲 Generated ${places.length} unique mock places for radius ${radius}m`);
  return { 
    places: places.sort((a, b) => a.distance - b.distance),
    source: 'mock_data',
    location: location,
    totalFound: places.length
  };
};

const getNearbyPlaces = async (location, mood, radius = 2000) => {
  try {
    console.log('🔍 Fetching REAL places for location:', location);
    console.log(`📍 Radius: ${radius} meters (${radius/1000} km), Mood: ${mood}`);
    
    // Check if API key exists
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.error('❌ Google Maps API key not configured');
      return generateMockPlaces(location, mood, radius);
    }

    // Try to fetch real places from Google Places API
    console.log('🌐 Attempting to fetch real places from Google API...');
    const types = moodToPlacesTypes[mood] || ['restaurant'];
    const allPlaces = [];
    
    // Strategy 1: Search by specific types
    for (const type of types) {
      try {
        const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
        const searchRadius = Math.min(radius, 50000);
        
        const params = new URLSearchParams({
          location: `${location.lat},${location.lng}`,
          radius: searchRadius.toString(),
          type: type,
          key: process.env.GOOGLE_MAPS_API_KEY
        });

        console.log(`🌐 Calling Google API for type: ${type} with radius: ${searchRadius}m`);
        
        let response;
        try {
          response = await axios.get(`${apiUrl}?${params}`, { 
            timeout: 5000,
            retry: 1,
            retryDelay: 1000
          });
        } catch (apiError) {
          console.error(`❌ Google API failed for type: ${type}`, apiError.message);
          continue; // Skip to next type
        }
        
        if (response.data && response.data.results && response.data.results.length > 0) {
          console.log(`✅ Found ${response.data.results.length} places for type: ${type}`);
          
          // Process and add places
          const processedPlaces = response.data.results.map(place => ({
            place_id: place.place_id,
            name: place.name,
            vicinity: place.vicinity || 'No address',
            rating: place.rating || 0,
            user_ratings_total: place.user_ratings_total || 0,
            price_level: place.price_level || 1,
            types: place.types || [type],
            geometry: {
              location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
              }
            },
            photos: place.photos || [],
            distance: calculateDistance(location, {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            })
          }));
          
          allPlaces.push(...processedPlaces);
        }
        
        // If we found enough places, stop searching
        if (allPlaces.length >= 10) {
          break;
        }
        
      } catch (typeError) {
        console.error(`❌ Error processing type: ${type}`, typeError.message);
        continue;
      }
    }
    
    // If we found real places, return them
    if (allPlaces.length > 0) {
      console.log(`✅ Returning ${allPlaces.length} real places`);
      return {
        places: allPlaces.sort((a, b) => a.distance - b.distance).slice(0, 50), // Return top 50 places
        source: 'google_api',
        location: location,
        totalFound: allPlaces.length
      };
    }
    
    // If no real places found, use mock data
    console.log('❌ No real places found, using mock data');
    return generateMockPlaces(location, mood, radius);
    
  } catch (error) {
    console.error('❌ Critical error in getNearbyPlaces:', error);
    return generateMockPlaces(location, mood, radius);
  }
};

module.exports = {
  getNearbyPlaces,
  generateMockPlaces,
  calculateDistance
};
