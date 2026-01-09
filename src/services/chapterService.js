import { ref, get, set, update, push, remove } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';

/**
 * Chapter Service for NEET Question Management
 * Handles CRUD operations for chapters within subjects
 */

/**
 * Create a new chapter
 * @param {string} subject - physics | chemistry | biology
 * @param {string} chapterName - Name of the chapter
 * @param {string} teacherUid - UID of the teacher creating
 * @returns {Promise<{success: boolean, chapterId?: string, error?: string}>}
 */
export const createChapter = async (subject, chapterName, teacherUid) => {
    try {
        const chaptersRef = ref(firebaseDatabase, `NMD_2025/NEET_Chapters/${subject}`);
        const newChapterRef = push(chaptersRef);

        await set(newChapterRef, {
            name: chapterName,
            questionCount: 0,
            practiceEnabled: false,
            createdBy: teacherUid,
            createdAt: new Date().toISOString()
        });

        return { success: true, chapterId: newChapterRef.key };
    } catch (error) {
        console.error('Error creating chapter:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all chapters for a subject
 * @param {string} subject - physics | chemistry | biology
 * @returns {Promise<Array>}
 */
export const getChapters = async (subject) => {
    try {
        const chaptersRef = ref(firebaseDatabase, `NMD_2025/NEET_Chapters/${subject}`);
        const snapshot = await get(chaptersRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
        return [];
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return [];
    }
};

/**
 * Update chapter details
 * @param {string} subject 
 * @param {string} chapterId 
 * @param {object} updates - { name?, practiceEnabled?, questionCount? }
 * @returns {Promise<boolean>}
 */
export const updateChapter = async (subject, chapterId, updates) => {
    try {
        const chapterRef = ref(firebaseDatabase, `NMD_2025/NEET_Chapters/${subject}/${chapterId}`);
        await update(chapterRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error updating chapter:', error);
        return false;
    }
};

/**
 * Toggle practice mode for a chapter
 * @param {string} subject 
 * @param {string} chapterId 
 * @param {boolean} enabled 
 * @returns {Promise<boolean>}
 */
export const toggleChapterPractice = async (subject, chapterId, enabled) => {
    return updateChapter(subject, chapterId, { practiceEnabled: enabled });
};

/**
 * Delete a chapter (and optionally its questions)
 * @param {string} subject 
 * @param {string} chapterId 
 * @param {boolean} deleteQuestions - Also delete questions in this chapter
 * @returns {Promise<boolean>}
 */
export const deleteChapter = async (subject, chapterId, deleteQuestions = false) => {
    try {
        // Delete chapter metadata
        const chapterRef = ref(firebaseDatabase, `NMD_2025/NEET_Chapters/${subject}/${chapterId}`);
        await remove(chapterRef);

        // Optionally delete questions
        if (deleteQuestions) {
            const questionsRef = ref(firebaseDatabase, `NMD_2025/NEET_Questions/${subject}/${chapterId}`);
            await remove(questionsRef);
        }

        return true;
    } catch (error) {
        console.error('Error deleting chapter:', error);
        return false;
    }
};

/**
 * Get chapters with practice enabled for students
 * @param {string} subject 
 * @returns {Promise<Array>}
 */
export const getPracticeEnabledChapters = async (subject) => {
    const chapters = await getChapters(subject);
    return chapters.filter(ch => ch.practiceEnabled);
};

/**
 * Increment question count for a chapter
 * @param {string} subject 
 * @param {string} chapterId 
 * @param {number} count - Number to add (can be negative)
 * @returns {Promise<boolean>}
 */
export const updateChapterQuestionCount = async (subject, chapterId, count) => {
    try {
        const chapterRef = ref(firebaseDatabase, `NMD_2025/NEET_Chapters/${subject}/${chapterId}`);
        const snapshot = await get(chapterRef);

        if (snapshot.exists()) {
            const chapter = snapshot.val();
            const newCount = Math.max(0, (chapter.questionCount || 0) + count);
            await update(chapterRef, { questionCount: newCount });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating question count:', error);
        return false;
    }
};
