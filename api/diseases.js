// Vercel Serverless Function - Diseases API with MongoDB
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
    const collection = db.collection('diseases');

    if (req.method === 'GET') {
      const diseases = await collection.find({}).toArray();
      return res.status(200).json(diseases);
    }

    if (req.method === 'POST') {
      const result = await collection.insertOne(req.body);
      return res.status(201).json({ success: true, id: result.insertedId });
    }

    if (req.method === 'PUT') {
      const { id, ...data } = req.body;
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await collection.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Diseases API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
