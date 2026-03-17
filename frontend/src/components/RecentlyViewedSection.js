import React, { useState, useEffect } from 'react';

const RecentlyViewedSection = ({ onViewPlace }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  const loadRecentlyViewed = () => {
    try {
      const stored = localStorage.getItem('recentlyViewedPlaces');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentlyViewed(parsed.slice(0, 6)); // Show max 6 items
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  };

  const saveToRecentlyViewed = (place) => {
    try {
      const current = [...recentlyViewed];
      // Remove if already exists
      const filtered = current.filter(p => p.place_id !== place.place_id);
      // Add to beginning
      const updated = [place, ...filtered].slice(0, 12); // Keep max 12
      setRecentlyViewed(updated);
      localStorage.setItem('recentlyViewedPlaces', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving to recently viewed:', error);
    }
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem('recentlyViewedPlaces');
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getPlaceIcon = (types) => {
    if (!types || types.length === 0) return '📍';
    
    const type = types[0].toLowerCase();
    if (type.includes('cafe')) return '☕';
    if (type.includes('restaurant')) return '🍽️';
    if (type.includes('park')) return '🌳';
    if (type.includes('store') || type.includes('shopping')) return '🏪';
    if (type.includes('gym')) return '🏋️';
    if (type.includes('hospital')) return '🏥';
    if (type.includes('school')) return '🏫';
    
    return '📍';
  };

  if (recentlyViewed.length === 0) {
    return (
      <div className="recently-viewed-section">
        <h3 className="section-title">
          🕐 Recently Viewed Places
        </h3>
        <div className="empty-recent-state">
          <div className="empty-icon">👁️</div>
          <p>Your recently viewed places will appear here</p>
          <p className="empty-subtitle">
            Start exploring places to build your history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="recently-viewed-section">
      <div className="section-header">
        <h3 className="section-title">
          🕐 Recently Viewed Places
        </h3>
        <button 
          onClick={clearRecentlyViewed}
          className="clear-history-btn"
          title="Clear recently viewed history"
        >
          🗑️ Clear
        </button>
      </div>
      
      <div className="recently-viewed-grid">
        {recentlyViewed.map((place, index) => (
          <div 
            key={place.place_id || index}
            className="recently-viewed-item"
            onClick={() => onViewPlace(place)}
          >
            <div className="recent-place-icon">
              {getPlaceIcon(place.types)}
            </div>
            
            <div className="recent-place-info">
              <h4 className="recent-place-name">
                {place.name}
              </h4>
              <p className="recent-place-address">
                📍 {place.vicinity || place.formatted_address || 'Address unknown'}
              </p>
              <div className="recent-place-meta">
                <span className="recent-rating">
                  ⭐ {place.rating || 'N/A'}
                </span>
                {place.distance && (
                  <span className="recent-distance">
                    🚶 {place.distance.toFixed(1)} km
                  </span>
                )}
                <span className="recent-time">
                  🕐 {formatTimeAgo(place.viewedAt)}
                </span>
              </div>
            </div>
            
            <div className="recent-place-actions">
              <button 
                className="view-place-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewPlace(place);
                }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {recentlyViewed.length > 0 && (
        <div className="recently-viewed-footer">
          <p className="privacy-note">
            🔒 Your viewing history is stored locally and never shared
          </p>
        </div>
      )}
    </div>
  );
};

// Export a function to add places to recently viewed
export const addToRecentlyViewed = (place) => {
  try {
    const current = JSON.parse(localStorage.getItem('recentlyViewedPlaces') || '[]');
    // Remove if already exists
    const filtered = current.filter(p => p.place_id !== place.place_id);
    // Add to beginning with timestamp
    const updated = [{ ...place, viewedAt: Date.now() }, ...filtered].slice(0, 12);
    localStorage.setItem('recentlyViewedPlaces', JSON.stringify(updated));
  } catch (error) {
    console.error('Error adding to recently viewed:', error);
  }
};

export default RecentlyViewedSection;
