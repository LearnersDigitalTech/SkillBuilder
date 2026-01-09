import { ref, get, set, update, push } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';

/**
 * Quiz Service for NEET Question Management
 * Handles creating, fetching, and managing quizzes
 */

/**
 * Generate a unique quiz code (6 chars, uppercase alphanumeric)
 */
const generateQuizCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0,O,1,I
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

/**
 * Generate a shareable link ID (URL-safe base64-like)
 */
const generateShareableId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 12; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};

/**
 * Create a new quiz
 * @param {object} quizData - Quiz configuration
 * @param {string} quizData.subject - physics | chemistry | biology
 * @param {string} quizData.title - Quiz title
 * @param {Array} quizData.chapters - Array of { chapterId, chapterName, count }
 * @param {number} quizData.totalQuestions - Total question count
 * @param {number} quizData.timeMinutes - Time limit in minutes
 * @param {string} quizData.createdBy - Teacher UID
 * @param {string} quizData.type - 'overall' | 'chapter'
 * @returns {Promise<{success: boolean, quizId?: string, quizCode?: string, shareableLink?: string}>}
 */
export const createQuiz = async (quizData) => {
    try {
        const quizCode = generateQuizCode();
        const shareableId = generateShareableId();

        const quizzesRef = ref(firebaseDatabase, 'NMD_2025/NEET_Quizzes');
        const newQuizRef = push(quizzesRef);

        const quiz = {
            ...quizData,
            quizCode: quizCode,
            shareableId: shareableId,
            status: 'active',
            createdAt: new Date().toISOString(),
            attemptCount: 0
        };

        await set(newQuizRef, quiz);

        // Also index by quiz code for quick lookup
        await set(ref(firebaseDatabase, `NMD_2025/NEET_Quiz_Codes/${quizCode}`), newQuizRef.key);
        await set(ref(firebaseDatabase, `NMD_2025/NEET_Quiz_Links/${shareableId}`), newQuizRef.key);

        return {
            success: true,
            quizId: newQuizRef.key,
            quizCode: quizCode,
            shareableId: shareableId
        };
    } catch (error) {
        console.error('Error creating quiz:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get quiz by code
 * @param {string} code - 6-character quiz code
 * @returns {Promise<object|null>}
 */
export const getQuizByCode = async (code) => {
    try {
        const codeRef = ref(firebaseDatabase, `NMD_2025/NEET_Quiz_Codes/${code.toUpperCase()}`);
        const codeSnapshot = await get(codeRef);

        if (!codeSnapshot.exists()) return null;

        const quizId = codeSnapshot.val();
        const quizRef = ref(firebaseDatabase, `NMD_2025/NEET_Quizzes/${quizId}`);
        const quizSnapshot = await get(quizRef);

        if (quizSnapshot.exists()) {
            return { id: quizId, ...quizSnapshot.val() };
        }
        return null;
    } catch (error) {
        console.error('Error fetching quiz by code:', error);
        return null;
    }
};

/**
 * Get quiz by shareable link ID
 * @param {string} shareableId - 12-character shareable ID
 * @returns {Promise<object|null>}
 */
export const getQuizByShareableId = async (shareableId) => {
    try {
        const linkRef = ref(firebaseDatabase, `NMD_2025/NEET_Quiz_Links/${shareableId}`);
        const linkSnapshot = await get(linkRef);

        if (!linkSnapshot.exists()) return null;

        const quizId = linkSnapshot.val();
        const quizRef = ref(firebaseDatabase, `NMD_2025/NEET_Quizzes/${quizId}`);
        const quizSnapshot = await get(quizRef);

        if (quizSnapshot.exists()) {
            return { id: quizId, ...quizSnapshot.val() };
        }
        return null;
    } catch (error) {
        console.error('Error fetching quiz by shareable ID:', error);
        return null;
    }
};

/**
 * Get all quizzes created by a teacher
 * @param {string} teacherUid 
 * @returns {Promise<Array>}
 */
export const getTeacherQuizzes = async (teacherUid) => {
    try {
        const quizzesRef = ref(firebaseDatabase, 'NMD_2025/NEET_Quizzes');
        const snapshot = await get(quizzesRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.keys(data)
                .filter(key => data[key].createdBy === teacherUid)
                .map(key => ({ id: key, ...data[key] }))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return [];
    } catch (error) {
        console.error('Error fetching teacher quizzes:', error);
        return [];
    }
};

/**
 * Get quizzes by subject
 * @param {string} subject 
 * @returns {Promise<Array>}
 */
export const getQuizzesBySubject = async (subject) => {
    try {
        const quizzesRef = ref(firebaseDatabase, 'NMD_2025/NEET_Quizzes');
        const snapshot = await get(quizzesRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.keys(data)
                .filter(key => data[key].subject === subject && data[key].status === 'active')
                .map(key => ({ id: key, ...data[key] }))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return [];
    } catch (error) {
        console.error('Error fetching quizzes by subject:', error);
        return [];
    }
};

/**
 * Update quiz status
 * @param {string} quizId 
 * @param {string} status - 'active' | 'inactive' | 'archived'
 * @returns {Promise<boolean>}
 */
export const updateQuizStatus = async (quizId, status) => {
    try {
        const quizRef = ref(firebaseDatabase, `NMD_2025/NEET_Quizzes/${quizId}`);
        await update(quizRef, { status, updatedAt: new Date().toISOString() });
        return true;
    } catch (error) {
        console.error('Error updating quiz status:', error);
        return false;
    }
};

/**
 * Increment quiz attempt count
 * @param {string} quizId 
 * @returns {Promise<boolean>}
 */
export const incrementQuizAttempt = async (quizId) => {
    try {
        const quizRef = ref(firebaseDatabase, `NMD_2025/NEET_Quizzes/${quizId}`);
        const snapshot = await get(quizRef);

        if (snapshot.exists()) {
            const quiz = snapshot.val();
            await update(quizRef, {
                attemptCount: (quiz.attemptCount || 0) + 1,
                lastAttemptAt: new Date().toISOString()
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error incrementing attempt count:', error);
        return false;
    }
};

/**
 * Delete a quiz
 * @param {string} quizId 
 * @returns {Promise<boolean>}
 */
export const deleteQuiz = async (quizId) => {
    try {
        // First get the quiz to remove code/link indexes
        const quizRef = ref(firebaseDatabase, `NMD_2025/NEET_Quizzes/${quizId}`);
        const snapshot = await get(quizRef);

        if (snapshot.exists()) {
            const quiz = snapshot.val();

            // Remove code index
            if (quiz.quizCode) {
                await set(ref(firebaseDatabase, `NMD_2025/NEET_Quiz_Codes/${quiz.quizCode}`), null);
            }

            // Remove link index
            if (quiz.shareableId) {
                await set(ref(firebaseDatabase, `NMD_2025/NEET_Quiz_Links/${quiz.shareableId}`), null);
            }

            // Delete quiz
            await set(quizRef, null);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting quiz:', error);
        return false;
    }
};
