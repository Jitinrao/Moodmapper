import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const SettingsDropdown = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme !== theme) {
      toggleTheme();
    }
  }, [theme, toggleTheme]);

  // Handle theme toggle with localStorage persistence
  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    toggleTheme();
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle account settings submission
  const handleAccountSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      // Validate form
      if (!formData.name || !formData.email) {
        setMessage('Name and email are required');
        setLoading(false);
        return;
      }

      if (formData.password && formData.password !== formData.confirmPassword) {
        setMessage('Passwords do not match');
        setLoading(false);
        return;
      }

      // Prepare update data
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      // Call backend API
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile updated successfully!');
        // Update user in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
        
        // Close settings after 2 seconds
        setTimeout(() => {
          setShowAccountSettings(false);
          setMessage('');
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.settings-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="settings-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="settings-button"
      >
        ⚙️ Settings
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <h4>⚙️ Settings</h4>
            <p className="user-email">{user?.email}</p>
          </div>
          
          <div className="dropdown-section">
            <h5>🎨 Theme</h5>
            <button 
              onClick={handleThemeToggle}
              className="theme-toggle-dropdown"
            >
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
          
          <div className="dropdown-section">
            <h5>👤 Account</h5>
            <button 
              onClick={() => navigate('/profile')}
              className="dropdown-item"
            >
              👤 Profile
            </button>
            <button 
              onClick={() => navigate('/account-settings')}
              className="dropdown-item"
            >
              ⚙️ Account Settings
            </button>
          </div>
          
          <div className="dropdown-section">
            <h5>🚪 Actions</h5>
            <button onClick={handleLogout} className="dropdown-item logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      )}

      {/* Account Settings Modal */}
      {showAccountSettings && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>⚙️ Account Settings</h3>
              <button 
                onClick={() => setShowAccountSettings(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAccountSettings} className="account-form">
              {message && (
                <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowAccountSettings(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;
