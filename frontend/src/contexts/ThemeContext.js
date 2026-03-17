import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Theme context for managing dark/light theme across the application
const ThemeContext = createContext();

// Custom hook for theme management
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Detect system theme preference
  const getSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  // Get saved theme from localStorage or use system preference
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    return getSystemTheme();
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [isSystemTheme, setIsSystemTheme] = useState(!localStorage.getItem('theme'));

  // Apply theme to document root
  const applyTheme = useCallback((newTheme) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    // Add new theme class to both root and body
    root.classList.add(newTheme);
    body.classList.add(newTheme);
    
    // Update CSS custom properties for smooth transitions
    root.style.setProperty('--theme-transition', 'all 0.3s ease');
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = newTheme === 'dark' ? '#1a1a1a' : '#ffffff';
    }
  }, []);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      setIsSystemTheme(false);
      return newTheme;
    });
  }, [applyTheme]);

  // Set specific theme function
  const setThemeMode = useCallback((newTheme) => {
    setTheme(prevTheme => {
      if (prevTheme !== newTheme) {
        applyTheme(newTheme);
        setIsSystemTheme(false);
        return newTheme;
      }
      return prevTheme;
    });
  }, [applyTheme]);

  // Reset to system theme
  const resetToSystemTheme = useCallback(() => {
    const systemTheme = getSystemTheme();
    setTheme(prevTheme => {
      if (prevTheme !== systemTheme) {
        applyTheme(systemTheme);
        setIsSystemTheme(true);
        localStorage.removeItem('theme');
        return systemTheme;
      }
      return prevTheme;
    });
  }, [applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      if (isSystemTheme) {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        applyTheme(newSystemTheme);
        setTheme(newSystemTheme);
      }
    };

    // Add event listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }

    // Apply initial theme
    applyTheme(theme);

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, [theme, isSystemTheme, applyTheme]);

  // Add keyboard shortcuts for theme toggle
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + Shift + T for theme toggle
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        toggleTheme();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [toggleTheme]);

  const value = {
    theme,
    isDarkTheme: theme === 'dark',
    isLightTheme: theme === 'light',
    isSystemTheme,
    toggleTheme,
    setTheme: setThemeMode,
    resetToSystemTheme,
    themeTransition: 'all 0.3s ease'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
