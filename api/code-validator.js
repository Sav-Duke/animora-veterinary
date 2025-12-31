import mongoose from 'mongoose';
import * as codeValidatorController from './backend/controllers/codeValidatorController.js';

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) return;
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
}

export default async function handler(req, res) {
  await connectDB();
  if (req.method === 'GET') {
    const { id } = req.query;
    if (id) {
      return codeValidatorController.getValidationById(req, res);
    }
    return codeValidatorController.getAllValidations(req, res);
  }
  if (req.method === 'POST') {
    return codeValidatorController.createValidation(req, res);
  }
  if (req.method === 'PUT') {
    return codeValidatorController.updateValidation(req, res);
  }
  if (req.method === 'DELETE') {
    return codeValidatorController.deleteValidation(req, res);
  }
  res.status(405).json({ error: 'Method not allowed' });
}
