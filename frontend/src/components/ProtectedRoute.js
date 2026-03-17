import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If still loading auth state, don't redirect yet
    if (loading) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const currentPath = window.location.pathname;
      const returnUrl = encodeURIComponent(currentPath);
      navigate(`/auth?returnUrl=${returnUrl}`, { replace: true });
      return;
    }

    // Check if admin-only route and user is not admin
    if (adminOnly && user?.role !== 'admin') {
      navigate('/?error=unauthorized', { replace: true });
      return;
    }

    // Check if user account is active
    if (user && user.isActive === false) {
      console.log('🚫 Account disabled for user:', user.email);
      navigate('/auth?error=account_disabled', { replace: true });
      return;
    }
  }, [isAuthenticated, user, loading, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  // If not authenticated, show redirect message
  if (!isAuthenticated) {
    return (
      <div className="protected-route-redirect">
        <div className="auth-required">
          <div className="auth-icon">🔐</div>
          <h2>Authentication Required</h2>
          <p>You must be logged in to access this resource.</p>
          <div className="auth-actions">
            <button 
              onClick={() => navigate('/auth', { replace: true })}
              className="auth-button primary"
            >
              Go to Login
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="auth-button secondary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check admin-only routes
  if (adminOnly && user?.role !== 'admin') {
    return (
      <div className="protected-route-redirect">
        <div className="auth-required">
          <div className="auth-icon">🚫</div>
          <h2>Access Denied</h2>
          <p>This area is restricted to administrators only.</p>
          <div className="auth-actions">
            <button 
              onClick={() => navigate('/', { replace: true })}
              className="auth-button primary"
            >
              Go Home
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="auth-button secondary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user account is active
  if (user && user.isActive === false) {
    return (
      <div className="protected-route-redirect">
        <div className="auth-required">
          <div className="auth-icon">⚠️</div>
          <h2>Account Disabled</h2>
          <p>Your account has been disabled. Please contact support.</p>
          <div className="auth-actions">
            <button 
              onClick={() => navigate('/auth', { replace: true })}
              className="auth-button primary"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized, render children
  return children;
};

export default ProtectedRoute;
