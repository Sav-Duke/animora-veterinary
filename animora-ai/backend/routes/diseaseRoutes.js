import express from 'express';
import Disease from '../models/diseaseModel.js';

const router = express.Router();

// Get all diseases
router.get('/', async (req, res) => {
  try {
    const diseases = await Disease.find();
    res.json(diseases);
  } catch (err) {
    console.error("❌ Error fetching diseases:", err);
    res.status(500).json({ error: "Failed to fetch diseases" });
  }
});

// Get single disease by ID
router.get('/:id', async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id);
    if (!disease) {
      return res.status(404).json({ error: "Disease not found" });
    }
    res.json(disease);
  } catch (err) {
    console.error("❌ Error fetching disease:", err);
    res.status(500).json({ error: "Failed to fetch disease" });
  }
});

// Create new disease
router.post('/', async (req, res) => {
  try {
    const disease = new Disease(req.body);
    await disease.save();
    console.log("✅ Disease created:", disease.name);
    res.status(201).json(disease);
  } catch (err) {
    console.error("❌ Error creating disease:", err);
    res.status(500).json({ error: "Failed to create disease" });
  }
});

// Update disease by ID
router.put('/:id', async (req, res) => {
  try {
    const disease = await Disease.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!disease) {
      return res.status(404).json({ error: "Disease not found" });
    }
    console.log("✅ Disease updated:", disease.name);
    res.json(disease);
  } catch (err) {
    console.error("❌ Error updating disease:", err);
    res.status(500).json({ error: "Failed to update disease" });
  }
});

// Delete disease by ID
router.delete('/:id', async (req, res) => {
  try {
    const disease = await Disease.findByIdAndDelete(req.params.id);
    if (!disease) {
      return res.status(404).json({ error: "Disease not found" });
    }
    console.log("✅ Disease deleted:", disease.name);
    res.json({ message: "Disease deleted successfully", disease });
  } catch (err) {
    console.error("❌ Error deleting disease:", err);
    res.status(500).json({ error: "Failed to delete disease" });
  }
});

export default router;

