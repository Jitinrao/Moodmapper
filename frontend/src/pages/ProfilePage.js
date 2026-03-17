import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    savedCount: 0,
    searchCount: 0,
    lastLogin: null,
    joinDate: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/auth');
      return;
    }
    loadUserStats();
  }, [user, navigate]);

  const loadUserStats = () => {
    try {
      // Load user statistics from localStorage
      const savedPlaces = JSON.parse(localStorage.getItem('savedPlaces') || '[]');
      const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const lastLogin = localStorage.getItem('lastLogin');
      const joinDate = localStorage.getItem('joinDate') || new Date().toISOString();

      setStats({
        savedCount: savedPlaces.length,
        searchCount: searchHistory.length,
        lastLogin: lastLogin ? new Date(lastLogin) : null,
        joinDate: new Date(joinDate)
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Update last login time
    localStorage.setItem('lastLogin', new Date().toISOString());
    
    // Clear authentication
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logout();
    
    // Redirect to login
    navigate('/login');
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAccountAge = () => {
    if (!stats.joinDate) return 'Unknown';
    
    const now = new Date();
    const diff = now - stats.joinDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="avatar-badge">
            {user?.isEmailVerified ? '✅' : '⚠️'}
          </div>
        </div>
        
        <div className="profile-info">
          <h1 className="profile-name">
            {user?.name || 'User'}
          </h1>
          <p className="profile-email">
            📧 {user?.email || 'user@example.com'}
          </p>
          <div className="profile-status">
            <span className={`status-badge ${user?.isEmailVerified ? 'verified' : 'unverified'}`}>
              {user?.isEmailVerified ? 'Verified Account' : 'Email Not Verified'}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <h2 className="stats-title">📊 Your Activity</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📍</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.savedCount}</h3>
              <p className="stat-label">Saved Places</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.searchCount}</h3>
              <p className="stat-label">Searches Made</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3 className="stat-number">{getAccountAge()}</h3>
              <p className="stat-label">Member For</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🕐</div>
            <div className="stat-info">
              <h3 className="stat-number">
                {stats.lastLogin ? formatDate(stats.lastLogin) : 'Never'}
              </h3>
              <p className="stat-label">Last Login</p>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <h2 className="actions-title">⚙️ Account Settings</h2>
        
        <div className="actions-grid">
          <button className="action-btn primary" onClick={() => navigate('/settings')}>
            📝 Edit Profile
          </button>
          
          <button className="action-btn secondary">
            🔔 Notification Settings
          </button>
          
          <button className="action-btn secondary">
            🌐 Language & Region
          </button>
          
          <button className="action-btn secondary">
            🔒 Privacy Settings
          </button>
          
          <button className="action-btn secondary">
            💾 Export Data
          </button>
        </div>
        
        <div className="danger-zone">
          <h3>⚠️ Danger Zone</h3>
          <button className="action-btn danger" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="profile-footer">
        <p className="footer-text">
          Member since {formatDate(stats.joinDate)}
        </p>
        <p className="footer-subtitle">
          🎯 Discovering amazing places since {stats.joinDate.getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
