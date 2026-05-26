import React, { useState } from 'react';
import './Gallery.css';

const DEFAULT_COLLECTION = [
  {
    _id: 'duchess',
    title: 'The Duchess',
    category: 'weddings',
    price: '$320',
    description: 'A stately 3-tier masterpiece featuring textured white buttercream, cascading gold leaf accents, and hand-selected fresh white peonies.',
    image: '/wedding_cake.png',
    flavors: 'Classic Vanilla Bean & Raspberry Compote',
    servings: '50-70 guests',
    highlights: ['Edible Gold Leaf', 'Fresh Organic Peonies', 'Silky Swiss Meringue']
  },
  {
    _id: 'midnight-cocoa',
    title: 'Midnight Cocoa Drip',
    category: 'chocolate',
    price: '$85',
    description: 'Rich double-layer chocolate fudge cake enveloped in dark glossy chocolate ganache drip and crowned with fresh blackberries and gold luster dust.',
    image: '/chocolate_cake.png',
    flavors: 'Dark Chocolate Fudge & Salted Caramel',
    servings: '12-18 guests',
    highlights: ['Belgian Ganache', 'Fresh Blackberries', 'Edible Gold Dust']
  },
  {
    _id: 'emerald-crepe',
    title: 'Emerald Crepe',
    category: 'seasonal',
    price: '$75',
    description: 'A modern, delicate matcha crepe cake made of 20 paper-thin layers dusted with fine Uji matcha green tea powder and finished with cherries.',
    image: '/matcha_cake.png',
    flavors: 'Uji Matcha Cream & Cherry Infusion',
    servings: '10-15 guests',
    highlights: ['20 Micro-layers', 'Authentic Matcha', 'Fresh Cherries']
  },
  {
    _id: 'crimson-swirl',
    title: 'Crimson Swirl',
    category: 'signature',
    price: '$90',
    description: 'Classic rich red velvet layers paired with piped cream cheese frosting, red velvet crumbs, and organic edible flower accents.',
    image: '/red_velvet.png',
    flavors: 'Vibrant Red Velvet & Tangy Cream Cheese',
    servings: '12-20 guests',
    highlights: ['Cream Cheese Frosting', 'Velvet Sponge Crumb', 'Edible Flowers']
  }
];

export default function Gallery({ cakesList = [], onAddToInquiry }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCake, setSelectedCake] = useState(null);

  const displayCollection = cakesList.length > 0 ? cakesList : DEFAULT_COLLECTION;

  const filteredCakes = activeFilter === 'all' 
    ? displayCollection 
    : displayCollection.filter(cake => cake.category === activeFilter);

  const handleInquiryClick = (cake) => {
    onAddToInquiry({
      id: cake._id,
      name: cake.title,
      type: 'Collection Cake',
      price: cake.price,
      details: `Category: ${cake.category} | Flavors: ${cake.flavors}`,
      image: cake.image
    });
    setSelectedCake(null);
  };

  return (
    <section className="gallery-section section-padding" id="gallery">
      <div className="container">
        <div className="gallery-header">
          <span className="gallery-subtitle">THE Luxe COLLECTION</span>
          <h2 className="gallery-title">Explore Our Signature Creations</h2>
          <div className="gallery-filters">
            {['all', 'weddings', 'chocolate', 'seasonal', 'signature'].map(filter => (
              <button 
                key={filter} 
                className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="gallery-grid">
          {filteredCakes.map(cake => (
            <div key={cake._id} className="cake-card glass-card" onClick={() => setSelectedCake(cake)}>
              <div className="cake-card-image-wrapper">
                <img src={cake.image} alt={cake.title} className="cake-card-image" />
                <div className="cake-card-overlay">
                  <span className="view-details-btn">View Details</span>
                </div>
              </div>
              <div className="cake-card-content">
                <div className="cake-card-meta">
                  <span className="cake-card-category">{cake.category}</span>
                  <span className="cake-card-price">{cake.price}</span>
                </div>
                <h3 className="cake-card-title">{cake.title}</h3>
                <p className="cake-card-description">{cake.description.substring(0, 80)}...</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Detail Overlay */}
      {selectedCake && (
        <div className="modal-overlay" onClick={() => setSelectedCake(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedCake(null)}>×</button>
            <div className="modal-grid">
              <div className="modal-image-panel">
                <img src={selectedCake.image} alt={selectedCake.title} />
              </div>
              <div className="modal-info-panel">
                <span className="modal-category">{selectedCake.category}</span>
                <h3 className="modal-title">{selectedCake.title}</h3>
                <span className="modal-price">{selectedCake.price}</span>
                <p className="modal-description">{selectedCake.description}</p>
                
                <div className="modal-specs">
                  <div className="spec-item">
                    <span className="spec-label">Flavor Profile</span>
                    <span className="spec-val">{selectedCake.flavors}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Servings</span>
                    <span className="spec-val">{selectedCake.servings}</span>
                  </div>
                </div>

                <div className="modal-highlights">
                  {selectedCake.highlights.map((highlight, idx) => (
                    <span key={idx} className="highlight-tag">✦ {highlight}</span>
                  ))}
                </div>

                <button 
                  className="btn-primary modal-action-btn"
                  onClick={() => handleInquiryClick(selectedCake)}
                >
                  Inquire About This Cake
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
