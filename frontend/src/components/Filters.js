import React from 'react';

const Filters = ({ sortBy, filterOpen, onSortChange, onFilterChange, places, onResetFilters }) => {
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterOpen !== 'all') count++;
    if (sortBy !== 'distance') count++;
    return count;
  };

  const getPlacesCount = () => {
    return places?.length || 0;
  };

  const handleResetFilters = () => {
    if (onResetFilters && typeof onResetFilters === 'function') {
      onResetFilters();
    }
  };

  return (
    <div className="filters">
      <div className="filters-header">
        <h3>Filter & Sort Results</h3>
        <span className="results-count">{getPlacesCount()} places found</span>
      </div>
      
      <div className="filter-group">
        <div className="filter-section">
          <label className="filter-label">
            📊 Sort by:
            <select 
              className="filter-select" 
              value={sortBy} 
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="distance">📍 Distance</option>
              <option value="rating">⭐ Rating</option>
              <option value="name">🔤 Name</option>
              <option value="price">💰 Price</option>
            </select>
          </label>
        </div>
        
        <div className="filter-section">
          <label className="filter-label">
            🕐 Status:
            <select 
              className="filter-select" 
              value={filterOpen} 
              onChange={(e) => onFilterChange(e.target.value)}
            >
              <option value="all">🔄 All Places</option>
              <option value="open">🟢 Open Now</option>
              <option value="closed">🔴 Closed</option>
            </select>
          </label>
        </div>
      </div>

      {getActiveFiltersCount() > 0 && (
        <div className="active-filters">
          <span className="active-filters-text">
            {getActiveFiltersCount()} active filter{getActiveFiltersCount() > 1 ? 's' : ''}
          </span>
          <button 
            className="reset-filters-btn"
            onClick={handleResetFilters}
            title="Reset all filters"
          >
            🔄 Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Filters;
