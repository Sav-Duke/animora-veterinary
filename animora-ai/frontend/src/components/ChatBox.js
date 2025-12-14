import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import './ChatBox.css';

const API_BASE = "http://localhost:4001/api";

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { id: 0, role: "ai", content: "👋 Hello! Ask me about any animal disease.", copyable: false, complete: true }
  ]);
  const [copiedId, setCopiedId] = useState(null);
  const [hoveredMsgIdx, setHoveredMsgIdx] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  // Typewriter effect: progressively reveal `fullText` as an AI message
  const typeOut = async (fullText) => {
    if (!fullText) return;
    // push empty AI message
    setMessages(prev => [...prev, { id: Date.now(), role: 'ai', content: '', copyable: false, complete: false }]);

    const chars = Array.from(fullText);
    for (let i = 0; i < chars.length; i++) {
      const partial = chars.slice(0, i + 1).join('');
      // update last message
      setMessages(prev => {
        const out = prev.slice();
        out[out.length - 1] = { ...out[out.length - 1], content: partial };
        return out;
      });

      // scroll into view
      endRef.current?.scrollIntoView({ behavior: 'smooth' });

      // variable delay: punctuation pauses longer
      const ch = chars[i];
      let delayMs = 18; // base speed
      if (/[.,!?]/.test(ch)) delayMs = 120;
      else if (ch === '\n') delayMs = 80;
      else if (/[;:]/.test(ch)) delayMs = 80;

      await new Promise(r => setTimeout(r, delayMs));
    }
    // mark last message as complete and copyable
    setMessages(prev => {
      const out = prev.slice();
      const last = out[out.length - 1] || {};
      out[out.length - 1] = { ...last, content: fullText, complete: true, copyable: true };
      return out;
    });
  };

  const sendMessage = async (text) => {
    const payload = { message: text };
    const res = await axios.post(`${API_BASE}/chat`, payload, { headers: { "Content-Type": "application/json" } });
    return res.data;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendMessage(text);
      await typeOut(data.reply);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { id: Date.now(), role: "ai", content: err.response?.data?.reply || "❌ Error connecting to server.", copyable: true, complete: true }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div
            key={m.id ?? i}
            style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}
            onMouseEnter={() => m.role === 'ai' && m.copyable && setHoveredMsgIdx(i)}
            onMouseLeave={() => setHoveredMsgIdx(null)}
          >
            <div style={{ position: 'relative', ...styles.bubble, ...(m.role === "user" ? styles.user : styles.ai) }}>
              {m.role === 'ai' && typeof m.content === 'string' ? (
                <div className="markdown-content" style={styles.markdownContainer}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{m.content}</pre>
              )}
              {m.role === 'ai' && m.copyable && hoveredMsgIdx === i && (
                <button
                  onClick={async () => {
                    try {
                      const txt = String(m.content || '');
                      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(txt);
                      } else {
                        const ta = document.createElement('textarea');
                        ta.value = txt;
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                      }
                      setCopiedId(m.id ?? i);
                      setTimeout(() => setCopiedId(null), 1600);
                    } catch (e) {
                      console.error('Copy failed', e);
                    }
                  }}
                  style={{...styles.copyBtn, ...(copiedId === (m.id ?? i) ? styles.copyBtnCopied : {})}}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {copiedId === (m.id ?? i) ? (
                      <path d="M20 6L9 17l-5-5"/>
                    ) : (
                      <>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </>
                    )}
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && <div style={{ opacity: 0.7 }}>Typing...</div>}
        <div ref={endRef} />
      </div>
      <div style={styles.inputRow}>
        <div style={styles.textareaWrapper}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask about disease..."
            style={styles.textarea}
            rows={1}
          />
          <button
            onClick={handleSend}
            style={{...styles.sendBtn, ...(loading || !input.trim() ? styles.sendBtnDisabled : {})}}
            disabled={loading || !input.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: "18px auto", padding: 18 },
  chatBox: { height: 480, overflowY: "auto", padding: 16, borderRadius: 12, background: "#f4f4f6", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  bubble: { maxWidth: "78%", padding: "10px 14px", borderRadius: 12, lineHeight: 1.45, whiteSpace: "pre-wrap" },
  user: { background: "#16A34A", color: "#fff", borderBottomRightRadius: 4 },
  ai: { background: "#fff", color: "#111", border: "1px solid #e6e6e6", borderBottomLeftRadius: 4 },
  markdownContainer: {
    fontSize: 14,
    lineHeight: 1.6
  },
  copyBtn: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    padding: '6px 8px',
    fontSize: 13,
    borderRadius: 6,
    border: '1px solid #d1d5db',
    background: '#f9fafb',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    transition: 'all 0.2s',
    color: '#374151'
  },
  copyBtnCopied: {
    background: '#10b981',
    color: '#fff',
    borderColor: '#10b981'
  },
  inputRow: { display: "flex", marginTop: 12 },
  textareaWrapper: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end'
  },
  textarea: {
    flex: 1,
    padding: '12px 52px 12px 14px',
    borderRadius: 24,
    border: '1px solid #ccc',
    resize: 'none',
    fontFamily: 'inherit',
    fontSize: 15,
    lineHeight: 1.5,
    outline: 'none',
    maxHeight: 120,
    overflowY: 'auto'
  },
  sendBtn: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#16A34A',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  sendBtnDisabled: {
    background: '#d1d5db',
    cursor: 'not-allowed'
  }
};







