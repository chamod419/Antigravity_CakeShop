import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional for OAuth social accounts
  provider: { type: String, default: 'local', enum: ['local', 'google', 'facebook'] },
  providerId: { type: String }, // OAuth id if social login
  avatar: { type: String }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
