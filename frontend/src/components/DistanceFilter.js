import React from 'react';

const DistanceFilter = ({ radius, onRadiusChange, disabled = false }) => {
  const handleChange = (e) => {
    const newRadius = parseInt(e.target.value);
    onRadiusChange(newRadius);
  };

  return (
    <div className="distance-filter">
      <label htmlFor="distance-range" className="filter-label">
        Distance: {radius} km
      </label>
      <input
        id="distance-range"
        type="range"
        min="1"
        max="20"
        value={radius}
        onChange={handleChange}
        disabled={disabled}
        className="distance-slider"
      />
      <div className="distance-marks">
        <span>1km</span>
        <span>10km</span>
        <span>20km</span>
      </div>
    </div>
  );
};

export default DistanceFilter;
