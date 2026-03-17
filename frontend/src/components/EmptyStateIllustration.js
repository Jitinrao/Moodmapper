import React from 'react';

const EmptyStateIllustration = ({ 
  type = 'no-places', 
  onFilterChange,
  currentFilter 
}) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'no-places':
        return {
          illustration: '🗺️',
          title: 'No Places Found',
          message: 'We couldn\'t find any places matching your criteria.',
          suggestions: [
            'Try adjusting your search filters',
            'Expand your search radius',
            'Try different keywords or moods',
            'Check your location settings'
          ]
        };
      case 'no-search-results':
        return {
          illustration: '🔍',
          title: 'No Search Results',
          message: 'No places found for your search query.',
          suggestions: [
            'Check your spelling',
            'Try more general terms',
            'Use different keywords',
            'Browse by mood instead'
          ]
        };
      case 'location-error':
        return {
          illustration: '📍',
          title: 'Location Access Needed',
          message: 'We need your location to find nearby places.',
          suggestions: [
            'Enable location permissions',
            'Try searching manually',
            'Use the location button above',
            'Check browser settings'
          ]
        };
      case 'network-error':
        return {
          illustration: '🌐',
          title: 'Connection Error',
          message: 'Unable to connect to our servers.',
          suggestions: [
            'Check your internet connection',
            'Try refreshing the page',
            'Wait a moment and try again',
            'Contact support if the issue persists'
          ]
        };
      default:
        return {
          illustration: '🤔',
          title: 'Something\'s Missing',
          message: 'We\'re not sure what happened here.',
          suggestions: [
            'Try refreshing the page',
            'Check your internet connection',
            'Clear your browser cache',
            'Contact support if needed'
          ]
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="empty-state">
      <div className="empty-state-illustration">
        <div className="illustration-icon">
          {content.illustration}
        </div>
        <div className="illustration-decoration">
          <div className="decoration-circle decoration-1"></div>
          <div className="decoration-circle decoration-2"></div>
          <div className="decoration-circle decoration-3"></div>
        </div>
      </div>
      
      <div className="empty-state-content">
        <h2 className="empty-state-title">
          {content.title}
        </h2>
        
        <p className="empty-state-message">
          {content.message}
        </p>
        
        <div className="empty-state-suggestions">
          <h3>Here are some things you can try:</h3>
          <ul className="suggestions-list">
            {content.suggestions.map((suggestion, index) => (
              <li key={index} className="suggestion-item">
                <span className="suggestion-bullet">💡</span>
                <span className="suggestion-text">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {onFilterChange && (
          <div className="empty-state-actions">
            <button 
              onClick={() => onFilterChange('all')}
              className="action-button primary"
            >
              🔄 Reset Filters
            </button>
            
            {currentFilter !== 'all' && (
              <button 
                onClick={() => onFilterChange('all')}
                className="action-button secondary"
              >
                ✨ Browse All Places
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyStateIllustration;
