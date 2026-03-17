import React, { useState, useEffect } from 'react';
import './Favorites.css';

const Favorites = ({ places = [], onFavoriteSelect }) => {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const addToFavorites = (place) => {
    const newFavorites = [...favorites, place];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const removeFromFavorites = (placeId) => {
    const newFavorites = favorites.filter(fav => fav.place_id !== placeId);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (placeId) => {
    return favorites.some(fav => fav.place_id === placeId);
  };

  const getPlaceIcon = (place) => {
    if (place.types && place.types.includes('restaurant')) {
      return '🍽️';
    }
    if (place.types && place.types.includes('cafe')) {
      return '☕';
    }
    if (place.types && place.types.includes('park')) {
      return '🌳';
    }
    if (place.types && place.types.includes('gym')) {
      return '💪';
    }
    if (place.types && place.types.includes('shopping')) {
      return '🛍️';
    }
    return '📍';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="favorites-container">
      <h3 className="favorites-title">
        <span>❤️</span> Favorites
      </h3>
      
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      {favorites.length === 0 ? (
        <div className="no-favorites">
          <div className="empty-icon">⭐</div>
          <p>No favorites yet. Start adding places you love!</p>
        </div>
      ) : (
        <div className="favorites-list">
          {favorites.map((favorite) => (
            <div key={favorite.place_id} className="favorite-item">
              <div className="favorite-info">
                <h4>{favorite.name}</h4>
                <p>{favorite.vicinity}</p>
                {favorite.rating && (
                  <span className="rating">⭐ {favorite.rating}</span>
                )}
              </div>
              <div className="favorite-actions">
                <button 
                  className="favorite-btn remove-btn"
                  onClick={() => removeFromFavorites(favorite.place_id)}
                >
                  Remove
                </button>
                <button 
                  className="favorite-btn select-btn"
                  onClick={() => onFavoriteSelect && onFavoriteSelect(favorite)}
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

export default Favorites;
