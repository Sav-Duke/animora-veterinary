// Vercel Serverless Function - Fetch Vets
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const filePath = path.join(process.cwd(), 'data', 'vets.json');

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error loading vets:', error);
    return res.status(200).json([]);
  }
}
