/**
 * Role-Based Access Control (RBAC) System
 * 
 * Defines roles, permissions, and access control utilities for multi-tenant platform
 */

// ==================== ROLE DEFINITIONS ====================

export const ROLES = {
    // Platform Level
    PLATFORM_ADMIN: 'platform_admin',

    // Organization Level
    ORG_ADMIN: 'org_admin',
    TEACHER: 'teacher',
    MENTOR: 'mentor',
    COMPANION: 'companion',
    PARENT: 'parent',
    STUDENT: 'student',
    CHAMPION: 'champion',
};

// ==================== PERMISSION DEFINITIONS ====================

export const PERMISSIONS = {
    // Organization Management
    MANAGE_ORG_SETTINGS: 'manage_org_settings',
    VIEW_ORG_ANALYTICS: 'view_org_analytics',
    MANAGE_BILLING: 'manage_billing',

    // User Management
    MANAGE_ALL_USERS: 'manage_all_users',
    MANAGE_TEACHERS: 'manage_teachers',
    MANAGE_STUDENTS: 'manage_students',
    MANAGE_PARENTS: 'manage_parents',
    VIEW_USER_PROFILES: 'view_user_profiles',

    // Class Management
    MANAGE_CLASSES: 'manage_classes',
    VIEW_ASSIGNED_CLASSES: 'view_assigned_classes',
    ASSIGN_STUDENTS: 'assign_students',

    // Assessment Management
    CREATE_ASSESSMENTS: 'create_assessments',
    ASSIGN_TESTS: 'assign_tests',
    VIEW_TEST_RESULTS: 'view_test_results',
    GRADE_ASSIGNMENTS: 'grade_assignments',

    // Student Data
    VIEW_OWN_RESULTS: 'view_own_results',
    VIEW_CHILDREN_RESULTS: 'view_children_results',
    VIEW_STUDENT_REPORTS: 'view_student_reports',

    // Analytics
    VIEW_CLASS_ANALYTICS: 'view_class_analytics',
    VIEW_STUDENT_ANALYTICS: 'view_student_analytics',
    EXPORT_DATA: 'export_data',

    // Mentoring & Support
    PROVIDE_MENTORSHIP: 'provide_mentorship',
    PROVIDE_COMPANION_SUPPORT: 'provide_companion_support',

    // Community
    PARTICIPATE_CHAMPION_PROGRAM: 'participate_champion_program',
    MODERATE_COMMUNITY: 'moderate_community',
};

// ==================== ROLE-PERMISSION MATRIX ====================

export const ROLE_PERMISSIONS = {
    [ROLES.PLATFORM_ADMIN]: [
        '*', // All permissions
    ],

    [ROLES.ORG_ADMIN]: [
        PERMISSIONS.MANAGE_ORG_SETTINGS,
        PERMISSIONS.VIEW_ORG_ANALYTICS,
        PERMISSIONS.MANAGE_BILLING,
        PERMISSIONS.MANAGE_ALL_USERS,
        PERMISSIONS.MANAGE_TEACHERS,
        PERMISSIONS.MANAGE_STUDENTS,
        PERMISSIONS.MANAGE_PARENTS,
        PERMISSIONS.VIEW_USER_PROFILES,
        PERMISSIONS.MANAGE_CLASSES,
        PERMISSIONS.ASSIGN_STUDENTS,
        PERMISSIONS.CREATE_ASSESSMENTS,
        PERMISSIONS.ASSIGN_TESTS,
        PERMISSIONS.VIEW_TEST_RESULTS,
        PERMISSIONS.VIEW_STUDENT_REPORTS,
        PERMISSIONS.VIEW_CLASS_ANALYTICS,
        PERMISSIONS.VIEW_STUDENT_ANALYTICS,
        PERMISSIONS.EXPORT_DATA,
        PERMISSIONS.MODERATE_COMMUNITY,
    ],

    [ROLES.TEACHER]: [
        PERMISSIONS.VIEW_ASSIGNED_CLASSES,
        PERMISSIONS.ASSIGN_STUDENTS,
        PERMISSIONS.CREATE_ASSESSMENTS,
        PERMISSIONS.ASSIGN_TESTS,
        PERMISSIONS.VIEW_TEST_RESULTS,
        PERMISSIONS.GRADE_ASSIGNMENTS,
        PERMISSIONS.VIEW_STUDENT_REPORTS,
        PERMISSIONS.VIEW_CLASS_ANALYTICS,
        PERMISSIONS.VIEW_STUDENT_ANALYTICS,
        PERMISSIONS.EXPORT_DATA,
    ],

    [ROLES.MENTOR]: [
        PERMISSIONS.PROVIDE_MENTORSHIP,
        PERMISSIONS.VIEW_STUDENT_REPORTS,
        PERMISSIONS.VIEW_STUDENT_ANALYTICS,
    ],

    [ROLES.COMPANION]: [
        PERMISSIONS.PROVIDE_COMPANION_SUPPORT,
        PERMISSIONS.VIEW_STUDENT_REPORTS,
    ],

    [ROLES.PARENT]: [
        PERMISSIONS.VIEW_CHILDREN_RESULTS,
        PERMISSIONS.VIEW_STUDENT_REPORTS,
        PERMISSIONS.VIEW_STUDENT_ANALYTICS,
    ],

    [ROLES.STUDENT]: [
        PERMISSIONS.VIEW_OWN_RESULTS,
        PERMISSIONS.PARTICIPATE_CHAMPION_PROGRAM,
    ],

    [ROLES.CHAMPION]: [
        PERMISSIONS.VIEW_OWN_RESULTS,
        PERMISSIONS.PARTICIPATE_CHAMPION_PROGRAM,
    ],
};

