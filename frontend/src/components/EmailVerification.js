import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const EmailVerification = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResendVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Email Verification</h2>
      <p>Please check your email for a verification link. If you didn't receive it, you can request a new one below.</p>
      
      <form onSubmit={handleResendVerification}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>
        
        {message && (
          <div className={`message ${message.includes('sent') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Sending...' : 'Resend Verification Email'}
        </button>
      </form>
    </div>
  );
};

export default EmailVerification;
