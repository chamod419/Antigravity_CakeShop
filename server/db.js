import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Cake from './models/Cake.js';
import Inquiry from './models/Inquiry.js';
import Subscriber from './models/Subscriber.js';
import User from './models/User.js';
import Promotion from './models/Promotion.js';

const DB_FILE = path.resolve('db.json');
let useLocalJSON = false;

// Helpers for Hashing Passwords (using Node's built-in crypto)
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Initial Seed Data for JSON Database
const DEFAULT_CAKES = [
  {
    _id: '507f1f77bcf86cd799439011',
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
    _id: '507f1f77bcf86cd799439012',
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
    _id: '507f1f77bcf86cd799439013',
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
    _id: '507f1f77bcf86cd799439014',
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

const DEFAULT_PROMOTIONS = [
  {
    _id: 'promo-seed-1',
    title: 'Grand Opening Celebration',
    subtitle: 'Enjoy premium artisan cakes on your sweet event. Apply code at checkout.',
    discountText: '15% OFF',
    couponCode: 'WELCOME15',
    image: '/chocolate_cake.png',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

// Helper to read JSON DB
const readJSON = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = { 
        cakes: DEFAULT_CAKES, 
        inquiries: [], 
        subscribers: [],
        users: [],
        promotions: DEFAULT_PROMOTIONS
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Auto-migrate schema updates if missing collections
    let migrated = false;
    if (!parsed.users) { parsed.users = []; migrated = true; }
    if (!parsed.promotions) { parsed.promotions = DEFAULT_PROMOTIONS; migrated = true; }
    
    if (migrated) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
    }
    return parsed;
  } catch (err) {
    console.error('Error reading JSON database:', err.message);
    return { cakes: DEFAULT_CAKES, inquiries: [], subscribers: [], users: [], promotions: DEFAULT_PROMOTIONS };
  }
};

// Helper to write JSON DB
const writeJSON = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to JSON database:', err.message);
  }
};

export const initializeDB = async (mongoUri) => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('MongoDB successfully connected.');
    useLocalJSON = false;
    
    // Seed default promotion in MongoDB if collection is empty
    const count = await Promotion.countDocuments();
    if (count === 0) {
      await Promotion.insertMany(DEFAULT_PROMOTIONS.map(p => ({
        title: p.title,
        subtitle: p.subtitle,
        discountText: p.discountText,
        couponCode: p.couponCode,
        image: p.image,
        isActive: p.isActive
      })));
      console.log('Seeded default active promotion into MongoDB.');
    }
  } catch (err) {
    console.warn('\n⚠️  MongoDB connection failed:', err.message);
    console.warn(`⚠️  Falling back to Local Persistent JSON Store: ${DB_FILE}`);
    console.warn('⚠️  The application will be fully functional and save data locally!\n');
    useLocalJSON = true;
    readJSON(); // Ensure local DB file exists and is initialized
  }
};

// ==========================================
// DB OPERATIONS ADAPTERS - CAKES
// ==========================================

export const getCakes = async () => {
  if (useLocalJSON) return readJSON().cakes;
  return await Cake.find();
};

export const createCake = async (cakeData) => {
  if (useLocalJSON) {
    const db = readJSON();
    const newCake = {
      _id: `json-${Date.now()}`,
      ...cakeData,
      createdAt: new Date().toISOString()
    };
    db.cakes.push(newCake);
    writeJSON(db);
    return newCake;
  }
  const newCake = new Cake(cakeData);
  return await newCake.save();
};

export const updateCake = async (id, cakeData) => {
  if (useLocalJSON) {
    const db = readJSON();
    const index = db.cakes.findIndex(c => c._id === id);
    if (index === -1) return null;
    db.cakes[index] = { ...db.cakes[index], ...cakeData, updatedAt: new Date().toISOString() };
    writeJSON(db);
    return db.cakes[index];
  }
  return await Cake.findByIdAndUpdate(id, cakeData, { new: true });
};

export const deleteCake = async (id) => {
  if (useLocalJSON) {
    const db = readJSON();
    const initialLength = db.cakes.length;
    db.cakes = db.cakes.filter(c => c._id !== id);
    if (db.cakes.length === initialLength) return null;
    writeJSON(db);
    return { message: 'Deleted' };
  }
  return await Cake.findByIdAndDelete(id);
};

