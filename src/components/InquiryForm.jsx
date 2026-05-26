import React, { useState } from 'react';
import './InquiryForm.css';

export default function InquiryForm({ inquiryList = [], onRemoveItem, onClearInquiry, onBookingSubmit, onNavigate }) {
  const [step, setStep] = useState(1); // 1, 2, 3 (Success)
  const [successData, setSuccessData] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    serviceType: 'delivery',
    address: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{8,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = 'Celebration date is required';
    if (formData.serviceType === 'delivery' && !formData.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep2()) {
      setIsSubmitting(true);
      const result = await onBookingSubmit(formData);
      setIsSubmitting(false);
      if (result) {
        setSuccessData(result);
        setStep(3); // Success Screen
      } else {
        setErrors(prev => ({ ...prev, submit: 'Server integration failure. Please try again.' }));
      }
    }
  };

  const handleSuccessClose = () => {
    onClearInquiry();
    setStep(1);
    setSuccessData(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      date: '',
      serviceType: 'delivery',
      address: '',
      notes: ''
    });
    onNavigate('hero');
  };

  return (
    <section className="inquiry-section section-padding" id="inquiry">
      <div className="container">
        <div className="inquiry-header text-center">
          <span className="inquiry-subtitle">SECURE YOUR BOOKING</span>
          <h2 className="inquiry-title">Inquiry Basket & Booking</h2>
          <p className="inquiry-description-text">Review your selected designs and submit your details. Our cake concierge will contact you within 24 hours.</p>
        </div>

        {inquiryList.length === 0 && step !== 3 ? (
          <div className="empty-basket-view glass-card flex-center">
            <span className="basket-emoji">🎂</span>
            <h3>Your Inquiry Basket is Empty</h3>
            <p>Select an artisan cake from our Collection or build your own to begin.</p>
            <div className="empty-basket-actions">
              <button className="btn-primary" onClick={() => onNavigate('builder')}>Go to Designer</button>
              <button className="btn-secondary" onClick={() => onNavigate('gallery')}>Browse Collection</button>
            </div>
          </div>
        ) : (
          step !== 3 && (
            <div className="inquiry-grid">
              {/* Basket list column */}
              <div className="inquiry-basket-column glass-card">
                <h3 className="column-title">Selected Designs ({inquiryList.length})</h3>
                <div className="basket-items-list">
                  {inquiryList.map(item => (
                    <div key={item.id} className="basket-item-card">
                      <img src={item.image} alt={item.name} className="basket-item-img" />
                      <div className="basket-item-info">
                        <span className="basket-item-type">{item.type}</span>
                        <h4 className="basket-item-title">{item.name}</h4>
                        <p className="basket-item-details">{item.details}</p>
                        <span className="basket-item-price">{item.price}</span>
                      </div>
                      <button 
                        className="remove-item-btn" 
                        onClick={() => onRemoveItem(item.id)}
                        aria-label="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form columns */}
              <div className="inquiry-form-column glass-card">
                {/* Form Progress indicators */}
                <div className="form-steps-indicator">
                  <div className={`step-node ${step >= 1 ? 'active' : ''}`}>1. Client Info</div>
                  <div className="step-connector"></div>
                  <div className={`step-node ${step >= 2 ? 'active' : ''}`}>2. Event Details</div>
                </div>

                <form onSubmit={handleSubmit} className="booking-form">
                  {step === 1 && (
                    <div className="form-step-content animate-fade">
                      <div className="input-field">
                        <label htmlFor="name">Full Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          placeholder="Lord/Lady Velvet"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="field-error">{errors.name}</span>}
                      </div>

                      <div className="input-field">
                        <label htmlFor="email">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          placeholder="you@luxe.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="field-error">{errors.email}</span>}
                      </div>

                      <div className="input-field">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          placeholder="+1 (555) 019-2834"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={errors.phone ? 'error' : ''}
                        />
                        {errors.phone && <span className="field-error">{errors.phone}</span>}
                      </div>

                      <button type="button" className="btn-primary form-nav-btn" onClick={handleNextStep}>
                        Continue to Event Details
                      </button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="form-step-content animate-fade">
                      <div className="input-field">
                        <label htmlFor="date">Celebration Date</label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className={errors.date ? 'error' : ''}
                        />
                        {errors.date && <span className="field-error">{errors.date}</span>}
                      </div>

                      <div className="input-field">
                        <label>Fulfillment Type</label>
                        <div className="radio-group">
                          <label className={`radio-chip ${formData.serviceType === 'delivery' ? 'checked' : ''}`}>
                            <input 
                              type="radio" 
                              name="serviceType" 
                              value="delivery" 
                              checked={formData.serviceType === 'delivery'} 
                              onChange={handleInputChange} 
                            />
                            Luxury Delivery
                          </label>
                          <label className={`radio-chip ${formData.serviceType === 'pickup' ? 'checked' : ''}`}>
                            <input 
                              type="radio" 
                              name="serviceType" 
                              value="pickup" 
                              checked={formData.serviceType === 'pickup'} 
                              onChange={handleInputChange} 
                            />
                            Boutique Pickup
                          </label>
                        </div>
                      </div>

                      {formData.serviceType === 'delivery' && (
                        <div className="input-field">
                          <label htmlFor="address">Delivery Address</label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            placeholder="123 Velvet Avenue, Suite 100"
                            value={formData.address}
                            onChange={handleInputChange}
                            className={errors.address ? 'error' : ''}
                          />
                          {errors.address && <span className="field-error">{errors.address}</span>}
                        </div>
                      )}

                      <div className="input-field">
                        <label htmlFor="notes">Special Creative Requests / Allergies</label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows="3"
                          placeholder="Please note any dietary restrictions or bespoke layout requests here..."
                          value={formData.notes}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>

                      {errors.submit && <span className="field-error" style={{ textAlign: 'center' }}>{errors.submit}</span>}

                      <div className="form-nav-buttons-row">
                        <button type="button" className="btn-secondary" onClick={handlePrevStep}>
                          Back
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                          {isSubmitting ? 'Securing Connection...' : 'Submit Inquiry Request'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )
        )}

        {/* Full Screen Success Overlay Modal */}
        {step === 3 && successData && (
          <div className="success-overlay flex-center animate-fade">
            <div className="success-card glass-card text-center">
              <div className="success-icon-badge">✓</div>
              <h3 className="success-card-title">Inquiry Sent Successfully</h3>
              <p className="success-card-desc">
                Thank you, <strong>{successData.name}</strong>. Your inquiry has been registered. A details copy has been sent to <strong>{successData.email}</strong>.
              </p>
              
              <div className="reference-code-box">
                <span className="ref-label">Inquiry Reference Code</span>
                <span className="ref-code">{successData.referenceCode}</span>
              </div>

              <p className="success-next-steps">Our artisan cake concierge will call/email you shortly to finalize details and deposit information.</p>
              
              <button className="btn-primary success-home-btn" onClick={handleSuccessClose}>
                Return to Gallery
              </button>
            </div>
            <div className="success-confetti">🎉✨🎊🎈</div>
          </div>
        )}
      </div>
    </section>
  );
}
