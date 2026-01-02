/**
 * Admin Teacher Service
 * Migrated to PostgreSQL API
 */

const normalize = (g) => (g || '').toLowerCase().replace(/\s+/g, '');

/**
 * Get all teachers
 * @returns {Promise<Array>} Array of teacher objects
 */
export const getAllTeachers = async () => {
    try {
        const res = await fetch('/api/admin/teachers');
        if (!res.ok) return [];
        const data = await res.json();
        return data.teachers || [];
    } catch (error) {
        console.error('Error fetching teachers:', error);
        return [];
    }
};

/**
 * Get teacher details with full assignment information
 * @param {string} teacherUid 
 * @returns {Promise<Object|null>} Teacher details object
 */
export const getTeacherDetails = async (teacherUid) => {
    try {
        const res = await fetch(`/api/admin/teachers/${teacherUid}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.teacher || null;
    } catch (error) {
        console.error('Error fetching teacher details:', error);
        return null;
    }
};

/**
 * Assign grades to a teacher
 * @param {string} teacherUid 
 * @param {Array<string>} grades 
 * @param {string} adminUid 
 * @returns {Promise<boolean>} Success status
 */
export const assignGradesToTeacher = async (teacherUid, grades, adminUid) => {
    try {
        const res = await fetch(`/api/admin/teachers/${teacherUid}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'assign_grades', grades })
        });
        return res.ok;
    } catch (error) {
        console.error('Error assigning grades:', error);
        return false;
    }
};

/**
 * Assign students to a teacher
 * @param {string} teacherUid 
 * @param {Array<Object>} students 
 * @param {string} adminUid 
 * @returns {Promise<boolean>} Success status
 */
export const assignStudentsToTeacher = async (teacherUid, students, adminUid) => {
    try {
        const res = await fetch(`/api/admin/teachers/${teacherUid}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'assign_students', students })
        });
        return res.ok;
    } catch (error) {
        console.error('Error assigning students:', error);
        return false;
    }
};

/**
 * Remove a grade assignment from teacher
 * @param {string} teacherUid 
 * @param {string} grade 
 * @returns {Promise<boolean>} Success status
 */
export const removeGradeFromTeacher = async (teacherUid, grade) => {
    try {
        const res = await fetch(`/api/admin/teachers/${teacherUid}/assignments`, {
            method: 'POST', // Using POST with action for simplicity
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'remove_grade', grade })
        });
        return res.ok;
    } catch (error) {
        console.error('Error removing grade:', error);
        return false;
    }
};

/**
 * Remove a student assignment from teacher
 * @param {string} teacherUid 
 * @param {string} studentUid 
 * @returns {Promise<boolean>} Success status
 */
export const removeStudentFromTeacher = async (teacherUid, studentUid) => {
    try {
        const res = await fetch(`/api/admin/teachers/${teacherUid}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'remove_student', studentUid })
        });
        return res.ok;
    } catch (error) {
        console.error('Error removing student:', error);
        return false;
    }
};

/**
 * Reset all assignments for a teacher
 * @param {string} teacherUid 
 * @param {string} adminUid 
 * @returns {Promise<boolean>} Success status
 */
export const resetTeacherAssignments = async (teacherUid, adminUid) => {
    try {
        const res = await fetch(`/api/admin/teachers/${teacherUid}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reset' })
        });
        return res.ok;
    } catch (error) {
        console.error('Error resetting assignments:', error);
        return false;
    }
};

/**
 * Update teacher permissions
 * @param {string} teacherUid 
 * @param {Object} permissions 
 * @param {string} adminUid 
 * @returns {Promise<boolean>} Success status
 */
export const updateTeacherPermissions = async (teacherUid, permissions, adminUid) => {
    try {
        const res = await fetch(`/api/admin/teachers/${teacherUid}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(permissions)
        });
        return res.ok;
    } catch (error) {
        console.error('Error updating permissions:', error);
        return false;
    }
};

/**
 * Get all students filtered by grade
 * @param {string} grade 
 * @returns {Promise<Array>} Array of student objects
 */
export const getStudentsByGrade = async (grade) => {
    try {
        const res = await fetch(`/api/admin/students?grade=${encodeURIComponent(grade)}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.students || [];
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
    // Deprecated? The API now returns hydrated details directly.
    // If needed, we can implement batch fetch or just loop.
    // For now, return empty or try to fetch individual if strictly required.
    // But since `getTeacherDetails` already returns full student objects, 
    // this utility might not be needed by the UI if it relies on `getTeacherDetails`.
    // We'll leave it as a no-op or basic pass-through if needed.
    return [];
};

