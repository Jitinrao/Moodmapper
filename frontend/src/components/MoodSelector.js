import React, { useState } from 'react';

const MoodSelector = ({ moods, selectedMood, onMoodSelect, onFindPlaces, loading, places }) => {
  const [hoveredMood, setHoveredMood] = useState(null);

  // Enhanced mood descriptions with today's theme and photos
  const getMoodDescription = (moodId) => {
    const descriptions = {
      work: '☕ Perfect for productive work sessions with WiFi and quiet environments',
      relax: '🌅 Peaceful spots to unwind and recharge your energy today',
      food: '🍽️ Delicious dining experiences for your culinary adventures today',
      social: '🎉 Vibrant places to connect with friends and meet new people',
      nature: '🌳 Beautiful outdoor spaces to enjoy fresh air and scenery',
      shopping: '🛍️ Great shopping destinations for today\'s retail therapy',
      fitness: '🏋️ Active places to stay healthy and energized today',
      culture: '🎨 Enriching cultural experiences and artistic venues',
      entertainment: '🎭 Fun entertainment options for today\'s enjoyment',
      learning: '📚 Educational spaces to expand your knowledge today'
    };
    return descriptions[moodId] || '';
  };

  const getMoodPhoto = (moodId) => {
    const photos = {
      work: 'https://images.unsplash.com/photo-1497366214047-51237e3b8906?w=400&h=300&fit=crop',
      relax: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=300&fit=crop',
      food: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
      social: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop',
      nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      shopping: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      fitness: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      culture: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
      entertainment: 'https://images.unsplash.com/photo-1533138604225-3d9a8004fac3?w=400&h=300&fit=crop',
      learning: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
    };
    return photos[moodId] || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop';
  };

  const getMoodSuggestions = (moodId) => {
    if (!places || places.length === 0) return [];
    
    const suggestions = places.filter(place => {
      switch (moodId) {
        case 'work':
          return place.types.includes('cafe') && place.rating >= 4.0;
        case 'date':
          return (place.types.includes('restaurant') || place.types.includes('cafe')) && 
                 place.rating >= 4.2 && place.price_level >= 2;
        case 'quick-bite':
          return place.types.includes('restaurant') || place.types.includes('cafe');
        case 'budget':
          return !place.price_level || place.price_level <= 2;
        default:
          return true;
      }
    }).slice(0, 3);

    return suggestions.map(place => ({
      ...place,
      suggestionReason: getSuggestionReason(place, moodId),
      photo: getPlacePhoto(place, moodId)
    }));
  };

  const getSuggestionReason = (place, moodId) => {
    const reasons = {
      work: place.rating >= 4.5 ? '⭐ Excellent for focused work today' : '👍 Good for work sessions',
      date: place.rating >= 4.5 ? '💕 Perfect for romantic dates today' : '😊 Great for casual dates',
      'quick-bite': place.rating >= 4.0 ? '⚡ Quick and highly rated' : '🏃 Fast and convenient',
      budget: place.price_level === 1 ? '💎 Very budget-friendly today' : '💵 Great value for money'
    };
    return reasons[moodId] || '🌟 Recommended for you today';
  };

  const getPlacePhoto = (place, moodId) => {
    // Generate photo URLs based on place type and mood
    const photoMap = {
      restaurant: 'https://images.unsplash.com/photo-1517248138861-0d4cf9e65b0?w=400&h=300&fit=crop',
      cafe: 'https://images.unsplash.com/photo-1521016925-4c5d4f1a5a3?w=400&h=300&fit=crop',
      park: 'https://images.unsplash.com/photo-1506905925346-7b426625ec7d?w=400&h=300&fit=crop',
      store: 'https://images.unsplash.com/photo-1556742049-0dced4a33f4d?w=400&h=300&fit=crop',
      gym: 'https://images.unsplash.com/photo-1571019613452-1ab2ae656d5d?w=400&h=300&fit=crop',
      default: 'https://images.unsplash.com/photo-1566073791259-9a8aa806bfae?w=400&h=300&fit=crop'
    };

    // Get photo based on primary place type
    const primaryType = place.types?.[0] || 'default';
    return photoMap[primaryType] || photoMap.default;
  };

  const getMoodIcon = (moodId) => {
    const icons = {
      work: '💼',
      date: '💕',
      'quick-bite': '🍔',
      budget: '💰'
    };
    return icons[moodId] || '😊';
  };

  const currentSuggestions = selectedMood ? getMoodSuggestions(selectedMood) : [];

  return (
    <div className="mood-selector">
      <div className="mood-header">
        <h2>🌅 How are you feeling today?</h2>
        <p className="mood-subtitle">Choose your mood to get personalized recommendations</p>
      </div>
      
      <div className="mood-options">
        {moods.map((mood) => (
          <div key={mood.id} className="mood-option-wrapper">
            <button
              className={`mood-btn ${selectedMood === mood.id ? 'active' : ''} ${loading ? 'disabled' : ''}`}
              onClick={() => !loading && onMoodSelect(mood.id)}
              onMouseEnter={() => setHoveredMood(mood.id)}
              onMouseLeave={() => setHoveredMood(null)}
              disabled={loading}
              style={{
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              <span className="mood-icon">{getMoodIcon(mood.id)}</span>
              <span className="mood-name">{mood.name}</span>
              {selectedMood === mood.id && (
                <span className="selected-indicator">✓</span>
              )}
            </button>
            
            {hoveredMood === mood.id && (
              <div className="mood-tooltip">
                <div className="tooltip-content">
                  <strong>{mood.name}</strong>
                  <p>{getMoodDescription(mood.id)}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="action-section">
        <button
          className={`find-places-btn ${selectedMood && !loading ? 'ready' : ''}`}
          onClick={onFindPlaces}
          disabled={!selectedMood || loading}
        >
          {loading ? (
            <>
              <div className="loading-spinner"></div>
              Finding Amazing Places...
            </>
          ) : (
            <>
              <span className="btn-icon">🔍</span>
              <span className="btn-text">Find Nearby Places</span>
              <span className="btn-arrow">→</span>
            </>
          )}
        </button>
        
        {selectedMood && (
          <div className="selected-mood-info">
            <div className="selected-mood-header">
              <span className="selected-mood-icon">{getMoodIcon(selectedMood)}</span>
              <span className="selected-mood-name">{moods.find(m => m.id === selectedMood)?.name}</span>
            </div>
            <p className="selected-mood-description">{getMoodDescription(selectedMood)}</p>
          </div>
        )}
      </div>

      {currentSuggestions.length > 0 && !loading && (
        <div className="mood-suggestions">
          <div className="suggestions-header">
            <h4>🎯 Perfect for your mood today:</h4>
            <p>Top recommendations based on your current feeling</p>
          </div>
          <div className="suggestion-list">
            {currentSuggestions.map((place, index) => (
              <div key={place.place_id} className="suggestion-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="suggestion-photo">
                  <img 
                    src={place.photo} 
                    alt={place.name}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1566073791259-9a8aa806bfae?w=400&h=300&fit=crop';
                    }}
                  />
                  <div className="suggestion-rating">
                    ⭐ {place.rating || 'N/A'}
                  </div>
                </div>
                <div className="suggestion-content">
                  <div className="suggestion-name">{place.name}</div>
                  <div className="suggestion-reason">{place.suggestionReason}</div>
                  <div className="suggestion-details">
                    <span className="detail-item">
                      <span className="detail-icon">📍</span>
                      {place.distance ? place.distance.toFixed(1) + ' km away' : 'Very nearby'}
                    </span>
                    {place.price_level && (
                      <span className="detail-item">
                        <span className="detail-icon">💵</span>
                        {'$'.repeat(place.price_level)} Budget-friendly
                      </span>
                    )}
                    {place.types && (
                      <span className="detail-item">
                        <span className="detail-icon">🏷️</span>
                        {place.types[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodSelector;
