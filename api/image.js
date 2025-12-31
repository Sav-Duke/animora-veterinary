import mongoose from 'mongoose';
import { analyzeImage } from '../animora-ai/backend/controllers/imageController.js';

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) return;
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
}

export default async function handler(req, res) {
  await connectDB();
  if (req.method === 'POST') {
    return analyzeImage(req, res);
  }
  res.status(405).json({ error: 'Method not allowed' });
}
