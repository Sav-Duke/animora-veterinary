// Unified AI-related API handler for Vercel Hobby plan
import mongoose from 'mongoose';
import { chatWithAI } from './backend/controllers/chatController.js';
import * as codeValidatorController from './backend/controllers/codeValidatorController.js';
import * as seoController from './backend/controllers/seoController.js';
import Disease from './backend/models/diseaseModel.js';
import { analyzeImage } from './backend/controllers/imageController.js';

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) return;
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
}

export default async function handler(req, res) {
  const allowedOrigins = [
    'https://your-main-frontend.vercel.app',
    'https://your-admin-frontend.vercel.app',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // --- Example CORS code for Vercel serverless ---
  // This block allows only requests from your deployed frontends (replace with your actual Vercel domains):
  // const allowedOrigins = [
  //   'https://your-main-frontend.vercel.app',
  //   'https://your-admin-frontend.vercel.app',
  //   'http://localhost:3000'
  // ];
  // const origin = req.headers.origin;
  // if (allowedOrigins.includes(origin)) {
  //   res.setHeader('Access-Control-Allow-Origin', origin);
  // } else {
  //   res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  // }
  // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // if (req.method === 'OPTIONS') return res.status(200).end();

  await connectDB();
  const { action } = req.query;

  // Route by action query param
  switch (action) {
    case 'chat':
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      return chatWithAI(req, res);
    case 'code-validator':
      if (req.method === 'GET') {
        const { id } = req.query;
        if (id) return codeValidatorController.getValidationById(req, res);
        return codeValidatorController.getAllValidations(req, res);
      }
      if (req.method === 'POST') return codeValidatorController.createValidation(req, res);
      if (req.method === 'PUT') return codeValidatorController.updateValidation(req, res);
      if (req.method === 'DELETE') return codeValidatorController.deleteValidation(req, res);
      return res.status(405).json({ error: 'Method not allowed' });
    case 'seo':
      if (req.method === 'GET') {
        const { page } = req.query;
        if (page) return seoController.getSEOByPage(req, res);
        return seoController.getAllSEO(req, res);
      }
      if (req.method === 'POST') return seoController.createSEO(req, res);
      if (req.method === 'PUT') return seoController.updateSEO(req, res);
      if (req.method === 'DELETE') return seoController.deleteSEO(req, res);
      return res.status(405).json({ error: 'Method not allowed' });
    case 'diseases':
      if (req.method === 'GET') {
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
      return res.status(405).json({ error: 'Method not allowed' });
    case 'image':
      if (req.method === 'POST') return analyzeImage(req, res);
      return res.status(405).json({ error: 'Method not allowed' });
    default:
      return res.status(400).json({ error: 'Unknown or missing action parameter.' });
  }
}
