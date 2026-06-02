import React, { useState } from 'react';
import './PromoPopup.css';

export default function PromoPopup({ promo, onClose }) {
  const [copied, setCopied] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!promo || !promo.isActive) return null;

  const handleCopyCode = () => {
    if (!promo.couponCode) return;
    navigator.clipboard.writeText(promo.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseClick = () => {
    if (dontShowAgain) {
      localStorage.setItem(`luxe_promo_dismissed_${promo._id}`, 'true');
    }
    onClose();
  };

  return (
    <div className="promo-overlay flex-center animate-fade">
      <div className="promo-card glass-card text-center animate-zoom">
        <button className="promo-close-btn" onClick={handleCloseClick}>×</button>
        
        <div className="promo-tag-badge">Special Offer</div>
        
        {promo.discountText && (
          <div className="promo-discount-badge animate-pulse-glow">
            {promo.discountText}
          </div>
        )}
        
        <h3 className="promo-title font-display">{promo.title}</h3>
        <p className="promo-subtitle-text">{promo.subtitle}</p>

        {promo.couponCode && (
          <div className="promo-code-container" onClick={handleCopyCode}>
            <span className="code-label">PROMO CODE</span>
            <div className="code-box">
              <span className="code-text">{promo.couponCode}</span>
              <span className="copy-indicator">{copied ? 'Copied!' : 'Click to Copy'}</span>
            </div>
          </div>
        )}

        <div className="promo-footer-actions">
          <button className="btn-primary promo-cta-btn" onClick={handleCloseClick}>
            Unlock Discount
          </button>
          
          <label className="dont-show-checkbox">
            <input 
              type="checkbox" 
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span>Don't show this again</span>
          </label>
        </div>
      </div>
    </div>
  );
}
