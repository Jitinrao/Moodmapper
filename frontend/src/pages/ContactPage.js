import React, { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.message) {
        setMessage('All fields are required');
        setLoading(false);
        return;
      }

      // Call backend API (optional)
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('Message sent successfully! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setMessage('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <h1>📞 Contact Us</h1>
          <p>We'd love to hear from you! Get in touch with us through any of the following ways:</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-card">
              <div className="contact-icon">📧</div>
              <div className="contact-details">
                <h3>Email</h3>
                <a href="mailto:moodmapper0@gmail.com" className="contact-link">
                  moodmapper0@gmail.com
                </a>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-icon">💬</div>
              <div className="contact-details">
                <h3>WhatsApp</h3>
                <a 
                  href="https://wa.me/919671770765" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  9671770765
                </a>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              {message && (
                <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  placeholder="Tell us what's on your mind..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        <div className="contact-faq">
          <h2>❓ Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>How do I find places near me?</h3>
              <p>Simply use the search bar to type your location or click "Use My Location" to automatically detect your current position.</p>
            </div>
            <div className="faq-item">
              <h3>What are mood-based recommendations?</h3>
              <p>Select your current mood (Work, Relax, Food, etc.) and we'll suggest places that match your vibe and preferences.</p>
            </div>
            <div className="faq-item">
              <h3>Is the app free to use?</h3>
              <p>Yes! Mood Mapper is completely free to use. No hidden charges or premium features.</p>
            </div>
            <div className="faq-item">
              <h3>How accurate are the location results?</h3>
              <p>We use Google Maps API for the most accurate and up-to-date location information available.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
