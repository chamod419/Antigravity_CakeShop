import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Cake from './models/Cake.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/luxelayers';

const DEFAULT_CAKES = [
  {
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

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('Clearing existing cakes from database...');
    await Cake.deleteMany({});
    console.log('Database cleared.');

    console.log('Inserting default cakes catalog...');
    const result = await Cake.insertMany(DEFAULT_CAKES);
    console.log(`Success! Inserted ${result.length} signature cakes into the database.`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding database failed:', err.message);
    process.exit(1);
  }
}

seedDatabase();
