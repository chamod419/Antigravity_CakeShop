import React, { useState, useEffect } from 'react';
import './OrderTracker.css';

const API_BASE = 'http://localhost:5000/api';

export default function OrderTracker({ currentUser, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchUserOrders = async () => {
    if (!currentUser || !currentUser.email) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/users/orders?email=${encodeURIComponent(currentUser.email)}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setOrders(data);
      }
    } catch (err) {
      setError('Connection failure. Could not load your bookings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [currentUser]);

  const handleCopyRef = (refCode) => {
    navigator.clipboard.writeText(refCode);
    setCopiedId(refCode);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getOrderStatusStep = (status) => {
    // Returns active step: 1 = Pending approval, 2 = Baking, 3 = Completed/Ready
    switch (status) {
      case 'Pending':
        return 1;
      case 'Approved':
        return 2;
      case 'Completed':
        return 3;
      default:
        return 1;
    }
  };

  const calculateTotal = (items) => {
    let total = 0;
    items.forEach(item => {
      const priceVal = parseFloat(item.price.replace('$', ''));
      if (!isNaN(priceVal)) {
        total += priceVal;
      }
    });
    return `$${total}`;
  };

  return (
    <div className="order-tracker-overlay flex-center">
      <div className="order-tracker-container glass-card animate-fade">
        <header className="tracker-header">
          <div className="tracker-title-area">
            <h2 className="font-display text-gradient">Your Boutique Bookings</h2>
            <p className="tracker-subtitle">Real-time fulfillment tracking for {currentUser.name}</p>
          </div>
          <button className="btn-secondary close-tracker-btn" onClick={onClose}>
            ✕ Close
          </button>
        </header>

        <div className="tracker-content">
          {loading ? (
            <div className="tracker-loading flex-center">
              <div className="whisk-loader"></div>
              <p>Fetching your order files...</p>
            </div>
          ) : error ? (
            <div className="tracker-error text-center">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button className="btn-primary" onClick={fetchUserOrders}>Try Again</button>
            </div>
          ) : orders.length === 0 ? (
            <div className="tracker-empty text-center">
              <span className="empty-icon">🍰</span>
              <h3>No Bookings Found</h3>
              <p>You haven't submitted any cake design inquiries yet. Create a masterpiece in the Designer or pick from our Collection!</p>
              <button className="btn-primary" onClick={onClose}>Explore Cakes</button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => {
                const currentStep = getOrderStatusStep(order.status);
                return (
                  <div key={order._id} className="order-card glass-card">
                    {/* Order Meta Header */}
                    <div className="order-card-header">
                      <div className="order-ref-group">
                        <span className="order-ref-label">Reference</span>
                        <div className="ref-code-wrapper">
                          <span className="order-ref-code">{order.referenceCode}</span>
                          <button 
                            className="btn-copy-ref" 
                            onClick={() => handleCopyRef(order.referenceCode)}
                            title="Copy reference code"
                          >
                            {copiedId === order.referenceCode ? '✓ Copied' : '📋'}
                          </button>
                        </div>
                      </div>

                      <div className="order-meta-info">
                        <div>
                          <span className="meta-label">Celebration Date</span>
                          <span className="meta-value">{new Date(order.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div>
                          <span className="meta-label">Fulfillment</span>
                          <span className="meta-value fulfillment-badge">
                            {order.serviceType === 'delivery' ? '🚚 Luxury Delivery' : '🛍️ Boutique Pickup'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Visualizer */}
                    <div className="order-timeline-wrapper">
                      <div className="timeline-progress-bar">
                        <div 
                          className="progress-line-fill" 
                          style={{ width: `${(currentStep / 3) * 100}%` }}
                        ></div>
                      </div>
                      
                      <div className="timeline-nodes">
                        {/* Node 1 */}
                        <div className={`timeline-node ${currentStep >= 1 ? 'done' : ''}`}>
                          <div className="node-icon">✓</div>
                          <span className="node-title">Order Placed</span>
                          <span className="node-desc">Inquiry received</span>
                        </div>

                        {/* Node 2 */}
                        <div className={`timeline-node ${currentStep > 1 ? 'done' : currentStep === 1 ? 'active' : ''}`}>
                          <div className="node-icon">{currentStep > 1 ? '✓' : '•'}</div>
                          <span className="node-title">Verification</span>
                          <span className="node-desc">{currentStep === 1 ? 'Details checking' : 'Details verified'}</span>
                        </div>

                        {/* Node 3 */}
                        <div className={`timeline-node ${currentStep > 2 ? 'done' : currentStep === 2 ? 'active' : ''}`}>
                          <div className="node-icon">{currentStep > 2 ? '✓' : '👩‍🍳'}</div>
                          <span className="node-title">Baking & Decor</span>
                          <span className="node-desc">{currentStep === 2 ? 'In the oven' : currentStep > 2 ? 'Decorated' : 'Upcoming'}</span>
                        </div>

                        {/* Node 4 */}
                        <div className={`timeline-node ${currentStep === 3 ? 'done' : ''}`}>
                          <div className="node-icon">✨</div>
                          <span className="node-title">Ready</span>
                          <span className="node-desc">{order.serviceType === 'delivery' ? 'Out for delivery' : 'Ready for pickup'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Details Accordion / Summary */}
                    <div className="order-details-summary">
                      <div className="details-items-section">
                        <h4>Items in Booking ({order.items.length})</h4>
                        <div className="details-items-list">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="summary-item-row">
                              <div className="summary-item-img-box">
                                <img src={item.image} alt={item.name} className="summary-item-img" />
                              </div>
                              <div className="summary-item-meta">
                                <span className="summary-item-type">{item.type}</span>
                                <strong>{item.name}</strong>
                                <span className="summary-item-desc">{item.details}</span>
                              </div>
                              <span className="summary-item-price">{item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="details-footer-grid">
                        {order.serviceType === 'delivery' && (
                          <div className="fulfillment-address-block">
                            <strong>Luxury Delivery Address</strong>
                            <p>{order.address}</p>
                          </div>
                        )}
                        {order.notes && (
                          <div className="customer-notes-block">
                            <strong>Special Requests / Notes</strong>
                            <p>"{order.notes}"</p>
                          </div>
                        )}
                        <div className="order-total-block">
                          <span className="total-label">Subtotal Price</span>
                          <span className="total-value">{calculateTotal(order.items)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
