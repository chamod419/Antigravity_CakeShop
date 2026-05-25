import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import CakeBuilder from './components/CakeBuilder';
import TasteProfiler from './components/TasteProfiler';
import InquiryForm from './components/InquiryForm';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [inquiryList, setInquiryList] = useState([]);
  const [prefilledCake, setPrefilledCake] = useState(null);

  // Navigation controller
  const navigateToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Add Item to Inquiry
  const handleAddToInquiry = (item) => {
    setInquiryList(prev => {
      // Avoid duplicate inquiry of the exact same configuration id
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
    // Auto-scroll user to the inquiry section to review their basket
    setTimeout(() => navigateToSection('inquiry'), 500);
  };

  // Remove Item from Inquiry
  const handleRemoveItem = (itemId) => {
    setInquiryList(prev => prev.filter(i => i.id !== itemId));
  };

  // Clear Basket on Success booking
  const handleClearInquiry = () => {
    setInquiryList([]);
    setPrefilledCake(null);
  };

  // Load Quiz Match inside designer
  const handleLoadInDesigner = (cakeConfig) => {
    setPrefilledCake(cakeConfig);
    // Smooth scroll down to the builder
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
  }, []);

  return (
    <>
      <Navbar inquiryCount={inquiryList.length} onNavigate={navigateToSection} />
      
      <Hero onNavigate={navigateToSection} />
      
      <div className="reveal-section fade-up-section">
        <Gallery 
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
          onClearInquiry={handleClearInquiry}
          onNavigate={navigateToSection}
        />
      </div>

      <Footer onNavigate={navigateToSection} />
    </>
  );
}

export default App;
