import React from 'react';
import './AboutUs.css';

export default function AboutUs() {
  return (
    <section id="about" className="section-padding about-section">
      <div className="container">
        <div className="text-center about-header">
          <span className="about-subtitle">The LuxeLayers Legacy</span>
          <h2 className="about-title font-display text-gradient">Artistry in Every Layer</h2>
          <div className="title-divider"></div>
        </div>

        <div className="grid-2 about-content">
          <div className="about-story-col">
            <h3 className="story-heading font-display">Crafting Sweet Masterpieces Since 2018</h3>
            <p className="story-text">
              LuxeLayers was born out of a passion to fuse fine art with haute pastry craftsmanship. 
              We believe that a cake is not merely a dessert, but the crown jewel of your celebration. 
              Under the creative direction of our master pastry chefs, every design is realized as a bespoke, 
              sculptural statement that reflects your unique story.
            </p>
            <p className="story-text">
              We operate at the intersection of taste and design, sourcing local organic ingredients and 
              hand-sculpting delicate sugar decorations. From intimate seasonal gatherings to grand multi-tiered 
              wedding galas, we deliver sensory experiences that linger long after the last crumb is gone.
            </p>
            
            <div className="about-signature-block">
              <span className="signature-title font-display">Nadeesha Perera</span>
              <span className="signature-role">Founder & Master Cake Designer</span>
            </div>
          </div>

          <div className="about-pillars-col">
            <div className="pillar-card glass-card">
              <div className="pillar-icon">🎨</div>
              <div className="pillar-details">
                <h4 className="pillar-title font-display">Bespoke Couture Design</h4>
                <p className="pillar-desc">
                  Every sugar flower, gold leaf stripe, and textured finish is handcrafted to complement the aesthetic theme of your special event.
                </p>
              </div>
            </div>

            <div className="pillar-card glass-card">
              <div className="pillar-icon">🍓</div>
              <div className="pillar-details">
                <h4 className="pillar-title font-display">Prestige Ingredients</h4>
                <p className="pillar-desc">
                  We use organic berries, double-fold Madagascar Bourbon vanilla, and fine Belgian chocolates to guarantee layers of pure decadence.
                </p>
              </div>
            </div>

            <div className="pillar-card glass-card">
              <div className="pillar-icon">✨</div>
              <div className="pillar-details">
                <h4 className="pillar-title font-display">Impeccable Experience</h4>
                <p className="pillar-desc">
                  From interactive digital builders and taste profilers to white-glove assembly, we offer a seamless, luxurious booking journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
