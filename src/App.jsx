import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import CakeBuilder from './components/CakeBuilder';
import TasteProfiler from './components/TasteProfiler';
import InquiryForm from './components/InquiryForm';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [cakesList, setCakesList] = useState([]);
  const [inquiryList, setInquiryList] = useState([]);
  const [prefilledCake, setPrefilledCake] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

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

  useEffect(() => {
    fetchCakes();
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

  // Clear Basket on Success booking (Submit booking to Backend)
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
        return data; // returns created inquiry containing reference code
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
  }, [cakesList]); // Re-run when cakes load to bind elements

  return (
    <>
      <Navbar inquiryCount={inquiryList.length} onNavigate={navigateToSection} />
      
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
        />
      </div>

      <Footer onNavigate={navigateToSection} />

      {/* Admin Panel Dialog Dashboard */}
      {showAdmin && (
        <AdminPanel 
          onClose={() => {
            setShowAdmin(false);
            fetchCakes(); // reload catalog in case admin added/deleted cakes
          }} 
        />
      )}
    </>
  );
}

export default App;
