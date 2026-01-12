import { ref, get, set, update, push, remove } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';

const BASE_PATH = 'NMD_2025/AbacusInsights';

// ============================================================
// TEST MANAGEMENT
// ============================================================

/**
 * Create a new test/paper
 * @param {Object} testData - { name, duration, shuffleQuestions }
 * @param {string} adminUid - Admin's Firebase UID
 * @returns {Promise<string|null>} - Test ID or null on failure
 */
export const createTest = async (testData, adminUid) => {
    try {
        const testRef = push(ref(firebaseDatabase, `${BASE_PATH}/Tests`));
        const testId = testRef.key;

        await set(testRef, {
            ...testData,
            id: testId,
            createdAt: new Date().toISOString(),
            createdBy: adminUid,
            isActive: true,
            questionCount: 0
        });

        return testId;
    } catch (error) {
        console.error('Error creating test:', error);
        return null;
    }
};

/**
 * Get all tests
 * @returns {Promise<Array>}
 */
export const getTests = async () => {
    try {
        const testsRef = ref(firebaseDatabase, `${BASE_PATH}/Tests`);
        const snapshot = await get(testsRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return [];
    } catch (error) {
        console.error('Error fetching tests:', error);
        return [];
    }
};

/**
 * Update test details
 * @param {string} testId
 * @param {Object} updates
 * @returns {Promise<boolean>}
 */
export const updateTest = async (testId, updates) => {
    try {
        const testRef = ref(firebaseDatabase, `${BASE_PATH}/Tests/${testId}`);
        await update(testRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error updating test:', error);
        return false;
    }
};

/**
 * Delete a test and all its questions/students
 * @param {string} testId
 * @returns {Promise<boolean>}
 */
export const deleteTest = async (testId) => {
    try {
        const updates = {};
        updates[`${BASE_PATH}/Tests/${testId}`] = null;
        updates[`${BASE_PATH}/Questions/${testId}`] = null;
        updates[`${BASE_PATH}/Students/${testId}`] = null;
        await update(ref(firebaseDatabase), updates);
        return true;
    } catch (error) {
        console.error('Error deleting test:', error);
        return false;
    }
};

// ============================================================
// QUESTION MANAGEMENT
// ============================================================

/**
 * Save questions in bulk for a test
 * @param {string} testId
 * @param {Array} questions - Array of question objects
 * @param {string} adminUid
 * @returns {Promise<boolean>}
 */
export const saveQuestions = async (testId, questions, adminUid) => {
    try {
        const timestamp = new Date().toISOString();
        const updates = {};

        questions.forEach((q) => {
            const newKey = push(ref(firebaseDatabase, `${BASE_PATH}/Questions/${testId}`)).key;
            updates[`${BASE_PATH}/Questions/${testId}/${newKey}`] = {
                ...q,
                id: newKey,
                uploadedBy: adminUid,
                createdAt: timestamp
            };
        });

        // Update question count in test
        const questionsRef = ref(firebaseDatabase, `${BASE_PATH}/Questions/${testId}`);
        const existingSnapshot = await get(questionsRef);
        const existingCount = existingSnapshot.exists() ? Object.keys(existingSnapshot.val()).length : 0;
        updates[`${BASE_PATH}/Tests/${testId}/questionCount`] = existingCount + questions.length;

        await update(ref(firebaseDatabase), updates);
        return true;
    } catch (error) {
        console.error('Error saving questions:', error);
        return false;
    }
};

/**
 * Update a single question
 * @param {string} testId
 * @param {string} questionId
 * @param {Object} updates
 * @returns {Promise<boolean>}
 */
export const updateQuestion = async (testId, questionId, updates) => {
    try {
        const qRef = ref(firebaseDatabase, `${BASE_PATH}/Questions/${testId}/${questionId}`);
        await update(qRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error updating question:', error);
        return false;
    }
};

/**
 * Get all questions for a test
 */
export const getQuestions = async (testId) => {
    try {
        const questionsRef = ref(firebaseDatabase, `${BASE_PATH}/Questions/${testId}`);
        const snapshot = await get(questionsRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).sort((a, b) => (a.no || 0) - (b.no || 0));
        }
        return [];
    } catch (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
};

/**
 * Delete a single question
 * @param {string} testId
 * @param {string} questionId
 * @returns {Promise<boolean>}
 */
export const deleteQuestion = async (testId, questionId) => {
    try {
        const questionRef = ref(firebaseDatabase, `${BASE_PATH}/Questions/${testId}/${questionId}`);
        await remove(questionRef);

        // Update question count
        const questionsRef = ref(firebaseDatabase, `${BASE_PATH}/Questions/${testId}`);
        const snapshot = await get(questionsRef);
        const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
        await update(ref(firebaseDatabase, `${BASE_PATH}/Tests/${testId}`), { questionCount: count });

        return true;
    } catch (error) {
        console.error('Error deleting question:', error);
        return false;
    }
};

/**
 * Clear all questions for a test
 * @param {string} testId
 * @returns {Promise<boolean>}
 */
export const clearQuestions = async (testId) => {
    try {
        const questionsRef = ref(firebaseDatabase, `${BASE_PATH}/Questions/${testId}`);
        await set(questionsRef, null);
        await update(ref(firebaseDatabase, `${BASE_PATH}/Tests/${testId}`), { questionCount: 0 });
        return true;
    } catch (error) {
        console.error('Error clearing questions:', error);
        return false;
    }
};

// ============================================================
// STUDENT UID MANAGEMENT
// ============================================================

/**
 * Generate unique 6-digit UID
 * @returns {string}
 */
const generateUID = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate student UIDs for a test
 * @param {string} testId
 * @param {Array} students - Array of { name } objects
 * @param {string} adminUid
 * @returns {Promise<Array|null>} - Array of generated students with UIDs
 */
export const generateStudentUIDs = async (testId, students, adminUid) => {
    try {
        const timestamp = new Date().toISOString();
        const updates = {};
        const generatedStudents = [];

        // Get existing UIDs to avoid duplicates
        const existingRef = ref(firebaseDatabase, `${BASE_PATH}/Students/${testId}`);
        const existingSnapshot = await get(existingRef);
        const existingUIDs = new Set();
        let existingCount = 0;
        if (existingSnapshot.exists()) {
            const existingStudents = Object.values(existingSnapshot.val());
            existingStudents.forEach(s => existingUIDs.add(s.uid));
            existingCount = existingStudents.length;
        }

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            let uid = generateUID();
            // Ensure unique UID
            while (existingUIDs.has(uid)) {
                uid = generateUID();
            }
            existingUIDs.add(uid);

            const studentData = {
                name: student.name,
                uid: uid,
                assignedPaper: student.assignedPaper || testId, // Store which paper this student should see
                orderIndex: student.orderIndex || existingCount + i + 1, // Sequential order from Excel
                createdAt: timestamp,
                createdBy: adminUid,
                hasAttempted: false
            };

            updates[`${BASE_PATH}/Students/${testId}/${uid}`] = studentData;
            generatedStudents.push(studentData);
        }

        await update(ref(firebaseDatabase), updates);
        return generatedStudents;
    } catch (error) {
        console.error('Error generating student UIDs:', error);
        return null;
    }
};

/**
 * Get all students for a test
 * @param {string} testId
 * @returns {Promise<Array>}
 */
export const getStudents = async (testId) => {
    try {
        const studentsRef = ref(firebaseDatabase, `${BASE_PATH}/Students/${testId}`);
        const snapshot = await get(studentsRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.keys(data).map(key => ({
                ...data[key]
            })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return [];
    } catch (error) {
        console.error('Error fetching students:', error);
        return [];
    }
};

/**
 * Validate student UID and get student data
 * @param {string} uid - 6-digit UID
 * @returns {Promise<{ valid: boolean, student?: Object, testId?: string, test?: Object }>}
 */
export const validateStudentUID = async (uid) => {
    try {
        // Search across all tests for this UID
        const testsRef = ref(firebaseDatabase, `${BASE_PATH}/Tests`);
        const testsSnapshot = await get(testsRef);

        if (!testsSnapshot.exists()) {
            return { valid: false, error: 'No tests found' };
        }

        const tests = testsSnapshot.val();

        for (const testId of Object.keys(tests)) {
            const studentRef = ref(firebaseDatabase, `${BASE_PATH}/Students/${testId}/${uid}`);
            const studentSnapshot = await get(studentRef);

            if (studentSnapshot.exists()) {
                const student = studentSnapshot.val();
                const test = tests[testId];

                // Check if test is active
                if (!test.isActive) {
                    return { valid: false, error: 'This test is not currently active' };
                }

                // Check if already attempted (Allow resumption if sessionId exists)
                if (student.hasAttempted && !student.sessionId) {
                    return { valid: false, error: 'You have already attempted this test' };
                }

                // Get the assigned paper details (might be different from registration test)
                const assignedPaperId = student.assignedPaper || testId;
                const assignedPaper = tests[assignedPaperId];

                if (!assignedPaper) {
                    return { valid: false, error: 'Assigned paper not found' };
                }

                if (!assignedPaper.isActive) {
                    return { valid: false, error: 'Your assigned paper is not currently active' };
                }

                return {
                    valid: true,
                    student,
                    testId,
                    test,
                    assignedPaperId, // The paper from which questions will be fetched
                    assignedPaper    // The paper details
                };
            }
        }

        return { valid: false, error: 'Invalid UID. Please check and try again.' };
    } catch (error) {
        console.error('Error validating UID:', error);
        return { valid: false, error: 'An error occurred. Please try again.' };
    }
};

/**
 * Delete a student
 * @param {string} testId
 * @param {string} uid
 * @returns {Promise<boolean>}
 */
export const deleteStudent = async (testId, uid) => {
    try {
        const studentRef = ref(firebaseDatabase, `${BASE_PATH}/Students/${testId}/${uid}`);
        await remove(studentRef);
        return true;
    } catch (error) {
        console.error('Error deleting student:', error);
        return false;
    }
};

// ============================================================
// EXAM SESSION MANAGEMENT
// ============================================================

/**
 * Create a new exam session
 * @param {string} testId
 * @param {string} studentUid
 * @param {Object} studentData
 * @returns {Promise<string|null>} - Session ID or null
 */
export const createSession = async (testId, studentUid, studentData) => {
    try {
        const sessionRef = push(ref(firebaseDatabase, `${BASE_PATH}/Sessions`));
        const sessionId = sessionRef.key;

        const now = new Date().toISOString();
        await set(sessionRef, {
            id: sessionId,
            testId,
            studentUid,
            studentName: studentData.name,
            assignedPaper: studentData.assignedPaper || testId,
            assignedQuestions: studentData.assignedQuestions || null, // For fixed random sets
            startTime: now,
            lastActivityTime: now, // Track last activity for elapsed time calculation
            status: 'in-progress',
            answers: {},
            grades: {}, // For manual grading { questionId: { marks, feedback, gradedAt } }
            violations: []
        });

        // Mark student as attempted
        await update(ref(firebaseDatabase, `${BASE_PATH}/Students/${testId}/${studentUid}`), {
            hasAttempted: true,
            attemptedAt: new Date().toISOString(),
            sessionId
        });

        return sessionId;
    } catch (error) {
        console.error('Error creating session:', error);
        return null;
    }
};

/**
 * Update session with manual grades for practical tasks
 * @param {string} sessionId 
 * @param {Object} grades - { questionId: { marks, feedback } }
 * @returns {Promise<boolean>}
 */
export const updateSessionGrades = async (sessionId, grades) => {
    try {
        const timestamp = new Date().toISOString();
        const gradesWithTimestamp = {};

        Object.keys(grades).forEach(qId => {
            gradesWithTimestamp[qId] = {
                ...grades[qId],
                gradedAt: timestamp
            };
        });

        await update(ref(firebaseDatabase, `${BASE_PATH}/Sessions/${sessionId}`), {
            grades: gradesWithTimestamp,
            lastGraded: timestamp
        });
        return true;
    } catch (error) {
        console.error('Error updating grades:', error);
        return false;
    }
};

/**
 * Update session with answers
 * @param {string} sessionId
 * @param {Object} answers - { questionId: selectedOption }
 * @returns {Promise<boolean>}
 */
export const updateSessionAnswers = async (sessionId, answers) => {
    try {
        await update(ref(firebaseDatabase, `${BASE_PATH}/Sessions/${sessionId}`), {
            answers,
            lastUpdated: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error updating session:', error);
        return false;
    }
};

/**
 * Log a security violation
 * @param {string} sessionId
 * @param {Object} violation - { type, details, timestamp }
 * @returns {Promise<boolean>}
 */
export const logSessionViolation = async (sessionId, violation) => {
    try {
        const violationRef = push(ref(firebaseDatabase, `${BASE_PATH}/Sessions/${sessionId}/violations`));
        await set(violationRef, {
            ...violation,
            timestamp: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error logging violation:', error);
        return false;
    }
};

/**
 * Complete the exam session
 * @param {string} sessionId
 * @param {Object} data - { answers, autoSubmitted }
 * @returns {Promise<boolean>}
 */
export const completeSession = async (sessionId, data) => {
    try {
        await update(ref(firebaseDatabase, `${BASE_PATH}/Sessions/${sessionId}`), {
            answers: data.answers,
            endTime: new Date().toISOString(),
            status: data.autoSubmitted ? 'auto-submitted' : 'completed'
        });
        return true;
    } catch (error) {
        console.error('Error completing session:', error);
        return false;
    }
};

/**
 * Get session details
 * @param {string} sessionId
 * @returns {Promise<Object|null>}
 */
export const getSession = async (sessionId) => {
    try {
        const sessionRef = ref(firebaseDatabase, `${BASE_PATH}/Sessions/${sessionId}`);
        const snapshot = await get(sessionRef);
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error('Error fetching session:', error);
        return null;
    }
};

/**
 * Get all sessions for a test (admin view)
 * @param {string} testId
 * @returns {Promise<Array>}
 */
export const getTestSessions = async (testId) => {
    try {
        const sessionsRef = ref(firebaseDatabase, `${BASE_PATH}/Sessions`);
        const snapshot = await get(sessionsRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.keys(data)
                .map(key => data[key])
                .filter(session => session.testId === testId)
                .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        }
        return [];
    } catch (error) {
        console.error('Error fetching test sessions:', error);
        return [];
    }
};

/**
 * Get a specific student's session for a test
 * @param {string} testId
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
export const getStudentSession = async (testId, uid) => {
    try {
        const sessionsRef = ref(firebaseDatabase, `${BASE_PATH}/Sessions`);
        const snapshot = await get(sessionsRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            const session = Object.values(data).find(s => s.testId === testId && s.studentUid === uid);
            return session || null;
        }
        return null;
    } catch (error) {
        console.error('Error fetching student session:', error);
        return null;
    }
};
