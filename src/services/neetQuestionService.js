
/**
 * Save questions for a specific subject
 * @param {string} subject - physics | chemistry | biology
 * @param {Array} questions - Array of question objects
 * @param {string} teacherUid - UID of the teacher uploading
 * @returns {Promise<boolean>}
 */
export const saveNeetQuestions = async (subject, questions, teacherUid) => {
    try {
        const res = await fetch('/api/neet/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, questions, teacherUid })
        });
        return res.ok;
    } catch (error) {
        console.error(`Error saving NEET ${subject} questions:`, error);
        return false;
    }
};

/**
 * Fetch all questions for a specific subject
 * @param {string} subject - physics | chemistry | biology
 * @returns {Promise<Array>}
 */
export const getNeetQuestions = async (subject) => {
    try {
        const res = await fetch(`/api/neet/questions?subject=${encodeURIComponent(subject)}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.questions || [];
    } catch (error) {
        console.error(`Error fetching NEET ${subject} questions:`, error);
        return [];
    }
};

/**
 * Delete a single question
 * @param {string} subject 
 * @param {string} questionId 
 * @returns {Promise<boolean>}
 */
export const deleteNeetQuestion = async (subject, questionId) => {
    try {
        const res = await fetch(`/api/neet/questions?id=${questionId}&subject=${subject}`, {
            method: 'DELETE'
        });
        return res.ok;
    } catch (error) {
        console.error(`Error deleting NEET ${subject} question:`, error);
        return false;
    }
};

/**
 * Clear all questions for a subject
 * @param {string} subject 
 * @returns {Promise<boolean>}
 */
export const clearNeetQuestions = async (subject) => {
    try {
        const res = await fetch(`/api/neet/questions?subject=${encodeURIComponent(subject)}&clear=true`, {
            method: 'DELETE'
        });
        return res.ok;
    } catch (error) {
        console.error(`Error clearing NEET ${subject} questions:`, error);
        return false;
    }
};

