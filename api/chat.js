// Vercel serverless function for /api/chat
import mongoose from 'mongoose';
import { chatWithAI } from './backend/controllers/chatController.js';

// Connection caching for Vercel serverless
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 1,
    };
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    await dbConnect();
    // Patch req/res to look like Express for controller
    req.query = req.query || {};
    req.params = req.params || {};
    // Call the controller
    await chatWithAI(req, res);
  } catch (err) {
    res.status(500).json({ reply: '🚫 Server error. Please try again later.', error: err.message });
  }
}
