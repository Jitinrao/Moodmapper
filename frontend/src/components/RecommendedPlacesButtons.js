import React, { useState } from 'react';

const RecommendedPlacesButtons = ({ places, selectedPlace, onPlaceSelect }) => {
  const [imageErrors, setImageErrors] = useState({});

  const getPlaceIcon = (place) => {
    if (place.types.includes('cafe')) return '☕';
    if (place.types.includes('restaurant')) return '🍽️';
    if (place.types.includes('store')) return '🏪';
    if (place.types.includes('park')) return '🌳';
    if (place.types.includes('gym')) return '🏋️';
    if (place.types.includes('hospital')) return '🏥';
    if (place.types.includes('school')) return '🏫';
    return '📍';
  };

  const getPriceIcon = (priceLevel) => {
    if (!priceLevel) return '';
    return '$'.repeat(priceLevel);
  };

  const getPlacePhoto = (place) => {
    // Try to get photo from place details first
    if (place.details && place.details.photos && place.details.photos.length > 0) {
      const photo = place.details.photos[0];
      const photoReference = photo.photo_reference || photo.photo_reference;
      if (photoReference) {
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
      }
    }
    
    // Try to get photo from place.photos array
    if (place.photos && place.photos.length > 0) {
      const photo = place.photos[0];
      const photoReference = photo.photo_reference || photo.photo_reference;
      if (photoReference) {
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
      }
    }
    
    // Try to get photo from place.icon
    if (place.icon) {
      return place.icon;
    }
    
    // Fallback to icon-based background
    return null;
  };

  const getFallbackImageUrl = (place) => {
    // Use Unsplash images based on place type as fallback
    const type = place.types?.[0] || 'place';
    const seed = `${place.name}-${place.place_id}`;
    return `https://source.unsplash.com/400x300/?${type},${seed}&sig=${seed}`;
  };

  const handleImageError = (placeId) => {
    setImageErrors(prev => ({ ...prev, [placeId]: true }));
  };

  const handlePlaceClick = (place) => {
    // Add to recently viewed
    try {
      const current = JSON.parse(localStorage.getItem('recentlyViewedPlaces') || '[]');
      const filtered = current.filter(p => p.place_id !== place.place_id);
      const updated = [{ ...place, viewedAt: Date.now() }, ...filtered].slice(0, 12);
      localStorage.setItem('recentlyViewedPlaces', JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
    
    // Call the parent handler
    if (onPlaceSelect) {
      onPlaceSelect(place);
    }
  };

  const getDirections = (place) => {
    if (place.geometry && place.geometry.location) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat},${place.geometry.location.lng}`;
      window.open(url, '_blank');
    }
  };

  const callPlace = (place) => {
    if (place.details && place.details.formatted_phone_number) {
      window.open(`tel:${place.details.formatted_phone_number}`);
    }
  };

  const visitWebsite = (place) => {
    if (place.details && place.details.website) {
      window.open(place.details.website, '_blank');
    }
  };

  const savePlace = (place) => {
    try {
      const saved = JSON.parse(localStorage.getItem('savedPlaces') || '[]');
      if (!saved.find(p => p.place_id === place.place_id)) {
        saved.push({ ...place, savedAt: Date.now() });
        localStorage.setItem('savedPlaces', JSON.stringify(saved));
        alert('Place saved successfully!');
      } else {
        alert('Place already saved!');
      }
    } catch (error) {
      console.error('Error saving place:', error);
    }
  };

  if (!places || places.length === 0) {
    return (
      <div className="recommended-places-buttons">
        <h3>Recommended Places (0)</h3>
        <div className="no-places-message">
          <div className="no-places-icon">🔍</div>
          <p>No places found. Try selecting a mood or searching for locations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommended-places-buttons">
      <h3>Recommended Places ({places.length})</h3>
      <div className="places-grid">
        {places.map((place) => {
          const photoUrl = getPlacePhoto(place);
          const hasImageError = imageErrors[place.place_id];
          
          return (
            <div
              key={place.place_id}
              className={`place-card ${selectedPlace?.place_id === place.place_id ? 'active' : ''}`}
              onClick={() => handlePlaceClick(place)}
            >
              {/* Place Image/Icon */}
              <div className="place-image-container">
                {photoUrl && !hasImageError ? (
                  <img
                    src={photoUrl}
                    alt={place.name}
                    className="place-image"
                    onError={() => handleImageError(place.place_id)}
                  />
                ) : hasImageError ? (
                  <img
                    src={getFallbackImageUrl(place)}
                    alt={place.name}
                    className="place-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="place-icon-bg">
                    <div className="place-icon">{getPlaceIcon(place)}</div>
                  </div>
                )}
                
                {/* Quick actions overlay */}
                <div className="place-quick-actions">
                  <button 
                    className="quick-action-btn save-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      savePlace(place);
                    }}
                    title="Save Place"
                  >
                    ❤️
                  </button>
                </div>
              </div>
              
              {/* Place Information */}
              <div className="place-content">
                <div className="place-header">
                  <h4 className="place-name">{place.name}</h4>
                  <div className="place-rating-badge">
                    ⭐ {place.rating || 'N/A'}
                  </div>
                </div>
                
                <div className="place-details">
                  <div className="place-address">
                    📍 {place.vicinity || place.formatted_address || 'Address not available'}
                  </div>
                  
                  <div className="place-meta">
                    <div className="place-price">
                      {getPriceIcon(place.price_level) || '💰 Price not available'}
                    </div>
                    <div className="place-distance">
                      � {place.distance ? place.distance.toFixed(1) + ' km' : 'Nearby'}
                    </div>
                  </div>
                  
                  <div className={`place-status ${place.opening_hours?.open_now ? 'open' : 'closed'}`}>
                    {place.opening_hours?.open_now ? '🟢 Open Now' : '🔴 Closed'}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="place-actions">
                  <button 
                    className="action-btn primary-btn directions-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      getDirections(place);
                    }}
                    title="Get Directions"
                  >
                    🧭 Directions
                  </button>
                  
                  {place.details && place.details.formatted_phone_number && (
                    <button 
                      className="action-btn secondary-btn call-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        callPlace(place);
                      }}
                      title="Call Place"
                    >
                      📞 Call
                    </button>
                  )}
                  
                  {place.details && place.details.website && (
                    <button 
                      className="action-btn secondary-btn website-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        visitWebsite(place);
                      }}
                      title="Visit Website"
                    >
                      🌐 Website
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedPlacesButtons;
