import React from 'react';

const HeroSection = ({ onExploreClick }) => {
  return (
    <div className="hero-section">
      <div className="hero-background">
        <div className="hero-overlay"></div>
        <div className="hero-gradient"></div>
      </div>
      <div className="hero-content">
        <div className="hero-glassmorphism">
          <div className="hero-text">
            <h1 className="hero-title">
              Find the Perfect Place For Your Mood
            </h1>
            <p className="hero-subtitle">
              Smart location-based recommendations powered by Google Maps
            </p>
            <button 
              className="hero-cta-button"
              onClick={onExploreClick}
            >
              <span className="button-glow">Explore Nearby</span>
              <span className="button-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
