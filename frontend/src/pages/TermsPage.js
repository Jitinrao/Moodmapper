import React from 'react';

const TermsPage = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <div className="terms-header">
          <h1>📋 Terms of Service</h1>
          <p>Last updated: January 2026</p>
        </div>

        <div className="terms-content">
          <div className="terms-section">
            <h2>🤝 Agreement to Terms</h2>
            <p>
              By accessing and using Mood Mapper, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </div>

          <div className="terms-section">
            <h2>📝 Description of Service</h2>
            <p>
              Mood Mapper is a location-based discovery platform that helps users find places 
              that match their current mood and preferences. Our service includes:
            </p>
            <ul className="service-list">
              <li>Location-based place recommendations</li>
              <li>Mood-based search filtering</li>
              <li>Interactive maps and navigation</li>
              <li>User profiles and preferences</li>
              <li>Place reviews and ratings</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2>👤 User Responsibilities</h2>
            <p>As a user of Mood Mapper, you agree to:</p>
            <ul className="responsibility-list">
              <li>Provide accurate and truthful information</li>
              <li>Use the service for lawful purposes only</li>
              <li>Respect the privacy and rights of other users</li>
              <li>Not attempt to harm or disrupt our service</li>
              <li>Not share false or misleading information</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2>🚫 Prohibited Activities</h2>
            <p>You may not use Mood Mapper to:</p>
            <ul className="prohibited-list">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Spread false or misleading information</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated tools to scrape our data</li>
              <li>Interfere with or disrupt our service</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2>🔐 Privacy and Data</h2>
            <p>
              Your privacy is important to us. Our collection and use of personal information 
              is governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            <p>
              By using Mood Mapper, you consent to the collection and use of your information 
              as described in our Privacy Policy.
            </p>
          </div>

          <div className="terms-section">
            <h2>📍 Location Services</h2>
            <p>
              Mood Mapper uses location services to provide place recommendations. By using our service:
            </p>
            <ul className="location-list">
              <li>You consent to us collecting your location data</li>
              <li>You understand that location data may be used for recommendations</li>
              <li>You can disable location services at any time</li>
              <li>Some features may not work without location access</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2>💬 User Content</h2>
            <p>
              You may submit content to Mood Mapper, including reviews, ratings, and comments. 
              By submitting content, you grant us a license to use, display, and distribute 
              your content for the purpose of providing our service.
            </p>
            <p>
              You retain ownership of your content, but you represent that you have the right 
              to grant us this license.
            </p>
          </div>

          <div className="terms-section">
            <h2>🛡️ Intellectual Property</h2>
            <p>
              Mood Mapper and its original content, features, and functionality are owned by 
              Mood Mapper and are protected by international copyright, trademark, and other 
              intellectual property laws.
            </p>
            <p>
              You may not use our trademarks, logos, or other proprietary materials without 
              our prior written consent.
            </p>
          </div>

          <div className="terms-section">
            <h2>⚠️ Disclaimers</h2>
            <p>
              Mood Mapper is provided "as is" without warranties of any kind. We do not guarantee:
            </p>
            <ul className="disclaimer-list">
              <li>Accuracy or completeness of place information</li>
              <li>Availability or reliability of our service</li>
              <li>Suitability of recommendations for your needs</li>
              <li>Absence of errors or bugs in our software</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2>⚖️ Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Mood Mapper shall not be liable for any 
              indirect, incidental, special, or consequential damages arising from your use of our service.
            </p>
            <p>
              Our total liability shall not exceed the amount you paid for our service, if any.
            </p>
          </div>

          <div className="terms-section">
            <h2>🔄 Service Changes</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue our service at any time 
              without notice. We may also update these Terms from time to time.
            </p>
            <p>
              Continued use of our service after any changes constitutes acceptance of the new terms.
            </p>
          </div>

          <div className="terms-section">
            <h2>🚪 Termination</h2>
            <p>
              You may terminate your account at any time by following the account deletion process 
              in our app or by contacting us.
            </p>
            <p>
              We may terminate or suspend your account for violation of these Terms or for any 
              other reason at our sole discretion.
            </p>
          </div>

          <div className="terms-section">
            <h2>📞 Contact Information</h2>
            <p>
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> <a href="mailto:moodmapper0@gmail.com">moodmapper0@gmail.com</a></p>
              <p><strong>WhatsApp:</strong> <a href="https://wa.me/919671770765" target="_blank" rel="noopener noreferrer">9671770765</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
