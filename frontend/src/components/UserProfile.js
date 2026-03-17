import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="user-info">
          <h3>Welcome, {user.name}!</h3>
          <p>{user.email}</p>
          {user.isEmailVerified ? (
            <span className="verification-status verified">✅ Email Verified</span>
          ) : (
            <span className="verification-status not-verified">⚠️ Email Not Verified</span>
          )}
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
