import React from 'react';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-header">
          <h1>🎯 About Mood Mapper</h1>
          <p>Discover amazing places that match your vibe</p>
        </div>

        <div className="about-content">
          <div className="about-section">
            <h2>🌟 Our Mission</h2>
            <p>
              Mood Mapper is your intelligent companion for discovering places that perfectly match your current mood and preferences. 
              Whether you're looking for a quiet cafe to work, a vibrant restaurant to socialize, or a peaceful park to relax, 
              we've got you covered with personalized recommendations powered by advanced location intelligence.
            </p>
          </div>

          <div className="about-section">
            <h2>🚀 How It Works</h2>
            <div className="how-it-works">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Set Your Location</h3>
                <p>Search for any location or use your current location with GPS</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Choose Your Mood</h3>
                <p>Select how you're feeling - Work, Relax, Food, Social, and more</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Discover Places</h3>
                <p>Get personalized recommendations with ratings, distance, and details</p>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <h3>Explore & Enjoy</h3>
                <p>Navigate to places, save favorites, and share with friends</p>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h2>✨ Key Features</h2>
            <div className="features-grid">
              <div className="feature">
                <div className="feature-icon">🎭</div>
                <h3>Mood-Based Search</h3>
                <p>Find places that match your current emotional state</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🗺️</div>
                <h3>Interactive Maps</h3>
                <p>Real-time location tracking and navigation</p>
              </div>
              <div className="feature">
                <div className="feature-icon">⭐</div>
                <h3>Ratings & Reviews</h3>
                <p>Make informed decisions with community feedback</p>
              </div>
              <div className="feature">
                <div className="feature-icon">📱</div>
                <h3>Mobile Friendly</h3>
                <p>Seamless experience across all devices</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🌙</div>
                <h3>Dark Mode</h3>
                <p>Comfortable viewing in any lighting condition</p>
              </div>
              <div className="feature">
                <div className="feature-icon">💾</div>
                <h3>Save Favorites</h3>
                <p>Keep track of places you love</p>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h2>👥 Our Team</h2>
            <p>
              Mood Mapper was created by a passionate team of developers who believe that finding the perfect place 
              shouldn't be a hassle. We combine cutting-edge technology with user-centric design to deliver 
              an experience that's both powerful and delightful.
            </p>
          </div>

          <div className="about-section">
            <h2>📞 Get in Touch</h2>
            <div className="contact-info">
              <div className="contact-item">
                <strong>Email:</strong>
                <a href="mailto:moodmapper0@gmail.com">moodmapper0@gmail.com</a>
              </div>
              <div className="contact-item">
                <strong>WhatsApp:</strong>
                <a href="https://wa.me/919671770765" target="_blank" rel="noopener noreferrer">
                  9671770765
                </a>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h2>🎉 Join Our Community</h2>
            <p>
              We're constantly improving and adding new features based on your feedback. 
              Download Mood Mapper today and start discovering amazing places that match your vibe!
            </p>
            <div className="cta-buttons">
              <a href="/auth" className="cta-btn primary">Get Started</a>
              <a href="/contact" className="cta-btn secondary">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
