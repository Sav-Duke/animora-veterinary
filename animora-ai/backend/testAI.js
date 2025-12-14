// Test the AI service
import { getAIResponse } from './utils/aiAgent.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('🧪 Testing Animora AI Service...\n');
console.log(`AI Provider: ${process.env.AI_PROVIDER || 'huggingface'}\n`);

// Test 1: Simple question
async function testSimpleQuestion() {
  console.log('Test 1: Simple Question');
  console.log('Question: "What is mastitis?"\n');
  
  try {
    const response = await getAIResponse(
      "What is mastitis?",
      [],
      null,
      500
    );
    console.log('✅ Response received:');
    console.log(response.substring(0, 200) + '...\n');
  } catch (error) {
    console.error('❌ Error:', error.message, '\n');
  }
}

// Test 2: Question with disease context
async function testWithContext() {
  console.log('Test 2: Question with Disease Context');
  console.log('Question: "Tell me about this disease"\n');
  
  const diseaseData = {
    name: "Bovine Mastitis",
    species: ["Cattle"],
    description: "Inflammation of the mammary gland",
    treatment: [
      {
        modality: "Intramammary Antibiotics",
        antibiotics: ["Cloxacillin", "Penicillin"]
      }
    ]
  };
  
  try {
    const response = await getAIResponse(
      "Tell me about this disease and its treatment",
      [],
      diseaseData,
      500
    );
    console.log('✅ Response received:');
    console.log(response.substring(0, 200) + '...\n');
  } catch (error) {
    console.error('❌ Error:', error.message, '\n');
  }
}

// Test 3: Conversation with follow-up
async function testFollowUp() {
  console.log('Test 3: Follow-up Question');
  
  const history = [
    { role: 'user', content: 'What is mastitis?' },
    { role: 'assistant', content: 'Mastitis is an inflammation of the mammary gland, commonly affecting dairy cattle.' }
  ];
  
  console.log('Previous context: Discussion about mastitis');
  console.log('Follow-up: "What are the treatment options?"\n');
  
  try {
    const response = await getAIResponse(
      "What are the treatment options?",
      history,
      null,
      500
    );
    console.log('✅ Response received:');
    console.log(response.substring(0, 200) + '...\n');
  } catch (error) {
    console.error('❌ Error:', error.message, '\n');
  }
}

// Run all tests
async function runTests() {
  await testSimpleQuestion();
  await testWithContext();
  await testFollowUp();
  console.log('🎉 All tests completed!');
}

runTests().catch(console.error);