// ==========================================
// DB OPERATIONS ADAPTERS - INQUIRIES
// ==========================================

export const getInquiries = async () => {
  if (useLocalJSON) {
    return readJSON().inquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return await Inquiry.find().sort({ createdAt: -1 });
};

export const createInquiry = async (inquiryData) => {
  if (useLocalJSON) {
    const db = readJSON();
    const newInquiry = {
      _id: `json-inq-${Date.now()}`,
      ...inquiryData,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    db.inquiries.push(newInquiry);
    writeJSON(db);
    return newInquiry;
  }
  const newInquiry = new Inquiry(inquiryData);
  return await newInquiry.save();
};

export const updateInquiry = async (id, status) => {
  if (useLocalJSON) {
    const db = readJSON();
    const index = db.inquiries.findIndex(i => i._id === id);
    if (index === -1) return null;
    db.inquiries[index].status = status;
    db.inquiries[index].updatedAt = new Date().toISOString();
    writeJSON(db);
    return db.inquiries[index];
  }
  return await Inquiry.findByIdAndUpdate(id, { status }, { new: true });
};

// ==========================================
// DB OPERATIONS ADAPTERS - SUBSCRIBERS
// ==========================================

export const getSubscribers = async () => {
  if (useLocalJSON) {
    return readJSON().subscribers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return await Subscriber.find().sort({ createdAt: -1 });
};

export const createSubscriber = async (email) => {
  if (useLocalJSON) {
    const db = readJSON();
    const existing = db.subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (existing) return { message: 'Already subscribed' };
    
    const newSub = {
      _id: `json-sub-${Date.now()}`,
      email,
      createdAt: new Date().toISOString()
    };
    db.subscribers.push(newSub);
    writeJSON(db);
    return newSub;
  }
  
  const existing = await Subscriber.findOne({ email });
  if (existing) return { message: 'Already subscribed' };

  const newSub = new Subscriber({ email });
  return await newSub.save();
};

// ==========================================
// DB OPERATIONS ADAPTERS - PROMOTIONS
// ==========================================

export const getActivePromotion = async () => {
  if (useLocalJSON) {
    const active = readJSON().promotions.filter(p => p.isActive);
    return active.length > 0 ? active[active.length - 1] : null; // return latest active
  }
  return await Promotion.findOne({ isActive: true }).sort({ createdAt: -1 });
};

export const getPromotions = async () => {
  if (useLocalJSON) {
    return readJSON().promotions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return await Promotion.find().sort({ createdAt: -1 });
};

export const createPromotion = async (promoData) => {
  if (useLocalJSON) {
    const db = readJSON();
    
    // If setting this one to active, we can optionally keep others or toggle
    const newPromo = {
      _id: `json-promo-${Date.now()}`,
      ...promoData,
      isActive: promoData.isActive !== undefined ? promoData.isActive : true,
      createdAt: new Date().toISOString()
    };
    db.promotions.push(newPromo);
    writeJSON(db);
    return newPromo;
  }
  const newPromo = new Promotion(promoData);
  return await newPromo.save();
};

export const updatePromotion = async (id, promoData) => {
  if (useLocalJSON) {
    const db = readJSON();
    const index = db.promotions.findIndex(p => p._id === id);
    if (index === -1) return null;
    db.promotions[index] = { ...db.promotions[index], ...promoData, updatedAt: new Date().toISOString() };
    writeJSON(db);
    return db.promotions[index];
  }
  return await Promotion.findByIdAndUpdate(id, promoData, { new: true });
};

export const deletePromotion = async (id) => {
  if (useLocalJSON) {
    const db = readJSON();
    const initialLength = db.promotions.length;
    db.promotions = db.promotions.filter(p => p._id !== id);
    if (db.promotions.length === initialLength) return null;
    writeJSON(db);
    return { message: 'Deleted' };
  }
  return await Promotion.findByIdAndDelete(id);
};

// ==========================================
// DB OPERATIONS ADAPTERS - USERS & AUTH
// ==========================================

export const getUsers = async () => {
  if (useLocalJSON) {
    return readJSON().users.map(({ password, ...u }) => u); // omit passwords
  }
  return await User.find({}, '-password').sort({ createdAt: -1 });
};

export const registerUser = async (userData) => {
  const { name, email, password } = userData;
  const normalizedEmail = email.toLowerCase().trim();

  if (useLocalJSON) {
    const db = readJSON();
    const existing = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) throw new Error('Email is already registered');

    const newUser = {
      _id: `json-usr-${Date.now()}`,
      name,
      email: normalizedEmail,
      password: hashPassword(password),
      provider: 'local',
      createdAt: new Date().toISOString()
    };
    
    db.users.push(newUser);
    writeJSON(db);
    
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new Error('Email is already registered');

  const newUser = new User({
    name,
    email: normalizedEmail,
    password: hashPassword(password),
    provider: 'local'
  });
  
  const saved = await newUser.save();
  const userObj = saved.toObject();
  delete userObj.password;
  return userObj;
};

export const loginUser = async (email, password) => {
  const normalizedEmail = email.toLowerCase().trim();
  const hashedPassword = hashPassword(password);

  if (useLocalJSON) {
    const db = readJSON();
    const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === hashedPassword);
    if (!user) throw new Error('Invalid email or password');

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || user.password !== hashedPassword) {
    throw new Error('Invalid email or password');
  }

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

export const socialAuthUser = async (profile) => {
  const { name, email, provider, providerId, avatar } = profile;
  const normalizedEmail = email.toLowerCase().trim();

  if (useLocalJSON) {
    const db = readJSON();
    let userIndex = db.users.findIndex(u => u.email.toLowerCase() === normalizedEmail);
    
    if (userIndex !== -1) {
      // User exists, update avatar and details
      db.users[userIndex].name = name;
      db.users[userIndex].provider = provider;
      db.users[userIndex].providerId = providerId;
      db.users[userIndex].avatar = avatar || db.users[userIndex].avatar;
      db.users[userIndex].updatedAt = new Date().toISOString();
    } else {
      // Register new social user
      const newUser = {
        _id: `json-usr-${Date.now()}`,
        name,
        email: normalizedEmail,
        provider,
        providerId,
        avatar,
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      userIndex = db.users.length - 1;
    }
    
    writeJSON(db);
    const { password: _, ...userWithoutPassword } = db.users[userIndex];
    return userWithoutPassword;
  }

  let user = await User.findOne({ email: normalizedEmail });
  if (user) {
    user.name = name;
    user.provider = provider;
    user.providerId = providerId;
    if (avatar) user.avatar = avatar;
    await user.save();
  } else {
    user = new User({
      name,
      email: normalizedEmail,
      provider,
      providerId,
      avatar
    });
    await user.save();
  }
  
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

// ==========================================
// DB OPERATIONS ADAPTERS - STATS
// ==========================================

export const getStats = async () => {
  if (useLocalJSON) {
    const db = readJSON();
    const totalInquiries = db.inquiries.length;
    const pendingInquiries = db.inquiries.filter(i => i.status === 'Pending').length;
    const totalSubscribers = db.subscribers.length;

    let estimatedRevenue = 0;
    db.inquiries.filter(i => ['Approved', 'Completed'].includes(i.status)).forEach(inq => {
      inq.items.forEach(item => {
        const cost = parseFloat(item.price.replace('$', ''));
        if (!isNaN(cost)) {
          estimatedRevenue += cost;
        }
      });
    });

    return {
      totalInquiries,
      pendingInquiries,
      totalSubscribers,
      estimatedRevenue: `$${estimatedRevenue}`
    };
  }

  const totalInquiries = await Inquiry.countDocuments();
  const pendingInquiries = await Inquiry.countDocuments({ status: 'Pending' });
  const totalSubscribers = await Subscriber.countDocuments();
  
  const inquiries = await Inquiry.find({ status: { $in: ['Approved', 'Completed'] } });
  let estimatedRevenue = 0;
  inquiries.forEach(inq => {
    inq.items.forEach(item => {
      const cost = parseFloat(item.price.replace('$', ''));
      if (!isNaN(cost)) {
        estimatedRevenue += cost;
      }
    });
  });

  return {
    totalInquiries,
    pendingInquiries,
    totalSubscribers,
    estimatedRevenue: `$${estimatedRevenue}`
  };
};
