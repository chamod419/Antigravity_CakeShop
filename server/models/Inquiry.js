import mongoose from 'mongoose';

const inquiryItemSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: String, required: true },
  details: { type: String },
  image: { type: String }
});

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  serviceType: { type: String, required: true, enum: ['delivery', 'pickup'] },
  address: { type: String },
  notes: { type: String },
  items: [inquiryItemSchema],
  status: { type: String, default: 'Pending', enum: ['Pending', 'Approved', 'Completed'] },
  referenceCode: { type: String, required: true, unique: true }
}, { timestamps: true });

export default mongoose.model('Inquiry', inquirySchema);
