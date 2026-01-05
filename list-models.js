// Quick script to list available Gemini models for your API key
// Run with: node list-models.js

require('dotenv').config({ path: '.env.local' });

async function listAvailableModels() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found');
        return;
    }

    console.log('🔍 Checking available models for your API key...\n');
    console.log('API Key:', apiKey.substring(0, 10) + '...\n');

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Error:', error);
            return;
        }

        const data = await response.json();

        console.log('✅ Available models:\n');

        if (data.models && data.models.length > 0) {
            data.models.forEach(model => {
                const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent');
                if (supportsGenerate) {
                    console.log(`✓ ${model.name}`);
                    console.log(`  Display Name: ${model.displayName}`);
                    console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
                    console.log('');
                }
            });

            console.log('\n📝 Models that support generateContent:');
            const generateModels = data.models.filter(m =>
                m.supportedGenerationMethods?.includes('generateContent')
            );
            generateModels.forEach(m => console.log(`  - ${m.name}`));

        } else {
            console.log('❌ No models found for this API key');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

listAvailableModels();
