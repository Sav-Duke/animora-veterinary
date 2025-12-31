import mongoose from 'mongoose';
import * as seoController from '../animora-ai/backend/controllers/seoController.js';

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) return;
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
}

export default async function handler(req, res) {
  await connectDB();
  if (req.method === 'GET') {
    const { page } = req.query;
    if (page) {
      return seoController.getSEOByPage(req, res);
    }
    return seoController.getAllSEO(req, res);
  }
  if (req.method === 'POST') {
    return seoController.createSEO(req, res);
  }
  if (req.method === 'PUT') {
    return seoController.updateSEO(req, res);
  }
  if (req.method === 'DELETE') {
    return seoController.deleteSEO(req, res);
  }
  res.status(405).json({ error: 'Method not allowed' });
}
