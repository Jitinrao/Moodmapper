import React, { useState, useEffect } from 'react';
import './RecentlyViewed.css';

const RecentlyViewed = ({ places = [], onPlaceSelect }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    // Load recently viewed from localStorage
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) {
      setRecentlyViewed(JSON.parse(saved));
    }
  }, []);

  const addToRecentlyViewed = (place) => {
    const newRecentlyViewed = [place, ...recentlyViewed.filter(p => p.place_id !== place.place_id)].slice(0, 10);
    setRecentlyViewed(newRecentlyViewed);
    localStorage.setItem('recentlyViewed', JSON.stringify(newRecentlyViewed));
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem('recentlyViewed');
  };

  return (
    <div className="recently-viewed-container">
      <div className="recently-viewed-header">
        <h3 className="recently-viewed-title">
          <span>🕐</span> Recently Viewed
        </h3>
        <button 
          className="clear-btn"
          onClick={clearRecentlyViewed}
        >
          Clear All
        </button>
      </div>
      
      {recentlyViewed.length === 0 ? (
        <div className="no-recent">
          <p>No recently viewed places yet.</p>
        </div>
      ) : (
        <div className="recently-viewed-list">
          {recentlyViewed.map((place, index) => (
            <div key={place.place_id} className="recent-item">
              <div className="recent-info">
                <h4>{place.name}</h4>
                <p>{place.vicinity}</p>
                {place.rating && (
                  <span className="rating">⭐ {place.rating}</span>
                )}
                <span className="viewed-time">
                  Viewed {index === 0 ? 'just now' : `${index + 1} hours ago`}
                </span>
              </div>
              <div className="recent-actions">
                <button 
                  className="recent-btn view-btn"
                  onClick={() => onPlaceSelect && onPlaceSelect(place)}
                >
                  View on Map
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentlyViewed;
