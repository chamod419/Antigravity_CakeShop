import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  discountText: { type: String }, // e.g. "15% OFF" or "FREE DELIVERY"
  couponCode: { type: String }, // e.g. "WELCOME15"
  image: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Promotion', promotionSchema);
