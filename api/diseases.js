import mongoose from 'mongoose';
import Disease from './backend/models/diseaseModel.js';

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) return;
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
}

export default async function handler(req, res) {
  await connectDB();
  if (req.method === 'GET') {
    // /api/diseases or /api/diseases/:id
    const { id } = req.query;
    if (id) {
      const disease = await Disease.findById(id);
      if (!disease) return res.status(404).json({ error: 'Disease not found' });
      return res.json(disease);
    }
    const diseases = await Disease.find();
    return res.json(diseases);
  }
  if (req.method === 'POST') {
    const disease = new Disease(req.body);
    await disease.save();
    return res.status(201).json(disease);
  }
  if (req.method === 'PUT') {
    const { id } = req.query;
    const disease = await Disease.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!disease) return res.status(404).json({ error: 'Disease not found' });
    return res.json(disease);
  }
  if (req.method === 'DELETE') {
    const { id } = req.query;
    const disease = await Disease.findByIdAndDelete(id);
    if (!disease) return res.status(404).json({ error: 'Disease not found' });
    return res.json({ message: 'Deleted' });
  }
  res.status(405).json({ error: 'Method not allowed' });
}
