import { ref, get, update, set } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';

/**
 * Get all teachers from Registrations
 * @returns {Promise<Array>} Array of teacher objects
 */
export const getAllTeachers = async () => {
    try {
        const registrationsRef = ref(firebaseDatabase, 'NMD_2025/Registrations');
        const snapshot = await get(registrationsRef);

        if (!snapshot.exists()) {
            return [];
        }

        const registrations = snapshot.val();
        const teachersMap = new Map(); // Use Map to deduplicate by ticketCode

        Object.entries(registrations).forEach(([uid, userData]) => {
            if (userData.userType === 'teacher') {
                const assignments = userData.teacherAssignments || {};
                const assignedGrades = assignments.assignedGrades || [];
                const students = assignments.students || {};
                const ticketCode = userData.ticketCode || 'N/A';

                const teacherData = {
                    uid,
                    name: userData.name || 'Unknown',
                    email: userData.email || userData.parentEmail || 'N/A',
                    ticketCode: ticketCode,
                    phoneNumber: userData.phoneNumber || userData.parentPhone || 'N/A',
                    schoolName: userData.schoolName || 'N/A',
                    assignedGradesCount: assignedGrades.length,
                    totalStudents: Object.keys(students).length,
                    assignedGrades,
                    createdAt: userData.createdAt || null
                };

                // Deduplicate: If we already have this ticketCode, prefer the UID-based entry
                // (UID-based entries have more complete data and are the primary reference)
                if (!teachersMap.has(ticketCode)) {
                    teachersMap.set(ticketCode, teacherData);
                } else {
                    // If the current entry's key is NOT the ticketCode itself, it's a UID
                    // Prefer UID-based entries over ticketCode-based entries
                    if (uid !== ticketCode) {
                        teachersMap.set(ticketCode, teacherData);
                    }
                }
            }
        });

        return Array.from(teachersMap.values());
    } catch (error) {
        console.error('Error fetching teachers:', error);
        return [];
    }
};

/**
 * Get teacher details with full assignment information
 * @param {string} teacherUid - Teacher's Firebase UID
 * @returns {Promise<Object|null>} Teacher details object
 */
export const getTeacherDetails = async (teacherUid) => {
    try {
        const teacherRef = ref(firebaseDatabase, `NMD_2025/Registrations/${teacherUid}`);
        const snapshot = await get(teacherRef);

        if (!snapshot.exists()) {
            return null;
        }

        const userData = snapshot.val();

        if (userData.userType !== 'teacher') {
            return null;
        }

        const assignments = userData.teacherAssignments || {};

        return {
            uid: teacherUid,
            name: userData.name || 'Unknown',
            email: userData.email || userData.parentEmail || 'N/A',
            ticketCode: userData.ticketCode || 'N/A',
            phoneNumber: userData.phoneNumber || userData.parentPhone || 'N/A',
            schoolName: userData.schoolName || 'N/A',
            createdAt: userData.createdAt || null,
            assignments: {
                assignedGrades: assignments.assignedGrades || [],
                students: assignments.students || {},
                lastUpdated: assignments.lastUpdated || null,
                updatedBy: assignments.updatedBy || null
            }
        };
    } catch (error) {
        console.error('Error fetching teacher details:', error);
        return null;
    }
};

/**
 * Assign grades to a teacher
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {Array<string>} grades - Array of grade names
 * @param {string} adminUid - Admin's Firebase UID
 * @returns {Promise<boolean>} Success status
 */
export const assignGradesToTeacher = async (teacherUid, grades, adminUid) => {
    try {
        const updates = {
            [`NMD_2025/Registrations/${teacherUid}/teacherAssignments/assignedGrades`]: grades,
            [`NMD_2025/Registrations/${teacherUid}/teacherAssignments/lastUpdated`]: new Date().toISOString(),
            [`NMD_2025/Registrations/${teacherUid}/teacherAssignments/updatedBy`]: adminUid
        };

        await update(ref(firebaseDatabase), updates);
        return true;
    } catch (error) {
        console.error('Error assigning grades to teacher:', error);
        return false;
    }
};

