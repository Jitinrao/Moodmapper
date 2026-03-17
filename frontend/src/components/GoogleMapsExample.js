import React, { useState, useEffect, useRef, useCallback } from 'react';

const GoogleMapsExample = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize Google Maps
  useEffect(() => {
    if (!window.google || !window.google.maps) {
      console.log('📦 Loading Google Maps script...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      window.initGoogleMaps = () => {
        console.log('✅ Google Maps loaded successfully');
        setIsLoaded(true);
        setError(null);
        
        // Initialize map
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 12,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#212121' }] },
            { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] }
          ]
        });

        // Initialize services
        const placesService = new window.google.maps.places.PlacesService(map);
        const geocoder = new window.google.maps.Geocoder();
        const autocompleteService = new window.google.maps.places.AutocompleteService();

        // Set up event listeners
        const handleInputChange = (e) => {
          const value = e.target.value;
          setSearchQuery(value);
          
          if (value.length > 2) {
            autocompleteService.getPlacePredictions(
              {
                input: value,
                types: ['(cities)', 'establishment', 'geocode'],
                componentRestrictions: { country: 'in' }
              },
              (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
                  setSuggestions(predictions);
                  setShowSuggestions(true);
                } else {
                  setSuggestions([]);
                  setShowSuggestions(false);
                }
              }
            );
          }
        };

        // Handle place selection
        const handleSuggestionSelect = (suggestion) => {
          setSearchQuery(suggestion.description);
          setShowSuggestions(false);
          
          geocoder.geocode({ placeId: suggestion.place_id }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const location = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
              };
              
              setCurrentLocation(location);
              
              // Search nearby places
              placesService.nearbySearch(
                {
                  location: location,
                  radius: 5000,
                  type: 'restaurant'
                },
                (results, status) => {
                  if (status === 'OK' && results) {
                    const placesWithDistance = results.map(place => ({
                      ...place,
                      distance: calculateDistance(location, {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                      })
                    }).toFixed(1)
                    }));
                    
                    setPlaces(placesWithDistance);
                  }
                }
              );
            }
          });
        };

        // Handle user location
        const handleUseMyLocation = () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const location = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };
                
                setCurrentLocation(location);
                
                // Add user location marker
                const userMarker = new window.google.maps.Marker({
                  position: location,
                  map: map,
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
              });
            }
          };
        };

        // Close suggestions when clicking outside
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

      document.head.appendChild(script);
    } else {
      console.log('Google Maps already loaded');
      setIsLoaded(true);
      
      // Initialize map immediately
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#212121' }] },
          { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] }
          ]
        });

        const placesService = new window.google.maps.places.PlacesService(map);
        const geocoder = new window.google.maps.Geocoder();
        const autocompleteService = new window.google.maps.places.AutocompleteService();

        // Set up event listeners
        const handleInputChange = (e) => {
          const value = e.target.value;
          setSearchQuery(value);
          
          if (value.length > 2) {
            autocompleteService.getPlacePredictions(
              {
                input: value,
                types: ['(cities)', 'establishment', 'geocode'],
                componentRestrictions: { country: 'in' }
              },
              (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
                  setSuggestions(predictions);
                  setShowSuggestions(true);
                } else {
                  setSuggestions([]);
                  setShowSuggestions(false);
                }
              }
            );
          }
        };

        // Handle place selection
        const handleSuggestionSelect = (suggestion) => {
          setSearchQuery(suggestion.description);
          setShowSuggestions(false);
          
          geocoder.geocode({ placeId: suggestion.place_id }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const location = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
              };
              
              setCurrentLocation(location);
              
              // Search nearby places
              placesService.nearbySearch(
                {
                  location: location,
                  radius: 5000,
                  type: 'restaurant'
                },
                (results, status) => {
                  if (status === 'OK' && results) {
                    const placesWithDistance = results.map(place => ({
                      ...place,
                      distance: calculateDistance(location, {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                      })
                    }).toFixed(1)
                    }));
                    
                    setPlaces(placesWithDistance);
                  }
                }
              );
            }
          });
        };

        // Handle user location
        const handleUseMyLocation = () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const location = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };
                
                setCurrentLocation(location);
                
                // Add user location marker
                const userMarker = new window.google.maps.Marker({
                  position: location,
                  map: map,
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
              });
            }
          };
        };

        // Close suggestions when clicking outside
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

      // Set up event listeners
      const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        if (value.length > 2) {
          autocompleteService.getPlacePredictions(
              {
                input: value,
                types: ['(cities)', 'establishment', 'geocode'],
                componentRestrictions: { country: 'in' }
              },
              (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
                  setSuggestions(predictions);
                  setShowSuggestions(true);
                } else {
                  setSuggestions([]);
                  setShowSuggestions(false);
                }
              }
            );
          }
        };

        // Handle place selection
        const handleSuggestionSelect = (suggestion) => {
          setSearchQuery(suggestion.description);
          setShowSuggestions(false);
          
          geocoder.geocode({ placeId: suggestion.place_id }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const location = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
              };
              
              setCurrentLocation(location);
              
              // Search nearby places
              placesService.nearbySearch(
                {
                  location: location,
                  radius: 5000,
                  type: 'restaurant'
                },
                (results, status) => {
                  if (status === 'OK' && results) {
                    const placesWithDistance = results.map(place => ({
                      ...place,
                      distance: calculateDistance(location, {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                      })
                    }).toFixed(1)
                    }));
                    
                    setPlaces(placesWithDistance);
                  }
                }
              );
            }
          });
        };

        // Handle user location
        const handleUseMyLocation = () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const location = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };
                
                setCurrentLocation(location);
                
                // Add user location marker
                const userMarker = new window.google.maps.Marker({
                  position: location,
                  map: map,
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
              });
            }
          };
        };

        // Calculate distance between two points
        const calculateDistance = (point1, point2) => {
          const R = 6371; // Earth's radius in km
          const dLat = (point2.lat - point1.lat) * Math.PI / 180;
          const dLon = (point2.lng - point1.lng) * Math.PI / 180;
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(point1.lat * Math.PI / 180) * Math.cos(point1.lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          return distance;
        };

        return (
          <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2>🗺️ Google Maps Integration Example</h2>
            
            {/* Search Section */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ position: 'relative', maxWidth: '500px' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  placeholder="Search location..."
                  style={{
                    width: '100%',
                    padding: '1rem 1.5rem',
                    fontSize: '1.1rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                />
                
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    width: '100%',
                    maxWidth: '500px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '0 0 0 8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.place_id}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee',
                          backgroundColor: index === activeIndex ? '#f0f0f0' : 'white'
                        }}
                        onMouseDown={() => handleSuggestionSelect(suggestion)}
                      >
                        <div style={{ marginRight: '12px' }}>
                          {suggestion.types.includes('geocode') ? '📍' : '🏢'}
                        </div>
                        <div>
                          <div style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}>
                            {suggestion.structured_formatting.main_text}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>
                            {suggestion.structured_formatting.secondary_text}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleSearchSubmit(searchQuery)}
              disabled={loading || !searchQuery.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#4285F4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🔍 Search
            </button>

            <button
              onClick={handleUseMyLocation}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#34A85',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              📍 Use My Location
            </button>
            </div>

            {/* Map Container */}
            <div style={{ height: '500px', borderRadius: '8px', overflow: 'hidden', marginBottom: '2rem' }}>
              <div
                ref={mapRef}
                style={{ height: '100%', width: '100%', borderRadius: '8px' }}
              />
            </div>

            {/* Places List */}
            {places.length > 0 && (
              <div>
                <h3>Found {places.length} places</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr)', gap: '1rem' }}>
                  {places.map((place) => (
                    <div key={place.place_id} style={{
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '1rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s ease'
                    }}>
                      <div style={{ padding: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>{place.name}</h4>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>{place.vicinity}</p>
                        <p style={{ color: '#999', fontSize: '0.9rem', fontWeight: '500' }}>📍 {place.distance} km</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
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
                            onClick={() => handlePlaceSelect(place)}
                          >
                            🗺️ Open in Maps
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '2px solid #ddd',
                borderTop: 'none',
                borderRadius: '4px',
                backgroundColor: '#f0f0f0'
              }}></div>
              <p>Loading places...</p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '2px solid #ddd',
                borderTop: 'none',
                borderRadius: '4px',
                backgroundColor: '#f8d7da'
              }}></div>
              <p>{error}</p>
            </div>
          )}
        </div>
      );
    </div>
  );
};

export default GoogleMapsExample;
