import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
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
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // State management
  const [userLocation, setUserLocation] = useState(null);
  const [selectedMood, setSelectedMood] = useState('');
  const [radius, setRadius] = useState(5); // km
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  
  // Refs
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const dropdownRef = useRef(null);
  const placesServiceRef = useRef(null);

  // Google Maps API key
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Load Google Maps script
  useEffect(() => {
    console.log('🔍 Loading Google Maps script...');
    console.log('🔑 API Key:', GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');
    
    if (window.google) {
      console.log('✅ Google Maps already loaded');
      setGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    window.initGoogleMaps = () => {
      console.log('✅ Google Maps loaded successfully');
      setGoogleMapsLoaded(true);
    };

    script.onerror = (error) => {
      console.error('❌ Failed to load Google Maps:', error);
      setError('Failed to load Google Maps. Please check your API key.');
    };

    document.head.appendChild(script);

    return () => {
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [GOOGLE_MAPS_API_KEY]);

  // Initialize map and services
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || mapInstance) {
      console.log('🗺️ Map initialization conditions:', {
        googleMapsLoaded,
        mapRefExists: !!mapRef.current,
        mapInstanceExists: !!mapInstance
      });
      return;
    }

    console.log('🗺️ Initializing Google Maps...');
    
    try {
      // Create map instance
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
        zoom: 13,
        styles: theme === 'dark' ? [
          { elementType: "geometry", stylers: [{ color: "#212121" }] },
          { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
          { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
          { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
          { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
          { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
          { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
          { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
          { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
        ] : []
      });

      setMapInstance(map);

      // Initialize Places service
      placesServiceRef.current = new window.google.maps.places.PlacesService(map);

      // Initialize autocomplete
      if (searchInputRef.current && !autocompleteRef.current) {
        console.log('🔍 Initializing autocomplete...');
        autocompleteRef.current = new window.google.maps.places.Autocomplete(searchInputRef.current, {
          types: ['geocode', 'establishment']
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          console.log('📍 Place selected:', place);
          if (place.geometry && place.geometry.location) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };
            setUserLocation(location);
            setSearchQuery(place.formatted_address || place.name);
            map.setCenter(location);
            
            // Auto-fetch places if mood is selected
            if (selectedMood) {
              fetchPlaces(location, selectedMood, radius);
            }
          }
        });
      }

      console.log('✅ Map initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      setError('Failed to initialize Google Maps');
    }
  }, [googleMapsLoaded, theme, selectedMood, radius]);

  // Clear markers function
  const clearMarkers = useCallback(() => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  }, [markers]);

  // Add markers to map
  const addMarkers = useCallback((placesList) => {
    if (!mapInstance) return;

    const newMarkers = placesList.map(place => {
      const marker = new window.google.maps.Marker({
        position: place.geometry.location,
        map: mapInstance,
        title: place.name,
        icon: {
          url: place.icon || 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png',
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      // Add info window
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
        infoWindow.open(mapInstance, marker);
      });

      return marker;
    });

    setMarkers(newMarkers);
  }, [mapInstance]);

  // Fetch places using Google Places API
  const fetchPlaces = useCallback(async (location, mood, distance) => {
    if (!location || !mood) {
      setError('Please select a location and mood');
      return;
    }

    if (!placesServiceRef.current) {
      setError('Google Maps not loaded yet');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔍 Fetching places:', { location, mood, distance });
      
      const placeTypes = moodToPlacesTypes[mood] || ['establishment'];
      const radiusInMeters = distance * 1000;
      
      // Create promises for each place type
      const promises = placeTypes.map(type => 
        new Promise((resolve) => {
          placesServiceRef.current.nearbySearch({
            location: location,
            radius: radiusInMeters,
            type: type
          }, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              console.log(`✅ Found ${results.length} ${type} places`);
              resolve(results);
            } else {
              console.warn(`⚠️ Places API status for ${type}:`, status);
              resolve([]);
            }
          });
        })
      );

      // Wait for all promises to complete
      const allResults = await Promise.all(promises);
      
      // Combine and deduplicate results
      const combinedResults = allResults.flat();
      const uniqueResults = combinedResults.filter((place, index, self) =>
        index === self.findIndex((p) => p.place_id === place.place_id)
      );

      // Add distance information
      const placesWithDistance = uniqueResults.map(place => {
        const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
          new window.google.maps.LatLng(location),
          place.geometry.location
        ) / 1000; // Convert to km

        return {
          ...place,
          distance: Math.round(distance * 100) / 100
        };
      });

      // Sort by distance
      placesWithDistance.sort((a, b) => a.distance - b.distance);

      setPlaces(placesWithDistance);
      
      // Update map markers
      clearMarkers();
      addMarkers(placesWithDistance);

      console.log(`✅ Total unique places found: ${placesWithDistance.length}`);

      if (placesWithDistance.length === 0) {
        setError(`No ${mood} places found within ${distance}km. Try increasing the distance.`);
      }

    } catch (err) {
      console.error('❌ Error fetching places:', err);
      setError('Failed to fetch places. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [clearMarkers, addMarkers]);

  // Handle "Find Places" button click
  const handleFindPlaces = useCallback(() => {
    console.log('🔍 Find Places clicked:', { userLocation, selectedMood, radius });
    
    if (!userLocation) {
      setError('Please select a location first');
      return;
    }
    
    if (!selectedMood) {
      setError('Please select a mood');
      return;
    }
    
    if (!radius) {
      setError('Please select a distance');
      return;
    }
    
    fetchPlaces(userLocation, selectedMood, radius);
  }, [userLocation, selectedMood, radius, fetchPlaces]);

  // Handle "Use My Location"
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
        
        console.log('📍 Location found:', location);
        setUserLocation(location);
        
        if (mapInstance) {
          mapInstance.setCenter(location);
        }
        
        setLoading(false);
        
        // Auto-fetch places if mood is selected
        if (selectedMood) {
          fetchPlaces(location, selectedMood, radius);
        }
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
    );
  }, [mapInstance, selectedMood, radius, fetchPlaces]);

  // Handle mood selection
  const handleMoodSelect = useCallback((moodId) => {
    const newMood = moodId === selectedMood ? '' : moodId;
    setSelectedMood(newMood);
    
    // Auto-fetch places if location is selected
    if (newMood && userLocation) {
      fetchPlaces(userLocation, newMood, radius);
    }
  }, [selectedMood, userLocation, radius, fetchPlaces]);

  // Handle distance change
  const handleRadiusChange = useCallback((newRadius) => {
    setRadius(newRadius);
    
    // Auto-fetch places if location and mood are selected
    if (userLocation && selectedMood) {
      fetchPlaces(userLocation, selectedMood, newRadius);
    }
  }, [userLocation, selectedMood, fetchPlaces]);

  // Handle location search
  const handleLocationSearch = useCallback((query) => {
    setSearchQuery(query);
    
    // Parse search query for smart search
    if (query.toLowerCase().includes('near me') || query.toLowerCase().includes('near')) {
      // Extract place type from query
      const parts = query.toLowerCase().split(' near ');
      if (parts.length === 2) {
        const placeType = parts[0].trim();
        console.log('🎯 Smart search detected:', placeType);
        
        // Find matching mood
        const matchedMood = Object.keys(moodToPlacesTypes).find(mood => 
          mood.toLowerCase() === placeType || 
          placeType.includes(mood.toLowerCase())
        );
        
        if (matchedMood) {
          setSelectedMood(matchedMood);
          if (userLocation) {
            fetchPlaces(userLocation, matchedMood, radius);
          } else {
            setError('Please set your location first');
          }
        }
      }
    }
  }, [userLocation, radius, fetchPlaces]);

  // Handle logout
  const handleLogout = () => {
    logout();
    setShowAccountDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAccountDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Router>
      <div className={`app ${theme}`}>
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-background"></div>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-title">Mood Mapper</h1>
            <p className="hero-subtitle">Find places that match your vibe</p>
            
            {/* Location Search Bar */}
            <div className="location-search-container">
              <div className="search-input-wrapper">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  placeholder="Search location"
                  className="location-search-input"
                />
              </div>
              
              <button
                onClick={handleUseMyLocation}
                disabled={loading}
                className="use-location-btn"
              >
                📍 Use My Location
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Account Dropdown */}
            {isAuthenticated && (
              <div className="account-dropdown" ref={dropdownRef}>
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
          {/* Debug Info */}
          <div style={{background: 'rgba(255,255,255,0.1)', padding: '1rem', margin: '1rem 0', borderRadius: '8px', color: 'white'}}>
            <h4>Debug Info:</h4>
            <p>Google Maps Loaded: {googleMapsLoaded ? '✅' : '❌'}</p>
            <p>Map Instance: {mapInstance ? '✅' : '❌'}</p>
            <p>User Location: {userLocation ? '✅' : '❌'}</p>
            <p>Selected Mood: {selectedMood || 'None'}</p>
            <p>API Key: {GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing'}</p>
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
                >
                  <span className="mood-icon">{mood.icon}</span>
                  <span className="mood-name">{mood.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Distance Filter */}
          <div className="distance-section">
            <h3>Distance: {radius} km</h3>
            <input
              type="range"
              min="1"
              max="20"
              value={radius}
              onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
              className="distance-slider"
              disabled={loading}
            />
            <div className="distance-labels">
              <span>1km</span>
              <span>10km</span>
              <span>20km</span>
            </div>
          </div>

          {/* Find Places Button */}
          <div className="action-section">
            <button
              onClick={handleFindPlaces}
              disabled={!userLocation || !selectedMood || loading}
              className="find-places-btn"
            >
              {loading ? '🔄 Finding Places...' : '🔍 Find Places'}
            </button>
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
            <div ref={mapRef} className="google-map"></div>
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
                  <a href="/history" className="footer-link">History</a>
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
    </Router>
  );
};

export default App;
