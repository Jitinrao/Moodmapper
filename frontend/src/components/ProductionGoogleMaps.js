import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLoadScript } from '@react-google-maps/api';

const libraries = ['places'];

const ProductionGoogleMaps = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const geocoderRef = useRef(null);
  const userMarkerRef = useRef(null);

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Initialize services when Google Maps is loaded
  useEffect(() => {
    if (isLoaded && window.google) {
      console.log('✅ Google Maps loaded successfully');
      
      // Initialize services
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      geocoderRef.current = new window.google.maps.Geocoder();
      
      // Initialize map
      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 12,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#212121' }] },
          { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] }
        ]
      });

      placesServiceRef.current = new window.google.maps.places.PlacesService(map);

      // Try to get user location on load
      getUserLocation();
    }
  }, [isLoaded]);

  // Get user location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('📍 User location obtained:', location);
          setUserLocation(location);
          setMapCenter(location);
          addUserLocationMarker(location);
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
        }
      );
    }
  }, []);

  // Add user location marker
  const addUserLocationMarker = useCallback((location) => {
    if (!mapRef.current || !window.google) return;

    // Remove existing marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    // Add blue dot marker
    userMarkerRef.current = new window.google.maps.Marker({
      position: location,
      map: mapRef.current,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 8
      },
      zIndex: 1000
    });
  }, []);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!autocompleteServiceRef.current) return;

    // Get predictions
    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: value,
        types: ['(cities)', 'establishment', 'geocode'],
        componentRestrictions: { country: 'in' }
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          console.log('✅ Suggestions found:', predictions.length);
          setSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          console.log('❌ No suggestions found');
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    );
  }, []);

  // Handle suggestion selection
  const handleSuggestionClick = useCallback((suggestion) => {
    console.log('🎯 Selected suggestion:', suggestion.description);
    setSearchQuery(suggestion.description);
    setShowSuggestions(false);
    setSelectedPlace(suggestion);
    
    // Geocode the place
    if (geocoderRef.current) {
      geocoderRef.current.geocode({ placeId: suggestion.place_id }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };
          console.log('📍 Place location:', location);
          setMapCenter(location);
          searchNearbyPlaces(location);
        }
      });
    }
  }, []);

  // Handle manual search
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() || !geocoderRef.current) return;
    
    setLoading(true);
    console.log('🔍 Manual search for:', searchQuery);
    
    geocoderRef.current.geocode({ address: searchQuery }, (results, status) => {
      setLoading(false);
      if (status === 'OK' && results[0]) {
        const location = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };
        console.log('✅ Search location found:', location);
        setMapCenter(location);
        searchNearbyPlaces(location);
      } else {
        console.error('❌ Search failed:', status);
      }
    });
  }, [searchQuery]);

  // Search nearby places
  const searchNearbyPlaces = useCallback((location) => {
    if (!placesServiceRef.current) return;

    placesServiceRef.current.nearbySearch(
      {
        location: location,
        radius: 5000,
        type: 'restaurant'
      },
      (results, status) => {
        if (status === 'OK' && results) {
          console.log('✅ Found nearby places:', results.length);
          const placesWithDistance = results.map(place => ({
            ...place,
            distance: calculateDistance(location, {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }).toFixed(1)
          }));
          setPlaces(placesWithDistance);
        } else {
          console.log('❌ No nearby places found');
          setPlaces([]);
        }
      }
    );
  }, []);

  // Calculate distance
  const calculateDistance = useCallback((point1, point2) => {
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
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update map center
  useEffect(() => {
    if (mapRef.current && window.google) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 12,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#212121' }] },
          { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] }
        ]
      });

      // Add user location marker if exists
      if (userLocation) {
        addUserLocationMarker(userLocation);
      }

      // Reinitialize places service
      placesServiceRef.current = new window.google.maps.places.PlacesService(map);
    }
  }, [mapCenter, userLocation, addUserLocationMarker]);

  if (loadError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>❌ Error loading Google Maps</h3>
        <p>{loadError.message}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>🔄 Loading Google Maps...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>🗺️ Production Google Maps</h2>
      
      {/* Search Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="autocomplete-container" style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Search location... (e.g., 'cafe', 'restaurant', 'delhi')"
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  fontSize: '1.1rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: '#f8f9fa',
                  boxSizing: 'border-box'
                }}
              />
              
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  width: '100%',
                  maxWidth: '600px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '0 0 8px 8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 9999
                }}>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.place_id}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        backgroundColor: index === 0 ? '#f0f0f0' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                    >
                      <span style={{ fontSize: '14px' }}>
                        {suggestion.types && suggestion.types.includes('geocode') ? '📍' : '🏢'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}>
                          {suggestion.structured_formatting?.main_text || suggestion.description}
                        </div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          {suggestion.structured_formatting?.secondary_text || ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: loading ? '#ccc' : '#007BFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {loading ? '🔄 Searching...' : '🔍 Search'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={getUserLocation}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28A745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📍 Use My Location
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ 
        height: '500px', 
        borderRadius: '8px', 
        overflow: 'hidden', 
        marginBottom: '2rem',
        border: '1px solid #ddd',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div
          ref={mapRef}
          style={{ height: '100%', width: '100%' }}
        />
      </div>

      {/* Places List */}
      {places.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Found {places.length} places</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {places.map((place) => (
              <div key={place.place_id} style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease'
              }}>
                <div style={{ padding: '1rem 0' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{place.name}</h4>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0' }}>{place.vicinity}</p>
                  <p style={{ color: '#999', fontSize: '0.9rem', fontWeight: '500', margin: '0.5rem 0' }}>📍 {place.distance} km</p>
                  {place.rating && (
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0' }}>⭐ {place.rating}</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <button
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#007BFF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        if (geocoderRef.current) {
                          geocoderRef.current.geocode({ placeId: place.place_id }, (results, status) => {
                            if (status === 'OK' && results[0]) {
                              const location = {
                                lat: results[0].geometry.location.lat(),
                                lng: results[0].geometry.location.lng()
                              };
                              setMapCenter(location);
                            }
                          });
                        }
                      }}
                    >
                      🗺️ View on Map
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>🔄 Loading places...</p>
        </div>
      )}
    </div>
  );
};

export default ProductionGoogleMaps;
