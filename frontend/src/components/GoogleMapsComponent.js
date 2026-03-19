import React, { useState, useEffect, useRef } from "react";
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

// API URL for different environments
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
console.log("🌐 FINAL API URL:", API_URL);

const GoogleMapsComponent = () => {
  const { theme, toggleTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.209 });
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedDistance, setSelectedDistance] = useState(5);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [error, setError] = useState('');

  // Mock data generator as fallback
  const generateMockPlaces = (location, mood, radius) => {
    console.log('🎲 Generating mock places for location:', location, 'mood:', mood, 'radius:', radius);
    
    const placeTemplates = {
      food: [
        { name: 'Local Restaurant', type: 'restaurant', rating: 4.2 },
        { name: 'Street Food Corner', type: 'restaurant', rating: 4.5 },
        { name: 'Family Cafe', type: 'cafe', rating: 4.1 },
        { name: 'Quick Bites', type: 'restaurant', rating: 3.9 },
        { name: 'Pizza Palace', type: 'restaurant', rating: 4.3 },
        { name: 'Burger Joint', type: 'restaurant', rating: 4.0 }
      ],
      work: [
        { name: 'CoWorking Space', type: 'coworking_space', rating: 4.3 },
        { name: 'Business Center', type: 'establishment', rating: 4.0 },
        { name: 'Office Hub', type: 'establishment', rating: 3.8 },
        { name: 'Startup Incubator', type: 'establishment', rating: 4.1 }
      ],
      relax: [
        { name: 'City Park', type: 'park', rating: 4.4 },
        { name: 'Relaxation Center', type: 'spa', rating: 4.1 },
        { name: 'Quiet Garden', type: 'park', rating: 4.6 },
        { name: 'Meditation Studio', type: 'establishment', rating: 4.2 }
      ]
    };
    
    const templates = placeTemplates[mood] || placeTemplates.food;
    const places = templates.map((template, index) => {
      // Generate random location near user with better randomness
      const seed = Date.now() + index; // Use time + index for variety
      const random = Math.sin(seed) * 10000;
      const offset = 0.005 + (random % 0.01); // 0.5km to 1.5km radius
      const angle = (index * 2 * Math.PI) / templates.length + random;
      const placeLocation = {
        lat: location.lat + Math.cos(angle) * offset,
        lng: location.lng + Math.sin(angle) * offset
      };
      
      return {
        place_id: `mock_${mood}_${Date.now()}_${index}`,
        name: template.name,
        vicinity: `${template.type} • ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
        rating: template.rating,
        user_ratings_total: Math.floor(Math.random() * 200) + 50,
        price_level: Math.floor(Math.random() * 3) + 1,
        types: [template.type],
        geometry: { location: placeLocation },
        distance: (offset * 200).toFixed(2), // Convert to km
        photos: []
      };
    });
    
    console.log(`🎲 Generated ${places.length} unique mock places`);
    return places;
  };

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps) {
      console.log('✅ Google Maps already loaded');
      setIsLoaded(true);
      setLoadError(null);
      return;
    }

    console.log('🔍 Loading Google Maps script...');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps&v=3.55`;
    script.async = true;
    script.defer = true;

    // Global callback function
    window.initGoogleMaps = () => {
      console.log('✅ Google Maps API loaded successfully');
      console.log('🔍 Checking Places library availability...');
      
      // Check if Places library is actually available
      if (!window.google?.maps?.places) {
        console.error('❌ Places library not available - API key may not have Places API enabled');
        setLoadError('Google Maps API key does not have Places API enabled. Please check your Google Cloud Console.');
        return;
      }
      
      // Check for common Google Maps errors
      if (window.google?.maps?.places?.AutocompleteService) {
        console.log('✅ AutocompleteService available');
      } else {
        console.error('❌ AutocompleteService not available');
      }
      
      if (window.google?.maps?.Geocoder) {
        console.log('✅ Geocoder available');
      } else {
        console.error('❌ Geocoder not available');
      }
      
      console.log('✅ Places library is available');
      setIsLoaded(true);
      setLoadError(null);
    };

    // Add global error handler for Google Maps
    window.gm_authFailure = () => {
      console.error('❌ Google Maps authentication failed - API key issue');
      setLoadError('Google Maps API key authentication failed. Please check your API key and ensure Maps JavaScript API is enabled.');
    };

    window.gm_loadFailure = () => {
      console.error('❌ Google Maps failed to load');
      setLoadError('Google Maps failed to load. Please check your internet connection.');
    };

    script.onerror = () => {
      console.error('❌ Failed to load Google Maps API');
      setLoadError('Failed to load Google Maps API. Please check your internet connection and API key.');
    };

    document.head.appendChild(script);
  }, []);
 
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const geocoderRef = useRef(null);
  const markerRef = useRef(null);

  // Moods configuration
  const moods = [
    { id: 'work', name: 'Work', icon: '💼', color: '#4CAF50' },
    { id: 'relax', name: 'Relax', icon: '🧘', color: '#2196F3' },
    { id: 'food', name: 'Food', icon: '🍕', color: '#FF9800' },
    { id: 'social', name: 'Social', icon: '🎉', color: '#9C27B0' },
    { id: 'nature', name: 'Nature', icon: '🌳', color: '#8BC34A' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#E91E63' },
    { id: 'fitness', name: 'Fitness', icon: '💪', color: '#F44336' },
    { id: 'culture', name: 'Culture', icon: '🎭', color: '#795548' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#3F51B5' },
    { id: 'learning', name: 'Learning', icon: '📚', color: '#607D8B' },
    { id: 'clinic', name: 'Clinic', icon: '🏥', color: '#00BCD4' }
  ];

  // Debug API key
  useEffect(() => {
    console.log('🔑 Google Maps API Key:', process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');
    console.log('🌐 Google Maps loaded:', isLoaded);
    console.log('❌ Load error:', loadError);
    
    if (loadError) {
      console.error('❌ Google Maps failed to load - will use mock mode');
    }
  }, [isLoaded, loadError]);

  useEffect(() => {
    if (!isLoaded || loadError || !mapRef.current) return;

    console.log('🗺️ Initializing map...');
    console.log('🔑 Google Maps loaded:', isLoaded);
    console.log('❌ Load error:', loadError);
    console.log('🗺️ Map ref exists:', !!mapRef.current);

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 13,
        styles: theme === 'dark' ? [
          { elementType: 'geometry', stylers: [{ color: '#212121' }] },
          { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] }
        ] : []
      });

      mapInstanceRef.current = map;
      
      // Initialize services with error handling
      try {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        console.log('✅ Autocomplete service initialized');
      } catch (autoError) {
        console.error('❌ Failed to initialize autocomplete service:', autoError);
        autocompleteServiceRef.current = null;
      }
      
      try {
        geocoderRef.current = new window.google.maps.Geocoder();
        console.log('✅ Geocoder service initialized');
      } catch (geoError) {
        console.error('❌ Failed to initialize geocoder:', geoError);
        geocoderRef.current = null;
      }
      
      console.log('✅ Map initialized successfully');
      
      // If user location is already set, center map on it
      if (userLocation) {
        map.setCenter(userLocation);
      }
    } catch (mapError) {
      console.error('❌ Map initialization error:', mapError);
      setError('Failed to initialize map. Using demo mode.');
      // Create a simple demo mode
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div style="
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${theme === 'dark' ? '#1f2937' : '#f3f4f6'};
            color: ${theme === 'dark' ? '#f3f4f6' : '#374151'};
            text-align: center;
            padding: 20px;
          ">
            <div>
              <h3>🗺️ Demo Mode</h3>
              <p>Google Maps temporarily unavailable</p>
              <p style="font-size: 12px; margin-top: 10px;">
                Location: ${mapCenter.lat.toFixed(4)}, ${mapCenter.lng.toFixed(4)}
              </p>
            </div>
          </div>
        `;
      }
    }
  }, [isLoaded, loadError, mapCenter, userLocation]);

  useEffect(() => {
    if (loadError && mapRef.current) {
      // Create a simple mock map display
      mapRef.current.innerHTML = `
        <div style="
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f0f0;
          flex-direction: column;
          padding: 2rem;
          text-align: center;
        ">
          <h3>🗺️ Map View (Mock Mode)</h3>
          <p>Google Maps API key has billing restrictions.</p>
          <p>App is working with mock data.</p>
          <p style="color: #666; font-size: 0.9rem;">
            Location: ${mapCenter.lat.toFixed(4)}, ${mapCenter.lng.toFixed(4)}
          </p>
        </div>
      `;
    }
  }, [loadError, mapCenter]);

  // Fetch places when distance changes
  useEffect(() => {
    if (userLocation && selectedMood) {
      console.log('🔄 Distance changed, refetching places...');
      fetchPlacesFromBackend(userLocation, selectedMood, selectedDistance);
    }
  }, [selectedDistance]);

  useEffect(() => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setCenter(userLocation);
      mapInstanceRef.current.setZoom(14);
      
      // Draw radius circle
      if (window.radiusCircle) {
        window.radiusCircle.setMap(null);
      }
      
      window.radiusCircle = new window.google.maps.Circle({
        strokeColor: '#2563eb',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#2563eb',
        fillOpacity: 0.1,
        map: mapInstanceRef.current,
        center: userLocation,
        radius: selectedDistance * 1000 // Convert km to meters
      });
    }
  }, [userLocation, selectedDistance]);

  const addMarker = (location) => {
    console.log('📍 Adding user location marker:', location);
    console.log('🗺️ Map instance status:', !!mapInstanceRef.current);
    console.log('🌐 Google Maps status:', !!window.google?.maps);
    
    // Wait a moment for map to fully initialize
    setTimeout(() => {
      // Check if Google Maps API is loaded
      if (!window.google || !window.google.maps) {
        console.error('❌ Google Maps API not loaded in addMarker');
        setError('Google Maps not loaded. Please refresh the page.');
        return;
      }
      
      if (!mapInstanceRef.current) {
        console.error('❌ Map instance not available in addMarker');
        setError('Map not initialized. Please refresh the page.');
        return;
      }

      if (markerRef.current) {
        try {
          markerRef.current.setMap(null);
        } catch (e) {
          console.error('Error removing existing marker:', e);
        }
      }

      try {
        markerRef.current = new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          title: 'Your Location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 15,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
          }
        });

        mapInstanceRef.current.setCenter(location);
        console.log('✅ User location marker added successfully');
      } catch (e) {
        console.error('❌ Error creating user location marker:', e);
        setError('Failed to add location marker. Please refresh the page.');
      }
    }, 500); // Wait 500ms for map to initialize
  };

  // Add markers for places on the map
  const addPlaceMarkers = (places) => {
    console.log('🗺️ Adding place markers:', places?.length || 'undefined');
    
    // Check if places is valid
    if (!places || !Array.isArray(places)) {
      console.error('❌ Invalid places data:', places);
      setError('Invalid places data received from server.');
      return;
    }
    
    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps) {
      console.error('❌ Google Maps API not loaded');
      setError('Google Maps not loaded. Please refresh the page.');
      return;
    }
    
    if (!mapInstanceRef.current) {
      console.error('❌ Map instance not available');
      setError('Map not initialized. Please refresh the page.');
      return;
    }
    
    // Clear existing place markers (but keep user location marker)
    if (window.placeMarkers) {
      window.placeMarkers.forEach(marker => {
        try {
          marker.setMap(null);
        } catch (e) {
          console.error('Error removing marker:', e);
        }
      });
    }
    window.placeMarkers = [];
    
    // Add markers for each place
    places.forEach((place, index) => {
      if (place.geometry && place.geometry.location) {
        try {
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map: mapInstanceRef.current,
            title: place.name,
            label: {
              text: (index + 1).toString(),
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#2563eb',
              fillOpacity: 1,
              strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });
        
        // Add click listener to show place info
        marker.addListener('click', () => {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="margin: 0 0 4px 0; font-size: 14px;">${place.name}</h3>
                <p style="margin: 0; font-size: 12px; color: #666;">${place.vicinity || ''}</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #2563eb; font-weight: bold;">
                  📏 ${parseFloat(place.distance).toFixed(2)} km
                </p>
              </div>
            `
          });
          infoWindow.open(mapInstanceRef.current, marker);
        });
        
        window.placeMarkers.push(marker);
        } catch (e) {
          console.error('❌ Error creating marker for place:', place.name, e);
        }
      } else {
        console.warn('⚠️ Place missing geometry:', place.name);
      }
    });
    
    console.log(`📍 Added ${window.placeMarkers.length} place markers to map`);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Try the new AutocompleteSuggestion API first, fallback to old method
    if (window.google && window.google.maps && window.google.maps.places) {
      try {
        // New API for new customers
        if (window.google.maps.places.AutocompleteSuggestion) {
          window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: value,
            includedPrimaryTypes: ['restaurant', 'cafe', 'park', 'shopping_mall', 'tourist_attraction', 'establishment'],
          }).then((result) => {
            if (result && result.suggestions && Array.isArray(result.suggestions)) {
              const predictions = result.suggestions.map(s => ({
                place_id: s.placePrediction.placeId,
                description: s.placePrediction.text.text
              }));
              console.log('✅ New API autocomplete results:', predictions.length);
              setSuggestions(predictions);
              setShowSuggestions(true);
            }
          }).catch((err) => {
            console.log('New API failed, trying old API:', err);
            fetchAutocompleteOld(value);
          });
        } else {
          // Fallback to old API
          fetchAutocompleteOld(value);
        }
      } catch (err) {
        console.error('Autocomplete error:', err);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      console.error('❌ Google Maps not loaded');
    }
  };

  const fetchAutocompleteOld = (value) => {
    if (!autocompleteServiceRef.current) {
      console.error('❌ Autocomplete service not available');
      return;
    }

    // Check if Places library is properly loaded
    if (!window.google?.maps?.places) {
      console.error('❌ Google Maps Places library not loaded - using fallback');
      setSuggestions([]); // Clear suggestions
      setShowSuggestions(false);
      return;
    }

    try {
      autocompleteServiceRef.current.getPlacePredictions(
        { 
          input: value,
          types: ['establishment', 'geocode'],
        },
        (predictions, status) => {
          if (status === 'OK' && predictions && Array.isArray(predictions)) {
            console.log('✅ Old API autocomplete results:', predictions.length);
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            console.error('❌ Autocomplete error:', status);
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } catch (placesError) {
      console.error('❌ Places API error:', placesError);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setError('Please enter a location to search');
      return;
    }
    
    if (!geocoderRef.current) {
      console.error('❌ Geocoder service not available');
      setError('Location service not available');
      return;
    }
    
    setLoading(true);
    setError('');
    
    geocoderRef.current.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };
        setUserLocation(location);
        setMapCenter(location);
        addMarker(location);
        
        // Fetch places if mood is selected
        if (selectedMood) {
          fetchPlacesFromBackend(location, selectedMood, selectedDistance);
        } else {
          setLoading(false); // Only set loading false if not fetching places
        }
      } else {
        console.error('❌ Geocoding error:', status);
        setError('Location not found. Please try a different search term.');
        setLoading(false);
      }
    });
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.description);
    setShowSuggestions(false);

    if (!geocoderRef.current) {
      console.error('❌ Geocoder service not available for suggestion');
      setError('Location service not available');
      return;
    }

    setLoading(true);
    setError('');

    geocoderRef.current.geocode(
      { placeId: suggestion.place_id },
      (results, status) => {
        if (status === "OK" && results && results[0]) {
          const location = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          };
          setUserLocation(location);
          setMapCenter(location);
          addMarker(location);
          
          // Fetch places if mood is selected
          if (selectedMood) {
            fetchPlacesFromBackend(location, selectedMood, selectedDistance);
          } else {
            setLoading(false); // Only set loading false if not fetching places
          }
        } else {
          console.error('❌ Suggestion geocoding error:', status);
          setError('Location not found. Please try a different search term.');
          setLoading(false);
        }
      }
    );
  };

  // Manual connection test function
  const handleManualConnectionTest = async () => {
    console.log('🔧 Manual connection test triggered');
    setError('Testing connection...');
    
    // Simple ping test first
    try {
      console.log('📡 Testing basic connectivity...');
      const pingResponse = await fetch('http://localhost:5001/api/health', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      console.log('✅ Basic connectivity test passed');
    } catch (pingError) {
      console.error('❌ Basic connectivity failed:', pingError.message);
    }
    
    const result = await testBackendConnection();
    if (result === true) {
      setError('✅ Connection successful! Try searching again.');
      setTimeout(() => setError(''), 3000);
    } else if (result === 'network_down') {
      setError('📶 Network disconnected. Check your internet connection.');
    } else {
      setError('❌ Cannot connect to backend. Check if backend is running on port 5001.');
    }
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log('🔗 Testing backend connection to:', API_URL);
      
      const testResponse = await axios.get(`${API_URL}/health`, {
        timeout: 10000, // Increased timeout
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      console.log('✅ Backend connection test passed:', testResponse.status);
      console.log('📡 Backend response:', testResponse.data);
      return true;
    } catch (testError) {
      console.error('❌ Backend connection test failed:', testError.message);
      console.error('🔍 Connection test details:', {
        code: testError.code,
        status: testError.response?.status,
        config: {
          url: testError.config?.url,
          method: testError.config?.method
        }
      });
      
      // Test if it's a complete network failure
      if (testError.code === 'ERR_NETWORK_CHANGED' || 
          testError.code === 'ERR_INTERNET_DISCONNECTED' ||
          navigator.onLine === false) {
        console.error('📶 Complete network failure detected');
        return 'network_down';
      }
      
      // Fallback: try direct fetch as backup
      try {
        console.log('🔄 Trying fallback connection method...');
        const fallbackResponse = await fetch(`${API_URL}/health`, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache'
        });
        if (fallbackResponse.ok) {
          console.log('✅ Fallback connection successful');
          return true;
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError.message);
      }
      
      return false;
    }
  };
  // Calculate distance between two points
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

  // Fetch places from backend API
  const fetchPlacesFromBackend = async (location, mood, distance) => {
    console.log('🚀 Starting fetchPlacesFromBackend...');
    console.log('📏 Distance parameter:', distance, 'km');
    console.log('📍 Location:', location);
    console.log('🎨 Mood:', mood);
    
    // Set loading timeout - force stop after 25 seconds
    const loadingTimeout = setTimeout(() => {
      console.log('⏰ Loading timeout reached - using mock data');
      setLoading(false);
      setError('Request timed out. Using mock data.');
      // Use mock data as fallback
      const places = generateMockPlaces(mapCenter || { lat: 28.6139, lng: 77.209 }, selectedMood || 'food', selectedDistance * 1000);
      addPlaceMarkers(places);
      setFilteredPlaces(places);
    }, 25000);
    
    // Test backend connection first (with shorter timeout)
    const isBackendConnected = await testBackendConnection();
    if (isBackendConnected === 'network_down') {
      setError('Network connection lost. Please check your internet connection and try again.');
      setLoading(false);
      return;
    } else if (!isBackendConnected) {
      setError('Cannot connect to backend server. Please ensure backend is running on port 5001.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('✅ Loading set to true');
      
      // Clear previous markers and places immediately
      setFilteredPlaces([]);
      if (window.placeMarkers) {
        window.placeMarkers.forEach(marker => marker.setMap(null));
        window.placeMarkers = [];
      }
      
      console.log('🔍 Fetching places from backend:', { location, mood, distance });
      
      console.log('🌐 API URL:', API_URL);
      
      const response = await axios.get(`${API_URL}/places/recommend`, {
        params: {
          mood: mood,
          location: JSON.stringify(location),
          radius: distance * 1000, // Convert km to meters
          _t: Date.now(), // Cache-busting timestamp
          _r: Math.random().toString(36).substring(7) // Additional random cache buster
        },
        paramsSerializer: function(params) {
          return Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
        },
        timeout: 20000, // 20 second timeout (less than backend's 25s)
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Backend response received:', response.status);
      console.log('📍 Full response data:', response.data);
      console.log('📍 Response data keys:', Object.keys(response.data || {}));
      
      // Clear loading timeout
      clearTimeout(loadingTimeout);
      
      // Validate response structure - be more flexible
      if (!response.data) {
        console.error('❌ No response data received');
        setError('No data received from server. Using mock data.');
        // Use mock data as fallback
        const places = generateMockPlaces(mapCenter || { lat: 28.6139, lng: 77.209 }, selectedMood || 'food', selectedDistance * 1000);
        addPlaceMarkers(places);
        setFilteredPlaces(places);
        setLoading(false);
        return;
      }
      
      // Check for different possible response structures
      let places = [];
      if (response.data.places && Array.isArray(response.data.places)) {
        places = response.data.places;
        console.log('✅ Found places in response.data.places');
      } else if (response.data.results && Array.isArray(response.data.results)) {
        places = response.data.results;
        console.log('✅ Found places in response.data.results');
      } else if (Array.isArray(response.data)) {
        places = response.data;
        console.log('✅ Found places in response.data (direct array)');
      } else {
        console.error('❌ Invalid response structure:', response.data);
        console.error('❌ Expected places array but found:', typeof response.data.places, typeof response.data.results, typeof response.data);
        setError('Server returned invalid response. Using mock data.');
        // Use mock data as fallback
        places = generateMockPlaces(mapCenter || { lat: 28.6139, lng: 77.209 }, selectedMood || 'food', selectedDistance * 1000);
      }
      
      console.log(`📊 Processing ${places.length} places`);
      
      // Add place markers to map
      addPlaceMarkers(places);
      
      // Set filtered places for display
      setFilteredPlaces(places);
      
      console.log(`🎯 Displaying ${places.length} places at current location`);
      console.log('✅ fetchPlacesFromBackend completed successfully');
      
      // Clear any previous errors
      setError('');
      
    } catch (error) {
      console.error('❌ Error fetching places from backend:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params,
          timeout: error.config?.timeout
        }
      });
      
      // User-friendly error messages
      let errorMessage = 'Failed to fetch places. Please try again.';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('⏰ Request timeout');
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.response) {
        // Server responded with error status
        console.error('🚨 Server error response:', error.response.status, error.response.data);
        if (error.response.status === 408) {
          errorMessage = 'Server timeout. Please try again.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.error || 'Invalid request parameters.';
        } else if (error.response.status === 404) {
          errorMessage = 'Service not found. Please check your connection.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.response.status === 429) {
          errorMessage = 'Too many requests. Please wait a moment.';
        } else if (error.response.status >= 400 && error.response.status < 500) {
          errorMessage = `Request error (${error.response.status}). Please check your request.`;
        } else if (error.response.status >= 500) {
          errorMessage = `Server error (${error.response.status}). Please try again later.`;
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.error('🚫 Connection refused - backend not running');
        errorMessage = 'Cannot connect to server. Please check if backend is running on port 5001.';
      } else if (error.code === 'ERR_NETWORK') {
        console.error('🌐 Network connectivity issue');
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'ETIMEDOUT') {
        console.error('⏰ Request timeout');
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.code === 'ERR_INTERNET_DISCONNECTED') {
        console.error('📶 Internet disconnected');
        errorMessage = 'Internet connection lost. Please check your network.';
      } else {
        console.error('❓ Unknown error type:', error.code, error.message);
        errorMessage = `Network error: ${error.message || 'Unknown error'}`;
      }
      
      setError(errorMessage);
      setFilteredPlaces([]);
      console.log('❌ fetchPlacesFromBackend failed with error');
      
    } finally {
      // Always reset loading state
      setLoading(false);
      console.log('🏁 Loading set to false in finally block');
    }
  };

  const handleUseMyLocation = (forceRefresh = false) => {
    console.log('🎯 handleUseMyLocation called, map ready:', !!mapInstanceRef.current);
    console.log('🎯 Google Maps loaded:', !!window.google?.maps);
    console.log('🎯 Navigator geolocation available:', !!navigator.geolocation);
    
    // Check if map is ready before getting location
    if (!mapInstanceRef.current) {
      console.error('❌ Map not initialized yet, cannot get location');
      setError('Map is still loading. Please wait a moment and try again.');
      return;
    }
    
    // Fallback: Try to manually set location if geolocation fails
    const fallbackLocation = { lat: 28.6139, lng: 77.209 }; // Delhi coordinates
    
    if (navigator.geolocation) {
      setLocationLoading(true);
      setError('');
      // Clear previous places while getting new location
      setFilteredPlaces([]);
      
      // Clear any cached data if force refresh
      if (forceRefresh) {
        console.log('🔄 Force refresh - clearing all cached data');
        localStorage.removeItem('nearbyTracker_location');
        localStorage.removeItem('nearbyTracker_places');
        // Clear map markers
        if (window.placeMarkers) {
          window.placeMarkers.forEach(marker => marker.setMap(null));
          window.placeMarkers = [];
        }
        if (markerRef.current) {
          markerRef.current.setMap(null);
          markerRef.current = null;
        }
      }
      
      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: forceRefresh ? 0 : 0 // Always get fresh location
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          console.log('📍 Got user location:', location);
          console.log('🎯 Accuracy:', position.coords.accuracy, 'meters');
          console.log('⏱️ Location timestamp:', new Date(position.timestamp).toLocaleTimeString());
          
          // Store in localStorage for debugging
          localStorage.setItem('nearbyTracker_location', JSON.stringify(location));
          
          setUserLocation(location);
          setMapCenter(location);
          
          // Add marker with fallback
          try {
            addMarker(location);
          } catch (markerError) {
            console.error('❌ Failed to add marker, using fallback:', markerError);
            // Still set location even if marker fails
          }
          
          setLocationLoading(false);
          // Clear search query when using current location
          setTimeout(() => {
            if (mapInstanceRef.current) {
              try {
                addMarker(location);
                console.log('✅ User location marker added');
              } catch (markerError) {
                console.error('❌ Failed to add user marker:', markerError);
              }
            }
          }, 1000);
          
          // Auto-select first mood if none selected
          if (!selectedMood) {
            console.log('🎨 Auto-selecting first mood: food');
            setSelectedMood('food');
            // Fetch places with food mood
            fetchPlacesFromBackend(location, 'food', selectedDistance);
          } else {
            // Fetch places with current mood
            fetchPlacesFromBackend(location, selectedMood, selectedDistance);
          }
          
          setLocationLoading(false);
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
          let errorMessage = 'Unable to get your location.';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            case error.UNKNOWN_ERROR:
              errorMessage = 'An unknown error occurred.';
              break;
          }
          
          setError(errorMessage);
          setLocationLoading(false);
          
          // Use fallback location and fetch places
          const fallbackLocation = { lat: 28.6139, lng: 77.209 };
          console.log('📍 Using fallback location:', fallbackLocation);
          setUserLocation(fallbackLocation);
          setMapCenter(fallbackLocation);
          
          if (!selectedMood) {
            setSelectedMood('food');
            fetchPlacesFromBackend(fallbackLocation, 'food', selectedDistance);
          } else {
            fetchPlacesFromBackend(fallbackLocation, selectedMood, selectedDistance);
          }
        },
        geoOptions
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  if (loadError) {
    console.error('❌ Google Maps Load Error:', loadError);
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f8fafc',
        color: theme === 'dark' ? '#ffffff' : '#1f2937',
        flexDirection: 'column',
        padding: '2rem'
      }}>
        <div style={{
          fontSize: '1.5rem',
          color: '#dc3545',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          ⚠️ Error loading Google Maps
        </div>
        <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {loadError.message || 'Failed to load Google Maps. Please check your internet connection.'}
        </p>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          fontFamily: 'monospace'
        }}>
          <strong>Debug Info:</strong><br/>
          API Key: {process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing'}<br/>
          Error: {loadError.message || 'Unknown error'}<br/>
          Libraries: places
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f8fafc',
        color: theme === 'dark' ? '#ffffff' : '#1f2937',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: `4px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} />
        <p style={{ fontSize: '1.2rem' }}>Loading Google Maps...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f8fafc',
      color: theme === 'dark' ? '#ffffff' : '#1f2937',
      margin: 0,
      padding: '2rem',
      boxSizing: 'border-box'
    }}>
      {/* Main Content */}
      <div style={{ padding: '0 2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'flex-start',
          gap: '2rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <input
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search location or places..."
              style={{
                width: '100%',
                padding: '1.25rem',
                fontSize: '1.1rem',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#d1d5db'}`,
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#1f2937',
                boxSizing: 'border-box',
                minWidth: '400px'
              }}
            />
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🔍 Search
            </button>

            {/* Search Results Dropdown - FIXED POSITIONING */}
            {showSuggestions && searchQuery && suggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: '80px',
                  background: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#d1d5db'}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  maxHeight: '250px',
                  overflowY: 'auto'
                }}
              >
                {suggestions && suggestions.map((suggestion) => (
                  <div
                    key={suggestion.place_id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      borderBottom: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                      color: theme === 'dark' ? '#ffffff' : '#1f2937',
                      transition: 'background-color 0.2s ease',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#ffffff';
                    }}
                  >
                    📍 {suggestion.description}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => handleUseMyLocation(false)}
              disabled={locationLoading}
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: locationLoading ? '#6b7280' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: locationLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {locationLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Getting location...</span>
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📍 Use My Location
                </span>
              )}
            </button>

            <button
              onClick={() => handleUseMyLocation(true)}
              disabled={locationLoading}
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: locationLoading ? '#6b7280' : '#dc3545',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: locationLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
              title="Clear cache and force fresh location"
            >
              🔄 Force Refresh
            </button>

            <button
              onClick={handleManualConnectionTest}
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: '#17a2b8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              title="Test backend connection"
            >
              🔧 Test Connection
            </button>

            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: loading ? '#6b7280' : '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Searching...' : '🔍 Search'}
            </button>
          </div>
        </div>

        {/* Moods */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h3 style={{ 
            marginBottom: '2rem', 
            color: theme === 'dark' ? '#ffffff' : '#1f2937',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            How are you feeling today?
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '1rem', 
            maxWidth: '1200px', 
            margin: '0 auto' 
          }}>
            {moods && moods.map((mood, index) => (
              <button
                key={mood.id}
                onClick={() => {
                  setSelectedMood(mood.id);
                  // Fetch places if location is already set
                  if (userLocation) {
                    fetchPlacesFromBackend(userLocation, mood.id, selectedDistance);
                  }
                }}
                style={{
                  padding: '1.5rem 1rem',
                  border: selectedMood === mood.id ? '2px solid #2563eb' : `1px solid ${theme === 'dark' ? '#374151' : '#d1d5db'}`,
                  borderRadius: '16px',
                  backgroundColor: selectedMood === mood.id ? mood.color : (theme === 'dark' ? '#1f2937' : '#ffffff'),
                  color: selectedMood === mood.id ? '#ffffff' : (theme === 'dark' ? '#ffffff' : '#1f2937'),
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ 
                  fontSize: '2rem',
                  marginRight: '0.5rem',
                  display: 'block'
                }}>{mood.icon}</span>
                <span style={{ 
                  fontWeight: '700', 
                  fontSize: '1.125rem',
                  display: 'block'
                }}>{mood.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Distance Filter */}
        {selectedMood && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            padding: '1.5rem',
            background: theme === 'dark' ? '#1f2937' : '#f8fafc',
            borderRadius: '12px',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
          }}>
            <h3 style={{ 
              marginBottom: '1rem', 
              color: theme === 'dark' ? '#ffffff' : '#1f2937',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              📏 Search Distance: {selectedDistance} km
            </h3>
            {userLocation && (
              <p style={{
                fontSize: '0.85rem',
                color: theme === 'dark' ? '#b0b0b0' : '#6b7280',
                marginBottom: '1rem'
              }}>
                📍 Current: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            )}
            <div style={{ 
              maxWidth: '400px', 
              margin: '0 auto' 
            }}>
              <input
                type="range"
                min="1"
                max="20"
                value={selectedDistance}
                onChange={(e) => {
                  const newDistance = parseInt(e.target.value);
                  console.log('🎯 Distance slider changed:', newDistance, 'km');
                  console.log('📍 Current location:', userLocation);
                  console.log('🎭 Current mood:', selectedMood);
                  setSelectedDistance(newDistance);
                  // Refetch places with new distance if location and mood are set
                  if (userLocation && selectedMood) {
                    console.log('🔄 Refetching places with new distance:', newDistance);
                    fetchPlacesFromBackend(userLocation, selectedMood, newDistance);
                  } else {
                    console.log('⚠️ Cannot refetch - missing location or mood');
                  }
                }}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: theme === 'dark' ? '#374151' : '#e5e7eb',
                  outline: 'none',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
                onMouseDown={(e) => {
                  e.target.style.background = `linear-gradient(to right, #2563eb 0%, #2563eb ${((selectedDistance - 1) / 19) * 100}%, ${theme === 'dark' ? '#374151' : '#e5e7eb'} ${((selectedDistance - 1) / 19) * 100}%, ${theme === 'dark' ? '#374151' : '#e5e7eb'} 100%)`;
                }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '0.5rem',
                color: theme === 'dark' ? '#b0b0b0' : '#6b7280',
                fontSize: '0.9rem'
              }}>
                <span>1 km</span>
                <span>5 km</span>
                <span>10 km</span>
                <span>20 km</span>
              </div>
            </div>
          </div>
        )}

        {/* Map */}
        <div style={{ 
          padding: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div
            ref={mapRef}
            style={{ 
              position: 'relative', 
              height: '500px', 
              width: '100%', 
              borderRadius: '12px', 
              overflow: 'hidden' 
            }}
          >
            {/* Location Info */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 1000,
              background: theme === 'dark' ? '#1f2937' : '#ffffff',
              padding: '8px 12px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              fontSize: '12px',
              color: theme === 'dark' ? '#f3f4f6' : '#374151'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                📍 Location: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
              </div>
              {userLocation && (
                <div style={{ fontSize: '11px', color: theme === 'dark' ? '#9ca3af' : '#059669' }}>
                  🎯 Your Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </div>
              )}
            </div>

            <div
              style={{ 
                height: '100%', 
                width: '100%',
                borderRadius: '12px',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#d1d5db'}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        </div>

        {/* Places Display */}
        {error && (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            background: '#dc3545',
            color: 'white',
            borderRadius: '12px',
            marginBottom: '2rem'
          }}>
            <p style={{ margin: 0, fontSize: '1.1rem' }}>
              ⚠️ {error}
            </p>
          </div>
        )}
        {filteredPlaces.length > 0 && (
          <div style={{ 
            padding: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <h3 style={{ 
              marginBottom: '2rem', 
              color: theme === 'dark' ? '#ffffff' : '#1f2937',
              fontSize: '1.5rem',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              🎯 Found {filteredPlaces ? filteredPlaces.length : 0} places within {selectedDistance} km
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {filteredPlaces && filteredPlaces.map((place, index) => (
                <div
                  key={place.place_id || index}
                  style={{
                    background: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <h4 style={{ 
                      margin: 0, 
                      color: theme === 'dark' ? '#ffffff' : '#1f2937',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      flex: 1
                    }}>
                      {place.name}
                    </h4>
                    {place.rating && (
                      <span style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        marginLeft: '0.5rem'
                      }}>
                        ⭐ {place.rating}
                      </span>
                    )}
                  </div>
                  <p style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: theme === 'dark' ? '#b0b0b0' : '#6b7280',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    📍 {place.vicinity || place.formatted_address}
                  </p>
                  {place.distance && (
                    <p style={{ 
                      margin: '0 0 0.5rem 0', 
                      color: '#2563eb',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}>
                      📏 {parseFloat(place.distance).toFixed(2)} km away
                    </p>
                  )}
                  {place.price_level && (
                    <p style={{ 
                      margin: '0 0 0.5rem 0', 
                      color: theme === 'dark' ? '#b0b0b0' : '#6b7280',
                      fontSize: '0.9rem'
                    }}>
                      {'₹'.repeat(place.price_level)}
                    </p>
                  )}
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem',
                    marginTop: '1rem'
                  }}>
                    <button
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.vicinity)}`;
                        window.open(mapsUrl, '_blank');
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
                    >
                      🗺️ View on Maps
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            zIndex: 1000,
            fontSize: '0.9rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: theme === 'dark' ? '#ffffff' : '#1f2937'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: `4px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p style={{ fontSize: '1.1rem' }}>Finding amazing places for you...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleMapsComponent;
