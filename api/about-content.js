
// Vercel Serverless Function - About Content API with MongoDB
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('animora');
    const collection = db.collection('about_content');

    if (req.method === 'GET') {
      const about = await collection.findOne({});
      return res.status(200).json(about || {});
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const data = req.body;
      // Upsert: update if exists, insert if not
      await collection.updateOne({}, { $set: data }, { upsert: true });
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      await collection.deleteMany({});
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


