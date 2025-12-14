// backend/utils/visionAgent.js
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Vision AI Service for Animal Health Image Analysis
 * Supports multiple free vision models:
 * 1. Ollama LLaVA (local, free, no API key)
 * 2. Hugging Face BLIP-2 (free API with optional key)
 * 3. Moondream2 via Ollama (lightweight, fast)
 */

const VISION_PROVIDER = process.env.VISION_PROVIDER || 'ollama';

const VISION_PROVIDERS = {
  ollama: {
    url: 'http://localhost:11434/api/generate',
    model: 'llava', // or 'moondream' for lightweight
    formatRequest: (imageBase64, prompt) => ({
      model: 'llava',
      prompt: prompt,
      images: [imageBase64],
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9
      }
    }),
    parseResponse: (data) => data.response || 'No analysis generated'
  },
  
  huggingface: {
    url: 'https://api-inference.huggingface.co/models/Salesforce/blip2-opt-2.7b',
    getHeaders: () => ({
      'Authorization': process.env.HUGGINGFACE_API_KEY ? `Bearer ${process.env.HUGGINGFACE_API_KEY}` : '',
      'Content-Type': 'application/json'
    }),
    formatRequest: (imageBase64, prompt) => ({
      inputs: imageBase64,
      parameters: {
        question: prompt || "What symptoms or health issues can you see in this animal?"
      }
    }),
    parseResponse: (data) => {
      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text;
      }
      return data.generated_text || data[0]?.answer || 'No analysis generated';
    }
  }
};

/**
 * Analyze an animal health image
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} userQuestion - Optional specific question about the image
 * @param {string} species - Animal species for context
 * @returns {Promise<object>} Analysis results
 */
export async function analyzeAnimalImage(imageBase64, userQuestion = null, species = 'cattle') {
  const provider = VISION_PROVIDERS[VISION_PROVIDER];
  
  if (!provider) {
    throw new Error(`Unknown vision provider: ${VISION_PROVIDER}`);
  }

  // Build comprehensive veterinary analysis prompt
  const basePrompt = `You are an expert veterinarian analyzing a ${species} health image.

Examine this image carefully and provide:
1. What you observe (visible symptoms, abnormalities, conditions)
2. Possible health issues or diseases indicated
3. Severity level (mild, moderate, severe, emergency)
4. Recommended immediate actions
5. Whether veterinary consultation is needed

Focus on: wounds, lesions, swelling, parasites, skin conditions, udder issues, limb problems, eye problems, discharge, and any visible abnormalities.

${userQuestion ? `\nSpecific question: ${userQuestion}` : ''}

Provide a clear, actionable assessment.`;

  try {
    let response;
    
    if (VISION_PROVIDER === 'ollama') {
      // Ollama uses a different endpoint structure
      response = await axios.post(
        provider.url,
        provider.formatRequest(imageBase64, basePrompt),
        { timeout: 60000 } // Vision models can be slow
      );
    } else {
      // Hugging Face and other API providers
      response = await axios.post(
        provider.url,
        provider.formatRequest(imageBase64, basePrompt),
        {
          headers: provider.getHeaders(),
          timeout: 30000
        }
      );
    }

    const analysis = provider.parseResponse(response.data);
    
    // Extract severity and keywords from analysis
    const severity = extractSeverity(analysis);
    const symptoms = extractSymptoms(analysis);
    const urgency = determineUrgency(analysis, severity);
    
    return {
      success: true,
      analysis: analysis,
      metadata: {
        severity: severity,
        symptoms: symptoms,
        urgency: urgency,
        requiresVet: urgency === 'urgent' || urgency === 'emergency',
        species: species,
        provider: VISION_PROVIDER
      }
    };

  } catch (error) {
    console.error('Vision AI Error:', error.response?.data || error.message);
    
    // Provide helpful error messages
    if (VISION_PROVIDER === 'ollama' && error.code === 'ECONNREFUSED') {
      throw new Error('Ollama is not running. Start it with: ollama serve\nThen install LLaVA: ollama pull llava');
    }
    
    if (error.response?.status === 503) {
      throw new Error('Vision model is loading. Please wait a moment and try again.');
    }
    
    throw new Error(`Vision analysis failed: ${error.message}`);
  }
}

/**
 * Extract severity level from analysis text
 */
function extractSeverity(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('emergency') || lowerText.includes('critical') || lowerText.includes('life-threatening')) {
    return 'emergency';
  } else if (lowerText.includes('severe') || lowerText.includes('serious') || lowerText.includes('significant')) {
    return 'severe';
  } else if (lowerText.includes('moderate')) {
    return 'moderate';
  } else if (lowerText.includes('mild') || lowerText.includes('minor')) {
    return 'mild';
  }
  
  return 'unknown';
}

/**
 * Extract symptom keywords from analysis
 */
function extractSymptoms(text) {
  const symptoms = [];
  const symptomKeywords = [
    'wound', 'lesion', 'swelling', 'inflammation', 'redness', 'discharge',
    'parasite', 'tick', 'lice', 'mange', 'abscess', 'infection',
    'mastitis', 'udder', 'teat', 'lameness', 'hoof', 'foot rot',
    'skin condition', 'rash', 'hair loss', 'crust', 'scab',
    'eye problem', 'conjunctivitis', 'blindness', 'cloudy eye'
  ];
  
  const lowerText = text.toLowerCase();
  symptomKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      symptoms.push(keyword);
    }
  });
  
  return symptoms;
}

/**
 * Determine urgency level
 */
function determineUrgency(text, severity) {
  const lowerText = text.toLowerCase();
  
  const emergencyKeywords = ['emergency', 'immediate', 'urgent', 'critical', 'life-threatening', 'toxic', 'shock'];
  const urgentKeywords = ['requires veterinary', 'consult vet', 'see a vet', 'veterinary attention', 'within 24 hours'];
  
  if (emergencyKeywords.some(kw => lowerText.includes(kw)) || severity === 'emergency') {
    return 'emergency';
  } else if (urgentKeywords.some(kw => lowerText.includes(kw)) || severity === 'severe') {
    return 'urgent';
  } else if (severity === 'moderate') {
    return 'moderate';
  } else {
    return 'monitor';
  }
}

/**
 * Search disease database based on visual symptoms
 * @param {Array} symptoms - Extracted symptoms from image
 * @param {string} species - Animal species
 * @returns {Promise<Array>} Matching diseases
 */
export async function searchDiseasesBySymptoms(symptoms, species = 'cattle') {
  // This will integrate with your existing disease database
  // For now, return a placeholder that you can enhance
  return {
    symptoms: symptoms,
    species: species,
    matches: [] // Will be populated by disease search
  };
}

export default {
  analyzeAnimalImage,
  searchDiseasesBySymptoms
};
