import mongoose from 'mongoose';

const seoSchema = new mongoose.Schema({
  page: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: { type: [String], default: [] },
  updatedAt: { type: Date, default: Date.now }
});

const SEO = mongoose.model('SEO', seoSchema);
export default SEO;