/**
 * Assign students to a teacher
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {Array<Object>} students - Array of student objects {uid, childId, grade}
 * @param {string} adminUid - Admin's Firebase UID
 * @returns {Promise<boolean>} Success status
 */
export const assignStudentsToTeacher = async (teacherUid, students, adminUid) => {
    try {
        const studentsMap = {};
        const timestamp = new Date().toISOString();

        students.forEach(student => {
            // Store the UID as the database key - this is already the correct key
            // from Registrations, so it will work for all registration methods
            studentsMap[student.uid] = {
                childId: student.childId,
                grade: student.grade,
                assignedAt: timestamp,
                assignedBy: adminUid,
                // Store the UID again as databaseKey for clarity and future compatibility
                databaseKey: student.uid
            };
        });

        const updates = {
            [`NMD_2025/Registrations/${teacherUid}/teacherAssignments/students`]: studentsMap,
            [`NMD_2025/Registrations/${teacherUid}/teacherAssignments/lastUpdated`]: timestamp,
            [`NMD_2025/Registrations/${teacherUid}/teacherAssignments/updatedBy`]: adminUid
        };

        await update(ref(firebaseDatabase), updates);
        return true;
    } catch (error) {
        console.error('Error assigning students to teacher:', error);
        return false;
    }
};

/**
 * Remove a grade assignment from teacher
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {string} grade - Grade to remove
 * @returns {Promise<boolean>} Success status
 */
export const removeGradeFromTeacher = async (teacherUid, grade) => {
    try {
        const teacherDetails = await getTeacherDetails(teacherUid);
        if (!teacherDetails) return false;

        const updatedGrades = teacherDetails.assignments.assignedGrades.filter(g => g !== grade);

        const updates = {
            [`NMD_2025/Registrations/${teacherUid}/teacherAssignments/assignedGrades`]: updatedGrades,
            [`NMD_2025/Registrations/${teacherUid}/teacherAssignments/lastUpdated`]: new Date().toISOString()
        };

        await update(ref(firebaseDatabase), updates);
        return true;
    } catch (error) {
        console.error('Error removing grade from teacher:', error);
        return false;
    }
};

/**
 * Remove a student assignment from teacher
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {string} studentUid - Student's UID to remove
 * @returns {Promise<boolean>} Success status
 */
export const removeStudentFromTeacher = async (teacherUid, studentUid) => {
    try {
        const teacherDetails = await getTeacherDetails(teacherUid);
        if (!teacherDetails) return false;

        const updatedStudents = { ...teacherDetails.assignments.students };
        delete updatedStudents[studentUid];

        const updates = {
            [`NMD_2025/Registrations/${teacherUid}/teacherAssignments/students`]: updatedStudents,
            [`NMD_2025/Registrations/${teacherUid}/teacherAssignments/lastUpdated`]: new Date().toISOString()
        };

        await update(ref(firebaseDatabase), updates);
        return true;
    } catch (error) {
        console.error('Error removing student from teacher:', error);
        return false;
    }
}


/**
 * Reset all assignments for a teacher
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {string} adminUid - Admin's Firebase UID
 * @returns {Promise<boolean>} Success status
 */
export const resetTeacherAssignments = async (teacherUid, adminUid) => {
    try {
        const timestamp = new Date().toISOString();
        const updates = {
            [`NMD_2025/Registrations/${teacherUid}/teacherAssignments/assignedGrades`]: [],
            [`NMD_2025/Registrations/${teacherUid}/teacherAssignments/students`]: null,
            [`NMD_2025/Registrations/${teacherUid}/teacherAssignments/lastUpdated`]: timestamp,
            [`NMD_2025/Registrations/${teacherUid}/teacherAssignments/updatedBy`]: adminUid
        };

        await update(ref(firebaseDatabase), updates);
        return true;
    } catch (error) {
        console.error('Error resetting teacher assignments:', error);
        return false;
    }
};

/**
 * Get all students filtered by grade
 * @param {string} grade - Grade to filter by
 * @returns {Promise<Array>} Array of student objects
 */
