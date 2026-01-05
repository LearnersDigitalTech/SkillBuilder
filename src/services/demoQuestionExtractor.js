/**
 * Demo/Mock AI Question Extractor
 * This provides sample questions for testing when Gemini API is not available
 */

/**
 * Generate mock questions based on document text
 * @param {string} documentText - Extracted text from document
 * @param {string} subject - Subject (physics, chemistry, biology)
 * @returns {Array<Object>} - Array of mock questions
 */
export function generateMockQuestions(documentText, subject = 'chemistry') {
    // Count how many questions to generate based on document length
    const questionCount = Math.min(Math.floor(documentText.length / 500), 10);

    const mockQuestions = [];

    for (let i = 1; i <= questionCount; i++) {
        mockQuestions.push({
            no: i,
            question: `Sample ${subject} question ${i}: What is the chemical formula for water?`,
            options: [
                '$\\ce{H2O}$',
                '$\\ce{CO2}$',
                '$\\ce{O2}$',
                '$\\ce{N2}$'
            ],
            correctAnswer: 'A',
            explanation: `Water is composed of two hydrogen atoms and one oxygen atom, represented as $\\ce{H2O}$. This is a fundamental chemical compound.`,
            hasImage: false,
            hasFormula: true,
            formulaType: 'chemistry',
            imageUrl: null,
            aiConfidence: 0.95
        });
    }

    // Add some variety
    if (questionCount > 1) {
        mockQuestions[1] = {
            no: 2,
            question: 'Calculate the value of $x$ in the equation $x^2 + 5x + 6 = 0$',
            options: [
                '$x = -2$ or $x = -3$',
                '$x = 2$ or $x = 3$',
                '$x = -1$ or $x = -6$',
                '$x = 1$ or $x = 6$'
            ],
            correctAnswer: 'A',
            explanation: 'Using the quadratic formula or factoring: $(x+2)(x+3) = 0$, we get $x = -2$ or $x = -3$',
            hasImage: false,
            hasFormula: true,
            formulaType: 'math',
            imageUrl: null,
            aiConfidence: 0.92
        };
    }

    if (questionCount > 2) {
        mockQuestions[2] = {
            no: 3,
            question: 'What is the molecular mass of $\\ce{CH3COOH}$ (acetic acid)?',
            options: [
                '60 g/mol',
                '44 g/mol',
                '32 g/mol',
                '18 g/mol'
            ],
            correctAnswer: 'A',
            explanation: 'The molecular formula $\\ce{CH3COOH}$ has: C(12×2) + H(1×4) + O(16×2) = 24 + 4 + 32 = 60 g/mol',
            hasImage: false,
            hasFormula: true,
            formulaType: 'chemistry',
            imageUrl: null,
            aiConfidence: 0.88
        };
    }

    return mockQuestions;
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
