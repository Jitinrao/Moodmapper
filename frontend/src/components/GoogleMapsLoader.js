import { useState, useEffect, useCallback } from 'react';

// Global state to track if Google Maps API is loaded
let isGoogleMapsLoaded = false;
let loadingPromise = null;

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const loadGoogleMaps = useCallback(() => {
    // Return existing promise if already loading
    if (loadingPromise) {
      return loadingPromise;
    }

    // Return resolved promise if already loaded
    if (isGoogleMapsLoaded) {
      setIsLoaded(true);
      return Promise.resolve(window.google);
    }

    // Create new loading promise
    loadingPromise = new Promise((resolve, reject) => {
      console.log(' Loading Google Maps script...');
      
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      // Global callback function
      window.initGoogleMaps = () => {
        console.log('✅ Google Maps API loaded successfully');
        isGoogleMapsLoaded = true;
        setIsLoaded(true);
        setError(null);
        loadingPromise = null;
        resolve(window.google);
      };

      script.onerror = () => {
        console.error('❌ Failed to load Google Maps API');
        const errorMsg = 'Failed to load Google Maps API. Please check your internet connection and API key.';
        setError(errorMsg);
        loadingPromise = null;
        reject(new Error(errorMsg));
      };

      // Set timeout for loading
      const timeout = setTimeout(() => {
        console.error('❌ Google Maps API loading timeout');
        const errorMsg = 'Google Maps API loading timeout. Please check your API key configuration.';
        setError(errorMsg);
        loadingPromise = null;
        reject(new Error(errorMsg));
      }, 10000); // 10 second timeout

      document.head.appendChild(script);
    });

    return loadingPromise;
  }, []);

  useEffect(() => {
    // Force load on component mount
    if (!isGoogleMapsLoaded && !loadingPromise) {
      loadGoogleMaps();
    }
  }, [loadGoogleMaps]);

  return { isLoaded, error, loadGoogleMaps };
};
