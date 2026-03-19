import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import SettingsDropdown from './components/SettingsDropdown';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ProductionGoogleMaps from './components/ProductionGoogleMaps';
import Footer from './components/Footer';
import ProfilePage from './pages/ProfilePage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import './App.css';

// Mood to Google Places API type mapping
const moodToPlacesTypes = {
  work: ['coworking_space', 'office'],
  relax: ['spa', 'park'],
  food: ['restaurant', 'cafe'],
  social: ['bar', 'nightclub'],
  nature: ['park', 'tourist_attraction'],
  fitness: ['gym'],
  culture: ['museum', 'art_gallery'],
  entertainment: ['movie_theater', 'amusement_park'],
  learning: ['library', 'bookstore'],
  shopping: ['shopping_mall', 'clothing_store']
};

// Moods configuration
const moods = [
  { id: 'work', name: 'Work', icon: '💼', color: '#3B82F6' },
  { id: 'relax', name: 'Relax', icon: '🧘', color: '#10B981' },
  { id: 'food', name: 'Food', icon: '🍕', color: '#F59E0B' },
  { id: 'social', name: 'Social', icon: '🎉', color: '#EF4444' },
  { id: 'nature', name: 'Nature', icon: '🌳', color: '#059669' },
  { id: 'fitness', name: 'Fitness', icon: '💪', color: '#8B5CF6' },
  { id: 'culture', name: 'Culture', icon: '🎭', color: '#EC4899' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#F97316' },
  { id: 'learning', name: 'Learning', icon: '📚', color: '#6366F1' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#84CC16' }
];

const App = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  // State for search and location
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedDistance, setSelectedDistance] = useState(5);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [mapZoom, setMapZoom] = useState(12);
  const [placesService, setPlacesService] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showRecentlyViewed, setShowRecentlyViewed] = useState(false);

  // Refs for map and services
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Clear markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];
    setMarkers([]);
  }, []);

  // Handle map load
  const handleMapLoad = useCallback(({ map, placesService: ps, geocoder: gc }) => {
    console.log('✅ Simple Map loaded successfully');
    setPlacesService(ps);
    setGeocoder(gc);
    mapInstanceRef.current = map; // ✅ Set map instance reference
    
    // If user location is already set, center map on it
    if (currentLocation) {
      map.setCenter(currentLocation);
    }
  }, [currentLocation]);

  // Handle place selection from autocomplete
  const handlePlaceSelect = useCallback((suggestion) => {
    if (!geocoder) return;
  
  setLoading(true);
  setError('');
  
  // Get place details
  geocoder.geocode({ placeId: suggestion.place_id }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const location = {
        lat: results[0].geometry.location.lat(),
        lng: results[0].geometry.location.lng()
      };
      
      console.log('📍 Place selected:', suggestion.description);
      console.log('📍 Place location:', location);
      
      setCurrentLocation(location);
      setMapCenter(location);
      setSearchQuery(suggestion.description);
      
      // Add to recently viewed
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const newRecentlyViewed = [results[0], ...recentlyViewed.filter(p => p.place_id !== results[0].place_id)].slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(newRecentlyViewed));
      
      // Fetch nearby places if mood is selected
      if (selectedMood && placesService) {
        fetchNearbyPlaces(location, selectedMood, selectedDistance);
      }
    } else {
      console.error('❌ Geocoding failed:', status);
      setError('Failed to get location details');
    }
    setLoading(false);
  });
}, [geocoder, selectedMood, selectedDistance, placesService]);

