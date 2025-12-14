import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import diseaseRoutes from './routes/diseaseRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import imageRoutes from './routes/imageRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// (server will be started after routes are registered and PORT is defined)

// --- Routes ---
app.use('/api/diseases', diseaseRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/image', imageRoutes);

// --- Test route ---
app.get("/", (req, res) => {
  res.send("Animora AI backend is running!");
});

const PORT = process.env.PORT || 4001;

// Start server only after MongoDB connection succeeds
(async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log("✅ Connected to MongoDB (animora)");

    const server = app.listen(PORT, () => console.log(`🚀 Animora AI backend running at http://localhost:${PORT}`));

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} in use — free the port or set PORT env var.`);
        process.exit(1);
      }
      console.error('Server error', err);
    });

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    console.error('The server will not start until MongoDB connection succeeds.');
  }
})();
