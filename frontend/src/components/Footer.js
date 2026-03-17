import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Footer = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Account</h4>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="footer-link">My Profile</Link>
              <Link to="/account-settings" className="footer-link">Account Settings</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="footer-link">Sign In</Link>
              <Link to="/register" className="footer-link">Register</Link>
            </>
          )}
        </div>
        
        <div className="footer-section">
          <h4>Company</h4>
          <Link to="/about" className="footer-link">About Us</Link>
          <Link to="/contact" className="footer-link">Contact</Link>
          <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          <Link to="/terms" className="footer-link">Terms of Service</Link>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <a 
            href="mailto:moodmapper0@gmail.com" 
            className="footer-link contact-link"
          >
            📧 moodmapper0@gmail.com
          </a>
          <a 
            href="https://wa.me/919671770765" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link contact-link"
          >
            💬 WhatsApp: 9671770765
          </a>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 Mood Mapper. Made with ❤️</p>
        <div className="social-links">
          <a href="https://wa.me/919671770765" target="_blank" rel="noopener noreferrer">
            <span className="social-icon">💬</span>
          </a>
          <a href="mailto:moodmapper0@gmail.com">
            <span className="social-icon">📧</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
