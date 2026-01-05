/**
 * Real AI Question Extractor using direct REST API calls to Google Generative AI
 * This bypasses the SDK to use the correct v1 API endpoint
 */

/**
 * Extract questions from document text using Google Generative AI REST API
 * @param {string} documentText - Extracted text from document
 * @param {string} subject - Subject (physics, chemistry, biology)
 * @returns {Promise<Array<Object>>} - Array of extracted questions
 */
export async function extractQuestionsWithAI(documentText, subject = 'general') {
    try {
        // Check API key
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env.local file');
        }

        console.log('🤖 Initializing Gemini AI with REST API...');
        console.log('API Key (first 10 chars):', process.env.GEMINI_API_KEY.substring(0, 10) + '...');

        const prompt = `You are an expert question extraction assistant for NEET exam preparation. 

🚨 CRITICAL: Extract EVERY SINGLE QUESTION from the document. Do not stop until you've processed the entire text.

Your task is to extract ALL multiple-choice questions (MCQs) from the following document text. The document contains approximately 50+ questions. You MUST extract ALL of them.

EXTRACTION RULES:
1. ✅ Extract EVERY question - scan the ENTIRE document from start to finish
2. ✅ Each question should have 4 options (A, B, C, D)
3. ✅ Identify the correct answer for each question
4. ✅ For mathematical formulas, use KaTeX format with $ delimiters
5. ✅ For chemical formulas, use subscripts (_) and superscripts (^) in KaTeX
6. ✅ If a question references an image/diagram, set hasImage to true
7. ✅ Extract explanations if provided

OUTPUT FORMAT:
Return a JSON array with ALL questions. Do NOT truncate or summarize. Extract EVERY question you find.

[
  {
    "questionNumber": 1,
    "questionText": "Question text here (use KaTeX for formulas: $x^2 + y^2 = z^2$)",
    "optionA": "First option",
    "optionB": "Second option", 
    "optionC": "Third option",
    "optionD": "Fourth option",
    "correctAnswer": "A",
    "explanation": "Explanation text (optional)",
    "hasImage": false,
    "hasFormula": true,
    "formulaType": "math"
  },
  ... (continue for ALL questions in the document)
]

FORMULA CONVERSION EXAMPLES:
**Chemical Formulas (use subscripts and superscripts):**
- H₂O → $H_2O$
- CH₄ → $CH_4$
- CH₃COOH → $CH_3COOH$
- SO₄²⁻ → $SO_4^{2-}$
- NH₃ → $NH_3$
- CO₂ → $CO_2$
- H₂SO₄ → $H_2SO_4$
- C₆H₅NHCOCH₃ → $C_6H_5NHCOCH_3$

**Mathematical Formulas:**
- x² + 2x + 1 → $x^2 + 2x + 1$
- E = mc² → $E = mc^2$
- ½mv² → $\\frac{1}{2}mv^2$
- √(a² + b²) → $\\sqrt{a^2 + b^2}$
- Δ → $\\Delta$
- π → $\\pi$

IMPORTANT RULES:
- correctAnswer must be ONLY the letter: "A", "B", "C", or "D"
- formulaType can be: "math", "chemistry", or null
- Return ONLY valid JSON, no markdown code blocks or extra text
- Process the ENTIRE document - do not stop early
- If you see "Question 1" through "Question 55", extract ALL 55 questions
- Keep all text on single lines - do NOT include literal line breaks within string values
- Use spaces instead of line breaks in question text and explanations

Document text to process:
${documentText}

Remember: Extract ALL questions. Count them as you go. Do not stop until you've processed the entire document.`;

        console.log(`📤 Sending request to Gemini API (v1 endpoint)...`);
        console.log(`📝 Prompt length: ${prompt.length} characters`);

        // Use gemini-2.5-flash (latest model available with user's API key)
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.4, // Lower temperature for more consistent extraction
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 65536, // Maximum allowed - enough for 55+ questions
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error Response:', errorData);
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log(`📥 Received response from Gemini`);

        // Extract text from response
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error('No text in response:', data);
            throw new Error('No text content in API response');
        }

        console.log(`📊 Response length: ${text.length} characters`);

        // Clean up response - remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // ROBUST JSON SANITIZATION
        // The AI generates LaTeX/KaTeX formulas with single backslashes which are invalid in JSON
        // Strategy: Replace ALL single backslashes with double backslashes, except for valid JSON escapes
        console.log('🔧 Sanitizing JSON escape sequences...');

        // First, protect valid JSON escape sequences by replacing them with placeholders
        const escapeMap = {
            '\\n': '___NEWLINE___',
            '\\r': '___RETURN___',
            '\\t': '___TAB___',
            '\\"': '___QUOTE___',
            '\\\\': '___BACKSLASH___',
            '\\/': '___SLASH___',
            '\\b': '___BACKSPACE___',
            '\\f': '___FORMFEED___'
        };

        // Replace valid escapes with placeholders
        Object.keys(escapeMap).forEach(escape => {
            text = text.split(escape).join(escapeMap[escape]);
        });

        // Now replace ALL remaining single backslashes with double backslashes
        text = text.replace(/\\/g, '\\\\');

        // Restore the valid JSON escapes
        Object.keys(escapeMap).forEach(escape => {
            text = text.split(escapeMap[escape]).join(escape);
        });

        console.log('✓ JSON sanitization complete');


        // Remove control characters that break JSON parsing (but keep newlines for JSON structure)
        console.log('🔧 Removing control characters...');
        // Only remove non-printable control characters, NOT newlines/tabs which are part of JSON structure
        text = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
        console.log('✓ Control character removal complete');

        // If response seems incomplete, try to fix it
        if (!text.endsWith(']')) {
            console.warn('⚠️ Response appears incomplete, attempting to fix...');
            // Find the last complete question object
            const lastCompleteIndex = text.lastIndexOf('}');
            if (lastCompleteIndex > 0) {
                text = text.substring(0, lastCompleteIndex + 1) + '\n]';
                console.log('✓ Fixed incomplete JSON');
            }
        }

        // Parse JSON response
        let questions;
        try {
            questions = JSON.parse(text);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON');
            console.error('First 500 chars:', text.substring(0, 500));
            console.error('Last 500 chars:', text.substring(Math.max(0, text.length - 500)));
            console.error('Parse error:', parseError.message);
            throw new Error(`AI returned invalid JSON format: ${parseError.message}`);
        }

        // Validate and format questions
        const formattedQuestions = questions.map((q, index) => {
            // Ensure correct answer is uppercase single letter
            let correctAnswer = q.correctAnswer?.toString().toUpperCase().trim();
            if (correctAnswer && correctAnswer.length > 1) {
                // Extract just the letter if it's like "A)" or "A."
                correctAnswer = correctAnswer.charAt(0);
            }

            // Clean up chemistry notation - convert \ce{} to subscript notation
            const cleanChemistry = (text) => {
                if (!text) return text;
                // Convert \ce{H2O} to H_2O, \ce{CH3COOH} to CH_3COOH, etc.
                return text.replace(/\\ce\{([^}]+)\}/g, (match, formula) => {
                    // Simple conversion: add underscores before numbers
                    return formula.replace(/([A-Z][a-z]?)(\d+)/g, '$1_$2');
                });
            };

            return {
                no: q.questionNumber || index + 1,
                question: cleanChemistry(q.questionText || q.question || ''),
                options: [
                    cleanChemistry(q.optionA || q.options?.[0] || ''),
                    cleanChemistry(q.optionB || q.options?.[1] || ''),
                    cleanChemistry(q.optionC || q.options?.[2] || ''),
                    cleanChemistry(q.optionD || q.options?.[3] || '')
                ],
                correctAnswer: correctAnswer || 'A',
                explanation: cleanChemistry(q.explanation || ''),
                hasImage: q.hasImage || false,
                hasFormula: q.hasFormula || false,
                formulaType: q.formulaType || null,
                imageUrl: null, // Will be populated later if images are uploaded
                aiConfidence: 0.85 // Default confidence score
            };
        });

        console.log(`✅ Successfully formatted ${formattedQuestions.length} questions`);

        return formattedQuestions;

    } catch (error) {
        console.error('Error extracting questions with AI:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        throw new Error(`AI extraction failed: ${error.message}`);
    }
}

