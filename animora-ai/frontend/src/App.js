import React from 'react';
import ChatBox from './components/ChatBox';

function App() {
  return (
    <div style={{ width: "100%", maxWidth: "900px", margin: "auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", color: "#16A34A" }}>Animora AI Chat</h1>
      <p style={{ textAlign: "center" }}>Ask anything about animal health & diseases 🐾</p>
      <ChatBox />
    </div>
  );
}

export default App;






