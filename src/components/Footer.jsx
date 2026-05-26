import React, { useState } from 'react';
import './Footer.css';

export default function Footer({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    
    try {
      const res = await fetch('http://localhost:5000/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!data.error) {
        setSubscribed(true);
        setEmail('');
        setTimeout(() => {
          setSubscribed(false);
        }, 4000);
      } else {
        setError('Failed to subscribe. Try again.');
      }
    } catch (err) {
      console.error('Newsletter subscription error:', err.message);
      setError('Connection error. Please try again.');
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo" onClick={() => onNavigate('hero')}>
            <span className="logo-text">Luxe<span className="gold-text">Layers</span></span>
            <span className="logo-sub">ARTISAN CAKE BOUTIQUE</span>
          </div>
          <p className="footer-tagline">
            Crafting premium, bespoke cakes that turn your sweet celebrations into unforgettable, artistic masterpieces.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" className="social-icon" aria-label="Pinterest">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.35c-.95.53-2.1.25-2.73-.66l-1.07-1.54c-.2-.28-.29-.63-.26-.98l.18-1.74-.95-1.57c-.36-.6-.17-1.38.43-1.74s1.38-.17 1.74.43l.53.88 1.43-2.45c.36-.62 1.15-.83 1.77-.47s.83 1.15.47 1.77l-1.89 3.24c-.17.29-.44.5-.76.58l-1.28.32.74 1.06c.35.5.3 1.18-.13 1.62l-1 .46z"></path></svg>
            </a>
            <a href="#" className="social-icon" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h4 className="footer-title">Navigation</h4>
          <ul>
            <li><a href="#gallery" onClick={(e) => { e.preventDefault(); onNavigate('gallery'); }}>The Collection</a></li>
            <li><a href="#builder" onClick={(e) => { e.preventDefault(); onNavigate('builder'); }}>Cake Designer</a></li>
            <li><a href="#quiz" onClick={(e) => { e.preventDefault(); onNavigate('quiz'); }}>Taste Quiz</a></li>
            <li><a href="#inquiry" onClick={(e) => { e.preventDefault(); onNavigate('inquiry'); }}>Book Inquiry</a></li>
            <li><a href="#admin" onClick={(e) => { e.preventDefault(); onNavigate('admin'); }} style={{ color: 'var(--color-gold)', fontWeight: '500' }}>Admin Control Suite</a></li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h4 className="footer-title">Join The Club</h4>
          <p className="newsletter-text">Subscribe to receive recipe insights, seasonal collection launches, and priority booking slots.</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={error ? 'error-border' : ''}
              />
              <button type="submit" className="newsletter-btn">
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </div>
            {error && <span className="error-message">{error}</span>}
            {subscribed && <span className="success-message">Welcome to LuxeLayers! A welcome note has been sent.</span>}
          </form>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>&copy; {new Date().getFullYear()} LuxeLayers. Crafted with passion. All rights reserved.</p>
      </div>
    </footer>
  );
}
