import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { 
    theme, 
    isDarkTheme, 
    isLightTheme, 
    isSystemTheme, 
    toggleTheme, 
    resetToSystemTheme 
  } = useTheme();

  const handleToggle = () => {
    toggleTheme();
  };

  const handleResetToSystem = () => {
    resetToSystemTheme();
  };

  return (
    <div className="theme-toggle">
      <div className="theme-toggle-container">
        <button
          className={`theme-toggle-btn ${theme}`}
          onClick={handleToggle}
          aria-label={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
          title={`Current theme: ${theme}${isSystemTheme ? ' (system)' : ''} - Click to toggle`}
        >
          <span className="theme-icon">
            {isDarkTheme ? (
              // Sun icon for light mode
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <path d="M12 1v6m0 6v6m-6-6h6m-6 0h6"/>
              </svg>
            ) : (
              // Moon icon for dark mode
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 0 9.79 9 9 0 0 0 0 21 12.79z"/>
              </svg>
            )}
          </span>
          <span className="theme-label">
            {isDarkTheme ? 'Light' : 'Dark'}
          </span>
        </button>
        
        {isSystemTheme && (
          <button
            className="system-theme-indicator"
            onClick={handleResetToSystem}
            aria-label="Reset to system theme"
            title="Reset to system theme preference"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="9" x2="15" y2="9"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <span className="system-label">Auto</span>
          </button>
        )}
      </div>
      
      <div className="theme-info">
        <span className="theme-status">
          {theme} mode{isSystemTheme ? ' (system)' : ''}
        </span>
        <span className="keyboard-hint">
          Ctrl+Shift+T
        </span>
      </div>
    </div>
  );
};

export default ThemeToggle;
