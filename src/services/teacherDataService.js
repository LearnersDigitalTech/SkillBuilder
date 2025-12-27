/**
 * Teacher Data Service
 * Handles all data operations for teacher dashboard
 */

import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';

/**
 * Get grades assigned to a teacher
 * @param {string} teacherUid - Teacher's Firebase UID
 * @returns {Promise<Array<string>>} Array of grade names
 */
export const getAssignedGrades = async (teacherUid) => {
    try {
        const teacherRef = ref(firebaseDatabase, `NMD_2025/Registrations/${teacherUid}/teacherAssignments`);
        const snapshot = await get(teacherRef);

        if (snapshot.exists()) {
            const assignments = snapshot.val();
            return assignments.assignedGrades || [];
        }

        return [];
    } catch (error) {
        console.error('Error fetching assigned grades:', error);
        return [];
    }
};

/**
 * Get all students in a specific grade assigned to a teacher
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {string} grade - Grade name (e.g., "Grade 1")
 * @returns {Promise<Array>} Array of student objects
 */
export const getStudentsByGrade = async (teacherUid, grade) => {
    try {
        console.log("📚 getStudentsByGrade called:", { teacherUid, grade });

        // First, get the teacher's assigned students
        const teacherRef = ref(firebaseDatabase, `NMD_2025/Registrations/${teacherUid}/teacherAssignments/students`);
        const teacherSnapshot = await get(teacherRef);

        if (!teacherSnapshot.exists()) {
            console.log("⚠️ No assigned students found for teacher");
            return [];
        }

        const assignedStudents = teacherSnapshot.val();
        console.log("👥 Assigned students:", assignedStudents);
        const students = [];

        // Filter students by grade and fetch their data
        for (const [studentUid, studentInfo] of Object.entries(assignedStudents)) {
            console.log(`🔍 Checking student ${studentUid}:`, studentInfo);

            if (studentInfo.grade === grade) {
                console.log(`✅ Grade matches! Fetching registration data...`);

                // Use databaseKey if available (for new assignments), otherwise use studentUid (for old assignments)
                const lookupKey = studentInfo.databaseKey || studentUid;
                console.log(`🔑 Using lookup key: ${lookupKey}`);

                // Fetch student registration data
                const studentRef = ref(firebaseDatabase, `NMD_2025/Registrations/${lookupKey}`);
                const studentSnapshot = await get(studentRef);

                if (studentSnapshot.exists()) {
                    const studentData = studentSnapshot.val();
                    console.log(`📊 Student data found:`, studentData);
                    const childData = studentData.children?.[studentInfo.childId];
                    console.log(`👶 Child data:`, childData);

                    if (childData) {
                        const studentObj = {
                            uid: lookupKey,  // Use the lookup key as UID for consistency
                            childId: studentInfo.childId,
                            name: childData.name,
                            grade: childData.grade,
                            email: studentData.parentEmail || studentData.email,
                            assignedAt: studentInfo.assignedAt,
                            ...childData
                        };
                        console.log(`✅ Adding student to list:`, studentObj);
                        students.push(studentObj);
                    } else {
                        console.log(`❌ Child data not found for childId: ${studentInfo.childId}`);
                    }
                } else {
                    console.log(`❌ Student registration not found at: NMD_2025/Registrations/${lookupKey}`);
                }
            } else {
                console.log(`⏭️ Skipping - grade mismatch (${studentInfo.grade} !== ${grade})`);
            }
        }

        console.log(`📋 Final student list (${students.length} students):`, students);
        return students.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error('Error fetching students by grade:', error);
        return [];
    }
};

/**
 * Get dashboard data for a specific student
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {string} studentUid - Student's Firebase UID
 * @param {string} childId - Child profile ID
 * @returns {Promise<Object|null>} Student dashboard data or null
 */
export const getStudentDashboardData = async (teacherUid, studentUid, childId) => {
    try {
        // First verify teacher has access to this student
        const hasAccess = await checkTeacherAccess(teacherUid, studentUid, childId);

        if (!hasAccess) {
            console.warn('Teacher does not have access to this student');
            return null;
        }

        // Fetch student's reports
        const userKey = studentUid.replace('.', '_');
        const reportsRef = ref(firebaseDatabase, `NMD_2025/Reports/${userKey}/${childId}`);
        const reportsSnapshot = await get(reportsRef);

        if (!reportsSnapshot.exists()) {
            return {
                reports: null,
                studentInfo: await getStudentInfo(studentUid, childId)
            };
        }

        return {
            reports: reportsSnapshot.val(),
            studentInfo: await getStudentInfo(studentUid, childId)
        };
    } catch (error) {
        console.error('Error fetching student dashboard data:', error);
        return null;
    }
};

/**
 * Get basic student information
 * @param {string} studentUid - Student's Firebase UID
 * @param {string} childId - Child profile ID
 * @returns {Promise<Object|null>} Student info or null
 */
const getStudentInfo = async (studentUid, childId) => {
    try {
        const studentRef = ref(firebaseDatabase, `NMD_2025/Registrations/${studentUid}`);
        const snapshot = await get(studentRef);

        if (snapshot.exists()) {
            const studentData = snapshot.val();
            const childData = studentData.children?.[childId];

            if (childData) {
                return {
                    name: childData.name,
                    grade: childData.grade,
                    email: studentData.parentEmail || studentData.email,
                    parentPhone: studentData.parentPhone,
                    ...childData
                };
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching student info:', error);
        return null;
    }
};

/**
 * Check if teacher has access to a specific student
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {string} studentUid - Student's Firebase UID
 * @param {string} childId - Child profile ID (optional)
 * @returns {Promise<boolean>} True if teacher has access
 */
export const checkTeacherAccess = async (teacherUid, studentUid, childId = null) => {
    try {
        const teacherRef = ref(firebaseDatabase, `NMD_2025/Registrations/${teacherUid}/teacherAssignments/students/${studentUid}`);
        const snapshot = await get(teacherRef);

        if (!snapshot.exists()) {
            return false;
        }

        // If childId is provided, verify it matches
        if (childId) {
            const studentInfo = snapshot.val();
            return studentInfo.childId === childId;
        }

        return true;
    } catch (error) {
        console.error('Error checking teacher access:', error);
        return false;
    }
};

/**
 * Get teacher profile data
 * @param {string} teacherUid - Teacher's Firebase UID
 * @returns {Promise<Object|null>} Teacher profile or null
 */
export const getTeacherProfile = async (teacherUid) => {
    try {
        const teacherRef = ref(firebaseDatabase, `NMD_2025/Registrations/${teacherUid}`);
        const snapshot = await get(teacherRef);

        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.userType === 'teacher') {
                return userData;
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching teacher profile:', error);
        return null;
    }
};

/**
 * Get count of students per grade for a teacher
 * @param {string} teacherUid - Teacher's Firebase UID
 * @returns {Promise<Object>} Object with grade names as keys and counts as values
 */
export const getStudentCountsByGrade = async (teacherUid) => {
    try {
        const teacherRef = ref(firebaseDatabase, `NMD_2025/Registrations/${teacherUid}/teacherAssignments/students`);
        const snapshot = await get(teacherRef);

        if (!snapshot.exists()) {
            return {};
        }

        const students = snapshot.val();
        const counts = {};

        Object.values(students).forEach(student => {
            const grade = student.grade;
            counts[grade] = (counts[grade] || 0) + 1;
        });

        return counts;
    } catch (error) {
        console.error('Error fetching student counts:', error);
        return {};
    }
};
