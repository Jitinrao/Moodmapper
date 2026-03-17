import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';

const MapComponent = ({ userLocation, places, selectedPlace, onPlaceSelect, onMapClick }) => {
  // Refs to prevent unnecessary re-renders
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const mapScriptRef = useRef(null);
  const clickListenerRef = useRef(null);
  
  // State for clicked location
  const [clickedLocation, setClickedLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState('');

  // Memoized center location to prevent recalculations
  const centerLocation = useMemo(() => 
    userLocation || { lat: 37.7749, lng: -122.4194 }, 
    [userLocation]
  );

  // Initialize demo map when Google Maps fails
  const initializeDemoMap = useCallback(() => {
    if (!mapRef.current) return;

    const mapContainer = mapRef.current;
    const demoMapHTML = `
      <div style="
        width: 100%;
        height: 400px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: Arial, sans-serif;
        position: relative;
        overflow: hidden;
      ">
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="white" opacity="0.5"/></svg>');
          background-size: 50px 50px;
          opacity: 0.1;
        "></div>
        <div style="position: relative; z-index: 1; text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
          <h3 style="margin: 0 0 1rem 0; font-size: 1.5rem;">Interactive Map</h3>
          <p style="margin: 0 0 2rem 0; opacity: 0.9;">Click anywhere to drop a pin</p>
          <div style="
            background: rgba(255, 255, 255, 0.2);
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            max-width: 300px;
          ">
            <p style="margin: 0; font-size: 0.9rem;">
              📍 Center: ${centerLocation.lat.toFixed(4)}, ${centerLocation.lng.toFixed(4)}
            </p>
            <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">
              🏢 ${places?.length || 0} places nearby
            </p>
          </div>
          <button onclick="
            window.open('https://www.google.com/maps/search/?api=1&query=${centerLocation.lat},${centerLocation.lng}', '_blank')
          " style="
            background: rgba(255, 255, 255, 0.3);
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            color: white;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
          " onmouseover="this.style.background='rgba(255, 255, 255, 0.4)'"
             onmouseout="this.style.background='rgba(255, 255, 255, 0.3)'">
            🌐 Open in Google Maps
          </button>
        </div>
      </div>
    `;

    mapContainer.innerHTML = demoMapHTML;

    // Add click handler for demo map
    const demoMapElement = mapContainer.querySelector('div');
    const clickHandler = (e) => {
      const rect = demoMapElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate approximate lat/lng from click position
      const lat = centerLocation.lat + (y - rect.height / 2) * 0.001;
      const lng = centerLocation.lng + (x - rect.width / 2) * 0.001;
      
      setClickedLocation({ lat, lng });
      
      // Show info window
      showInfoWindow(lat, lng, 'Clicked Location');
    };
    
    demoMapElement.addEventListener('click', clickHandler);
    clickListenerRef.current = clickHandler;
    
    console.log('✅ Demo map initialized');
  }, [centerLocation, places]);

  // Show info window for clicked location
  const showInfoWindow = useCallback((lat, lng, title) => {
    if (!mapInstanceRef.current || !window.google) {
      // For demo map, show alert
      alert(`📍 ${title}\nLat: ${lat.toFixed(6)}\nLng: ${lng.toFixed(6)}\n\nClick OK to open in Google Maps`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
      return;
    }

    const infoWindow = infoWindowRef.current || new window.google.maps.InfoWindow();
    infoWindowRef.current = infoWindow;

    const content = `
      <div style="
        padding: 10px;
        min-width: 200px;
        font-family: Arial, sans-serif;
      ">
        <h4 style="margin: 0 0 10px 0; color: #333;">${title}</h4>
        <p style="margin: 5px 0; color: #666; font-size: 12px;">
          📍 Latitude: ${lat.toFixed(6)}
        </p>
        <p style="margin: 5px 0; color: #666; font-size: 12px;">
          📍 Longitude: ${lng.toFixed(6)}
        </p>
        <button onclick="
          window.open('https://www.google.com/maps/search/?api=1&query=${lat},${lng}', '_blank')
        " style="
          background: #4285f4;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          margin-top: 10px;
          width: 100%;
        ">
          🌐 Open in Google Maps
        </button>
      </div>
    `;

    infoWindow.setContent(content);
    infoWindow.setPosition({ lat, lng });
    infoWindow.open(mapInstanceRef.current);
  }, []);

  // Initialize Google Maps
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      console.error('❌ Map container or Google Maps not available');
      return;
    }

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: centerLocation,
        zoom: 14,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }]
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);
      console.log('✅ Google Maps initialized successfully');

      // Add click listener to map
      map.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        
        setClickedLocation({ lat, lng });
        
        // Call onMapClick callback to update userLocation and trigger search
        if (onMapClick) {
          onMapClick({ lat, lng });
        }
        
        // Add a temporary marker
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          animation: window.google.maps.Animation.DROP,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });

        // Show info window
        showInfoWindow(lat, lng, 'Clicked Location');
      });

      updateMarkers(map);
    } catch (err) {
      console.error('❌ Error initializing map:', err);
      setError('Failed to initialize map');
      initializeDemoMap();
    }
  }, [centerLocation, showInfoWindow, onMapClick]);

  // Update markers - optimized to prevent unnecessary updates
  const updateMarkers = useCallback((map) => {
    if (!window.google || !map) return;

    console.log(`🔄 Updating ${places?.length || 0} markers`);

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (!places || !Array.isArray(places)) return;

    places.forEach((place, index) => {
      if (!place?.geometry?.location) {
        console.warn(`⚠️ Place ${index} missing geometry:`, place);
        return;
      }

      try {
        const marker = new window.google.maps.Marker({
          position: place.geometry.location,
          map,
          title: place.name || 'Unknown Place',
          icon: {
            url: place.icon || "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new window.google.maps.Size(32, 32)
          },
          animation: place === selectedPlace ? window.google.maps.Animation.BOUNCE : null
        });

        // Enhanced click handler
        marker.addListener("click", () => {
          console.log('📍 Marker clicked:', place.name);
          
          // Open Google Maps directly
          if (place.geometry?.location) {
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name || '')}&query_place_id=${place.place_id || ''}`;
            window.open(googleMapsUrl, '_blank');
          }
          
          // Also select place in app
          if (onPlaceSelect) onPlaceSelect(place);
        });

        markersRef.current.push(marker);
      } catch (err) {
        console.error(`❌ Error creating marker for place ${index}:`, err);
      }
    });

    console.log(`✅ Added ${markersRef.current.length} markers`);
  }, [places, selectedPlace, onPlaceSelect]);

  // Load Google Maps script - only once
  useEffect(() => {
    if (window.google?.maps || mapScriptRef.current) {
      return;
    }

    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Google Maps API key not found, using demo map');
      initializeDemoMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('✅ Google Maps script loaded successfully');
    };

    script.onerror = () => {
      console.error('❌ Failed to load Google Maps script - using demo map');
      setError('Google Maps API key has restrictions. Using demo map.');
      initializeDemoMap();
    };

    // Set up global callback
    window.initGoogleMaps = () => {
      console.log('🎯 Google Maps initialized successfully');
      setMapLoaded(true);
      initializeMap();
    };

    mapScriptRef.current = script;
    document.head.appendChild(script);

    return () => {
      if (mapScriptRef.current && mapScriptRef.current.parentNode) {
        mapScriptRef.current.parentNode.removeChild(mapScriptRef.current);
      }
    };
  }, [initializeMap, initializeDemoMap]);

  // Initialize map when script loads
  useEffect(() => {
    if (window.google?.maps && mapRef.current && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [mapLoaded, initializeMap]);

  // Update markers only when places change - optimized
  useEffect(() => {
    if (mapInstanceRef.current && places) {
      updateMarkers(mapInstanceRef.current);
    }
  }, [places, updateMarkers]);

  // Center map on selected place
  useEffect(() => {
    if (selectedPlace?.geometry?.location && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(selectedPlace.geometry.location);
      mapInstanceRef.current.setZoom(16);
    }
  }, [selectedPlace]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clickListenerRef.current && mapRef.current) {
        mapRef.current.removeEventListener('click', clickListenerRef.current);
      }
      markersRef.current.forEach(marker => marker.setMap(null));
    };
  }, []);

  return (
    <div className="map-component">
      {error && (
        <div style={{
          background: '#ff6b6b',
          color: 'white',
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '10px',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}
      
      <div 
        ref={mapRef} 
        style={{
          width: '100%',
          height: '400px',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#f0f0f0'
        }}
      />
      
      {clickedLocation && (
        <div style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--border-color)',
          borderRadius: '8px',
          padding: '10px',
          marginTop: '10px',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          📍 Last clicked: {clickedLocation.lat.toFixed(6)}, {clickedLocation.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default MapComponent;