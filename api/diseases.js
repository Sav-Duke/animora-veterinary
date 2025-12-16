// Vercel Serverless Function - Diseases API
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const filePath = path.join(process.cwd(), 'animora-ai', 'diseases_100plus.json');

  try {
    if (req.method === 'GET') {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return res.status(200).json(data);
    }

    // For now, POST/PUT/DELETE are not supported on Vercel (read-only filesystem)
    // These would need a database like MongoDB
    return res.status(200).json({ 
      message: 'Disease data is read-only. Use MongoDB for editing capabilities.',
      data: JSON.parse(fs.readFileSync(filePath, 'utf8'))
    });
  } catch (error) {
    console.error('Error loading diseases:', error);
    return res.status(500).json({ error: error.message });
  }
}
