# Animora AI - Conversational AI Setup Guide

## 🎯 Overview

Your Animora AI chat system has been upgraded to support:
- ✅ **Long questions and sentences** - No character limits
- ✅ **Follow-up questions** - Maintains conversation context
- ✅ **Natural conversations** - Like ChatGPT, but without OpenAI
- ✅ **Free LLM providers** - Multiple options without API keys or with free tiers

## 🔧 Installation Steps

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install react-markdown
```

### 2. Configure AI Provider

The system supports three free AI providers:

#### Option A: Hugging Face (Recommended - No API Key Required)
- **Free tier**: Yes, works without API key
- **Setup**: Already configured by default
- **Optional**: Get API key for better rate limits at https://huggingface.co/settings/tokens

#### Option B: Together AI (Good Balance)
- **Free tier**: Yes, requires free API key
- **Setup**: 
  1. Sign up at https://api.together.xyz/signup
  2. Get your API key
  3. Add to `.env`: `AI_PROVIDER=together` and `TOGETHER_API_KEY=your_key`

#### Option C: Groq (Fastest)
- **Free tier**: Yes, requires free API key  
- **Setup**:
  1. Sign up at https://console.groq.com/keys
  2. Get your API key
  3. Add to `.env`: `AI_PROVIDER=groq` and `GROQ_API_KEY=your_key`

### 3. Update Backend .env File

```bash
cd backend
cp .env.example .env
```

Edit `.env` and configure:
```env
MONGODB_URI=mongodb://localhost:27017/animora
PORT=4001

# For Hugging Face (default - no key needed)
AI_PROVIDER=huggingface

# OR for Together AI
# AI_PROVIDER=together
# TOGETHER_API_KEY=your_together_key_here

# OR for Groq
# AI_PROVIDER=groq
# GROQ_API_KEY=your_groq_key_here
```

### 4. Start the Application

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

## 🚀 How It Works

### Conversation Flow

1. **User asks a question** (any length)
   - Example: "Can you tell me about bovine mastitis? What are the symptoms and how should it be treated?"

2. **System searches disease database**
   - Finds relevant disease information using fuzzy matching
   - Searches by name, species, symptoms, treatments

3. **AI generates conversational response**
   - Uses disease data as context
   - Provides natural, detailed explanations
   - Maintains conversation history for follow-ups

4. **User asks follow-up**
   - Example: "What antibiotics are most effective?"
   - System remembers previous context about mastitis

### Features

✅ **Context Awareness**: Remembers up to 5 previous exchanges (10 messages)
✅ **Session Management**: Each chat session maintains its own context
✅ **Markdown Support**: Responses formatted with bold, lists, headings
✅ **Auto-scroll**: Chat window automatically scrolls to new messages
✅ **Error Handling**: Graceful fallback if AI service is unavailable
✅ **Clear Chat**: Reset conversation and start fresh anytime

## 📝 Example Conversations

### Long Question
**User**: "I have a dairy cow that seems to have mastitis. Can you explain what this disease is, what symptoms I should look for, and what treatment options are available? Also, is it dangerous for humans?"

**AI**: Provides comprehensive response using disease database, covering all aspects asked.

### Follow-up
**User**: "Which antibiotics work best for mastitis caused by E. coli?"

**AI**: References previous mastitis discussion and provides specific antibiotic information.

### General Question
**User**: "What preventive measures can I take?"

**AI**: Understands context (still talking about mastitis) and provides prevention advice.

## 🛠️ Troubleshooting

### Issue: "Authentication failed"
- **Cause**: Invalid or missing API key for selected provider
- **Fix**: Check `.env` file, ensure correct API key for your chosen provider

### Issue: "Service unavailable or rate limited"
- **Cause**: Free tier rate limit reached
- **Fix**: 
  - Wait a few minutes
  - Switch to different provider
  - Get API key for better rate limits

### Issue: AI responses are slow
- **Cause**: Free tier can be slower during peak times
- **Fix**: 
  - Switch to Groq (fastest free option)
  - Get API key for priority access

### Issue: Responses don't match disease data
- **Cause**: Disease not found in database
- **Fix**: 
  - Add more diseases to `diseases_100plus.json`
  - Use more specific disease names
  - AI will provide general veterinary knowledge as fallback

## 🎨 Customization

### Change AI Model

Edit `backend/utils/aiAgent.js` and modify the model in the provider configuration:

```javascript
huggingface: {
  url: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
  // Change to another model on Hugging Face
}
```

### Adjust Response Length

In `backend/controllers/chatController.js`, change `maxTokens`:

```javascript
const aiResponse = await getAIResponse(
  rawQuery,
  effectiveHistory,
  diseaseData,
  1500 // Increase for longer responses
);
```

### Modify Conversation History Length

In `backend/controllers/chatController.js`:

```javascript
// Keep only last 10 messages (5 exchanges)
if (sessionHistory.length > 10) {
  sessionHistory = sessionHistory.slice(-10);
}
```

## 📊 Performance Tips

1. **Use specific disease names** in questions for better database matching
2. **Clear chat** when switching topics to avoid context confusion
3. **Keep questions focused** for more accurate responses
4. **Use follow-ups** instead of repeating context

## 🔒 Privacy & Data

- Conversation history stored in memory (not persisted)
- Sessions automatically cleared after 1 hour
- Disease data never leaves your server
- AI providers only receive your questions and disease context
- No personal data sent to AI providers

## 📚 Additional Resources

- [Hugging Face Inference API](https://huggingface.co/docs/api-inference/index)
- [Together AI Docs](https://docs.together.ai/)
- [Groq Documentation](https://console.groq.com/docs)

---

**Need help?** Check your console logs for detailed error messages.
