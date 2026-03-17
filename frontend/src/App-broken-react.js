import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import './App.css';

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
  const { isAuthenticated, user } = useAuth();
  
  // State
  const [userLocation, setUserLocation] = useState(null);
  const [selectedMood, setSelectedMood] = useState('');
  const [radius, setRadius] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  
  // Refs
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);

  // Google Maps API key
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Load Google Maps script
  useEffect(() => {
    console.log('🔍 Loading Google Maps...');
    console.log('🔑 API Key:', GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');
    
    if (window.google) {
      console.log('✅ Google Maps already loaded');
      setGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    window.initGoogleMaps = () => {
      console.log('✅ Google Maps loaded successfully');
      setGoogleMapsLoaded(true);
      
      // Initialize map after script loads
      if (mapRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 13
        });
        console.log('✅ Map initialized');
      }
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
    };
  }, [GOOGLE_MAPS_API_KEY]);

  // Handle "Use My Location"
  const handleUseMyLocation = () => {
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
        setLoading(false);
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        setError('Unable to get your location. Please enable location permissions.');
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Handle mood selection
  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId === selectedMood ? '' : moodId);
  };

  // Handle "Find Places"
  const handleFindPlaces = () => {
    if (!userLocation) {
      setError('Please select a location first');
      return;
    }
    
    if (!selectedMood) {
      setError('Please select a mood');
      return;
    }
    
    console.log('🔍 Finding places:', { userLocation, selectedMood, radius });
    // TODO: Implement actual place fetching
  };

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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              <div className="account-dropdown">
                <button className="account-button">
                  👤 {user?.email}
                  <span className="dropdown-arrow">▼</span>
                </button>
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
            <p>User Location: {userLocation ? '✅' : '❌'}</p>
            <p>Selected Mood: {selectedMood || 'None'}</p>
            <p>API Key: {GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing'}</p>
            <p>Search Query: {searchQuery || 'None'}</p>
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
              onChange={(e) => setRadius(parseInt(e.target.value))}
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
            <div 
              ref={mapRef} 
              className="google-map"
              style={{ 
                background: googleMapsLoaded ? 'transparent' : '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666'
              }}
            >
              {!googleMapsLoaded && <div>Loading Google Maps...</div>}
            </div>
          </div>
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
    </Router>
  );
};

export default App;
