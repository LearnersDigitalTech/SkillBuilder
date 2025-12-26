
/**
 * Role-Based Permissions System - Step 5 (Updated)
 * 
 * CORE PRINCIPLES:
 * 1. Learner privacy comes first
 * 2. No single role dominates data
 * 3. Schools must feel safe -> "Participation over Performance"
 * 4. GOLDEN ARCHITECTURAL PRINCIPLE: Learning data is separated from judgment authority.
 */

export const ROLES = {
    SCHOOL_ADMIN: 'school_admin',
    CLASS_TEACHER: 'class_teacher', // Administrative focus
    TEACHER_GUIDE: 'teacher_guide', // Pedagogical guidance focus
    MATH_TEACHER: 'math_teacher',
    PARENT_SUPPORTER: 'parent_supporter', // Parent (Must be linked to a School)
    MATH_CONNECTOR: 'math_connector',     // Introduces learners (Must be linked to a School)
    MATH_COMPANION: 'math_companion',     // Sitting along (Must be linked to a School)
    MATH_MENTOR: 'math_mentor',           // Academic guidance (Must be linked to a School)
    MATH_CHAMPION: 'math_champion',       // Community advocate (Must be linked to a School)
    LEARNER: 'learner'
};

export const PERMISSIONS = {
    // Views
    VIEW_SCHOOL_DASHBOARD: 'view_school_dashboard',     // Aggregate only
    VIEW_CLASS_PARTICIPATION: 'view_class_participation', // List of who participated
    VIEW_LEARNER_SUMMARY: 'view_learner_summary',       // Skills & Confidence (No detailed answers)
    VIEW_DETAILED_ANSWERS: 'view_detailed_answers',     // Question-level data
    VIEW_COMMUNITY_METRICS: 'view_community_metrics',   // Referral counts

    // Actions
    REGISTER_SCHOOL: 'register_school',
    INVITE_USERS: 'invite_users',
    REGISTER_LEARNER: 'register_learner',
    TAKE_ASSESSMENT: 'take_assessment',
    LOG_SUPPORT_MINUTES: 'log_support_minutes',
    ADD_REFLECTION: 'add_reflection',
    SUGGEST_PATHWAYS: 'suggest_pathways',
    DOWNLOAD_REPORTS: 'download_reports',

    // Explicit Restrictions (Conceptually handled by absence of Allow)
    // RANK_STUDENTS: 'rank_students', // NEVER ALLOWED
    // EDIT_RESULTS: 'edit_results',   // NEVER ALLOWED
};

// Role -> Permission Mapping
// One user can have multiple roles. 
const ROLE_DEFINITIONS = {
    [ROLES.SCHOOL_ADMIN]: [
        PERMISSIONS.VIEW_SCHOOL_DASHBOARD,
        PERMISSIONS.VIEW_CLASS_PARTICIPATION,
        PERMISSIONS.INVITE_USERS,
        PERMISSIONS.DOWNLOAD_REPORTS
    ],
    [ROLES.CLASS_TEACHER]: [
        PERMISSIONS.VIEW_CLASS_PARTICIPATION, // Monitor engagement
        PERMISSIONS.INVITE_USERS // Remind parents
    ],
    [ROLES.TEACHER_GUIDE]: [
        PERMISSIONS.VIEW_CLASS_PARTICIPATION,
        PERMISSIONS.SUGGEST_PATHWAYS,
        PERMISSIONS.VIEW_LEARNER_SUMMARY
    ],
    [ROLES.MATH_TEACHER]: [
        PERMISSIONS.VIEW_DETAILED_ANSWERS, // Identify skill gaps
        PERMISSIONS.VIEW_LEARNER_SUMMARY,
        PERMISSIONS.SUGGEST_PATHWAYS
    ],
    [ROLES.MATH_MENTOR]: [
        PERMISSIONS.VIEW_DETAILED_ANSWERS, // Same as Math Teacher, but scoped to assigned learners
        PERMISSIONS.VIEW_LEARNER_SUMMARY,
        PERMISSIONS.SUGGEST_PATHWAYS
    ],
    [ROLES.PARENT_SUPPORTER]: [
        PERMISSIONS.REGISTER_LEARNER,
        PERMISSIONS.VIEW_LEARNER_SUMMARY, // Child's summary only
        PERMISSIONS.LOG_SUPPORT_MINUTES,
        PERMISSIONS.ADD_REFLECTION
    ],
    [ROLES.MATH_COMPANION]: [
        PERMISSIONS.VIEW_LEARNER_SUMMARY,
        PERMISSIONS.LOG_SUPPORT_MINUTES,
        PERMISSIONS.ADD_REFLECTION
    ],
    [ROLES.MATH_CONNECTOR]: [
        PERMISSIONS.REGISTER_LEARNER,
        PERMISSIONS.VIEW_COMMUNITY_METRICS
    ],
    [ROLES.MATH_CHAMPION]: [
        PERMISSIONS.VIEW_COMMUNITY_METRICS,
        PERMISSIONS.INVITE_USERS // Share links
    ],
    [ROLES.LEARNER]: [
        PERMISSIONS.TAKE_ASSESSMENT,
        PERMISSIONS.VIEW_LEARNER_SUMMARY
        // Can view own detailed answers? Usually yes, but depends on platform config. 
        // Prompt says: "View own learning summary". 
    ]
};

/**
 * Check if a user has specific permission based on their roles.
 * @param {string|string[]} userRoles - Single role or array of roles assigned to the user
 * @param {string} permission - The permission to check
 * @returns {boolean}
 */
export const hasPermission = (userRoles, permission) => {
    if (!userRoles) return false;

    const rulesToCheck = Array.isArray(userRoles) ? userRoles : [userRoles];

    // Additive Permissions: If ANY role grants it, they have it.
    return rulesToCheck.some(role => {
        const allowed = ROLE_DEFINITIONS[role];
        return allowed && allowed.includes(permission);
    });
};

/**
 * Safety Feature: Language Filter
 * @param {string} text 
 * @returns {boolean}
 */
export const containsDiscouragedLanguage = (text) => {
    const discouragedWords = ['weak', 'fail', 'stupid', 'dumb', 'lazy', 'bad', 'ranking', 'topper'];
    const lowerText = text.toLowerCase();
    return discouragedWords.some(word => lowerText.includes(word));
};

/**
 * Safety Feature: Mask Marks / Data
 * Enforces the "Visibility Levels" logic.
 */
export const maskAssessmentData = (data, userRoles) => {
    const roles = Array.isArray(userRoles) ? userRoles : [userRoles];

    // Who can see Individual Answers?
    // Math Teacher, Math Mentor, Learner (Own)
    const canViewDetailed = roles.some(r =>
        [ROLES.MATH_TEACHER, ROLES.MATH_MENTOR, ROLES.LEARNER].includes(r)
    );

    if (canViewDetailed) {
        return data;
    }

    // For Parents, Class Teachers, Admins -> MASKED view
    return {
        ...data,
        // Sensitive fields removed
        answers: undefined,
        score: undefined,
        timeSpent: undefined,

        // Allowed fields
        completionStatus: data.completionStatus,
        participationDate: data.participationDate,
        skillSummary: data.skillSummary, // "Good at Logic" vs "5/10"
        effortGrade: "Participated"
    };
};

export default {
    ROLES,
    PERMISSIONS,
    hasPermission,
    containsDiscouragedLanguage,
    maskAssessmentData
};
