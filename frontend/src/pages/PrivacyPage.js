import React from 'react';

const PrivacyPage = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <div className="privacy-header">
          <h1>🔒 Privacy Policy</h1>
          <p>Last updated: January 2026</p>
        </div>

        <div className="privacy-content">
          <div className="privacy-section">
            <h2>📋 Introduction</h2>
            <p>
              At Mood Mapper, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, and protect your information when you use our service.
            </p>
          </div>

          <div className="privacy-section">
            <h2>🔍 Information We Collect</h2>
            <div className="info-list">
              <div className="info-item">
                <h3>Personal Information</h3>
                <p>Name, email address, and profile information you provide when creating an account.</p>
              </div>
              <div className="info-item">
                <h3>Location Data</h3>
                <p>Your current location and search locations to provide nearby place recommendations.</p>
              </div>
              <div className="info-item">
                <h3>Usage Data</h3>
                <p>How you interact with our app, including searches, preferences, and saved places.</p>
              </div>
              <div className="info-item">
                <h3>Device Information</h3>
                <p>Device type, operating system, and browser information for app optimization.</p>
              </div>
            </div>
          </div>

          <div className="privacy-section">
            <h2>🎯 How We Use Your Information</h2>
            <ul className="use-list">
              <li>Provide personalized place recommendations based on your location and preferences</li>
              <li>Improve our services and develop new features</li>
              <li>Communicate with you about your account and our services</li>
              <li>Analyze usage patterns to optimize user experience</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>🔐 Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="security-list">
              <li>SSL encryption for all data transmissions</li>
              <li>Secure authentication with JWT tokens</li>
              <li>Regular security audits and updates</li>
              <li>Limited access to user data</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>🍪 Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience:
            </p>
            <ul className="cookie-list">
              <li>Essential cookies for app functionality</li>
              <li>Preference cookies for theme and settings</li>
              <li>Analytics cookies to improve our service</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>🤝 Third-Party Services</h2>
            <p>
              We integrate with trusted third-party services:
            </p>
            <ul className="third-party-list">
              <li><strong>Google Maps API:</strong> For location services and place data</li>
              <li><strong>Google Places API:</strong> For place recommendations and details</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>👤 Your Rights</h2>
            <p>
              You have the following rights regarding your data:
            </p>
            <ul className="rights-list">
              <li>Access and view your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Delete your account and associated data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>👶 Children's Privacy</h2>
            <p>
              Mood Mapper is not intended for children under 13. We do not knowingly collect 
              personal information from children under 13. If we become aware of such collection, 
              we will take immediate steps to delete this information.
            </p>
          </div>

          <div className="privacy-section">
            <h2>📞 Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> <a href="mailto:moodmapper0@gmail.com">moodmapper0@gmail.com</a></p>
              <p><strong>WhatsApp:</strong> <a href="https://wa.me/919671770765" target="_blank" rel="noopener noreferrer">9671770765</a></p>
            </div>
          </div>

          <div className="privacy-section">
            <h2>🔄 Policy Updates</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
