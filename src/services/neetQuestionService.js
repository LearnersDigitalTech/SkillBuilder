import { ref, get, set, update, push } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';

/**
 * Save questions for a specific subject
 * @param {string} subject - physics | chemistry | biology
 * @param {Array} questions - Array of question objects
 * @param {string} teacherUid - UID of the teacher uploading
 * @param {string} uploadMethod - 'excel' | 'ai_document'
 * @returns {Promise<boolean>}
 */
export const saveNeetQuestions = async (subject, questions, teacherUid, uploadMethod = 'excel') => {
    try {
        const timestamp = new Date().toISOString();
        const updates = {};

        questions.forEach((q) => {
            const newPostKey = push(ref(firebaseDatabase, `NMD_2025/NEET_Questions/${subject}`)).key;
            updates[`NMD_2025/NEET_Questions/${subject}/${newPostKey}`] = {
                ...q,
                uploadedBy: teacherUid,
                uploadMethod: uploadMethod,
                createdAt: timestamp,
                // Ensure these fields exist
                imageUrl: q.imageUrl || null,
                hasFormula: q.hasFormula || false,
                formulaType: q.formulaType || null,
                aiConfidence: q.aiConfidence || null
            };
        });

        await update(ref(firebaseDatabase), updates);
        return true;
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
        const questionsRef = ref(firebaseDatabase, `NMD_2025/NEET_Questions/${subject}`);
        const snapshot = await get(questionsRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return [];
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
        const questionRef = ref(firebaseDatabase, `NMD_2025/NEET_Questions/${subject}/${questionId}`);
        await set(questionRef, null);
        return true;
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
        const subjectRef = ref(firebaseDatabase, `NMD_2025/NEET_Questions/${subject}`);
        await set(subjectRef, null);
        return true;
    } catch (error) {
        console.error(`Error clearing NEET ${subject} questions:`, error);
        return false;
    }
};
