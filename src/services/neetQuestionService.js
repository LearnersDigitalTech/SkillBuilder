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

/**
 * Update a single question
 * @param {string} subject - physics | chemistry | biology
 * @param {string} questionId - ID of the question to update
 * @param {object} updates - Object containing fields to update
 * @returns {Promise<boolean>}
 */
export const updateNeetQuestion = async (subject, questionId, updates) => {
    try {
        const questionRef = ref(firebaseDatabase, `NMD_2025/NEET_Questions/${subject}/${questionId}`);
        const timestamp = new Date().toISOString();
        await update(questionRef, {
            ...updates,
            updatedAt: timestamp
        });
        return true;
    } catch (error) {
        console.error(`Error updating NEET ${subject} question:`, error);
        return false;
    }
};

// ============================================
// CHAPTER-BASED QUESTION FUNCTIONS (NEW)
// ============================================

/**
 * Save questions to a specific chapter
 * @param {string} subject - physics | chemistry | biology
 * @param {string} chapterId - ID of the chapter
 * @param {Array} questions - Array of question objects
 * @param {string} teacherUid - UID of the teacher uploading
 * @param {string} uploadMethod - 'excel' | 'ai_document'
 * @returns {Promise<{success: boolean, count: number}>}
 */
export const saveQuestionsToChapter = async (subject, chapterId, questions, teacherUid, uploadMethod = 'ai_document') => {
    try {
        const timestamp = new Date().toISOString();
        const updates = {};

        questions.forEach((q) => {
            const newPostKey = push(ref(firebaseDatabase, `NMD_2025/NEET_Questions/${subject}/${chapterId}`)).key;
            updates[`NMD_2025/NEET_Questions/${subject}/${chapterId}/${newPostKey}`] = {
                ...q,
                chapterId: chapterId,
                uploadedBy: teacherUid,
                uploadMethod: uploadMethod,
                createdAt: timestamp,
                imageUrl: q.imageUrl || null,
                hasFormula: q.hasFormula || false,
                formulaType: q.formulaType || null,
                aiConfidence: q.aiConfidence || null
            };
        });

        await update(ref(firebaseDatabase), updates);
        return { success: true, count: questions.length };
    } catch (error) {
        console.error(`Error saving questions to chapter:`, error);
        return { success: false, count: 0 };
    }
};

/**
 * Get all questions for a specific chapter
 * @param {string} subject - physics | chemistry | biology
 * @param {string} chapterId - ID of the chapter
 * @returns {Promise<Array>}
 */
export const getChapterQuestions = async (subject, chapterId) => {
    try {
        const questionsRef = ref(firebaseDatabase, `NMD_2025/NEET_Questions/${subject}/${chapterId}`);
        const snapshot = await get(questionsRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.keys(data).map(key => ({
                id: key,
                chapterId: chapterId,
                ...data[key]
            })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return [];
    } catch (error) {
        console.error(`Error fetching chapter questions:`, error);
        return [];
    }
};

/**
 * Delete a question from a chapter
 * @param {string} subject 
 * @param {string} chapterId 
 * @param {string} questionId 
 * @returns {Promise<boolean>}
 */
export const deleteChapterQuestion = async (subject, chapterId, questionId) => {
    try {
        const questionRef = ref(firebaseDatabase, `NMD_2025/NEET_Questions/${subject}/${chapterId}/${questionId}`);
        await set(questionRef, null);
        return true;
    } catch (error) {
        console.error(`Error deleting chapter question:`, error);
        return false;
    }
};

/**
 * Clear all questions in a chapter
 * @param {string} subject 
 * @param {string} chapterId 
 * @returns {Promise<boolean>}
 */
export const clearChapterQuestions = async (subject, chapterId) => {
    try {
        const chapterRef = ref(firebaseDatabase, `NMD_2025/NEET_Questions/${subject}/${chapterId}`);
        await set(chapterRef, null);
        return true;
    } catch (error) {
        console.error(`Error clearing chapter questions:`, error);
        return false;
    }
};

/**
 * Get random questions from a chapter
 * @param {string} subject 
 * @param {string} chapterId 
 * @param {number} count - Number of questions to get
 * @returns {Promise<Array>}
 */
export const getRandomChapterQuestions = async (subject, chapterId, count) => {
    const questions = await getChapterQuestions(subject, chapterId);
    if (questions.length <= count) return questions;

    // Fisher-Yates shuffle and take first 'count'
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
};

