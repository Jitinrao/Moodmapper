import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Add auth wrapper functionality
  useEffect(() => {
    const authWrapper = document.querySelector('.auth-wrapper');
    const loginTrigger = document.querySelector('.login-trigger');
    const registerTrigger = document.querySelector('.register-trigger');

    if (registerTrigger) {
      registerTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        authWrapper.classList.add('toggled');
      });
    }

    if (loginTrigger) {
      loginTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        authWrapper.classList.remove('toggled');
      });
    }

    // Cleanup event listeners
    return () => {
      if (registerTrigger) {
        registerTrigger.removeEventListener('click', () => {});
      }
      if (loginTrigger) {
        loginTrigger.removeEventListener('click', () => {});
      }
    };
  }, []);

  // Initially show the auth wrapper for login
  useEffect(() => {
    const authWrapper = document.querySelector('.auth-wrapper');
    if (authWrapper) {
      authWrapper.classList.add('toggled');
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Show success message if redirected from registration
  useEffect(() => {
    const messageParam = searchParams.get('message');
    if (messageParam === 'registration_success') {
      setMessage('Registration successful! Please log in.');
      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    setMessage('');
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        console.log('✅ Login successful');
        // Navigation is handled by AuthContext state change
      } else {
        console.error('❌ Login failed:', result.error);
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <>
      {/* Auth Wrapper for Modal */}
      <div className="auth-wrapper">
        <div className="auth-content">
          <button className="login-trigger">Back to Login</button>
          <div className="auth-form">
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Login to your account</p>
            
            {errors.general && (
              <div className="error-message">
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    disabled={loading}
                  >
                    {showPassword ? '👁️' : '👁️‍♂️'}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            
            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <button 
                  type="button" 
                  className="register-trigger"
                  disabled={loading}
                >
                  Create Account
                </button>
              </p>
              <button 
                type="button" 
                onClick={() => navigate('/forgot-password')}
                className="link-button"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Original Login Page */}
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>🗺️ Mood Mapper</h1>
            <p>Discover amazing places around you</p>
          </div>
          
          {message && (
            <div className="auth-message success">
              {message}
            </div>
          )}
          
          <div className="auth-form">
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Login to your account</p>
            
            {errors.general && (
              <div className="error-message">
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    disabled={loading}
                  >
                    {showPassword ? '👁️' : '👁️‍♂️'}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          
            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <button 
                  type="button" 
                  onClick={() => navigate('/register')}
                  className="link-button"
                  disabled={loading}
                >
                  Create Account
                </button>
              </p>
              <button 
                type="button" 
                onClick={() => navigate('/forgot-password')}
                className="link-button"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
