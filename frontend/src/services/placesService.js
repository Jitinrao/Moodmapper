const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Get nearby places based on mood and location
export const getNearbyPlaces = async (location, mood, radius) => {
  try {
    console.log('🔍 Fetching places:', { location, mood, radius });
    
    const params = new URLSearchParams({
      location: JSON.stringify(location),
      mood,
      radius: radius.toString()
    });

    const response = await fetch(`${API_BASE_URL}/places/recommend?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    console.log('✅ Places fetched:', data.places?.length || 0);
    return data;
    
  } catch (error) {
    console.error('❌ Error fetching places:', error);
    throw error;
  }
};

// Search places
export const searchPlaces = async (location, query, radius) => {
  try {
    console.log('🔍 Searching places:', { location, query, radius });
    
    const params = new URLSearchParams({
      location: JSON.stringify(location),
      query,
      radius: radius.toString()
    });

    const response = await fetch(`${API_BASE_URL}/places/search?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to search places');
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    console.log('✅ Search results:', data.places?.length || 0);
    return data;
    
  } catch (error) {
    console.error('❌ Error searching places:', error);
    throw error;
  }
};

// Get place details
export const getPlaceDetails = async (placeId) => {
  try {
    console.log('🔍 Getting place details:', placeId);
    
    const response = await fetch(`${API_BASE_URL}/places/details/${placeId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch place details');
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
    
  } catch (error) {
    console.error('❌ Error fetching place details:', error);
    throw error;
  }
};
