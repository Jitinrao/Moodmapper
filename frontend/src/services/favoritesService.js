import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with auth headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Favorites API
export const favoritesAPI = {
  // Add place to favorites
  addToFavorites: async (placeId, placeName, placeDetails) => {
    try {
      const response = await apiClient.post('/favorites/add', {
        placeId,
        placeName,
        placeDetails
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  },

  // Get user's favorites
  getFavorites: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get('/favorites', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },

  // Remove place from favorites
  removeFromFavorites: async (placeId) => {
    try {
      const response = await apiClient.delete(`/favorites/remove/${placeId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  },

  // Check if place is in favorites
  checkFavoriteStatus: async (placeId) => {
    try {
      const response = await apiClient.get(`/favorites/check/${placeId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      throw error;
    }
  },

  // Get favorite statistics
  getFavoriteStats: async () => {
    try {
      const response = await apiClient.get('/favorites/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching favorite stats:', error);
      throw error;
    }
  }
};

// Recently Viewed API
export const recentlyViewedAPI = {
  // Add place to recently viewed
  addToRecentlyViewed: async (placeId, placeName, placeDetails) => {
    try {
      const response = await apiClient.post('/recently-viewed/add', {
        placeId,
        placeName,
        placeDetails
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
      throw error;
    }
  },

  // Get user's recently viewed places
  getRecentlyViewed: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get('/recently-viewed', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
      throw error;
    }
  },

  // Clear recently viewed history
  clearRecentlyViewed: async () => {
    try {
      const response = await apiClient.delete('/recently-viewed/clear');
      return response.data;
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
      throw error;
    }
  },

  // Remove specific place from recently viewed
  removeFromRecentlyViewed: async (placeId) => {
    try {
      const response = await apiClient.delete(`/recently-viewed/remove/${placeId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from recently viewed:', error);
      throw error;
    }
  },

  // Get recently viewed statistics
  getRecentlyViewedStats: async () => {
    try {
      const response = await apiClient.get('/recently-viewed/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching recently viewed stats:', error);
      throw error;
    }
  }
};

export default { favoritesAPI, recentlyViewedAPI };
