import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:4001/api';

export default function Dashboard() {
  // Disease search state
  const [query, setQuery] = useState('');
  const [species, setSpecies] = useState('');
  const [results, setResults] = useState([]);

  // Chat state
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  const chatEndRef = useRef(null);

  // --- Auto scroll to bottom ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // --- Disease Search ---
  const handleSearch = async () => {
    try {
      const res = await axios.get(`${API_BASE}/diseases/search`, { params: { q: query, species } });
      setResults(res.data);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    }
  };

  // --- Chat ---
  const handleSend = async (msg) => {
    const text = msg ?? message;
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text };
    setChat(prev => [...prev, userMsg]);
    setMessage('');

    try {
      const res = await axios.post(`${API_BASE}/chat`, { message: text });
      const aiMsg = { role: 'ai', content: res.data.reply };
      setChat(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const aiMsg = { role: 'ai', content: 'Error: Could not get response from AI.' };
      setChat(prev => [...prev, aiMsg]);
    }
  };

  // --- Click disease to chat ---
  const handleDiseaseClick = (name) => {
    setMessage(name);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Disease Search */}
      <div className="md:w-1/2 bg-white p-4 rounded shadow overflow-auto h-[80vh]">
        <h2 className="text-xl font-semibold mb-2">Disease Search</h2>
        <input
          type="text"
          placeholder="Search disease..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          placeholder="Filter by species..."
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <button
          onClick={handleSearch}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mb-4"
        >
          Search
        </button>
        <div>
          {results.length === 0 ? (
            <p className="text-gray-500">No results</p>
          ) : (
            results.map((disease) => (
              <div
                key={disease._id}
                className="border-b py-2 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleDiseaseClick(disease.name)}
              >
                <h3 className="font-semibold">{disease.name}</h3>
                <p className="text-sm text-gray-600">Species: {disease.species.join(', ')}</p>
                <p className="text-sm text-gray-600">Category: {disease.category}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Chat */}
      <div className="md:w-1/2 bg-white p-4 rounded shadow flex flex-col h-[80vh]">
        <h2 className="text-xl font-semibold mb-2">AI Chat</h2>
        <div className="flex-1 overflow-auto mb-2 border p-2 rounded">
          {chat.map((msg, idx) => (
            <div key={idx} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded max-w-[80%] ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                {msg.content}
              </span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 border rounded"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={() => handleSend()}
            className="bg-green-500 text-white px-4 rounded hover:bg-green-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

