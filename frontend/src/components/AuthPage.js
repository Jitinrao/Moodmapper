import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPassword from './ForgotPassword';
import EmailVerification from './EmailVerification';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('login'); // login, register, forgot, verification
  const [message, setMessage] = useState('');

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    const messageParam = searchParams.get('message');
    
    if (modeParam && ['login', 'register', 'forgot', 'verification'].includes(modeParam)) {
      setMode(modeParam);
    }
    
    if (messageParam === 'registration_success') {
      setMessage('Registration successful! Please log in.');
      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    }
  }, [searchParams]);

  const renderAuthForm = () => {
    switch (mode) {
      case 'login':
        return (
          <>
            <LoginForm onToggleMode={() => setMode('register')} />
            <div className="auth-footer">
              <button 
                type="button" 
                onClick={() => setMode('forgot')} 
                className="link-button"
              >
                Forgot password?
              </button>
            </div>
          </>
        );
      case 'register':
        return <RegisterForm onToggleMode={() => setMode('login')} />;
      case 'forgot':
        return <ForgotPassword onBackToLogin={() => setMode('login')} />;
      case 'verification':
        return <EmailVerification />;
      default:
        return <LoginForm onToggleMode={() => setMode('register')} />;
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🗺️ Nearby Places Recommender</h1>
          <p>Discover amazing places around you</p>
        </div>
        
        {message && (
          <div className="auth-message success">
            {message}
          </div>
        )}
        
        <div className="auth-content">
          {renderAuthForm()}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
