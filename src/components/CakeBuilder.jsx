import React, { useState, useEffect } from 'react';
import './CakeBuilder.css';

const FLAVORS = [
  { id: 'vanilla', name: 'Vanilla Bean', color: '#FAF6EE', price: 0, textDark: true },
  { id: 'chocolate', name: 'Chocolate Fudge', color: '#4A2E1D', price: 5, textDark: false },
  { id: 'matcha', name: 'Pistachio Matcha', color: '#889C76', price: 10, textDark: false },
  { id: 'velvet', name: 'Red Velvet', color: '#801A24', price: 8, textDark: false }
];

const ICING_COLORS = [
  { name: 'Champagne Cream', hex: '#FAF6EE' },
  { name: 'Blush Pink', hex: '#F7CAD0' },
  { name: 'Soft Lavender', hex: '#E2E2F7' },
  { name: 'Vintage Gold', hex: '#D4AF37' }
];

const TOPPINGS = [
  { id: 'macarons', name: 'French Macarons', price: 12, emoji: '🍡', desc: 'Elegant almond meringue cookies' },
  { id: 'flowers', name: 'Fresh Roses & Peonies', price: 15, emoji: '🌸', desc: 'Hand-selected organic blooms' },
  { id: 'berries', name: 'Wild Berries', price: 10, emoji: '🍓', desc: 'Strawberries, blueberries, & raspberries' },
  { id: 'gold', name: '24k Gold Leaf Flakes', price: 18, emoji: '✨', desc: 'Edible luxury metallic flakes' }
];

