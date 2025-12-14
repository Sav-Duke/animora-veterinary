// backend/controllers/imageController.js
import { analyzeAnimalImage, searchDiseasesBySymptoms } from '../utils/visionAgent.js';
import { getAIResponse } from '../utils/aiAgent.js';
import Disease from '../models/diseaseModel.js';

/**
 * Handle image upload and analysis
 */
export const analyzeImage = async (req, res) => {
  try {
    const { image, species, question, conversationHistory } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'No image provided. Send base64 encoded image in "image" field.'
      });
    }

    // Remove data URL prefix if present
    const imageBase64 = image.replace(/^data:image\/\w+;base64,/, '');
    
    console.log('🖼️  Analyzing image for species:', species || 'unknown');

    // Step 1: Analyze image with vision AI
    const visionResult = await analyzeAnimalImage(
      imageBase64,
      question,
      species || 'cattle'
    );

    console.log('✅ Vision analysis complete. Severity:', visionResult.metadata.severity);

    // Step 2: Search disease database based on detected symptoms
    let matchingDiseases = [];
    if (visionResult.metadata.symptoms.length > 0) {
      try {
        // Search for diseases matching the symptoms
        const symptomRegex = visionResult.metadata.symptoms.join('|');
        matchingDiseases = await Disease.find({
          $or: [
            { name: { $regex: symptomRegex, $options: 'i' } },
            { 'clinical_diagnosis_and_findings.findings': { $regex: symptomRegex, $options: 'i' } },
            { species: species || 'Cattle' }
          ]
        }).limit(3).lean();
        
        console.log(`📚 Found ${matchingDiseases.length} matching diseases`);
      } catch (dbError) {
        console.warn('Disease database search failed:', dbError.message);
      }
    }

    // Step 3: Generate comprehensive response using conversational AI
    const aiPrompt = question || 
      `Based on this image analysis, provide a comprehensive veterinary assessment and recommendations:

Vision Analysis Results:
${visionResult.analysis}

Detected Symptoms: ${visionResult.metadata.symptoms.join(', ') || 'None specific'}
Severity: ${visionResult.metadata.severity}
Urgency: ${visionResult.metadata.urgency}

${matchingDiseases.length > 0 ? `\nPossible Diseases from Database:\n${matchingDiseases.map(d => `- ${d.name}`).join('\n')}` : ''}

Please provide:
1. Summary of what you see in the image
2. Likely diagnosis or conditions
3. Recommended immediate actions
4. Whether veterinary visit is needed (and how urgently)
5. Any relevant information from the disease database`;

    let conversationalResponse;
    try {
      conversationalResponse = await getAIResponse(
        aiPrompt,
        conversationHistory || [],
        matchingDiseases.length > 0 ? matchingDiseases : null,
        1200
      );
    } catch (aiError) {
      console.warn('AI response generation failed, using vision analysis:', aiError.message);
      conversationalResponse = visionResult.analysis;
    }

    // Step 4: Return comprehensive result
    return res.json({
      success: true,
      response: conversationalResponse,
      imageAnalysis: {
        rawAnalysis: visionResult.analysis,
        severity: visionResult.metadata.severity,
        urgency: visionResult.metadata.urgency,
        symptoms: visionResult.metadata.symptoms,
        requiresVet: visionResult.metadata.requiresVet
      },
      matchingDiseases: matchingDiseases.length > 0 ? matchingDiseases.map(d => ({
        id: d._id,
        name: d.name,
        species: d.species
      })) : [],
      alert: getAlertMessage(visionResult.metadata.urgency)
    });

  } catch (error) {
    console.error('❌ Image Analysis Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      hint: error.message.includes('Ollama') ? 
        'Make sure Ollama is running and LLaVA model is installed' :
        'Image analysis service temporarily unavailable'
    });
  }
};

/**
 * Generate alert message based on urgency
 */
function getAlertMessage(urgency) {
  const alerts = {
    emergency: {
      level: 'emergency',
      icon: '🔴',
      message: 'EMERGENCY: Immediate veterinary attention required! This condition could be life-threatening.',
      action: 'Contact a veterinarian IMMEDIATELY or visit the nearest clinic NOW.'
    },
    urgent: {
      level: 'urgent',
      icon: '🟠',
      message: 'URGENT: Veterinary consultation needed within 24 hours.',
      action: 'Schedule a vet visit as soon as possible. Do not delay treatment.'
    },
    moderate: {
      level: 'moderate',
      icon: '🟡',
      message: 'MODERATE: Veterinary consultation recommended within 2-3 days.',
      action: 'Monitor the condition closely and contact a vet if symptoms worsen.'
    },
    monitor: {
      level: 'monitor',
      icon: '🟢',
      message: 'MONITOR: Keep observing the animal\'s condition.',
      action: 'Watch for any changes. Contact a vet if new symptoms develop or condition worsens.'
    }
  };

  return alerts[urgency] || alerts.monitor;
}

export default {
  analyzeImage
};
