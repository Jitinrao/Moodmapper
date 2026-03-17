import React, { useState, useEffect } from 'react';

const CurrentLocationButton = ({ onLocationFound, onError }) => {
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationStatus('error');
      onError('Geolocation is not supported by your browser');
    }
  }, [onError]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      onError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setLocationStatus('loading');

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        setLoading(false);
        setLocationStatus('success');
        onLocationFound(location);
        
        // Reset status after 3 seconds
        setTimeout(() => setLocationStatus('idle'), 3000);
      },
      // Error callback
      (error) => {
        setLoading(false);
        setLocationStatus('error');
        
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          case error.UNKNOWN_ERROR:
            errorMessage = 'An unknown error occurred.';
            break;
        }
        
        onError(errorMessage);
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const getButtonIcon = () => {
    if (loading) {
      return '🔄';
    }
    
    switch (locationStatus) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📍';
    }
  };

  const getButtonText = () => {
    if (loading) {
      return 'Getting Location...';
    }
    
    switch (locationStatus) {
      case 'success':
        return 'Location Found!';
      case 'error':
        return 'Location Error';
      default:
        return 'Use My Location';
    }
  };

  const getButtonStyle = () => {
    const baseStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      border: '2px solid',
      borderRadius: '50px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      background: 'transparent',
      minWidth: '200px',
      justifyContent: 'center'
    };

    switch (locationStatus) {
      case 'success':
        return {
          ...baseStyle,
          borderColor: '#10b981',
          color: '#10b981',
          background: 'rgba(16, 185, 129, 0.1)'
        };
      case 'error':
        return {
          ...baseStyle,
          borderColor: '#ef4444',
          color: '#ef4444',
          background: 'rgba(239, 68, 68, 0.1)'
        };
      default:
        return {
          ...baseStyle,
          borderColor: '#667eea',
          color: '#667eea',
          background: 'transparent'
        };
    }
  };

  return (
    <button
      style={getButtonStyle()}
      onClick={handleGetCurrentLocation}
      disabled={loading}
      className="current-location-btn"
      title="Get your current location"
    >
      <span className="location-icon">{getButtonIcon()}</span>
      <span className="location-text">{getButtonText()}</span>
    </button>
  );
};

export default CurrentLocationButton;