export default function CakeBuilder({ onAddToInquiry, prefilledCake }) {
  // Option States
  const [tiers, setTiers] = useState(2); // 1 or 2
  const [shape, setShape] = useState('round'); // round or square
  const [flavor, setFlavor] = useState(FLAVORS[0]);
  const [icingColor, setIcingColor] = useState(ICING_COLORS[0]);
  const [icingStyle, setIcingStyle] = useState('piped'); // piped, textured, naked
  const [toppings, setToppings] = useState([]); // list of topping ids
  const [customText, setCustomText] = useState('');
  const [textStyle, setTextStyle] = useState('cursive'); // cursive or serif
  
  // Wizard Navigation Tab State ('base', 'icing', 'decor')
  const [activeTab, setActiveTab] = useState('base');

  // Apply prefilled cake options if they come from the Taste Quiz
  useEffect(() => {
    if (prefilledCake) {
      const matchedFlavor = FLAVORS.find(f => f.name.toLowerCase().includes(prefilledCake.flavor.toLowerCase())) || FLAVORS[0];
      setFlavor(matchedFlavor);
      setTiers(prefilledCake.tiers || 2);
      setShape(prefilledCake.shape || 'round');
      if (prefilledCake.text) setCustomText(prefilledCake.text);
      if (prefilledCake.toppings) setToppings(prefilledCake.toppings);
      // Automatically switch to details tab to showcase prefilled quiz items
      setActiveTab('icing');
    }
  }, [prefilledCake]);

  const handleToppingToggle = (toppingId) => {
    setToppings(prev => 
      prev.includes(toppingId) 
        ? prev.filter(id => id !== toppingId) 
        : [...prev, toppingId]
    );
  };

  const handleReset = () => {
    setTiers(2);
    setShape('round');
    setFlavor(FLAVORS[0]);
    setIcingColor(ICING_COLORS[0]);
    setIcingStyle('piped');
    setToppings([]);
    setCustomText('');
    setTextStyle('cursive');
    setActiveTab('base');
  };

  // Price Calculation
  const basePrice = tiers === 1 ? 55 : 95;
  const flavorPrice = flavor.price;
  const toppingsPrice = toppings.reduce((sum, tid) => {
    const topping = TOPPINGS.find(t => t.id === tid);
    return sum + (topping ? topping.price : 0);
  }, 0);
  const totalPrice = basePrice + flavorPrice + toppingsPrice;

  const handleInquirySubmit = () => {
    const selectedToppingsNames = toppings.map(tid => TOPPINGS.find(t => t.id === tid)?.name).filter(Boolean);
    const configDetails = `${tiers} Tier ${shape.charAt(0).toUpperCase() + shape.slice(1)} Cake | Flavor: ${flavor.name} | Icing: ${icingStyle} (${icingColor.name}) ${selectedToppingsNames.length > 0 ? `| Toppings: ${selectedToppingsNames.join(', ')}` : ''} ${customText ? `| Custom Writing: "${customText}"` : ''}`;

    onAddToInquiry({
      id: `custom-${Date.now()}`,
      name: `Custom ${tiers}-Tier Design`,
      type: 'Bespoke Design',
      price: `$${totalPrice}`,
      details: configDetails,
      image: tiers === 1 ? '/matcha_cake.png' : '/wedding_cake.png' // representative base image
    });
  };

  return (
    <section className="builder-section section-padding" id="builder">
      <div className="container">
        <div className="builder-header text-center">
          <span className="builder-subtitle">INTERACTIVE DESIGNER</span>
          <h2 className="builder-title font-display text-gradient">Sculpt Your Custom Cake</h2>
          <p className="builder-description-text">Select your canvas, flavors, and embellishments. Watch your creation update in real-time in our interactive visualizer.</p>
        </div>

        <div className="builder-grid">
          {/* Left Visualizer Panel */}
          <div className="builder-visualizer glass-card flex-center">
            <div className={`cake-display-stand ${shape}`}>
              <div className="stand-plate"></div>
              <div className="stand-base"></div>
              
              <div className={`cake-tiers-container tiers-${tiers} shape-${shape}`}>
                {/* Top Tier (only shown if tiers === 2) */}
                {tiers === 2 && (
                  <div 
                    className={`cake-tier tier-top icing-${icingStyle}`} 
                    style={{ 
                      backgroundColor: icingStyle === 'naked' ? flavor.color : icingColor.hex,
                      borderColor: icingStyle === 'naked' ? flavor.color : icingColor.hex
                    }}
                  >
                    {/* Inner sponge stripes for naked style */}
                    {icingStyle === 'naked' && (
                      <div className="naked-stripes" style={{ background: `repeating-linear-gradient(0deg, ${flavor.color}, ${flavor.color} 18px, rgba(250, 246, 238, 0.85) 18px, rgba(250, 246, 238, 0.85) 23px)` }}></div>
                    )}
                    {/* Textured overlays */}
                    {icingStyle === 'textured' && <div className="textured-overlay"></div>}
                    {/* Edge piping */}
                    {icingStyle === 'piped' && <div className="piping-rim top" style={{ borderBottomColor: icingColor.hex }}></div>}
                    
                    {/* Custom Text on Top Tier */}
                    {customText && (
                      <div className={`tier-text ${textStyle} ${flavor.textDark || icingStyle !== 'naked' ? 'dark-font' : 'light-font'}`}>
                        {customText}
                      </div>
                    )}

                    {/* Gold Leaf Flakes details on top tier */}
                    {toppings.includes('gold') && (
                      <div className="gold-cluster">
                        <div className="gold-flake flake-1"></div>
                        <div className="gold-flake flake-2"></div>
                        <div className="gold-flake flake-5"></div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom/Base Tier */}
                <div 
                  className={`cake-tier tier-bottom icing-${icingStyle}`} 
                  style={{ 
                    backgroundColor: icingStyle === 'naked' ? flavor.color : icingColor.hex,
                    borderColor: icingStyle === 'naked' ? flavor.color : icingColor.hex
                  }}
                >
                  {icingStyle === 'naked' && (
                    <div className="naked-stripes" style={{ background: `repeating-linear-gradient(0deg, ${flavor.color}, ${flavor.color} 25px, rgba(250, 246, 238, 0.85) 25px, rgba(250, 246, 238, 0.85) 30px)` }}></div>
                  )}
                  {icingStyle === 'textured' && <div className="textured-overlay"></div>}
                  {icingStyle === 'piped' && <div className="piping-rim bottom" style={{ borderBottomColor: icingColor.hex }}></div>}
                  
                  {/* If single tier, custom text goes here */}
                  {tiers === 1 && customText && (
                    <div className={`tier-text ${textStyle} ${flavor.textDark || icingStyle !== 'naked' ? 'dark-font' : 'light-font'}`}>
                      {customText}
                    </div>
                  )}

                  {/* Gold Leaf Flakes details on bottom tier */}
                  {toppings.includes('gold') && (
                    <div className="gold-cluster">
                      <div className="gold-flake flake-3"></div>
                      <div className="gold-flake flake-4"></div>
                      <div className="gold-flake flake-6"></div>
                    </div>
                  )}
                </div>

                {/* Render Volumetric Toppings on Top of the Cake */}
                <div className="toppings-visual-container">
                  {/* Styled Macarons Cluster */}
                  {toppings.includes('macarons') && (
                    <div className="macarons-cluster animate-float">
                      <div className="macaron-element macaron-1">
                        <div className="cookie-top"></div>
                        <div className="filling"></div>
                        <div className="cookie-bottom"></div>
                      </div>
                      <div className="macaron-element macaron-2">
                        <div className="cookie-top"></div>
                        <div className="filling"></div>
                        <div className="cookie-bottom"></div>
                      </div>
                      <div className="macaron-element macaron-3">
                        <div className="cookie-top"></div>
                        <div className="filling"></div>
                        <div className="cookie-bottom"></div>
                      </div>
                    </div>
                  )}

                  {/* Elegant SVG Flowers Cluster */}
                  {toppings.includes('flowers') && (
                    <div className="flowers-cluster">
                      <svg className="flower-svg flower-1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="38" fill="#F7CAD0" />
                        <path d="M50 12 C35 30, 15 35, 50 88 C85 35, 65 30, 50 12 Z" fill="#fae0e4" opacity="0.9" />
                        <path d="M12 50 C30 35, 35 15, 88 50 C35 85, 30 65, 12 50 Z" fill="#fae0e4" opacity="0.8" />
                        <circle cx="50" cy="50" r="15" fill="#D4AF37" />
                      </svg>
                      <svg className="flower-svg flower-2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="38" fill="#fae0e4" />
                        <path d="M50 12 C35 30, 15 35, 50 88 C85 35, 65 30, 50 12 Z" fill="#ffffff" opacity="0.9" />
                        <circle cx="50" cy="50" r="12" fill="#FAF6EE" />
                      </svg>
                    </div>
                  )}

                  {/* Glossy Berries Cluster */}
                  {toppings.includes('berries') && (
                    <div className="berries-cluster animate-float">
                      <div className="berry strawberry"></div>
                      <div className="berry blueberry-1"></div>
                      <div className="berry blueberry-2"></div>
                      <div className="berry raspberry"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <button className="btn-secondary reset-builder-btn" onClick={handleReset}>
              Reset Design
            </button>
          </div>

          {/* Right Configuration Panel */}
          <div className="builder-config glass-card">
            <h3 className="config-title">Bespoke Specifications</h3>
            
            {/* Step Selection Tabs */}
            <div className="builder-tabs">
              <button 
                className={`tab-btn ${activeTab === 'base' ? 'active' : ''}`}
                onClick={() => setActiveTab('base')}
              >
                1. Size & Shape
              </button>
              <button 
                className={`tab-btn ${activeTab === 'icing' ? 'active' : ''}`}
                onClick={() => setActiveTab('icing')}
              >
                2. Flavor & Coating
              </button>
              <button 
                className={`tab-btn ${activeTab === 'decor' ? 'active' : ''}`}
                onClick={() => setActiveTab('decor')}
              >
                3. Toppings & Script
              </button>
            </div>

            {/* TAB 1: Base Tiers & Shape */}
            {activeTab === 'base' && (
              <div className="tab-pane animate-fade">
                <div className="config-section">
                  <span className="section-label">Dimensions & Tiers</span>
                  <p className="section-desc">Select the structural canvas of your custom design.</p>
                  <div className="option-row">
                    <button 
                      className={`option-chip tier-select-btn ${tiers === 1 ? 'active' : ''}`}
                      onClick={() => setTiers(1)}
                    >
                      <span className="tier-icon-preview single"></span>
                      <div>
                        <strong>1 Tier</strong>
                        <span>Serves 15 guests ($55)</span>
                      </div>
                    </button>
                    <button 
                      className={`option-chip tier-select-btn ${tiers === 2 ? 'active' : ''}`}
                      onClick={() => setTiers(2)}
                    >
                      <span className="tier-icon-preview double"></span>
                      <div>
                        <strong>2 Tiers</strong>
                        <span>Serves 40 guests ($95)</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="config-section" style={{ marginTop: '1rem' }}>
                  <span className="section-label">Geometric Contour</span>
                  <p className="section-desc">Pick the base shape that fits your occasion.</p>
                  <div className="option-row">
                    <button 
                      className={`option-chip shape-select-btn ${shape === 'round' ? 'active' : ''}`}
                      onClick={() => setShape('round')}
                    >
                      Elegant Round
                    </button>
                    <button 
                      className={`option-chip shape-select-btn ${shape === 'square' ? 'active' : ''}`}
                      onClick={() => setShape('square')}
                    >
                      Geometric Square
                    </button>
                  </div>
                </div>

                <button className="btn-primary tab-next-btn" onClick={() => setActiveTab('icing')}>
                  Continue to Flavor & Coating →
                </button>
              </div>
            )}

            {/* TAB 2: Flavor Sponge & Coating */}
            {activeTab === 'icing' && (
              <div className="tab-pane animate-fade">
                <div className="config-section">
                  <span className="section-label">Sponge Cake Flavor</span>
                  <p className="section-desc">Handcrafted organic ingredients baked to soft perfection.</p>
                  <div className="option-grid">
                    {FLAVORS.map(f => (
                      <button 
                        key={f.id} 
                        className={`flavor-btn-item ${flavor.id === f.id ? 'active' : ''}`}
                        onClick={() => setFlavor(f)}
                      >
                        <span className="flavor-color-dot" style={{ backgroundColor: f.color }}></span>
                        <div className="flavor-meta">
                          <strong>{f.name}</strong>
                          <span>{f.price > 0 ? `+$${f.price}` : 'Included'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="config-section" style={{ marginTop: '1.2rem' }}>
                  <span className="section-label">Outer Coating Style</span>
                  <p className="section-desc">How our decorators coat the sponge layers.</p>
                  <div className="option-row">
                    <button 
                      className={`option-chip ${icingStyle === 'piped' ? 'active' : ''}`}
                      onClick={() => setIcingStyle('piped')}
                    >
                      Smooth Piping
                    </button>
                    <button 
                      className={`option-chip ${icingStyle === 'textured' ? 'active' : ''}`}
                      onClick={() => setIcingStyle('textured')}
                    >
                      Rustic Textured
                    </button>
                    <button 
                      className={`option-chip ${icingStyle === 'naked' ? 'active' : ''}`}
                      onClick={() => setIcingStyle('naked')}
                    >
                      Naked Sponge
                    </button>
                  </div>

                  {icingStyle !== 'naked' && (
                    <div style={{ marginTop: '1rem' }} className="animate-fade">
                      <span className="sub-section-label">Icing Palette</span>
                      <div className="color-palette-row">
                        {ICING_COLORS.map((color, idx) => (
                          <button 
                            key={idx}
                            className={`color-chip ${icingColor.name === color.name ? 'active' : ''}`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                            onClick={() => setIcingColor(color)}
                          ></button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="tab-buttons-row">
                  <button className="btn-secondary" onClick={() => setActiveTab('base')}>
                    ← Back
                  </button>
                  <button className="btn-primary" onClick={() => setActiveTab('decor')}>
                    Continue to Toppings →
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Toppings / Embellishments & Personal Text */}
            {activeTab === 'decor' && (
              <div className="tab-pane animate-fade">
                <div className="config-section">
                  <span className="section-label">Artisan Embellishments</span>
                  <p className="section-desc">Premium toppings placed fresh by our chefs.</p>
                  <div className="toppings-list">
                    {TOPPINGS.map(t => (
                      <label key={t.id} className={`topping-checkbox-card ${toppings.includes(t.id) ? 'checked' : ''}`}>
                        <input 
                          type="checkbox" 
                          checked={toppings.includes(t.id)} 
                          onChange={() => handleToppingToggle(t.id)} 
                        />
                        <span className="topping-emoji">{t.emoji}</span>
                        <div className="topping-details">
                          <div className="topping-meta-txt">
                            <strong>{t.name}</strong>
                            <span>{t.desc}</span>
                          </div>
                          <span className="topping-price-label">+${t.price}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="config-section" style={{ marginTop: '1.2rem' }}>
                  <span className="section-label">Personalized Scripting</span>
                  <p className="section-desc">Up to 24 characters piped on the front face.</p>
                  <input 
                    type="text" 
                    placeholder="Congratulations, Happy Birthday, etc." 
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value.substring(0, 24))}
                    className="script-input"
                  />
                  {customText && (
                    <div className="option-row animate-fade" style={{ marginTop: '0.8rem' }}>
                      <button 
                        className={`option-chip font-chip ${textStyle === 'cursive' ? 'active' : ''}`}
                        onClick={() => setTextStyle('cursive')}
                      >
                        Script Cursive
                      </button>
                      <button 
                        className={`option-chip font-chip ${textStyle === 'serif' ? 'active' : ''}`}
                        onClick={() => setTextStyle('serif')}
                      >
                        Classic Serif
                      </button>
                    </div>
                  )}
                </div>

                <div className="tab-buttons-row">
                  <button className="btn-secondary" onClick={() => setActiveTab('icing')}>
                    ← Back
                  </button>
                </div>
              </div>
            )}

            {/* Price & Actions */}
            <div className="config-footer">
              <div className="price-box">
                <span className="price-label">Estimated Design Cost</span>
                <span className="price-amount">${totalPrice}</span>
                
                {/* Cost breakdown popover / label */}
                <span className="price-breakdown-tooltip">
                  Base: ${basePrice} {flavorPrice > 0 ? `+ Flavor: $${flavorPrice}` : ''} {toppingsPrice > 0 ? `+ Extras: $${toppingsPrice}` : ''}
                </span>
              </div>
              <button 
                className="btn-primary inquiry-submit-btn"
                onClick={handleInquirySubmit}
              >
                Inquire With This Design
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
