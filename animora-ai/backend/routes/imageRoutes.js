// backend/routes/imageRoutes.js
import express from 'express';
import { analyzeImage } from '../controllers/imageController.js';

const router = express.Router();

// POST /api/image/analyze - Analyze uploaded animal image
router.post('/analyze', analyzeImage);

export default router;
