import React, { useState } from 'react';
import './Navbar.css';

export default function Navbar({ inquiryCount = 0, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavClick = (sectionId) => {
    setIsOpen(false);
    onNavigate(sectionId);
  };

  return (
    <nav className="navbar glass-nav">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => handleNavClick('hero')}>
          <span className="logo-text">Luxe<span className="gold-text">Layers</span></span>
          <span className="logo-sub">ARTISAN CAKE BOUTIQUE</span>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-links">
          <a href="#gallery" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('gallery'); }}>The Collection</a>
          <a href="#builder" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('builder'); }}>Cake Designer</a>
          <a href="#quiz" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('quiz'); }}>Taste Quiz</a>
          <button className="nav-btn-inquiry" onClick={() => handleNavClick('inquiry')}>
            <span>Book Inquiry</span>
            {inquiryCount > 0 && <span className="inquiry-badge">{inquiryCount}</span>}
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className={`hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer glass-nav ${isOpen ? 'active' : ''}`}>
        <a href="#gallery" className="mobile-link" onClick={(e) => { e.preventDefault(); handleNavClick('gallery'); }}>The Collection</a>
        <a href="#builder" className="mobile-link" onClick={(e) => { e.preventDefault(); handleNavClick('builder'); }}>Cake Designer</a>
        <a href="#quiz" className="mobile-link" onClick={(e) => { e.preventDefault(); handleNavClick('quiz'); }}>Taste Quiz</a>
        <button className="mobile-btn-inquiry" onClick={() => handleNavClick('inquiry')}>
          Book Inquiry
          {inquiryCount > 0 && <span className="inquiry-badge">{inquiryCount}</span>}
        </button>
      </div>
    </nav>
  );
}
