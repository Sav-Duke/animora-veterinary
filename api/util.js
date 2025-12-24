// Vercel Serverless Function - Utility API (Merged)
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

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
    // FETCH VETS
    if (action === 'fetch-vets') {
      const filePath = path.join(process.cwd(), 'data', 'vets.json');
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return res.status(200).json(data);
    }
    // CHAT
    if (action === 'chat') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are Animora AI, a knowledgeable veterinary assistant. Provide helpful, accurate information about animal health, diseases, treatments, and preventive care. Be professional, compassionate, and clear in your responses.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });
      if (!groqResponse.ok) {
        throw new Error(`Groq API error: ${groqResponse.status}`);
      }
      const groqData = await groqResponse.json();
      const aiMessage = groqData.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      return res.status(200).json({ response: aiMessage });
    }
    // Unknown action
    return res.status(400).json({ error: 'Unknown or missing action parameter.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
