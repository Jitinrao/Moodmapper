import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGoogleMaps } from './GoogleMapsLoader';

const LocationAutocomplete = ({ 
  onPlaceSelect,
  placeholder = 'Search location...',
  className = '',
  disabled = false,
  defaultValue = '',
  countryRestriction = null
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const autocompleteServiceRef = useRef(null);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  const { isLoaded } = useGoogleMaps();

  // Initialize autocomplete service
  useEffect(() => {
    if (isLoaded && window.google && window.google.maps && window.google.maps.places) {
      console.log('🔍 Initializing autocomplete service...');
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (input) => {
    if (!input || input.length < 2 || !autocompleteServiceRef.current || disabled) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    console.log('🔍 Fetching suggestions for:', input);
    
    try {
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input,
          types: ['(cities)', 'establishment', 'geocode'],
          componentRestrictions: countryRestriction ? { country: countryRestriction } : undefined
        },
        (predictions, status) => {
          setIsLoading(false);
          console.log('🔍 Autocomplete response:', { status, predictionsCount: predictions?.length || 0 });
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
            console.log('✅ Suggestions found:', predictions.length);
            console.log('📍 Suggestions:', predictions.map(p => p.description));
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            console.log('❌ No suggestions found, status:', status);
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } catch (error) {
      console.error('❌ Autocomplete error:', error);
      setIsLoading(false);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [disabled, countryRestriction]);

  // Debounced fetch
  const debouncedFetch = useCallback(
    (input) => {
      const timeoutId = setTimeout(() => {
        fetchSuggestions(input);
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    [fetchSuggestions]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);
    
    // Use debounced fetch
    debouncedFetch(value);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.description);
    setShowSuggestions(false);
    setActiveIndex(-1);
    
    if (onPlaceSelect) {
      onPlaceSelect(suggestion);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleSuggestionClick(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setActiveIndex(-1);
        break;
    }
  };

  return (
    <div className={`autocomplete-container ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="autocomplete-input"
        style={{
          width: '100%',
          padding: '1rem 1.5rem',
          fontSize: '1.1rem',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          outline: 'none',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.3s ease',
          boxSizing: 'border-box',
          minHeight: '48px',
          paddingRight: isLoading ? '3rem' : '1.5rem'
        }}
      />
      
      {isLoading && (
        <div 
          className="autocomplete-loading"
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '16px',
            color: 'var(--text-secondary)',
            pointerEvents: 'none'
          }}
        >
          🔍
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="autocomplete-suggestions"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            width: '100%',
            maxWidth: '500px',
            maxHeight: '220px',
            overflowY: 'auto',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            pointerEvents: 'auto'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              className={`autocomplete-suggestion ${index === activeIndex ? 'active' : ''}`}
              onMouseDown={() => handleSuggestionClick(suggestion)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-color)',
                transition: 'background-color 0.2s ease',
                fontSize: '14px',
                backgroundColor: index === activeIndex ? 'var(--bg-secondary)' : 'transparent'
              }}
            >
              <div style={{ marginRight: '12px', fontSize: '14px', flexShrink: 0 }}>
                {suggestion.types.includes('geocode') ? '📍' : '🏢'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontWeight: 500, 
                  color: 'var(--text-primary)', 
                  whiteSpace: 'nowrap' 
                }}>
                  {suggestion.structured_formatting.main_text}
                </div>
                <div style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '12px', 
                  whiteSpace: 'nowrap' 
                }}>
                  {suggestion.structured_formatting.secondary_text}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