// Handle manual search
  const handleManualSearch = () => {
    if (!searchQuery.trim() || !geocoder) return;
    
    setLoading(true);
    setError('');
    
    console.log('🔍 Manual search for:', searchQuery);
    
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };
        
        console.log('✅ Manual search location found:', location);
        setCurrentLocation(location);
        setMapCenter(location);
        
        // Add to recently viewed
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const newRecentlyViewed = [results[0], ...recentlyViewed.filter(p => p.place_id !== results[0].place_id)].slice(0, 10);
        localStorage.setItem('recentlyViewed', JSON.stringify(newRecentlyViewed));
        
        // Fetch nearby places if mood is selected
        if (selectedMood && placesService) {
          fetchNearbyPlaces(location, selectedMood, selectedDistance);
        }
      } else {
        console.error('❌ Manual search failed:', status);
        setError('Location not found. Please try a different search term.');
      }
      setLoading(false);
    });
  };

  // Fetch nearby places
  const fetchNearbyPlaces = useCallback((location, mood, distance) => {
    if (!placesService) return;
    
    setLoading(true);
    setError('');
    
    const placeTypes = moodToPlacesTypes[mood] || ['establishment'];
    
    console.log('🔍 Fetching nearby places:', { location, mood, placeTypes, distance });
    
    placesService.nearbySearch(
      {
        location: location,
        radius: distance * 1000, // Convert km to meters
        type: placeTypes[0]
      },
      (results, status) => {
        setLoading(false);
        
        if (status === 'OK' && results) {
          console.log('✅ Found places:', results.length);
          
          // Add distance information to each place
          const placesWithDistance = results.map(place => {
            const placeLocation = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };
            
            // Calculate distance (simplified)
            const distance = calculateDistance(location, placeLocation);
            
            return {
              ...place,
              distance: distance.toFixed(1)
            };
          });
          
          setPlaces(placesWithDistance);
          console.log('✅ Places set:', placesWithDistance);
        } else {
          console.error('❌ Places search failed:', status);
          setError('No places found. Try expanding your search radius.');
          setPlaces([]);
        }
      }
    );
  }, [placesService]);

  // Calculate distance between two points
  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Initialize map when user logs in
  useEffect(() => {
    if (isAuthenticated && !mapCenter.lat && !mapCenter.lng) {
      // Set default center if no location is set
      setMapCenter({ lat: 37.7749, lng: -122.4194 });
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    
    // Fetch places if location is already set
    if (currentLocation && placesService) {
      fetchNearbyPlaces(currentLocation, mood, selectedDistance);
    }
  };

  const handleDistanceChange = (distance) => {
    setSelectedDistance(distance);
    
    // Refetch places with new distance if location and mood are set
    if (currentLocation && selectedMood && placesService) {
      fetchNearbyPlaces(currentLocation, selectedMood, distance);
    }
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          console.log('📍 User location obtained:', location);
          setCurrentLocation(location);
          setMapCenter(location);
          
          // Add user location to recently viewed
          const userLocationPlace = {
            place_id: 'user-location',
            name: 'Your Current Location',
            vicinity: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
            geometry: {
              location: {
                lat: location.lat,
                lng: location.lng
              }
            },
            rating: 5.0
          };
          
          const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
          const newRecentlyViewed = [userLocationPlace, ...recentlyViewed.filter(p => p.place_id !== 'user-location')].slice(0, 10);
          localStorage.setItem('recentlyViewed', JSON.stringify(newRecentlyViewed));
          
          // Fetch places if mood is selected
          if (selectedMood && placesService) {
            fetchNearbyPlaces(location, selectedMood, selectedDistance);
          }
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
          setError('Unable to get your location. Please enable location access.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };


  return (
    <div className={`app ${theme}`}>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Mood Mapper</h1>
          <p className="hero-subtitle">Find places that match your vibe</p>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Settings Dropdown */}
          <SettingsDropdown />

          {/* Account Dropdown */}
          {isAuthenticated && (
            <div className="account-dropdown">
              <button className="account-button">
                👤 {user?.email}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<ProductionGoogleMaps />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <AccountSettingsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/contact" element={
            <ProtectedRoute>
              <ContactPage />
            </ProtectedRoute>
          } />
          
          <Route path="/about" element={
            <ProtectedRoute>
              <AboutPage />
            </ProtectedRoute>
          } />
          
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
