import mongoose from 'mongoose';

const cakeSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  flavors: { type: String, required: true },
  servings: { type: String, required: true },
  highlights: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Cake', cakeSchema);
