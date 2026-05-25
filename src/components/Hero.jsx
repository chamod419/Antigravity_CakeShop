import React from 'react';
import './Hero.css';

export default function Hero({ onNavigate }) {
  return (
    <section className="hero-section" id="hero">
      <div className="hero-background-decor">
        <div className="decor-circle circle-1"></div>
        <div className="decor-circle circle-2"></div>
      </div>
      
      <div className="container hero-grid">
        <div className="hero-content">
          <span className="hero-subtitle">ARTISAN CAKE STUDIO</span>
          <h1 className="hero-title">
            Where <span className="text-gradient">Artistry</span> <br />
            Meets <span className="text-gradient">Taste</span>
          </h1>
          <p className="hero-description">
            We design edible masterpieces that taste as exquisite as they look. Handcrafted with organic ingredients and customized to tell your unique story.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={() => onNavigate('builder')}>
              Design Your Cake
            </button>
            <button className="btn-secondary" onClick={() => onNavigate('gallery')}>
              Explore Collection
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Bespoke</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">12+</span>
              <span className="stat-label">Artisan Flavors</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5★</span>
              <span className="stat-label">Customer Rating</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="image-wrapper animate-float">
            <img 
              src="/wedding_cake.png" 
              alt="Artisan Wedding Cake" 
              className="hero-main-image"
            />
            <div className="gold-accent-ring animate-spin-slow"></div>
            
            {/* Dynamic floating sparkles */}
            <div className="sparkle sparkle-1">✦</div>
            <div className="sparkle sparkle-2">✦</div>
            <div className="sparkle sparkle-3">✦</div>
          </div>
        </div>
      </div>
    </section>
  );
}
