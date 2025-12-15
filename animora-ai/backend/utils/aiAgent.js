import axios from 'axios';
import dotenv from 'dotenv';
import { searchVeterinaryInfo, needsWebSearch } from './webSearchAgent.js';
dotenv.config();

/**
 * Get a conversational AI response using free LLM services.
 * Supports multiple backends:
 * 1. Groq (fast free tier with API key) - RECOMMENDED
 * 2. xAI Grok (free tier)
 * 3. Together AI (free tier with API key)
 * 4. Ollama (local, no API key needed if installed)
 * 
 * Set in .env:
 * - AI_PROVIDER=groq|xai|together|ollama (default: groq)
 * - GROQ_API_KEY (for Groq) - Get free at: https://console.groq.com
 * - XAI_API_KEY (for xAI Grok) - Get at: https://console.x.ai
 * - TOGETHER_API_KEY (for Together AI) - Get free at: https://api.together.xyz
 */

// Configuration for different LLM providers
const AI_PROVIDER = process.env.AI_PROVIDER || 'groq';

const PROVIDERS = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    getHeaders: () => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY || ''}`
    }),
    formatRequest: (messages, maxTokens) => ({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      max_tokens: Math.min(maxTokens || 1500, 8000),
      temperature: 0.7
    }),
    parseResponse: (data) => data.choices[0].message.content
  },
  xai: {
    url: 'https://api.x.ai/v1/chat/completions',
    getHeaders: () => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.XAI_API_KEY || ''}`
    }),
    formatRequest: (messages, maxTokens) => ({
      model: 'grok-beta',
      messages: messages,
      max_tokens: maxTokens || 1500,
      temperature: 0.7
    }),
    parseResponse: (data) => data.choices[0].message.content
  },
  together: {
    url: 'https://api.together.xyz/v1/chat/completions',
    getHeaders: () => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY || ''}`
    }),
    formatRequest: (messages, maxTokens) => ({
      model: 'mistralai/Mistral-7B-Instruct-v0.1',
      messages: messages,
      max_tokens: maxTokens || 1000,
      temperature: 0.7,
      top_p: 0.95
    }),
    parseResponse: (data) => data.choices[0].message.content
  },
  ollama: {
    url: 'http://localhost:11434/api/chat',
    getHeaders: () => ({
      'Content-Type': 'application/json'
    }),
    formatRequest: (messages, maxTokens) => ({
      model: 'llama2',
      messages: messages,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.95,
        num_predict: maxTokens || 1000
      }
    }),
    parseResponse: (data) => data.message?.content || data.response || 'No response'
  }
};

/**
 * Get AI response with conversation history support
 * @param {string} userMessage - Current user message
 * @param {Array} conversationHistory - Array of previous messages [{role: 'user'|'assistant', content: string}]
 * @param {Object|Array} diseaseData - Disease data to use as context
 * @param {number} maxTokens - Max tokens for response
 * @param {boolean} enableWebSearch - Whether to search web for additional info (default: true)
 */
export async function getAIResponse(userMessage, conversationHistory = [], diseaseData = null, maxTokens = 1000, enableWebSearch = true) {
  const provider = PROVIDERS[AI_PROVIDER];
  
  if (!provider) {
    throw new Error(`Unknown AI provider: ${AI_PROVIDER}. Use: huggingface, together, or groq`);
  }

  // Check if we should search the web for additional information
  let webSearchResults = null;
  if (enableWebSearch && needsWebSearch(userMessage)) {
    console.log('🌐 Performing web search for additional veterinary information...');
    try {
      webSearchResults = await searchVeterinaryInfo(userMessage);
      console.log('✅ Web search completed:', webSearchResults?.hasResults ? 'Found results' : 'No results');
    } catch (error) {
      console.warn('⚠️ Web search failed, continuing without it:', error.message);
      webSearchResults = null; // Ensure it's null on error
    }
  }

  // Build context from disease data if provided
  let context = '';
  if (diseaseData) {
    if (Array.isArray(diseaseData)) {
      // Limit array size to prevent token overflow
      const limitedData = diseaseData.slice(0, 2);
      context = `Database: ${JSON.stringify(limitedData)}`;
    } else {
      // Limit object size
      context = `Database: ${JSON.stringify(diseaseData).substring(0, 1500)}`;
    }
  }

  // Add web search results to context (keep it concise)
  if (webSearchResults?.hasResults && webSearchResults.summary) {
    const webSummary = webSearchResults.summary.substring(0, 800); // Limit web search length
    context += context ? `\n\nWeb Info: ${webSummary}` : `Web Info: ${webSummary}`;
  }

  // Build the messages array for the AI
  const messages = [
    {
      role: 'system',
      content: `You are Animora AI, a friendly veterinary assistant for LIVESTOCK and FARM ANIMALS.

