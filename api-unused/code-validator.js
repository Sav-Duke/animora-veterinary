// Vercel Serverless Function - Code Validator API
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const filePath = path.join(process.cwd(), 'data', 'code-validator.json');
  try {
    if (req.method === 'GET') {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
