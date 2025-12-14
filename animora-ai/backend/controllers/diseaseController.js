import Disease from '../models/Disease.js';

// Search diseases by query (name, symptom, species)
export const searchDisease = async (req, res) => {
  try {
    const { q, species } = req.query;
    const query = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { symptoms: { $regex: q, $options: 'i' } }
      ]
    };
    if (species) query.species = { $in: [species.toLowerCase()] };

    const results = await Disease.find(query).limit(50);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDiseaseById = async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id);
    res.json(disease);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
