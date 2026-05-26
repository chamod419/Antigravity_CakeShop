import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  initializeDB, 
  getCakes, 
  createCake, 
  updateCake, 
  deleteCake, 
  getInquiries, 
  createInquiry, 
  updateInquiry, 
  getSubscribers, 
  createSubscriber, 
  getStats 
} from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/luxelayers';
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database connection (Local File fallback handled inside db.js)
initializeDB(MONGO_URI);

// Admin Authentication Middleware
const adminAuth = (req, res, next) => {
  const requestPin = req.headers['x-admin-pin'];
  if (requestPin === ADMIN_PIN) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid Admin PIN' });
  }
};

// ==========================================
// PUBLIC APIs
// ==========================================

// GET all cakes for the catalog
app.get('/api/cakes', async (req, res) => {
  try {
    const cakes = await getCakes();
    res.json(cakes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new inquiry booking
app.post('/api/inquiries', async (req, res) => {
  try {
    const { name, email, phone, date, serviceType, address, notes, items, referenceCode } = req.body;
    
    if (!name || !email || !phone || !date || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required inquiry details' });
    }

    const ref = referenceCode || `LL-${Math.floor(100000 + Math.random() * 900000)}`;
    const newInquiry = await createInquiry({
      name,
      email,
      phone,
      date,
      serviceType,
      address,
      notes,
      items,
      referenceCode: ref
    });

    res.status(201).json(newInquiry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST newsletter subscription
app.post('/api/subscribers', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await createSubscriber(email);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMINISTRATIVE APIs (Protected by Admin PIN)
// ==========================================

// GET server stats for Admin Panel
app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all inquiries for Admin Panel
app.get('/api/admin/inquiries', adminAuth, async (req, res) => {
  try {
    const inquiries = await getInquiries();
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update inquiry status (Pending -> Approved -> Completed)
app.put('/api/admin/inquiries/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = await updateInquiry(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new cake creation to Catalog
app.post('/api/admin/cakes', adminAuth, async (req, res) => {
  try {
    const newCake = await createCake(req.body);
    res.status(201).json(newCake);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a cake in Catalog
app.put('/api/admin/cakes/:id', adminAuth, async (req, res) => {
  try {
    const updated = await updateCake(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Cake not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a cake from Catalog
app.delete('/api/admin/cakes/:id', adminAuth, async (req, res) => {
  try {
    const result = await deleteCake(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Cake not found' });
    }
    res.json({ message: 'Cake deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all newsletter subscribers
app.get('/api/admin/subscribers', adminAuth, async (req, res) => {
  try {
    const subscribers = await getSubscribers();
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`LuxeLayers Server running on port ${PORT}`);
});
