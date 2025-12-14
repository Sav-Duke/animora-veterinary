import axios from 'axios';

const API_BASE = 'http://localhost:4001/api';

// Fetch diseases
export const searchDiseases = async (query, species) => {
  try {
    const res = await axios.get(`${API_BASE}/diseases/search`, { params: { q: query, species } });
    return res.data;
  } catch (err) {
    console.error('Error fetching diseases:', err);
    return [];
  }
};

// Get disease details
export const getDiseaseDetail = async (id) => {
  try {
    const res = await axios.get(`${API_BASE}/diseases/${id}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching disease detail:', err);
    return null;
  }
};

// Chat with AI
export const chatWithAI = async (message) => {
  try {
    const res = await axios.post(`${API_BASE}/chat`, { message });
    return res.data.reply;
  } catch (err) {
    console.error('Error chatting with AI:', err);
    return 'Sorry, the AI service is unavailable.';
  }
};