export const getStudentsByGrade = async (grade) => {
    try {
        const registrationsRef = ref(firebaseDatabase, 'NMD_2025/Registrations');
        const snapshot = await get(registrationsRef);

        if (!snapshot.exists()) {
            return [];
        }

        const registrations = snapshot.val();
        const students = [];

        Object.entries(registrations).forEach(([uid, userData]) => {
            // Skip teachers
            if (userData.userType === 'teacher') return;

            // Helper to normalize grade for comparison
            const normalize = (g) => (g || '').toLowerCase().replace(/\s+/g, '');
            const targetGrade = normalize(grade);

            // 1. Check for modern "children" structure
            if (userData.children) {
                Object.entries(userData.children).forEach(([childId, child]) => {
                    const childGrade = normalize(child.grade);
                    // Match if normalized grades are equal
                    // Also check if target is just number "1" and child is "Grade 1" or vice-versa
                    if (childGrade === targetGrade || childGrade.includes(targetGrade) || targetGrade.includes(childGrade)) {
                        students.push({
                            uid,
                            childId,
                            name: child.name || 'Unknown',
                            grade: child.grade,
                            schoolName: userData.schoolName || userData.school || child.schoolName || child.school || 'Unknown School',
                            email: child.email || userData.parentEmail || 'N/A',
                            phoneNumber: userData.parentPhone || userData.phoneNumber || 'N/A'
                        });
                    }
                });
            }
            // 2. Check for legacy/single-user structure (no children node, grade at root)
            else if (userData.grade) {
                const userGrade = normalize(userData.grade);
                if (userGrade === targetGrade || userGrade.includes(targetGrade) || targetGrade.includes(userGrade)) {
                    students.push({
                        uid,
                        childId: 'default', // Legacy users don't have childId
                        name: userData.name || 'Unknown',
                        grade: userData.grade,
                        schoolName: userData.schoolName || userData.school || 'Unknown School',
                        email: userData.email || userData.parentEmail || 'N/A',
                        phoneNumber: userData.phoneNumber || userData.parentPhone || 'N/A'
                    });
                }
            }
        });

        return students;
    } catch (error) {
        console.error('Error fetching students by grade:', error);
        return [];
    }
};

/**
 * Get details for a batch of students by UID/ChildID
 * @param {Array<{uid: string, childId: string}>} studentsList 
 * @returns {Promise<Array<Object>>} Hydrated student details
 */
export const getStudentDetailsBatch = async (studentsList) => {
    if (!studentsList || studentsList.length === 0) return [];

    try {
        const registrationsRef = ref(firebaseDatabase, 'NMD_2025/Registrations');
        const snapshot = await get(registrationsRef);

        if (!snapshot.exists()) return [];

        const registrations = snapshot.val();
        const hydratedStudents = [];

        studentsList.forEach(({ uid, childId }) => {
            const userData = registrations[uid];
            if (!userData) return;

            let studentDetails = null;

            // 1. Try to find in children (Modern)
            if (userData.children && userData.children[childId]) {
                const child = userData.children[childId];
                studentDetails = {
                    uid,
                    childId,
                    name: child.name || 'Unknown',
                    grade: child.grade,
                    schoolName: userData.schoolName || userData.school || child.schoolName || child.school || 'Unknown School',
                    email: child.email || userData.parentEmail || 'N/A',
                    phoneNumber: userData.parentPhone || userData.phoneNumber || 'N/A'
                };
            }
            // 2. Try root level (Legacy) if childId matches or is 'default'
            else if (!userData.children && (childId === 'default' || !childId)) {
                studentDetails = {
                    uid,
                    childId: 'default',
                    name: userData.name || 'Unknown',
                    grade: userData.grade,
                    schoolName: userData.schoolName || userData.school || 'Unknown School',
                    email: userData.email || userData.parentEmail || 'N/A',
                    phoneNumber: userData.phoneNumber || userData.parentPhone || 'N/A'
                };
            }
            // 3. Fallback: If childId exists but not found in children (deleted?), or hybrid case
            // We skip if we strictly can't find the referenced child.

            if (studentDetails) {
                hydratedStudents.push(studentDetails);
            }
        });

        return hydratedStudents;

    } catch (error) {
        console.error('Error fetching student batch details:', error);
        return [];
    }
};
