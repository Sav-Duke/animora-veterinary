// Unified general API handler for Vercel Hobby plan
import fs from 'fs';
import path from 'path';
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

  // Admin login endpoint
  if (req.query.action === 'admin-login') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });
    if (password === process.env.ADMIN_PASSWORD) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ error: 'Invalid password' });
    }
  }

  // Hello endpoint
  if (req.query.action === 'hello') {
    return res.status(200).json({ message: 'Hello from Vercel serverless!' });
  }

  // Utility endpoints
  const action = req.query.action;
  try {
    // BACKUP
    if (action === 'backup') {
      const filePath = path.join(process.cwd(), 'data', 'backups.json');
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
    }
    // FILE MANAGER
    if (action === 'file-manager') {
      const filePath = path.join(process.cwd(), 'data', 'file-manager.json');
      if (req.method === 'GET') {
        if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return res.status(200).json(data);
      }
      if (req.method === 'POST') {
        const files = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
        files.unshift(req.body);
        fs.writeFileSync(filePath, JSON.stringify(files, null, 2));
        return res.status(200).json({ success: true });
      }
      if (req.method === 'DELETE') {
        const { name } = req.body;
        let files = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
        files = files.filter(f => f.name !== name);
        fs.writeFileSync(filePath, JSON.stringify(files, null, 2));
        return res.status(200).json({ success: true });
      }
      return res.status(405).json({ error: 'Method not allowed' });
    }
    // SECURITY
    if (action === 'security') {
      const filePath = path.join(process.cwd(), 'data', 'security.json');
      if (req.method === 'GET') {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return res.status(200).json(data);
      }
      if (req.method === 'POST') {
        fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
        return res.status(200).json({ success: true });
      }
      return res.status(405).json({ error: 'Method not allowed' });
    }
    // NOTIFICATIONS
    if (action === 'notifications') {
      const filePath = path.join(process.cwd(), 'data', 'notifications.json');
      if (req.method === 'GET') {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return res.status(200).json(data);
      }
      if (req.method === 'POST') {
        fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
        return res.status(200).json({ success: true });
      }
      return res.status(405).json({ error: 'Method not allowed' });
    }
    // SETTINGS
    if (action === 'settings') {
      const filePath = path.join(process.cwd(), 'data', 'settings.json');
      if (req.method === 'GET') {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return res.status(200).json(data);
      }
      if (req.method === 'POST') {
        fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
        return res.status(200).json({ success: true });
      }
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // GALLERY
    if (action === 'gallery') {
      const filePath = path.join(process.cwd(), 'data', 'gallery.json');
      if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
      if (req.method === 'GET') {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return res.status(200).json(data);
      }
      if (req.method === 'POST') {
        const files = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        // Expecting { image: base64, ... }
        const { image } = req.body;
        if (!image) return res.status(400).json({ error: 'Image required' });
        const id = Date.now().toString();
        const imagePath = `uploads/gallery_${id}.png`;
        const base64Data = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        fs.writeFileSync(path.join(process.cwd(), imagePath), base64Data, 'base64');
        const newImage = { id, path: imagePath, uploadedAt: new Date().toISOString() };
        files.unshift(newImage);
        fs.writeFileSync(filePath, JSON.stringify(files, null, 2));
        return res.status(201).json(newImage);
      }
      if (req.method === 'DELETE') {
        const { id } = req.body;
        let files = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const img = files.find(f => f.id === id);
        if (!img) return res.status(404).json({ error: 'Image not found' });
        files = files.filter(f => f.id !== id);
        fs.writeFileSync(filePath, JSON.stringify(files, null, 2));
        // Optionally delete the file from uploads
        const imgPath = path.join(process.cwd(), img.path);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        return res.status(200).json({ success: true });
      }
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // BLOG BUTTON SETTINGS
    if (action === 'blog') {
      const filePath = path.join(process.cwd(), 'data', 'blog.json');
      if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}');
      if (req.method === 'GET') {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return res.status(200).json(data);
      }
      if (req.method === 'POST') {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const { blogSettings, adminSettings } = req.body;
        if (blogSettings) data.blogSettings = blogSettings;
        if (adminSettings) data.adminSettings = adminSettings;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return res.status(200).json({ success: true });
      }
      return res.status(405).json({ error: 'Method not allowed' });
    }
    // FETCH VETS
    if (action === 'fetch-vets') {
      const filePath = path.join(process.cwd(), 'data', 'vets.json');
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return res.status(200).json(data);
    }
    // RESOURCE API (about-content, contact-info, staff, vets, diseases, services)
    if (req.query.type && COLLECTIONS[req.query.type]) {
      const { type, id } = req.query;
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
    }
    // Unknown action
    return res.status(400).json({ error: 'Unknown or missing action/type parameter.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