/**
 * Validate extracted questions
 * @param {Array<Object>} questions - Questions to validate
 * @returns {{valid: boolean, errors: Array<string>, warnings: Array<string>}}
 */
export function validateExtractedQuestions(questions) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(questions) || questions.length === 0) {
        errors.push('No questions were extracted');
        return { valid: false, errors, warnings };
    }

    questions.forEach((q, index) => {
        const qNum = q.no || index + 1;

        // Check required fields
        if (!q.question || q.question.trim().length === 0) {
            errors.push(`Question ${qNum}: Missing question text`);
        }

        if (!q.options || q.options.length !== 4) {
            errors.push(`Question ${qNum}: Must have exactly 4 options`);
        } else {
            q.options.forEach((opt, i) => {
                if (!opt || opt.trim().length === 0) {
                    warnings.push(`Question ${qNum}: Option ${String.fromCharCode(65 + i)} is empty`);
                }
            });
        }

        if (!q.correctAnswer || !['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
            errors.push(`Question ${qNum}: Invalid correct answer (must be A, B, C, or D)`);
        }

        // Check for potential issues
        if (q.question.length < 10) {
            warnings.push(`Question ${qNum}: Question text seems too short`);
        }

        if (!q.explanation || q.explanation.trim().length === 0) {
            warnings.push(`Question ${qNum}: No explanation provided`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Enhance questions with image associations
 * @param {Array<Object>} questions - Extracted questions
 * @param {Array<Object>} images - Extracted images
 * @returns {Array<Object>} - Questions with image associations
 */
export function associateImagesWithQuestions(questions, images) {
    if (!images || images.length === 0) {
        return questions;
    }

    // Simple strategy: distribute images across questions that have hasImage flag
    const questionsWithImages = questions.filter(q => q.hasImage);

    questionsWithImages.forEach((q, index) => {
        if (index < images.length) {
            q.imageData = images[index]; // Temporary - will be replaced with URL after upload
        }
    });

    return questions;
}
