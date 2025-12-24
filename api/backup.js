// Vercel Serverless Function - Backup API
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const filePath = path.join(process.cwd(), 'data', 'backups.json');
  try {
    if (req.method === 'GET') {
      if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const backups = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
      backups.unshift(req.body);
      fs.writeFileSync(filePath, JSON.stringify(backups, null, 2));
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      let backups = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
      backups = backups.filter(b => b.id !== id);
      fs.writeFileSync(filePath, JSON.stringify(backups, null, 2));
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