CRITICAL: FMD = Foot and Mouth Disease (livestock), NOT feline disease.

CONVERSATIONAL HANDLING:
- For greetings (hello, hi, hey, etc.): Respond warmly and briefly, then ask how you can help with animal health
- For casual questions: Answer naturally and conversationally
- For disease queries: Provide comprehensive technical information

DATA EXPLOITATION - EXTRACT EVERYTHING:
1. EXTRACT ALL data from MongoDB database - every field, every detail, NOTHING left out
2. EXTRACT ALL unique information from web search - every fact, every detail
3. MERGE intelligently - combine overlapping info, eliminate exact duplicates only
4. COMPREHENSIVE OUTPUT - if MongoDB has treatments/dosages/pathogens/steps, include EVERY SINGLE ONE
5. If web search adds new angles (economic impact, global context, etc.), ADD them
6. Present as ONE complete, exhaustive resource

Content Requirements - Include EVERYTHING:
- Full disease overview and etiology
- ALL transmission methods and risk factors
- COMPLETE clinical signs (oral, foot, systemic, all lesion types)
- ALL target pathogens/serotypes from database
- EVERY treatment option with full details
- ALL antibiotics/medications with dosages if available
- COMPLETE administration steps (all 5-10 steps if listed)
- ALL considerations (withdrawal periods, duration, types)
- Prevention and biosecurity measures
- Economic and systemic impacts
- Diagnosis methods
- Management strategies
- Action plans

Formatting Rules for Disease Info:
- Use ONLY "-" bullets (NEVER "+")
- Use "**bold**" ONLY for the main disease name at the very top
- Use regular heading format (##) for sections like Overview, Clinical Signs, Treatment, etc.
- NO bold for section headings - just use markdown headings
- Clear hierarchical organization
- NO References section
- NO end notes about sources or "consult veterinarian" disclaimers at the end
- Integrate "consult veterinarian for serious cases" naturally within relevant sections

${context ? context + '\n' : ''}

Deliver exhaustive, professional veterinary information. Be friendly for casual chat, comprehensive for disease queries.`
    }
  ];

  // Add conversation history
  if (conversationHistory && conversationHistory.length > 0) {
    // Limit history to last 6 messages (3 exchanges) to avoid token limits
    const recentHistory = conversationHistory.slice(-6);
    messages.push(...recentHistory);
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage
  });

  try {
    const response = await axios.post(
      provider.url,
      provider.formatRequest(messages, maxTokens),
      { 
        headers: provider.getHeaders(),
        timeout: 30000 // 30 second timeout
      }
    );

    const aiResponse = provider.parseResponse(response.data);
    
    // Return response with metadata about web search
    return {
      response: aiResponse,
      webSearchUsed: webSearchResults?.hasResults || false,
      sources: webSearchResults?.sources || null
    };

  } catch (error) {
    console.error('❌ AI Provider Error:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Message:', error.message);
    
    // Handle specific errors
    if (error.response?.status === 401) {
      throw new Error(`Authentication failed for ${AI_PROVIDER}. Please check your API key in .env file.`);
    } else if (error.response?.status === 400) {
      const errorMsg = error.response?.data?.error?.message || 'Invalid request format';
      throw new Error(`Bad request to ${AI_PROVIDER}: ${errorMsg}`);
    } else if (error.response?.status === 503 || error.response?.status === 429) {
      throw new Error(`${AI_PROVIDER} service is currently unavailable or rate limited. Please try again in a moment.`);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The AI service took too long to respond.');
    }
    
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
}

/**
 * Simple conversational response without disease data
 * Useful for general questions and follow-ups
 */
export async function getChatResponse(userMessage, conversationHistory = [], enableWebSearch = true) {
  return getAIResponse(userMessage, conversationHistory, null, 800, enableWebSearch);
}
