import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AccountSettingsPage.css';

const AccountSettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle account settings submission
  const handleSubmit = async (e) => {
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

      if (formData.password && formData.password.length < 6) {
        setMessage('Password must be at least 6 characters long');
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
      const response = await fetch('http://localhost:5001/api/auth/update-profile', {
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
        
        // Show success message for 2 seconds
        setTimeout(() => {
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

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5001/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Clear all data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        logout();
        navigate('/login');
      } else {
        setMessage('Failed to delete account. Please try again.');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="account-settings-page">
      <div className="account-settings-container">
        <div className="page-header">
          <h1>⚙️ Account Settings</h1>
          <p>Manage your account information and preferences</p>
        </div>

        <div className="settings-content">
          <form onSubmit={handleSubmit} className="settings-form">
            {message && (
              <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <div className="form-section">
              <h2>📝 Personal Information</h2>
              
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div className="form-section">
              <h2>🔒 Change Password</h2>
              <p className="section-description">Leave blank to keep current password</p>
              
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password (min 6 characters)"
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
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="danger-zone">
            <h2>⚠️ Danger Zone</h2>
            <p className="danger-description">These actions are irreversible</p>
            
            <div className="danger-actions">
              <button
                onClick={handleDeleteAccount}
                className="btn-danger"
              >
                🗑️ Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
