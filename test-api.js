// Quick test script to verify API endpoints
const baseUrl = 'http://localhost:5000/api';

async function testHealthCheck() {
  try {
    const response = await fetch(`${baseUrl}/health`);
    const data = await response.json();
    console.log('Health Check:', data);
    return true;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

async function testAnalyze() {
  try {
    const response = await fetch(`${baseUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        update_text: "We just hit $1M ARR! Our team has grown from 5 to 15 people this quarter, and we've launched 3 new features that our customers love. Our monthly recurring revenue increased by 40% and we're seeing strong adoption across all customer segments."
      }),
    });
    
    const data = await response.json();
    console.log('Analyze Response:', data);
    return data;
  } catch (error) {
    console.error('Analyze test failed:', error);
    return null;
  }
}

async function testGenerate(contentChoice = 'image') {
  try {
    const response = await fetch(`${baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        update_text: "We just hit $1M ARR! Our team has grown from 5 to 15 people this quarter, and we've launched 3 new features that our customers love. Our monthly recurring revenue increased by 40% and we're seeing strong adoption across all customer segments.",
        content_choice: contentChoice
      }),
    });
    
    const data = await response.json();
    console.log('Generate Response:', data);
    return data;
  } catch (error) {
    console.error('Generate test failed:', error);
    return null;
  }
}

async function runTests() {
  console.log('=== Testing API Endpoints ===\n');
  
  console.log('1. Testing Health Check...');
  const healthOk = await testHealthCheck();
  
  if (healthOk) {
    console.log('\n2. Testing Analyze Endpoint...');
    const analyzeResult = await testAnalyze();
    
    if (analyzeResult) {
      console.log('\n3. Testing Generate Endpoint...');
      await testGenerate('image');
    }
  }
  
  console.log('\n=== Test Complete ===');
}

// For Node.js environment
if (typeof require !== 'undefined') {
  // Use node-fetch for Node.js
  const fetch = require('node-fetch');
  runTests();
} else {
  // Browser environment
  runTests();
}