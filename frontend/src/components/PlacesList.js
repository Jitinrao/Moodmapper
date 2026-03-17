import React, { useState, useEffect } from 'react';
import { calculateDrivingDistance } from '../services/distanceMatrixService';

const PlacesList = ({ places, selectedPlace, onPlaceSelect, userLocation }) => {
  const [distances, setDistances] = useState({});
  const [loadingDistances, setLoadingDistances] = useState({});

  // Calculate distances for all places
  useEffect(() => {
    if (!userLocation || !places || places.length === 0) return;

    const calculateDistances = async () => {
      setLoadingDistances(true);
      const newDistances = {};
      
      for (const place of places) {
        if (place.geometry?.location) {
          try {
            const distanceInfo = await calculateDrivingDistance(userLocation, place.geometry.location);
            newDistances[place.place_id] = {
              distance: distanceInfo.distance / 1000, // Convert meters to km
              duration: distanceInfo.duration,
              distanceText: distanceInfo.distanceText,
              durationText: distanceInfo.durationText,
              status: distanceInfo.status
            };
          } catch (error) {
            console.error(`Error calculating distance for ${place.name}:`, error);
            newDistances[place.place_id] = {
              distance: 0,
              duration: 0,
              distanceText: 'Distance unavailable',
              durationText: 'Duration unavailable',
              status: 'ERROR'
            };
          }
        }
      }
      
      setDistances(newDistances);
      setLoadingDistances(false);
    };

    calculateDistances();
  }, [userLocation, places]);

  const renderRatingStars = (rating) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    
    if (hasHalfStar) {
      stars.push('✨');
    }
    
    return stars.join('');
  };

  const formatPriceLevel = (priceLevel) => {
    if (!priceLevel) return '';
    return '₹'.repeat(priceLevel);
  };

  const getOpenStatusText = (isOpen) => {
    if (isOpen === undefined || isOpen === null) {
      return { text: 'Hours unknown', className: 'place-hours' };
    }
    return isOpen 
      ? { text: '🟢 Open now', className: 'place-hours open' }
      : { text: '🔴 Closed', className: 'place-hours closed' };
  };

  if (places.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        No places found. Try selecting a different mood or expanding your search area.
      </div>
    );
  }

  return (
    <div>
      {places.map((place) => {
        const openStatus = getOpenStatusText(place.isOpen);
        const isSelected = selectedPlace?.place_id === place.place_id;
        
        return (
          <div
            key={place.place_id}
            className={`place-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onPlaceSelect(place)}
          >
            <div className="place-name">
              {place.name}
              <span style={{ marginLeft: '8px', fontSize: '0.9em', color: '#666' }}>
                {formatPriceLevel(place.price_level)}
              </span>
            </div>
            
            <div className="place-info">
              {place.rating && (
                <div className="place-rating">
                  <span className="rating-stars">
                    {renderRatingStars(place.rating)}
                  </span>
                  <span>{place.rating}/5</span>
                  {place.user_ratings_total && (
                    <span style={{ color: '#999', fontSize: '0.8em' }}>
                      ({place.user_ratings_total})
                    </span>
                  )}
                </div>
              )}
              
              {place.vicinity && (
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  📍 {place.vicinity}
                </div>
              )}
              
              {distances[place.place_id] ? (
                <div className="place-distance">
                  🚶 {distances[place.place_id].distance.toFixed(1)} km away
                  {distances[place.place_id].durationText && (
                    <span className="place-duration">
                      🕐 {distances[place.place_id].durationText}
                    </span>
                  )}
                  {loadingDistances[place.place_id] && (
                    <span className="distance-loading">⏳</span>
                  )}
                </div>
              ) : (
                <div className="place-distance">
                  <span className="distance-unavailable">Distance unavailable</span>
                </div>
              )}
              
              <div className={openStatus.className}>
                {openStatus.text}
              </div>
              
              {place.types && place.types.length > 0 && (
                <div style={{ fontSize: '0.8em', color: '#999', marginTop: '0.5rem' }}>
                  {place.types.slice(0, 3).map(type => 
                    type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                  ).join(' • ')}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlacesList;
