// Test script to check Gemini API connectivity and available models
// Run with: node test-gemini.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testGeminiAPI() {
    console.log('🔍 Testing Gemini API...\n');

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found in .env.local');
        return;
    }

    console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
    console.log('   Length:', apiKey.length, 'characters\n');

    // Initialize client
    const genAI = new GoogleGenerativeAI(apiKey);

    // Try different model names
    const modelsToTry = [
        'gemini-pro',
        'gemini-1.0-pro',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'models/gemini-pro',
        'models/gemini-1.5-pro'
    ];

    for (const modelName of modelsToTry) {
        try {
            console.log(`\n📝 Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            // Try a simple generation
            const result = await model.generateContent('Say "Hello"');
            const response = await result.response;
            const text = response.text();

            console.log(`✅ SUCCESS! Model ${modelName} works!`);
            console.log(`   Response: ${text}`);
            console.log(`\n🎉 Use this model name in your code: "${modelName}"\n`);
            break; // Stop after first success

        } catch (error) {
            console.log(`❌ Failed: ${error.message.substring(0, 100)}...`);
        }
    }
}

testGeminiAPI().catch(console.error);
