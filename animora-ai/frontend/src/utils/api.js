import axios from 'axios';

const API_BASE = 'http://localhost:4001/api';

export const chatWithAI = async (message) => {
  const res = await axios.post(`${API_BASE}/chat`, { message });
  return res.data.reply;
};

export const searchDiseases = async (query, species) => {
  const res = await axios.get(`${API_BASE}/diseases/search`, { params: { q: query, species } });
  return res.data;
};

export const getDiseaseDetail = async (id) => {
  const res = await axios.get(`${API_BASE}/diseases/${id}`);
  return res.data;
};

