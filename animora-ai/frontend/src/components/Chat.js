import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import ImageUpload from './ImageUpload';

const API_BASE = 'http://localhost:4001/api';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState('cattle');
  const [abortController, setAbortController] = useState(null);
  const [hoveredMsgIdx, setHoveredMsgIdx] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setLoading(false);
      setMessages((prev) => [...prev, { role: 'ai', content: '⚠️ Stopped.' }]);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await axios.post(`${API_BASE}/chat`, { 
        message: currentInput,
        sessionId: sessionId,
        conversationHistory: conversationHistory,
        useAI: true
      }, {
        signal: controller.signal,
        timeout: 60000
      });
      
      const botMsg = { 
        role: 'ai', 
        content: res.data.reply,
        webSearchUsed: res.data.webSearchUsed || false,
        diseaseFound: res.data.diseaseFound || false
      };
      setMessages((prev) => [...prev, botMsg]);
      
      if (res.data.conversationHistory) {
        setConversationHistory(res.data.conversationHistory);
      }
      
      if (res.data.sessionId) {
        setSessionId(res.data.sessionId);
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      
      setMessages((prev) => [...prev, { role: 'ai', content: `❌ Error: ${err.response?.data?.error || err.message}` }]);
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationHistory([]);
    setSessionId(`session_${Date.now()}`);
  };

  const handleImageAnalysis = (analysisResult) => {
    setMessages(prev => [...prev, {
      role: 'ai',
      content: analysisResult.response
    }]);
  };

  return (
    <div style={{ marginTop: '20px', maxWidth: '900px', margin: '20px auto', padding: '0 15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <h2>🐾 Animora AI</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowImageUpload(!showImageUpload)} style={{padding: '8px 16px', backgroundColor: showImageUpload ? '#4CAF50' : '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'}}>
            {showImageUpload ? '💬 Chat' : '📸 Image'}
          </button>
          <button onClick={clearChat} style={{padding: '8px 16px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer'}}>Clear</button>
        </div>
      </div>

      {showImageUpload && <ImageUpload onAnalysisComplete={handleImageAnalysis} selectedSpecies={selectedSpecies} />}

      <div style={{border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', minHeight: '400px', maxHeight: '600px', overflowY: 'auto', backgroundColor: '#fafafa', marginBottom: '15px'}}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#666', padding: '40px 20px' }}>
            <h3>Welcome to Animora AI!</h3>
            <p>Ask about livestock diseases (FMD, Mastitis, etc.)</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            style={{display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', margin: '12px 0'}}
            onMouseEnter={() => setHoveredMsgIdx(idx)}
            onMouseLeave={() => setHoveredMsgIdx(null)}
          >
            <div style={{maxWidth: '75%', padding: '12px 16px', borderRadius: '12px', backgroundColor: msg.role === 'user' ? '#dcf8c6' : '#fff', border: msg.role === 'ai' ? '1px solid #e0e0e0' : 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative'}}>
              {msg.role === 'ai' && (msg.webSearchUsed || msg.diseaseFound) && (
                <div style={{display: 'flex', gap: '8px', marginBottom: '10px', fontSize: '11px'}}>
                  {msg.diseaseFound && <span style={{backgroundColor: '#e3f2fd', color: '#1976d2', padding: '4px 10px', borderRadius: '12px', fontWeight: '600'}}>📚 Database</span>}
                  {msg.webSearchUsed && <span style={{backgroundColor: '#fff3e0', color: '#f57c00', padding: '4px 10px', borderRadius: '12px', fontWeight: '600'}}>🌐 Web</span>}
                </div>
              )}
              
              {msg.role === 'ai' ? (
                <>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  {(hoveredMsgIdx === idx || copiedIdx === idx) && (
                    <button 
                      onClick={() => copyToClipboard(msg.content, idx)} 
                      style={{
                        position: 'absolute', 
                        bottom: '8px', 
                        right: '8px', 
                        padding: '6px', 
                        backgroundColor: '#ffffff',
                        border: '1px solid #d0d0d0', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: '#666',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                        e.currentTarget.style.borderColor = '#999';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#d0d0d0';
                      }}
                    >
                      {copiedIdx === idx ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <span>{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        
        {loading && <div style={{margin: '12px 0'}}><span style={{padding: '12px 16px', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #e0e0e0'}}>⏳ Thinking...</span></div>}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ position: 'relative' }}>
        <textarea 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={handleKeyPress} 
          placeholder="Message Animora AI..." 
          disabled={loading} 
          style={{
            width: '100%', 
            padding: '14px 50px 14px 14px', 
            borderRadius: '24px', 
            border: '1px solid #d0d0d0', 
            minHeight: '52px',
            maxHeight: '200px', 
            fontSize: '15px',
            resize: 'none',
            fontFamily: 'inherit',
            outline: 'none',
            backgroundColor: '#fff',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#999'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#d0d0d0'}
          rows="1"
        />
        {loading ? (
          <button 
            onClick={stopGeneration} 
            style={{
              position: 'absolute',
              right: '10px',
              bottom: '10px',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#fff',
              color: '#666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="1"/>
            </svg>
          </button>
        ) : (
          <button 
            onClick={handleSend} 
            disabled={!input.trim()} 
            style={{
              position: 'absolute',
              right: '10px',
              bottom: '10px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: !input.trim() ? '#d0d0d0' : '#2f2f2f',
              color: 'white',
              cursor: !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
              padding: 0
            }}
            onMouseEnter={(e) => {
              if (input.trim()) e.currentTarget.style.backgroundColor = '#000';
            }}
            onMouseLeave={(e) => {
              if (input.trim()) e.currentTarget.style.backgroundColor = '#2f2f2f';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
