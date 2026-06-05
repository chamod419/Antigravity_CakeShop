import React, { useState } from 'react';
import './Navbar.css';

export default function Navbar({ inquiryCount = 0, onNavigate, currentUser, onSignInClick, onLogout, onTrackOrdersClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavClick = (sectionId) => {
    setIsOpen(false);
    setShowDropdown(false);
    onNavigate(sectionId);
  };

  const getFirstName = (fullName) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
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
          <a href="#about" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}>About Us</a>
          <a href="#gallery" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('gallery'); }}>The Collection</a>
          <a href="#builder" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('builder'); }}>Cake Designer</a>
          <a href="#quiz" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('quiz'); }}>Taste Quiz</a>
          <a href="#reviews" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('reviews'); }}>Reviews</a>
          
          <button className="nav-btn-inquiry" onClick={() => handleNavClick('inquiry')}>
            <span>Book Inquiry</span>
            {inquiryCount > 0 && <span className="inquiry-badge">{inquiryCount}</span>}
          </button>

          {/* Customer Authentication Widget */}
          {currentUser ? (
            <div className="navbar-user-profile" onMouseLeave={() => setShowDropdown(false)}>
              <div 
                className="user-profile-trigger"
                onMouseEnter={() => setShowDropdown(true)}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="navbar-avatar" />
                ) : (
                  <span className="navbar-avatar-initial">{currentUser.name.charAt(0)}</span>
                )}
                <span className="navbar-username">{getFirstName(currentUser.name)}</span>
              </div>
              
              {showDropdown && (
                <div className="user-profile-dropdown glass-card animate-fade">
                  <div className="dropdown-user-header">
                    <strong>{currentUser.name}</strong>
                    <span>{currentUser.email}</span>
                  </div>
                  <button className="dropdown-item track-orders-btn" onClick={() => { onTrackOrdersClick(); setShowDropdown(false); }}>
                    📋 Track Bookings
                  </button>
                  <button className="dropdown-item logout-btn" onClick={() => { onLogout(); setShowDropdown(false); }}>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="nav-btn-signin" onClick={onSignInClick}>
              Sign In
            </button>
          )}
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
        {currentUser && (
          <div className="mobile-user-header">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="mobile-avatar" />
            ) : (
              <span className="mobile-avatar-initial">{currentUser.name.charAt(0)}</span>
            )}
            <div className="mobile-user-info">
              <strong>{currentUser.name}</strong>
              <span>{currentUser.email}</span>
            </div>
          </div>
        )}

        <a href="#about" className="mobile-link" onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}>About Us</a>
        <a href="#gallery" className="mobile-link" onClick={(e) => { e.preventDefault(); handleNavClick('gallery'); }}>The Collection</a>
        <a href="#builder" className="mobile-link" onClick={(e) => { e.preventDefault(); handleNavClick('builder'); }}>Cake Designer</a>
        <a href="#quiz" className="mobile-link" onClick={(e) => { e.preventDefault(); handleNavClick('quiz'); }}>Taste Quiz</a>
        <a href="#reviews" className="mobile-link" onClick={(e) => { e.preventDefault(); handleNavClick('reviews'); }}>Reviews</a>
        
        <button className="mobile-btn-inquiry" onClick={() => handleNavClick('inquiry')}>
          Book Inquiry
          {inquiryCount > 0 && <span className="inquiry-badge">{inquiryCount}</span>}
        </button>

        {currentUser ? (
          <>
            <button className="mobile-btn-track" onClick={() => { onTrackOrdersClick(); setIsOpen(false); }}>
              Track Bookings
            </button>
            <button className="mobile-btn-logout" onClick={() => { onLogout(); setIsOpen(false); }}>
              Log Out
            </button>
          </>
        ) : (
          <button className="mobile-btn-signin" onClick={() => { onSignInClick(); setIsOpen(false); }}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
