import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const API_BASE = 'http://localhost:5000/api';

export default function AdminPanel({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  
  // View states
  const [activeTab, setActiveTab] = useState('stats'); // stats, inquiries, cakes, subscribers
  
  // Data states
  const [stats, setStats] = useState({ totalInquiries: 0, pendingInquiries: 0, totalSubscribers: 0, estimatedRevenue: '$0' });
  const [inquiries, setInquiries] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Cake manager states
  const [newCake, setNewCake] = useState({
    title: '', category: 'signature', price: '$85', description: '',
    image: '/wedding_cake.png', flavors: '', servings: '15-20 guests', highlights: ''
  });
  const [editingCakeId, setEditingCakeId] = useState(null);

  // Verification PIN Authentication
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === '1234') { // Admin PIN matching .env default
      setIsAuthenticated(true);
      setPinError('');
      fetchAdminData();
    } else {
      setPinError('Invalid security passcode. Access denied.');
      setPin('');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    const headers = { 'x-admin-pin': '1234' }; // Pass matching verification passcode
    try {
      // 1. Fetch Stats
      const statsRes = await fetch(`${API_BASE}/admin/stats`, { headers });
      const statsData = await statsRes.json();
      if (!statsData.error) setStats(statsData);

      // 2. Fetch Inquiries
      const inqRes = await fetch(`${API_BASE}/admin/inquiries`, { headers });
      const inqData = await inqRes.json();
      if (!inqData.error) setInquiries(inqData);

      // 3. Fetch Subscribers
      const subRes = await fetch(`${API_BASE}/admin/subscribers`, { headers });
      const subData = await subRes.json();
      if (!subData.error) setSubscribers(subData);

      // 4. Fetch Cakes (Public API)
      const cakeRes = await fetch(`${API_BASE}/cakes`);
      const cakeData = await cakeRes.json();
      if (!cakeData.error) setCakes(cakeData);

    } catch (err) {
      console.error('Error loading admin panel records:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update Inquiry Status
  const handleUpdateInquiryStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/admin/inquiries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': '1234'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      if (!updated.error) {
        setInquiries(prev => prev.map(item => item._id === id ? { ...item, status: newStatus } : item));
        // Refresh stats
        const statsRes = await fetch(`${API_BASE}/admin/stats`, { headers: { 'x-admin-pin': '1234' } });
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to update inquiry status:', err.message);
    }
  };

  // Delete Cake Creation
  const handleDeleteCake = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cake from the catalog?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/cakes/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': '1234' }
      });
      if (res.ok) {
        setCakes(prev => prev.filter(c => c._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete cake:', err.message);
    }
  };

  // Add/Update Cake Submission
  const handleCakeSubmit = async (e) => {
    e.preventDefault();
    const headers = {
      'Content-Type': 'application/json',
      'x-admin-pin': '1234'
    };
    
    // Parse highlights string to array
    const highlightArr = newCake.highlights.split(',').map(h => h.trim()).filter(Boolean);
    const payload = { ...newCake, highlights: highlightArr };

    try {
      if (editingCakeId) {
        // PUT edit cake
        const res = await fetch(`${API_BASE}/admin/cakes/${editingCakeId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.error) {
          setCakes(prev => prev.map(c => c._id === editingCakeId ? data : c));
          setEditingCakeId(null);
          resetCakeForm();
        }
      } else {
        // POST create cake
        const res = await fetch(`${API_BASE}/admin/cakes`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.error) {
          setCakes(prev => [...prev, data]);
          resetCakeForm();
        }
      }
    } catch (err) {
      console.error('Error submitting cake:', err.message);
    }
  };

  const handleEditCakeClick = (cake) => {
    setEditingCakeId(cake._id);
    setNewCake({
      title: cake.title,
      category: cake.category,
      price: cake.price,
      description: cake.description,
      image: cake.image,
      flavors: cake.flavors,
      servings: cake.servings,
      highlights: cake.highlights.join(', ')
    });
  };

  const resetCakeForm = () => {
    setNewCake({
      title: '', category: 'signature', price: '$85', description: '',
      image: '/wedding_cake.png', flavors: '', servings: '15-20 guests', highlights: ''
    });
    setEditingCakeId(null);
  };

  return (
    <div className="admin-wrapper flex-center">
      {/* PIN Access Gate overlay */}
      {!isAuthenticated ? (
        <div className="pin-gate-card glass-card text-center animate-fade">
          <div className="lock-icon">🔒</div>
          <h3>LuxeControl Admin Panel</h3>
          <p>Please enter your 4-digit administrator PIN to proceed.</p>
          <form onSubmit={handlePinSubmit} className="pin-form">
            <input 
              type="password" 
              maxLength="4"
              value={pin}
              placeholder="••••"
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
              autoFocus
            />
            {pinError && <span className="pin-error-msg">{pinError}</span>}
            <div className="pin-gate-actions">
              <button type="submit" className="btn-primary">Unlock Panel</button>
              <button type="button" className="btn-secondary" onClick={onClose}>Exit</button>
            </div>
          </form>
        </div>
      ) : (
        // Main Admin Dashboard
        <div className="admin-dashboard-container glass-card">
          <header className="admin-header">
            <div className="admin-title-area">
              <h2>LuxeLayers Control Suite</h2>
              <span className="admin-status-badge">Live Connection</span>
            </div>
            <button className="btn-secondary admin-close-btn" onClick={onClose}>
              Back to Client View
            </button>
          </header>

          <div className="admin-layout">
            {/* Sidebar navigation */}
            <aside className="admin-sidebar">
              <button className={`sidebar-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
                📊 Dashboard Metrics
              </button>
              <button className={`sidebar-tab ${activeTab === 'inquiries' ? 'active' : ''}`} onClick={() => setActiveTab('inquiries')}>
                💌 Booking Inquiries ({inquiries.length})
              </button>
              <button className={`sidebar-tab ${activeTab === 'cakes' ? 'active' : ''}`} onClick={() => setActiveTab('cakes')}>
                🍰 Catalog Manager ({cakes.length})
              </button>
              <button className={`sidebar-tab ${activeTab === 'subscribers' ? 'active' : ''}`} onClick={() => setActiveTab('subscribers')}>
                👥 Newsletter Club ({subscribers.length})
              </button>
            </aside>

            {/* Main content body */}
            <main className="admin-content-view">
              {loading ? (
                <div className="admin-loading flex-center">
                  <div className="whisk-loader"></div>
                  <p>Loading database collection records...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: Metrics stats */}
                  {activeTab === 'stats' && (
                    <div className="tab-viewstats animate-fade">
                      <h3 className="tab-title font-display">System Overview</h3>
                      <div className="metrics-grid">
                        <div className="metric-tile glass-card">
                          <span className="metric-title-label">Total Inquiries</span>
                          <span className="metric-value">{stats.totalInquiries}</span>
                        </div>
                        <div className="metric-tile glass-card">
                          <span className="metric-title-label">Pending Reviews</span>
                          <span className="metric-value pending-count">{stats.pendingInquiries}</span>
                        </div>
                        <div className="metric-tile glass-card">
                          <span className="metric-title-label">Subscribers</span>
                          <span className="metric-value">{stats.totalSubscribers}</span>
                        </div>
                        <div className="metric-tile glass-card">
                          <span className="metric-title-label">Estimated Revenue</span>
                          <span className="metric-value gold-text">{stats.estimatedRevenue}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Inquiries Manager */}
                  {activeTab === 'inquiries' && (
                    <div className="tab-viewinquiries animate-fade">
                      <h3 className="tab-title">Manage Customer Bookings</h3>
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Ref Code</th>
                              <th>Date</th>
                              <th>Client</th>
                              <th>Fulfillment</th>
                              <th>Items Count</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inquiries.map(inq => (
                              <tr key={inq._id}>
                                <td className="ref-code-cell">{inq.referenceCode}</td>
                                <td>{inq.date}</td>
                                <td>
                                  <div className="client-cell-info">
                                    <strong>{inq.name}</strong>
                                    <span>{inq.email} | {inq.phone}</span>
                                  </div>
                                </td>
                                <td>{inq.serviceType === 'delivery' ? `🚚 Delivery` : `🛍️ Pickup`}</td>
                                <td>
                                  <div className="order-items-tooltip">
                                    {inq.items.length} items
                                    <div className="tooltip-details-text">
                                      {inq.items.map((i, index) => (
                                        <div key={index}>• {i.name} ({i.price})</div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className={`status-badge-val ${inq.status.toLowerCase()}`}>
                                    {inq.status}
                                  </span>
                                </td>
                                <td>
                                  <select 
                                    value={inq.status}
                                    onChange={(e) => handleUpdateInquiryStatus(inq._id, e.target.value)}
                                    className="status-selector-dropdown"
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approve</option>
                                    <option value="Completed">Complete</option>
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Catalog Manager */}
                  {activeTab === 'cakes' && (
                    <div className="tab-viewcakes animate-fade">
                      <div className="cakes-tab-header">
                        <h3 className="tab-title">Catalog Cake Collection</h3>
                        {editingCakeId && (
                          <button className="btn-secondary" onClick={resetCakeForm}>Cancel Editing</button>
                        )}
                      </div>

                      {/* Add/Edit Cake Form */}
                      <form onSubmit={handleCakeSubmit} className="cake-editor-form glass-card">
                        <h4 className="form-sub-heading">{editingCakeId ? 'Edit Product Configuration' : 'Introduce New Creation'}</h4>
                        <div className="form-inputs-grid">
                          <input 
                            type="text" placeholder="Title (e.g. Peach Royal)"
                            value={newCake.title} required
                            onChange={(e) => setNewCake(prev => ({ ...prev, title: e.target.value }))}
                          />
                          <input 
                            type="text" placeholder="Price (e.g. $95)"
                            value={newCake.price} required
                            onChange={(e) => setNewCake(prev => ({ ...prev, price: e.target.value }))}
                          />
                          <select 
                            value={newCake.category}
                            onChange={(e) => setNewCake(prev => ({ ...prev, category: e.target.value }))}
                          >
                            <option value="weddings">Weddings</option>
                            <option value="chocolate">Chocolate</option>
                            <option value="seasonal">Seasonal</option>
                            <option value="signature">Signature</option>
                          </select>
                          <input 
                            type="text" placeholder="Servings (e.g. 15-20 guests)"
                            value={newCake.servings} required
                            onChange={(e) => setNewCake(prev => ({ ...prev, servings: e.target.value }))}
                          />
                          <input 
                            type="text" placeholder="Flavors (e.g. Lemon & Lavender)"
                            value={newCake.flavors} required
                            onChange={(e) => setNewCake(prev => ({ ...prev, flavors: e.target.value }))}
                          />
                          <input 
                            type="text" placeholder="Image Path (e.g. /wedding_cake.png)"
                            value={newCake.image} required
                            onChange={(e) => setNewCake(prev => ({ ...prev, image: e.target.value }))}
                          />
                        </div>
                        <input 
                          type="text" placeholder="Highlights list (comma separated, e.g. Gold flakes, Organic berries, Cream filling)"
                          value={newCake.highlights} required
                          onChange={(e) => setNewCake(prev => ({ ...prev, highlights: e.target.value }))}
                          style={{ width: '100%', marginTop: '1rem' }}
                        />
                        <textarea 
                          placeholder="Detailed description of the creation..."
                          value={newCake.description} required
                          onChange={(e) => setNewCake(prev => ({ ...prev, description: e.target.value }))}
                          style={{ width: '100%', marginTop: '1rem' }}
                          rows="2"
                        ></textarea>
                        <button type="submit" className="btn-primary form-submit-cake-btn">
                          {editingCakeId ? 'Apply Update' : 'Save New Creation'}
                        </button>
                      </form>

                      {/* Cakes List */}
                      <div className="cakes-catalog-list">
                        {cakes.map(cake => (
                          <div key={cake._id} className="cake-catalog-item-card glass-card">
                            <img src={cake.image} alt={cake.title} className="catalog-item-img" />
                            <div className="catalog-item-info">
                              <span className="catalog-item-cat">{cake.category}</span>
                              <h4 className="catalog-item-title">{cake.title}</h4>
                              <span className="catalog-item-price">{cake.price}</span>
                            </div>
                            <div className="catalog-item-actions">
                              <button className="btn-secondary" onClick={() => handleEditCakeClick(cake)}>Edit</button>
                              <button className="btn-primary delete-btn" onClick={() => handleDeleteCake(cake._id)}>Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Newsletter Subscribers */}
                  {activeTab === 'subscribers' && (
                    <div className="tab-viewsubscribers animate-fade">
                      <div className="subscribers-header">
                        <h3 className="tab-title">Newsletter Club Members</h3>
                        <button 
                          className="btn-secondary"
                          onClick={() => {
                            const emailList = subscribers.map(s => s.email).join('\n');
                            navigator.clipboard.writeText(emailList);
                            alert('Subscribers emails list copied to clipboard!');
                          }}
                        >
                          Copy Emails List
                        </button>
                      </div>
                      <div className="subscribers-list-view">
                        {subscribers.map(sub => (
                          <div key={sub._id} className="subscriber-email-row glass-card">
                            <span className="email-addr">{sub.email}</span>
                            <span className="sub-date">Subscribed: {new Date(sub.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
