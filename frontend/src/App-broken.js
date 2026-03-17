import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './components/AuthPage';
import SettingsDropdown from './components/SettingsDropdown';
import Footer from './components/Footer';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
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

const moods = [
  { id: 'work', name: 'Work', icon: '💼', color: '#4285f4' },
  { id: 'relax', name: 'Relax', icon: '🌅', color: '#34a853' },
  { id: 'food', name: 'Food', icon: '🍽️', color: '#ea4335' },
  { id: 'social', name: 'Social', icon: '🎉', color: '#fbbc04' },
  { id: 'nature', name: 'Nature', icon: '🌳', color: '#34a853' },
  { id: 'fitness', name: 'Fitness', icon: '💪', color: '#e91e63' },
  { id: 'culture', name: 'Culture', icon: '🎨', color: '#9c27b0' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#ff5722' },
  { id: 'learning', name: 'Learning', icon: '📚', color: '#607d8b' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#ff9800' }
];

const App = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedDistance, setSelectedDistance] = useState(5);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapsError, setMapsError] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  
  // Refs for Google Maps
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const placesServiceRef = useRef(null);
  const scriptRef = useRef(null);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const geocoderRef = useRef(null);

  // Default location
  const defaultLocation = { lat: 37.7749, lng: -122.4194 };

  // Google Maps API key
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Debug: Log the API key to verify it's being detected
  console.log('🔑 API Key detected:', GOOGLE_MAPS_API_KEY ? GOOGLE_MAPS_API_KEY.substring(0, 10) + '...' : 'NOT FOUND');
  console.log('🔍 Full API Key check:', GOOGLE_MAPS_API_KEY);

  // Validate API key
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setMapsError('Google Maps API key is missing. Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file.');
      return;
    }

    // Check for common placeholder patterns
    if (GOOGLE_MAPS_API_KEY.includes('your_api_key_here') || 
        GOOGLE_MAPS_API_KEY.includes('AIzaSyBkAGL9XQ1xQ9XQ2xQ3xQ4xQ5xQ6xQ7xQ8xQ9xQ0xQ')) {
      setMapsError('Please replace the placeholder API key with a real Google Maps API key. See setup instructions below.');
      return;
    }

    // If we have a real API key, clear any previous errors
    setMapsError('');
  }, [GOOGLE_MAPS_API_KEY]);

  // Load Google Maps script with proper error handling
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || mapsError) return;

    // Check if script is already loaded
    if (window.google && window.google.maps) {
      console.log('✅ Google Maps already loaded');
      setGoogleMapsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    if (scriptRef.current) {
      console.log('🔄 Google Maps script already loading');
      return;
    }

    console.log('🔍 Loading Google Maps script...');

    const script = document.createElement('script');
    
    // Proper script URL with all required libraries
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Store script reference
    scriptRef.current = script;
    
    // Global callback for script loading
    window.initGoogleMaps = () => {
      console.log('✅ Google Maps loaded successfully');
      setGoogleMapsLoaded(true);
      setMapsError('');
      // Clean up global callback
      delete window.initGoogleMaps;
      scriptRef.current = null;
    };

    // Handle script loading errors
    script.onerror = (error) => {
      console.error('❌ Failed to load Google Maps script:', error);
      setMapsError('Failed to load Google Maps script. Please check your internet connection and API key.');
      scriptRef.current = null;
    };

    // Handle authentication errors
    window.gm_authFailure = () => {
      console.error('❌ Google Maps authentication failed');
      setMapsError('Google Maps authentication failed. Please check your API key and ensure Maps JavaScript API is enabled.');
    };

    // Add script to document
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Only remove script if it exists and hasn't loaded
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
      // Clean up global callbacks
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
      if (window.gm_authFailure) {
        delete window.gm_authFailure;
      }
    };
  }, [GOOGLE_MAPS_API_KEY, mapsError]);

  // Initialize map only once when Google Maps is loaded
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || mapInitialized || mapsError) {
      console.log('🗺️ Map initialization conditions:', {
        googleMapsLoaded,
        mapRefExists: !!mapRef.current,
        mapInitialized,
        mapsError: !!mapsError
      });
      return;
    }

    console.log('🗺️ Initializing Google Maps...');
    
    try {
      // Check if Google Maps is available
      if (!window.google || !window.google.maps) {
        throw new Error('Google Maps not available');
      }

      // Create map instance
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: searchLocation || currentLocation || defaultLocation,
        zoom: 12,
        styles: theme === 'dark' ? [
          { elementType: "geometry", stylers: [{ color: "#212121" }] },
          { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
          { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
          { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
          { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
          { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
          { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
          { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
        ] : [],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      setMapInitialized(true);

      // Initialize Places service
      try {
        placesServiceRef.current = new window.google.maps.places.PlacesService(mapInstance.current);
        geocoderRef.current = new window.google.maps.Geocoder();
        console.log('✅ Places service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Places service:', error);
        setMapsError('Places API is not enabled. Please enable Places API in your Google Cloud Console.');
        return;
      }

      console.log('✅ Map initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      setMapsError(`Failed to initialize Google Maps: ${error.message}`);
    }
  }, [googleMapsLoaded, searchLocation, currentLocation, theme, mapInitialized, mapsError]);

  // Update map center when location changes
  useEffect(() => {
    if (mapInstance.current && (searchLocation || currentLocation)) {
      mapInstance.current.setCenter(searchLocation || currentLocation);
    }
  }, [searchLocation, currentLocation]);

  // Clear markers function
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  }, []);

  // Add markers to map
  const addMarkers = useCallback((placesList) => {
    if (!mapInstance.current) return;

    const newMarkers = placesList.map(place => {
      const marker = new window.google.maps.Marker({
        position: place.geometry.location,
        map: mapInstance.current,
        title: place.name,
        icon: {
          url: place.icon || 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png',
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 200px;">
            <h4 style="margin: 0 0 5px 0; color: #333;">${place.name}</h4>
            <p style="margin: 0 0 5px 0; color: #666;">${place.vicinity || 'No address'}</p>
            ${place.rating ? `<p style="margin: 0; color: #666;">⭐ ${place.rating}</p>` : ''}
            ${place.distance ? `<p style="margin: 0; color: #666;">📍 ${place.distance} km</p>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance.current, marker);
      });

      return marker;
    });

    markersRef.current = newMarkers;
  }, []);

  // Fetch places from Google Places API
  const fetchPlaces = useCallback(async (location, mood, distance) => {
    if (!location || !mood || !placesServiceRef.current) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const placeTypes = moodToPlacesTypes[mood] || ['establishment'];
      const radiusInMeters = distance * 1000;
      
      const promises = placeTypes.map(type => 
        new Promise((resolve) => {
          placesServiceRef.current.nearbySearch({
            location: location,
            radius: radiusInMeters,
            type: type
          }, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              resolve(results);
            } else {
              console.warn(`⚠️ Places API status for ${type}:`, status);
              resolve([]);
            }
          });
        })
      );

      const allResults = await Promise.all(promises);
      const combinedResults = allResults.flat();
      const uniqueResults = combinedResults.filter((place, index, self) =>
        index === self.findIndex((p) => p.place_id === place.place_id)
      );

      // Add distance information
      const placesWithDistance = uniqueResults.map(place => {
        const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
          new window.google.maps.LatLng(location),
          place.geometry.location
        ) / 1000;

        return {
          ...place,
          distance: Math.round(distance * 100) / 100
        };
      });

      placesWithDistance.sort((a, b) => a.distance - b.distance);
      setPlaces(placesWithDistance);
      
      // Update map markers
      clearMarkers();
      addMarkers(placesWithDistance);

      if (placesWithDistance.length === 0) {
        setError(`No ${mood} places found within ${distance}km. Try increasing distance.`);
      }
    } catch (err) {
      console.error('❌ Error fetching places:', err);
      setError('Failed to fetch places. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [clearMarkers, addMarkers]);

  // Handle search input changes - FIXED: No auto-fill, only show suggestions
  const handleSearchInputChange = useCallback((value) => {
    setSearchQuery(value);
    setActiveSuggestionIndex(-1);
    
    if (!value || !window.google || !window.google.maps) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Use Places Autocomplete Service to get suggestions
    const autocompleteService = new window.google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions(
      { 
        input: value,
        types: ['geocode', 'establishment'],
        componentRestrictions: { country: 'in' } // Restrict to India for better results
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions.length > 0) {
          setSearchSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setSearchSuggestions([]);
          setShowSuggestions(false);
        }
      }
    );
  }, []);

  // Handle search submission - FIXED: Use Geocoding API for typed location
  const handleSearchSubmit = useCallback((query) => {
    if (!query || !window.google || !window.google.maps) return;

    setLoading(true);
    setError('');

    // Check if it's a smart search (contains "near")
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('near me') || lowerQuery.includes('near')) {
      const parts = lowerQuery.split(' near ');
      if (parts.length === 2) {
        const placeType = parts[0].trim();
        
        // Find matching mood
        const matchedMood = Object.keys(moodToPlacesTypes).find(mood => 
          mood.toLowerCase() === placeType || 
          placeType.includes(mood.toLowerCase())
        );
        
        if (matchedMood) {
          setSelectedMood(matchedMood);
          if (currentLocation) {
            fetchPlaces(currentLocation, matchedMood, selectedDistance);
          } else {
            setError('Please set your location first');
          }
        }
        setLoading(false);
        return;
      }
    }

    // For location-only searches, use Geocoding API
    geocoderRef.current.geocode(
      { address: query },
      (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };
          
          // Set search location (not current location)
          setSearchLocation(location);
          setSearchQuery(results[0].formatted_address);
          setShowSuggestions(false);
          
          // Center map to searched location
          if (mapInstance.current) {
            mapInstance.current.setCenter(location);
          }
          
          // Auto-fetch places if mood is selected
          if (selectedMood) {
            fetchPlaces(location, selectedMood, selectedDistance);
          }
        } else {
          setError('Location not found. Please try a different search.');
        }
        setLoading(false);
      }
    );
  }, [currentLocation, selectedMood, selectedDistance, fetchPlaces]);

  // Handle suggestion selection - FIXED: Only update when user clicks
  const handleSuggestionSelect = useCallback((suggestion) => {
    console.log('🖱️ Suggestion clicked:', suggestion);
    
    // Update input with selected suggestion
    setSearchQuery(suggestion.description);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    
    // Use PlacesService.getDetails() to get full place details
    const service = new window.google.maps.places.PlacesService(mapInstance.current);
    service.getDetails(
      { placeId: suggestion.place_id },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          console.log('✅ Place details retrieved:', place);
          // Extract geometry.location (lat, lng) from place details
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          
          // Set search location (not current location)
          setSearchLocation(location);
          setSearchQuery(place.formatted_address || place.name);
          
          // Center map to new location
          if (mapInstance.current) {
            console.log('🗺️ Centering map to:', location);
            mapInstance.current.setCenter(location);
          }
          
          // Auto-fetch places if mood is selected
          if (selectedMood) {
            console.log('🔍 Auto-fetching places for mood:', selectedMood);
            fetchPlaces(location, selectedMood, selectedDistance);
          }
        } else {
          console.error('❌ Failed to get place details:', status);
        }
      }
    );
  }, [selectedMood, selectedDistance, fetchPlaces]);

  // Handle keyboard navigation in suggestions
  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0 && searchSuggestions[activeSuggestionIndex]) {
          handleSuggestionSelect(searchSuggestions[activeSuggestionIndex]);
        } else {
          handleSearchSubmit(searchQuery);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
    }
  }, [showSuggestions, searchSuggestions, activeSuggestionIndex, searchQuery, handleSuggestionSelect, handleSearchSubmit]);

  // Handle "Use My Location" - FIXED: Use browser geolocation API
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Set current location (not search location)
        setCurrentLocation(location);
        
        if (mapInstance.current) {
          mapInstance.current.setCenter(location);
        }
        
        setLoading(false);
        
        // Auto-fetch places if mood is selected
        if (selectedMood) {
          fetchPlaces(location, selectedMood, selectedDistance);
        }
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, [selectedMood, selectedDistance, fetchPlaces]);

  // Handle mood selection
  const handleMoodSelect = useCallback((moodId) => {
    const newMood = moodId === selectedMood ? '' : moodId;
    setSelectedMood(newMood);
    
    // Fetch places based on available location
    const location = searchLocation || currentLocation;
    if (newMood && location) {
      fetchPlaces(location, newMood, selectedDistance);
    }
  }, [selectedMood, searchLocation, currentLocation, selectedDistance, fetchPlaces]);

  // Handle distance change
  const handleDistanceChange = useCallback((newDistance) => {
    setSelectedDistance(newDistance);
    
    // Fetch places based on available location
    const location = searchLocation || currentLocation;
    if (selectedMood && location) {
      fetchPlaces(location, selectedMood, newDistance);
    }
  }, [selectedMood, searchLocation, currentLocation, fetchPlaces]);

  // Handle logout - FIXED: Clear auth token and redirect
  const handleLogout = useCallback(() => {
    // Clear authentication token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Call logout from auth context
    logout();
    
    // Redirect to login page
    navigate('/auth');
    
    // Close dropdowns
    setShowAccountDropdown(false);
    setShowSettingsDropdown(false);
  }, [logout, navigate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.account-dropdown') !== event.currentTarget) {
        setShowAccountDropdown(false);
      }
      if (event.target.closest('.settings-dropdown') !== event.currentTarget) {
        setShowSettingsDropdown(false);
      }
      if (event.target.closest('.search-suggestions') !== event.currentTarget) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMarkers();
      placesServiceRef.current = null;
      geocoderRef.current = null;
      mapInstance.current = null;
    };
  }, [clearMarkers]);

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

            {/* Settings Dropdown - NEW */}
            <div className="settings-dropdown">
              <button
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="settings-button"
              >
                ⚙️ Settings
              </button>
              
              {showSettingsDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <h4>⚙️ Settings</h4>
                    <p className="user-email">{user?.email}</p>
                  </div>
                  
                  <div className="dropdown-section">
                    <h5>🎨 Theme</h5>
                    <button 
                      onClick={toggleTheme}
                      className="theme-toggle-dropdown"
                    >
                      {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                  </div>
                  
                  <div className="dropdown-section">
                    <h5>👤 Account</h5>
                    <a href="/profile" className="dropdown-item">👤 Profile</a>
                    <a href="/settings" className="dropdown-item">⚙️ Account Settings</a>
                  </div>
                  
                  <div className="dropdown-section">
                    <h5>🚪 Actions</h5>
                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Account Dropdown */}
            {isAuthenticated && (
              <div className="account-dropdown">
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="account-button"
                >
                  👤 {user?.email}
                  <span className="dropdown-arrow">▼</span>
                </button>
                
                {showAccountDropdown && (
                  <div className="dropdown-menu">
                    <a href="/profile" className="dropdown-item">👤 Profile</a>
                    <a href="/settings" className="dropdown-item">⚙️ Account Settings</a>
                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={
              <>
                {/* Google Maps Setup Instructions */}
                {mapsError && (
                  <div className="maps-error-section">
                    <div className="error-message maps-error">
                      <h3>🗺️ Google Maps Setup Required</h3>
                      <p>{mapsError}</p>
                      <div className="setup-instructions">
                        <h4>📋 Setup Instructions:</h4>
                        <ol>
                          <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                          <li>Create a new project or select existing project</li>
                          <li>Enable <strong>Maps JavaScript API</strong></li>
                          <li>Enable <strong>Places API</strong></li>
                          <li>Enable <strong>Geocoding API</strong></li>
                          <li>Create an API key</li>
                          <li>Enable billing for the project</li>
                          <li>Add the API key to your <code>.env</code> file</li>
                          <li>Restart the development server</li>
                        </ol>
                        <p><strong>Note:</strong> Make sure to set referrer restrictions to include <code>localhost:3000</code></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Search Section */}
                <div className="search-wrapper">
                  <label className="search-label">Where would you like to explore?</label>
                  <div className="search-container">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Search location... (e.g., 'cafe near me', 'gym in Delhi')"
                      className="enhanced-search-input"
                      disabled={!!mapsError}
                    />
                    
                    {/* Search Suggestions Dropdown */}
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <div className="search-suggestions" ref={suggestionsRef}>
                        {searchSuggestions.map((suggestion, index) => (
                          <div
                            key={suggestion.place_id}
                            className={`suggestion-item ${index === activeSuggestionIndex ? 'active' : ''}`}
                            onMouseDown={() => handleSuggestionSelect(suggestion)}
                          >
                            <div className="suggestion-icon">
                              {suggestion.types.includes('geocode') ? '📍' : '🏢'}
                            </div>
                            <div className="suggestion-text">
                              <div className="suggestion-main">{suggestion.structured_formatting.main_text}</div>
                              <div className="suggestion-secondary">{suggestion.structured_formatting.secondary_text}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleSearchSubmit(searchQuery)}
                      disabled={loading || !searchQuery.trim()}
                      className="search-btn"
                    >
                      🔍 Search
                    </button>
                  </div>
                  
                  {/* Use My Location Button */}
                  <button
                    onClick={handleUseMyLocation}
                    disabled={loading}
                    className="use-location-btn-separate"
                  >
                    📍 Use My Location
                  </button>
                </div>

                {/* Mood Selection */}
                <div className="mood-section">
                  <h3>How are you feeling today?</h3>
                  <div className="mood-grid">
                    {moods.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => handleMoodSelect(mood.id)}
                        className={`mood-button ${selectedMood === mood.id ? 'active' : ''}`}
                        style={{ '--mood-color': mood.color }}
                        disabled={!!mapsError}
                      >
                        <span className="mood-icon">{mood.icon}</span>
                        <span className="mood-name">{mood.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Distance Filter */}
                <div className="distance-section">
                  <h3>Distance: {selectedDistance} km</h3>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={selectedDistance}
                    onChange={(e) => handleDistanceChange(parseInt(e.target.value))}
                    className="distance-slider"
                    disabled={loading || !!mapsError}
                  />
                  <div className="distance-labels">
                    <span>1km</span>
                    <span>10km</span>
                    <span>20km</span>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Finding amazing places for you...</p>
                  </div>
                )}

                {/* Map Container */}
                <div className="map-container">
                  <div 
                    ref={mapRef} 
                    className="google-map"
                    style={{ 
                      height: "500px",
                      width: "100%",
                      background: mapsError ? '#f8f9fa' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: mapsError ? '#666' : 'transparent'
                    }}
                  >
                    {mapsError && (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                        <h3>Google Maps Not Available</h3>
                        <p>Please complete setup above to enable maps.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Places List */}
                {places.length > 0 && (
                  <div className="places-section">
                    <h3>Found {places.length} places</h3>
                    <div className="places-grid">
                      {places.map((place) => (
                        <div key={place.place_id} className="place-card">
                          <div className="place-header">
                            <h4>{place.name}</h4>
                            {place.rating && (
                              <span className="rating">⭐ {place.rating}</span>
                            )}
                          </div>
                          <p className="place-address">{place.vicinity}</p>
                          <p className="place-distance">📍 {place.distance} km</p>
                          <div className="place-actions">
                            <button 
                              onClick={() => {
                                const lat = place.geometry.location.lat();
                                const lng = place.geometry.location.lng();
                                const query = encodeURIComponent(place.name);
                                window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                              }}
                              className="open-maps-btn"
                              title="Open in Google Maps"
                            >
                              🗺️ Open in Maps
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            } />
            
            <Route path="/auth" element={<AuthPage />} />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    );
  };

  export default App;
          )}

          {/* Main Search Section - UPDATED LAYOUT */}
          <div className="search-wrapper">
            <label className="search-label">Where would you like to explore?</label>
            <div className="search-container">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search location... (e.g., 'cafe near me', 'gym in Delhi')"
                className="enhanced-search-input"
                disabled={!!mapsError}
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="search-suggestions" ref={suggestionsRef}>
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.place_id}
                      className={`suggestion-item ${index === activeSuggestionIndex ? 'active' : ''}`}
                      onMouseDown={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className="suggestion-icon">
                        {suggestion.types.includes('geocode') ? '📍' : '🏢'}
                      </div>
                      <div className="suggestion-text">
                        <div className="suggestion-main">{suggestion.structured_formatting.main_text}</div>
                        <div className="suggestion-secondary">{suggestion.structured_formatting.secondary_text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button
                onClick={() => handleSearchSubmit(searchQuery)}
                disabled={loading || !searchQuery.trim()}
                className="search-btn"
              >
                🔍 Search
              </button>
            </div>
            
            {/* Use My Location Button - MOVED OUTSIDE */}
            <button
              onClick={handleUseMyLocation}
              disabled={loading}
              className="use-location-btn-separate"
            >
              📍 Use My Location
            </button>
          </div>

          {/* Mood Selection */}
          <div className="mood-section">
            <h3>How are you feeling today?</h3>
            <div className="mood-grid">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelect(mood.id)}
                  className={`mood-button ${selectedMood === mood.id ? 'active' : ''}`}
                  style={{ '--mood-color': mood.color }}
                  disabled={!!mapsError}
                >
                  <span className="mood-icon">{mood.icon}</span>
                  <span className="mood-name">{mood.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Distance Filter */}
          <div className="distance-section">
            <h3>Distance: {selectedDistance} km</h3>
            <input
              type="range"
              min="1"
              max="20"
              value={selectedDistance}
              onChange={(e) => handleDistanceChange(parseInt(e.target.value))}
              className="distance-slider"
              disabled={loading || !!mapsError}
            />
            <div className="distance-labels">
              <span>1km</span>
              <span>10km</span>
              <span>20km</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Finding amazing places for you...</p>
            </div>
          )}

          {/* Map Container - ALWAYS RENDER */}
          <div className="map-container">
            <div 
              ref={mapRef} 
              className="google-map"
              style={{ 
                height: "500px",
                width: "100%",
                background: mapsError ? '#f8f9fa' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: mapsError ? '#666' : 'transparent'
              }}
            >
              {mapsError && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                  <h3>Google Maps Not Available</h3>
                  <p>Please complete the setup above to enable maps.</p>
                </div>
              )}
            </div>
          </div>

          {/* Places List */}
          {places.length > 0 && (
            <div className="places-section">
              <h3>Found {places.length} places</h3>
              <div className="places-grid">
                {places.map((place) => (
                  <div key={place.place_id} className="place-card">
                    <div className="place-header">
                      <h4>{place.name}</h4>
                      {place.rating && (
                        <span className="rating">⭐ {place.rating}</span>
                      )}
                    </div>
                    <p className="place-address">{place.vicinity}</p>
                    <p className="place-distance">📍 {place.distance} km</p>
                    <div className="place-actions">
                      <button 
                        onClick={() => {
                          const lat = place.geometry.location.lat();
                          const lng = place.geometry.location.lng();
                          const query = encodeURIComponent(place.name);
                          window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                        }}
                        className="open-maps-btn"
                        title="Open in Google Maps"
                      >
                        🗺️ Open in Maps
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Discover</h4>
              <a href="/moods" className="footer-link">All Moods</a>
              <a href="/categories" className="footer-link">Categories</a>
            </div>
            <div className="footer-section">
              <h4>Account</h4>
              {isAuthenticated ? (
                <>
                  <a href="/profile" className="footer-link">My Profile</a>
                  <a href="/favorites" className="footer-link">Favorites</a>
                </>
              ) : (
                <>
                  <a href="/auth" className="footer-link">Sign In</a>
                  <a href="/auth" className="footer-link">Register</a>
                </>
              )}
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <a href="/help" className="footer-link">Help Center</a>
              <a href="/about" className="footer-link">About</a>
              <a href="/contact" className="footer-link">Contact</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Mood Mapper. Made with ❤️</p>
          </div>
        </footer>
      </div>
    );
};

export default App;
