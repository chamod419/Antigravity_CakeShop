import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const API_BASE = 'http://localhost:5000/api';

export default function AdminPanel({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  
  // View states
  const [activeTab, setActiveTab] = useState('stats'); // stats, inquiries, cakes, subscribers, promotions, users
  
  // Data states
  const [stats, setStats] = useState({ totalInquiries: 0, pendingInquiries: 0, totalSubscribers: 0, estimatedRevenue: '$0' });
  const [inquiries, setInquiries] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Cake manager states
  const [newCake, setNewCake] = useState({
    title: '', category: 'signature', price: '$85', description: '',
    image: '/wedding_cake.png', flavors: '', servings: '15-20 guests', highlights: ''
  });
  const [editingCakeId, setEditingCakeId] = useState(null);

  // Promotion campaign manager states
  const [newPromo, setNewPromo] = useState({
    title: '', subtitle: '', discountText: '15% OFF', couponCode: '',
    image: '/chocolate_cake.png', isActive: true
  });
  const [editingPromoId, setEditingPromoId] = useState(null);

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
    const headers = { 'x-admin-pin': '1234' };
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

      // 5. Fetch Promotions
      const promoRes = await fetch(`${API_BASE}/admin/promotions`, { headers });
      const promoData = await promoRes.json();
      if (!promoData.error) setPromotions(promoData);

      // 6. Fetch Users
      const userRes = await fetch(`${API_BASE}/admin/users`, { headers });
      const userData = await userRes.json();
      if (!userData.error) setUsers(userData);

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

  // ==========================================
  // CATALOG MANAGER CRUD - CAKES
  // ==========================================
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

  const handleCakeSubmit = async (e) => {
    e.preventDefault();
    const headers = {
      'Content-Type': 'application/json',
      'x-admin-pin': '1234'
    };
    
    const highlightArr = newCake.highlights.split(',').map(h => h.trim()).filter(Boolean);
    const payload = { ...newCake, highlights: highlightArr };

    try {
      if (editingCakeId) {
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

  // ==========================================
  // CAMPAIGN PROMOTION MANAGER CRUD
  // ==========================================
  const handleDeletePromotion = async (id) => {
    if (!window.confirm('Delete this promotion from active announcements list?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/promotions/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': '1234' }
      });
      if (res.ok) {
        setPromotions(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete promotion:', err.message);
    }
  };

  const handlePromotionSubmit = async (e) => {
    e.preventDefault();
    const headers = {
      'Content-Type': 'application/json',
      'x-admin-pin': '1234'
    };

    try {
      if (editingPromoId) {
        // PUT edit promo
        const res = await fetch(`${API_BASE}/admin/promotions/${editingPromoId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(newPromo)
        });
        const data = await res.json();
        if (!data.error) {
          setPromotions(prev => prev.map(p => p._id === editingPromoId ? data : p));
          setEditingPromoId(null);
          resetPromoForm();
        }
      } else {
        // POST create promo
        const res = await fetch(`${API_BASE}/admin/promotions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(newPromo)
        });
        const data = await res.json();
        if (!data.error) {
          setPromotions(prev => [data, ...prev]);
          resetPromoForm();
        }
      }
    } catch (err) {
      console.error('Error submitting promotion:', err.message);
    }
  };

  const handleTogglePromoActive = async (promo) => {
    try {
      const res = await fetch(`${API_BASE}/admin/promotions/${promo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': '1234'
        },
        body: JSON.stringify({ isActive: !promo.isActive })
      });
      const data = await res.json();
      if (!data.error) {
        setPromotions(prev => prev.map(p => p._id === promo._id ? data : p));
      }
    } catch (err) {
      console.error('Failed to toggle promotion active status:', err.message);
    }
  };

  const handleEditPromoClick = (promo) => {
    setEditingPromoId(promo._id);
    setNewPromo({
      title: promo.title,
      subtitle: promo.subtitle || '',
      discountText: promo.discountText || '',
      couponCode: promo.couponCode || '',
      image: promo.image || '/chocolate_cake.png',
      isActive: promo.isActive
    });
  };

  const resetPromoForm = () => {
    setNewPromo({
      title: '', subtitle: '', discountText: '15% OFF', couponCode: '',
      image: '/chocolate_cake.png', isActive: true
    });
    setEditingPromoId(null);
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
              <button className={`sidebar-tab ${activeTab === 'promotions' ? 'active' : ''}`} onClick={() => setActiveTab('promotions')}>
                🎁 Campaign Promos ({promotions.length})
              </button>
              <button className={`sidebar-tab ${activeTab === 'subscribers' ? 'active' : ''}`} onClick={() => setActiveTab('subscribers')}>
                👥 Newsletter Club ({subscribers.length})
              </button>
              <button className={`sidebar-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                👑 Customers List ({users.length})
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

                  {/* TAB 4: Campaign Promotions Manager */}
                  {activeTab === 'promotions' && (
                    <div className="tab-viewpromotions animate-fade">
                      <div className="cakes-tab-header">
                        <h3 className="tab-title">Announcements & Promotions</h3>
                        {editingPromoId && (
                          <button className="btn-secondary" onClick={resetPromoForm}>Cancel Editing</button>
                        )}
                      </div>

                      {/* Add/Edit Promotion Form */}
                      <form onSubmit={handlePromotionSubmit} className="cake-editor-form glass-card">
                        <h4 className="form-sub-heading">{editingPromoId ? 'Edit Campaign Banner' : 'Create New Promotional Popup'}</h4>
                        <div className="form-inputs-grid">
                          <input 
                            type="text" placeholder="Promo Title (e.g. Winter Delicacy)"
                            value={newPromo.title} required
                            onChange={(e) => setNewPromo(prev => ({ ...prev, title: e.target.value }))}
                          />
                          <input 
                            type="text" placeholder="Discount Text (e.g. 15% OFF)"
                            value={newPromo.discountText}
                            onChange={(e) => setNewPromo(prev => ({ ...prev, discountText: e.target.value }))}
                          />
                          <input 
                            type="text" placeholder="Coupon Code (e.g. WELCOME15)"
                            value={newPromo.couponCode}
                            onChange={(e) => setNewPromo(prev => ({ ...prev, couponCode: e.target.value }))}
                          />
                          <input 
                            type="text" placeholder="Subtitle description notes..."
                            value={newPromo.subtitle}
                            onChange={(e) => setNewPromo(prev => ({ ...prev, subtitle: e.target.value }))}
                            style={{ gridColumn: 'span 2' }}
                          />
                          <input 
                            type="text" placeholder="Image URL (e.g. /chocolate_cake.png)"
                            value={newPromo.image}
                            onChange={(e) => setNewPromo(prev => ({ ...prev, image: e.target.value }))}
                          />
                        </div>
                        <button type="submit" className="btn-primary form-submit-cake-btn">
                          {editingPromoId ? 'Apply Updates' : 'Publish Promotion'}
                        </button>
                      </form>

                      {/* Promotions List */}
                      <div className="cakes-catalog-list">
                        {promotions.map(promo => (
                          <div key={promo._id} className="cake-catalog-item-card glass-card">
                            <div className="catalog-item-info">
                              <span className="catalog-item-cat" style={{ color: promo.isActive ? '#27ae60' : '#7f8c8d' }}>
                                {promo.isActive ? '● Active Announcement' : '○ Inactive/Hidden'}
                              </span>
                              <h4 className="catalog-item-title">{promo.title}</h4>
                              <span className="catalog-item-price" style={{ fontSize: '0.85rem' }}>
                                Code: <strong>{promo.couponCode || 'N/A'}</strong> | Discount: {promo.discountText || 'N/A'}
                              </span>
                            </div>
                            <div className="catalog-item-actions">
                              <button 
                                className="btn-secondary"
                                onClick={() => handleTogglePromoActive(promo)}
                                style={{ background: promo.isActive ? '#f39c12' : '#27ae60', color: 'white', borderColor: 'transparent' }}
                              >
                                {promo.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button className="btn-secondary" onClick={() => handleEditPromoClick(promo)}>Edit</button>
                              <button className="btn-primary delete-btn" onClick={() => handleDeletePromotion(promo._id)}>Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: Newsletter Subscribers */}
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

                  {/* TAB 6: Users List */}
                  {activeTab === 'users' && (
                    <div className="tab-viewusers animate-fade">
                      <h3 className="tab-title">Boutique Accounts Members</h3>
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Avatar</th>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Login Type</th>
                              <th>Registration Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map(usr => (
                              <tr key={usr._id}>
                                <td>
                                  {usr.avatar ? (
                                    <img src={usr.avatar} alt={usr.name} className="catalog-item-img" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                  ) : (
                                    <span className="navbar-avatar-initial" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>{usr.name.charAt(0)}</span>
                                  )}
                                </td>
                                <td><strong>{usr.name}</strong></td>
                                <td>{usr.email}</td>
                                <td>
                                  <span className={`status-badge-val provider-${usr.provider || 'local'}`} style={{
                                    background: usr.provider === 'google' ? '#4285F4' : usr.provider === 'facebook' ? '#1877F2' : '#2a0b15',
                                    color: 'white'
                                  }}>
                                    {usr.provider || 'local'}
                                  </span>
                                </td>
                                <td>{new Date(usr.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
