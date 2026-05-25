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
  { id: 'macarons', name: 'French Macarons', price: 12, emoji: '🍡' },
  { id: 'flowers', name: 'Fresh Roses & Peonies', price: 15, emoji: '🌸' },
  { id: 'berries', name: 'Wild Berries', price: 10, emoji: '🍓' },
  { id: 'gold', name: '24k Gold Leaf Flakes', price: 18, emoji: '✨' }
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

  // Apply prefilled cake options if they come from the Taste Quiz
  useEffect(() => {
    if (prefilledCake) {
      const matchedFlavor = FLAVORS.find(f => f.name.toLowerCase().includes(prefilledCake.flavor.toLowerCase())) || FLAVORS[0];
      setFlavor(matchedFlavor);
      setTiers(prefilledCake.tiers || 2);
      setShape(prefilledCake.shape || 'round');
      if (prefilledCake.text) setCustomText(prefilledCake.text);
      if (prefilledCake.toppings) setToppings(prefilledCake.toppings);
    }
  }, [prefilledCake]);

  const handleToppingToggle = (toppingId) => {
    setToppings(prev => 
      prev.includes(toppingId) 
        ? prev.filter(id => id !== toppingId) 
        : [...prev, toppingId]
    );
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
          <h2 className="builder-title">Sculpt Your Custom Cake</h2>
          <p className="builder-description-text">Select your canvas, flavors, and embellishments, and watch your creation come to life in real-time.</p>
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
                      <div className="naked-stripes" style={{ background: `repeating-linear-gradient(0deg, ${flavor.color}, ${flavor.color} 20px, #FAF6EE 20px, #FAF6EE 25px)` }}></div>
                    )}
                    {/* Textured overlays */}
                    {icingStyle === 'textured' && <div className="textured-overlay"></div>}
                    {/* Edge piping */}
                    {icingStyle === 'piped' && <div className="piping-rim top" style={{ backgroundColor: icingColor.hex }}></div>}
                    
                    {/* Custom Text on Top Tier */}
                    {customText && (
                      <div className={`tier-text ${textStyle} ${flavor.textDark || icingStyle !== 'naked' ? 'dark-font' : 'light-font'}`}>
                        {customText}
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
                    <div className="naked-stripes" style={{ background: `repeating-linear-gradient(0deg, ${flavor.color}, ${flavor.color} 30px, #FAF6EE 30px, #FAF6EE 35px)` }}></div>
                  )}
                  {icingStyle === 'textured' && <div className="textured-overlay"></div>}
                  {icingStyle === 'piped' && <div className="piping-rim bottom" style={{ backgroundColor: icingColor.hex }}></div>}
                  
                  {/* If single tier, custom text goes here */}
                  {tiers === 1 && customText && (
                    <div className={`tier-text ${textStyle} ${flavor.textDark || icingStyle !== 'naked' ? 'dark-font' : 'light-font'}`}>
                      {customText}
                    </div>
                  )}
                </div>

                {/* Render Toppings on Top of the Cake */}
                <div className="toppings-visual-container">
                  {toppings.includes('macarons') && (
                    <div className="topping-item macaron-topping animate-float">🍡🍡</div>
                  )}
                  {toppings.includes('flowers') && (
                    <div className="topping-item flower-topping">🌸🌹🌸</div>
                  )}
                  {toppings.includes('berries') && (
                    <div className="topping-item berry-topping">🍓🍒🫐</div>
                  )}
                  {toppings.includes('gold') && (
                    <div className="topping-item gold-topping animate-spin-slow">✨</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Configuration Panel */}
          <div className="builder-config glass-card">
            <h3 className="config-title">Bespoke Specifications</h3>
            
            {/* Tiers & Shape */}
            <div className="config-section">
              <span className="section-label">Dimensions & Tiers</span>
              <div className="option-row">
                <button 
                  className={`option-chip ${tiers === 1 ? 'active' : ''}`}
                  onClick={() => setTiers(1)}
                >
                  1 Tier (Serves 15)
                </button>
                <button 
                  className={`option-chip ${tiers === 2 ? 'active' : ''}`}
                  onClick={() => setTiers(2)}
                >
                  2 Tiers (Serves 40)
                </button>
              </div>
              <div className="option-row" style={{ marginTop: '0.8rem' }}>
                <button 
                  className={`option-chip ${shape === 'round' ? 'active' : ''}`}
                  onClick={() => setShape('round')}
                >
                  Elegant Round
                </button>
                <button 
                  className={`option-chip ${shape === 'square' ? 'active' : ''}`}
                  onClick={() => setShape('square')}
                >
                  Geometric Square
                </button>
              </div>
            </div>

            {/* Flavor Sponge Selection */}
            <div className="config-section">
              <span className="section-label">Sponge Cake Flavor</span>
              <div className="option-grid">
                {FLAVORS.map(f => (
                  <button 
                    key={f.id} 
                    className={`flavor-btn-item ${flavor.id === f.id ? 'active' : ''}`}
                    onClick={() => setFlavor(f)}
                  >
                    <span className="flavor-color-dot" style={{ backgroundColor: f.color }}></span>
                    <span className="flavor-name-label">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Icing Styling */}
            <div className="config-section">
              <span className="section-label">Outer Coating / Icing Style</span>
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
                <div style={{ marginTop: '1.2rem' }}>
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

            {/* Toppings / Embellishments */}
            <div className="config-section">
              <span className="section-label">Artisan Embellishments</span>
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
                      <span className="topping-title-label">{t.name}</span>
                      <span className="topping-price-label">+${t.price}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Personal Custom Script */}
            <div className="config-section">
              <span className="section-label">Personalized Scripting</span>
              <input 
                type="text" 
                placeholder="Congratulations, Happy Birthday, etc." 
                value={customText}
                onChange={(e) => setCustomText(e.target.value.substring(0, 24))}
                className="script-input"
              />
              {customText && (
                <div className="option-row" style={{ marginTop: '0.8rem' }}>
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

            {/* Price & Actions */}
            <div className="config-footer">
              <div className="price-box">
                <span className="price-label">Estimated Design Cost</span>
                <span className="price-amount">${totalPrice}</span>
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
