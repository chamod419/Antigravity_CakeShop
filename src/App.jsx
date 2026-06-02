import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import CakeBuilder from './components/CakeBuilder';
import TasteProfiler from './components/TasteProfiler';
import InquiryForm from './components/InquiryForm';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import PromoPopup from './components/PromoPopup';
import AuthModal from './components/AuthModal';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [cakesList, setCakesList] = useState([]);
  const [inquiryList, setInquiryList] = useState([]);
  const [prefilledCake, setPrefilledCake] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  
  // Auth & Promotions state
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activePromo, setActivePromo] = useState(null);
  const [showPromo, setShowPromo] = useState(false);

  // Fetch cakes collection from Backend API
  const fetchCakes = async () => {
    try {
      const res = await fetch(`${API_BASE}/cakes`);
      const data = await res.json();
      if (!data.error) {
        setCakesList(data);
      }
    } catch (err) {
      console.error('Error fetching cakes from backend:', err.message);
    }
  };

  // Fetch Active Promotion on Load
  const fetchActivePromotion = async () => {
    try {
      const res = await fetch(`${API_BASE}/promotions/active`);
      const data = await res.json();
      if (data && data._id && !data.error) {
        setActivePromo(data);
        const dismissed = localStorage.getItem(`luxe_promo_dismissed_${data._id}`);
        if (!dismissed) {
          // Trigger pop-up with a premium 1.5-second opening delay
          setTimeout(() => setShowPromo(true), 1500);
        }
      }
    } catch (err) {
      console.error('Error fetching active promotion:', err.message);
    }
  };

  useEffect(() => {
    fetchCakes();
    fetchActivePromotion();

    // Check for cached user login session
    const cachedUser = localStorage.getItem('luxe_customer_session');
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch (e) {
        localStorage.removeItem('luxe_customer_session');
      }
    }
  }, []);

  // Navigation controller
  const navigateToSection = (sectionId) => {
    if (sectionId === 'admin') {
      setShowAdmin(true);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Add Item to Inquiry
  const handleAddToInquiry = (item) => {
    setInquiryList(prev => {
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
    setTimeout(() => navigateToSection('inquiry'), 500);
  };

  // Remove Item from Inquiry
  const handleRemoveItem = (itemId) => {
    setInquiryList(prev => prev.filter(i => i.id !== itemId));
  };

  // Submit booking to Backend
  const handleBookingSubmit = async (formData) => {
    try {
      const res = await fetch(`${API_BASE}/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          items: inquiryList
        })
      });
      const data = await res.json();
      if (!data.error) {
        setInquiryList([]);
        setPrefilledCake(null);
        return data;
      }
    } catch (err) {
      console.error('Error submitting inquiry to server:', err.message);
      return null;
    }
  };

  // Load Quiz Match inside designer
  const handleLoadInDesigner = (cakeConfig) => {
    setPrefilledCake(cakeConfig);
    setTimeout(() => navigateToSection('builder'), 100);
  };

  // ==========================================
  // AUTHENTICATION LOGIC
  // ==========================================

  const handleRegister = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!data.error) {
        setCurrentUser(data);
        localStorage.setItem('luxe_customer_session', JSON.stringify(data));
        return data;
      }
      throw new Error(data.error || 'Registration failed');
    } catch (err) {
      console.error('Registration failed:', err.message);
      throw err;
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!data.error) {
        setCurrentUser(data);
        localStorage.setItem('luxe_customer_session', JSON.stringify(data));
        return data;
      }
      throw new Error(data.error || 'Login failed');
    } catch (err) {
      console.error('Login failed:', err.message);
      throw err;
    }
  };

  const handleSocialLogin = async (profile) => {
    try {
      const res = await fetch(`${API_BASE}/auth/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (!data.error) {
        setCurrentUser(data);
        localStorage.setItem('luxe_customer_session', JSON.stringify(data));
        return data;
      }
      throw new Error(data.error || 'Social auth login failed');
    } catch (err) {
      console.error('Social auth connection failed:', err.message);
      throw err;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('luxe_customer_session');
  };

  // Setup Scroll-Linked Animation Reveals (IntersectionObserver)
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal-section');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, {
      threshold: 0.15
    });

    reveals.forEach(el => observer.observe(el));

    return () => {
      reveals.forEach(el => observer.unobserve(el));
    };
  }, [cakesList]);

  return (
    <>
      <Navbar 
        inquiryCount={inquiryList.length} 
        onNavigate={navigateToSection}
        currentUser={currentUser}
        onSignInClick={() => setShowAuth(true)}
        onLogout={handleLogout}
      />
      
      <Hero onNavigate={navigateToSection} />
      
      <div className="reveal-section fade-up-section">
        <Gallery 
          cakesList={cakesList}
          onAddToInquiry={handleAddToInquiry} 
        />
      </div>

      <div className="reveal-section fade-up-section">
        <CakeBuilder 
          onAddToInquiry={handleAddToInquiry} 
          prefilledCake={prefilledCake} 
        />
      </div>

      <div className="reveal-section fade-up-section">
        <TasteProfiler 
          onLoadInDesigner={handleLoadInDesigner} 
          onAddToInquiry={handleAddToInquiry} 
        />
      </div>

      <div className="reveal-section fade-up-section">
        <InquiryForm 
          inquiryList={inquiryList} 
          onRemoveItem={handleRemoveItem}
          onBookingSubmit={handleBookingSubmit}
          onNavigate={navigateToSection}
          currentUser={currentUser}
        />
      </div>

      <Footer onNavigate={navigateToSection} />

      {/* Admin Panel Dialog Dashboard */}
      {showAdmin && (
        <AdminPanel 
          onClose={() => {
            setShowAdmin(false);
            fetchCakes();
          }} 
        />
      )}

      {/* Promo Announcment popup */}
      {showPromo && activePromo && (
        <PromoPopup 
          promo={activePromo}
          onClose={() => setShowPromo(false)}
        />
      )}

      {/* User Authentication modal overlay */}
      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onSocialLogin={handleSocialLogin}
        />
      )}
    </>
  );
}

export default App;