// ==================== PERMISSION CHECKING ====================

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role, permission) {
    const permissions = ROLE_PERMISSIONS[role];

    if (!permissions) {
        return false;
    }

    // Platform admins have all permissions
    if (permissions.includes('*')) {
        return true;
    }

    return permissions.includes(permission);
}

/**
 * Check if user has permission based on their role
 */
export function userHasPermission(user, permission) {
    if (!user || !user.role) {
        return false;
    }

    return roleHasPermission(user.role, permission);
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role) {
    return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user can access resource
 */
export function canAccessResource(user, resource, action) {
    if (!user) return false;

    // Platform admins can access everything
    if (user.role === ROLES.PLATFORM_ADMIN) {
        return true;
    }

    // Check org-level access
    if (resource.orgId && user.orgId !== resource.orgId) {
        return false;
    }

    // Check role-based permissions
    const requiredPermission = getRequiredPermission(resource.type, action);
    return userHasPermission(user, requiredPermission);
}

/**
 * Get required permission for resource action
 */
function getRequiredPermission(resourceType, action) {
    const permissionMap = {
        organization: {
            read: PERMISSIONS.VIEW_ORG_ANALYTICS,
            update: PERMISSIONS.MANAGE_ORG_SETTINGS,
            delete: PERMISSIONS.MANAGE_ORG_SETTINGS,
        },
        user: {
            read: PERMISSIONS.VIEW_USER_PROFILES,
            create: PERMISSIONS.MANAGE_ALL_USERS,
            update: PERMISSIONS.MANAGE_ALL_USERS,
            delete: PERMISSIONS.MANAGE_ALL_USERS,
        },
        class: {
            read: PERMISSIONS.VIEW_ASSIGNED_CLASSES,
            create: PERMISSIONS.MANAGE_CLASSES,
            update: PERMISSIONS.MANAGE_CLASSES,
            delete: PERMISSIONS.MANAGE_CLASSES,
        },
        test: {
            read: PERMISSIONS.VIEW_TEST_RESULTS,
            create: PERMISSIONS.CREATE_ASSESSMENTS,
            update: PERMISSIONS.CREATE_ASSESSMENTS,
            delete: PERMISSIONS.CREATE_ASSESSMENTS,
        },
        student_data: {
            read: PERMISSIONS.VIEW_STUDENT_REPORTS,
            export: PERMISSIONS.EXPORT_DATA,
        },
    };

    return permissionMap[resourceType]?.[action] || null;
}

// ==================== ROLE HIERARCHY ====================

export const ROLE_HIERARCHY = {
    [ROLES.PLATFORM_ADMIN]: 100,
    [ROLES.ORG_ADMIN]: 90,
    [ROLES.TEACHER]: 70,
    [ROLES.MENTOR]: 60,
    [ROLES.COMPANION]: 60,
    [ROLES.PARENT]: 50,
    [ROLES.CHAMPION]: 40,
    [ROLES.STUDENT]: 30,
};

/**
 * Check if role A has higher authority than role B
 */
export function hasHigherAuthority(roleA, roleB) {
    return (ROLE_HIERARCHY[roleA] || 0) > (ROLE_HIERARCHY[roleB] || 0);
}

/**
 * Check if user can manage another user
 */
export function canManageUser(manager, targetUser) {
    // Must be in same org (except platform admin)
    if (manager.role !== ROLES.PLATFORM_ADMIN && manager.orgId !== targetUser.orgId) {
        return false;
    }

    // Must have higher authority
    return hasHigherAuthority(manager.role, targetUser.role);
}

// ==================== CONTEXT-BASED ACCESS CONTROL ====================

/**
 * Check if teacher can access student data
 */
export function teacherCanAccessStudent(teacher, studentId, orgId) {
    if (teacher.role !== ROLES.TEACHER) {
        return false;
    }

    if (teacher.orgId !== orgId) {
        return false;
    }

    // Check if student is in teacher's assigned classes
    // This would need to query the database
    return true; // Placeholder - implement actual check
}

/**
 * Check if parent can access child data
 */
export function parentCanAccessChild(parent, childId, orgId) {
    if (parent.role !== ROLES.PARENT) {
        return false;
    }

    if (parent.orgId !== orgId) {
        return false;
    }

    // Check if child belongs to parent
    return parent.children?.includes(childId) || false;
}

/**
 * Check if mentor can access student
 */
export function mentorCanAccessStudent(mentor, studentId, orgId) {
    if (mentor.role !== ROLES.MENTOR) {
        return false;
    }

    if (mentor.orgId !== orgId) {
        return false;
    }

    // Check if student is assigned to mentor
    return mentor.assignedStudents?.includes(studentId) || false;
}

// ==================== EXPORT ====================

export default {
    ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS,
    roleHasPermission,
    userHasPermission,
    getPermissionsForRole,
    canAccessResource,
    hasHigherAuthority,
    canManageUser,
    teacherCanAccessStudent,
    parentCanAccessChild,
    mentorCanAccessStudent,
};
