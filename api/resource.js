// Trigger redeploy: minor comment for Vercel cache busting
// Vercel Serverless Function - Unified Resources API (about-content, contact-info, staff, vets, diseases, services)
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

const COLLECTIONS = {
  'about-content': 'about',
  'contact-info': 'contact',
  'staff': 'staff',
  'vets': 'vets',
  'diseases': 'diseases',
  'services': 'services'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type, id } = req.query;
  if (!type || !COLLECTIONS[type]) {
    return res.status(400).json({ error: 'Invalid or missing resource type' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('animora');
    const collection = db.collection(COLLECTIONS[type]);

    if (req.method === 'GET') {
      if (id) {
        const item = await collection.findOne({ _id: new ObjectId(id) });
        return res.status(200).json(item);
      }
      const items = await collection.find({}).toArray();
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const result = await collection.insertOne(req.body);
      return res.status(201).json({ success: true, id: result.insertedId });
    }

    if (req.method === 'PUT') {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: 'Missing _id for update' });
      await collection.updateOne({ _id: new ObjectId(_id) }, { $set: data });
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'Missing id for delete' });
      await collection.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
