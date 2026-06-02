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
  getStats,
  getActivePromotion,
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getUsers,
  registerUser,
  loginUser,
  socialAuthUser
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
// PUBLIC APIs - CATALOG & BOOKINGS
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
// PUBLIC APIs - MARKETING PROMOTIONS & AUTH
// ==========================================

// GET the active promotion popup banner
app.get('/api/promotions/active', async (req, res) => {
  try {
    const activePromo = await getActivePromotion();
    res.json(activePromo || { message: 'No active promotions' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const newUser = await registerUser({ name, email, password });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST user login authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const authenticatedUser = await loginUser(email, password);
    res.json(authenticatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST social authentication callback (Google / Facebook Auth profile save)
app.post('/api/auth/social', async (req, res) => {
  try {
    const { name, email, provider, providerId, avatar } = req.body;
    if (!name || !email || !provider || !providerId) {
      return res.status(400).json({ error: 'Social authentication profile data missing' });
    }

    const user = await socialAuthUser({ name, email, provider, providerId, avatar });
    res.json(user);
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

// GET all promotions for Campaign Manager
app.get('/api/admin/promotions', adminAuth, async (req, res) => {
  try {
    const promotions = await getPromotions();
    res.json(promotions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new promotion banner
app.post('/api/admin/promotions', adminAuth, async (req, res) => {
  try {
    const newPromo = await createPromotion(req.body);
    res.status(201).json(newPromo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update campaign promotion banner
app.put('/api/admin/promotions/:id', adminAuth, async (req, res) => {
  try {
    const updated = await updatePromotion(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE campaign promotion banner
app.delete('/api/admin/promotions/:id', adminAuth, async (req, res) => {
  try {
    const result = await deletePromotion(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    res.json({ message: 'Promotion deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all registered users for Admin panel
app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`LuxeLayers Server running on port ${PORT}`);
});
