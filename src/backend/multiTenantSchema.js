/**
 * Multi-Tenant Database Schema Utilities
 * 
 * This module provides utilities for managing multi-tenant organization data
 * in Firebase Realtime Database with proper isolation and security.
 */

import { ref, set, get, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { firebaseDatabase } from './firebaseHandler';

// ==================== CONSTANTS ====================

export const DB_PATHS = {
    ORGANIZATIONS: 'SkillBuilder_Platform/Organizations',
    PLATFORM_ADMINS: 'SkillBuilder_Platform/PlatformAdmins',
};

export const ORG_TYPES = {
    SCHOOL: 'school',
    COACHING_CENTER: 'coaching_center',
    DISTRICT: 'district',
    UNIVERSITY: 'university',
};

export const SUBSCRIPTION_TIERS = {
    TRIAL: 'trial',
    STARTER: 'starter',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise',
};

export const USER_ROLES = {
    PLATFORM_ADMIN: 'platform_admin',
    ORG_ADMIN: 'org_admin',
    TEACHER: 'teacher',
    MENTOR: 'mentor',
    COMPANION: 'companion',
    PARENT: 'parent',
    STUDENT: 'student',
    CHAMPION: 'champion',
};

export const SUBSCRIPTION_STATUS = {
    ACTIVE: 'active',
    TRIAL: 'trial',
    SUSPENDED: 'suspended',
    CANCELLED: 'cancelled',
};

// ==================== ORGANIZATION MANAGEMENT ====================

/**
 * Generate a unique organization ID from name
 */
export function generateOrgId(orgName) {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7);
    const cleanName = orgName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .substring(0, 30);

    return `${cleanName}_${timestamp}_${randomStr}`;
}

/**
 * Generate a unique subdomain from organization name
 */
export function generateSubdomain(orgName) {
    return orgName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
}

/**
 * Create a new organization
 */
export async function createOrganization(orgData) {
    const orgId = generateOrgId(orgData.name);
    const subdomain = orgData.subdomain || generateSubdomain(orgData.name);

    // Check if subdomain is already taken
    const existingOrg = await getOrgBySubdomain(subdomain);
    if (existingOrg) {
        throw new Error(`Subdomain "${subdomain}" is already taken`);
    }

    const organization = {
        orgInfo: {
            orgId,
            name: orgData.name,
            legalName: orgData.legalName || orgData.name,
            type: orgData.type || ORG_TYPES.SCHOOL,

            // Location
            address: {
                street: orgData.address?.street || '',
                city: orgData.address?.city || '',
                state: orgData.address?.state || '',
                country: orgData.address?.country || 'USA',
                zipCode: orgData.address?.zipCode || '',
                timezone: orgData.address?.timezone || 'America/Los_Angeles',
            },

            // Contact
            contactInfo: {
                primaryEmail: orgData.contactEmail,
                supportEmail: orgData.supportEmail || orgData.contactEmail,
                phone: orgData.contactPhone || '',
                website: orgData.website || '',
            },

            // Subscription
            subscription: {
                tier: orgData.subscriptionTier || SUBSCRIPTION_TIERS.TRIAL,
                status: SUBSCRIPTION_STATUS.TRIAL,
                startDate: new Date().toISOString(),
                renewalDate: calculateRenewalDate(14), // 14 days trial
                billingCycle: 'monthly',

                limits: getSubscriptionLimits(orgData.subscriptionTier || SUBSCRIPTION_TIERS.TRIAL),

                features: getSubscriptionFeatures(orgData.subscriptionTier || SUBSCRIPTION_TIERS.TRIAL),

                billing: {
                    stripeCustomerId: null,
                    stripeSubscriptionId: null,
                    paymentMethod: null,
                    lastPayment: null,
                    nextPayment: null,
                    amount: 0,
                },
            },

            // Branding
            branding: {
                logo: orgData.logo || '',
                favicon: orgData.favicon || '',
                primaryColor: orgData.primaryColor || '#1E40AF',
                secondaryColor: orgData.secondaryColor || '#10B981',
                accentColor: orgData.accentColor || '#F59E0B',
                fontFamily: 'Inter',
                customCSS: '',
                subdomain: subdomain,
                customDomain: orgData.customDomain || null,
                customDomainVerified: false,
                sslCertificate: 'pending',
            },

            // Settings
            settings: {
                // Registration
                allowParentRegistration: true,
                allowStudentSelfRegistration: false,
                requireAdminApproval: true,

                // Features
                enableSpeedTest: true,
                enablePracticeMode: true,
                enableLeaderboards: true,
                enableChampionProgram: true,

                // Academic
                academicYear: getCurrentAcademicYear(),
                gradeSystem: 'K-12',
                supportedGrades: generateGradeList('K-12'),

                // Notifications
                emailNotifications: true,
                smsNotifications: false,
                pushNotifications: true,

                // Privacy
                dataRetentionDays: 365,
                allowDataExport: true,
                gdprCompliant: true,
                coppaCompliant: true,
            },

            // Metadata
            createdAt: new Date().toISOString(),
            createdBy: orgData.createdBy || 'system',
            updatedAt: new Date().toISOString(),
            status: 'active',
        },
    };

    // Save to database
    const orgRef = ref(firebaseDatabase, `${DB_PATHS.ORGANIZATIONS}/${orgId}`);
    await set(orgRef, organization);

    // Create initial admin user if provided
    if (orgData.adminUser) {
        await createOrgAdmin(orgId, orgData.adminUser);
    }

    return { orgId, ...organization };
}

/**
 * Get organization by ID
 */
export async function getOrganization(orgId) {
    const orgRef = ref(firebaseDatabase, `${DB_PATHS.ORGANIZATIONS}/${orgId}`);
    const snapshot = await get(orgRef);

    if (!snapshot.exists()) {
        return null;
    }

    return snapshot.val();
}

/**
 * Get organization by subdomain
 */
export async function getOrgBySubdomain(subdomain) {
    const orgsRef = ref(firebaseDatabase, DB_PATHS.ORGANIZATIONS);
    const snapshot = await get(orgsRef);

    if (!snapshot.exists()) {
        return null;
    }

    const orgs = snapshot.val();
    const orgEntry = Object.entries(orgs).find(
        ([_, org]) => org.orgInfo?.branding?.subdomain === subdomain
    );

    return orgEntry ? { orgId: orgEntry[0], ...orgEntry[1] } : null;
}

/**
 * Get organization by custom domain
 */
export async function getOrgByCustomDomain(domain) {
    const orgsRef = ref(firebaseDatabase, DB_PATHS.ORGANIZATIONS);
    const snapshot = await get(orgsRef);

    if (!snapshot.exists()) {
        return null;
    }

    const orgs = snapshot.val();
    const orgEntry = Object.entries(orgs).find(
        ([_, org]) => org.orgInfo?.branding?.customDomain === domain &&
            org.orgInfo?.branding?.customDomainVerified === true
    );

    return orgEntry ? { orgId: orgEntry[0], ...orgEntry[1] } : null;
}

/**
 * Update organization
 */
export async function updateOrganization(orgId, updates) {
    const orgRef = ref(firebaseDatabase, `${DB_PATHS.ORGANIZATIONS}/${orgId}/orgInfo`);

    const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    await update(orgRef, updateData);
    return getOrganization(orgId);
}

/**
 * List all organizations (for platform admin)
 */
export async function listOrganizations() {
    try {
        const orgsRef = ref(firebaseDatabase, DB_PATHS.ORGANIZATIONS);
        const snapshot = await get(orgsRef);

        if (!snapshot.exists()) {
            return [];
        }

        const orgs = snapshot.val();
        return Object.entries(orgs).map(([orgId, orgData]) => ({
            orgId,
            ...orgData,
        }));
    } catch (error) {
        console.error('Error listing organizations:', error);
        // Return empty array instead of throwing to prevent UI crashes
        return [];
    }
}

// ==================== USER MANAGEMENT ====================

/**
 * Create organization admin
 */
export async function createOrgAdmin(orgId, adminData) {
    const adminId = adminData.uid || `admin_${Date.now()}`;

    const admin = {
        adminInfo: {
            uid: adminId, // Use the generated adminId if uid is not provided
            name: adminData.name,
            email: adminData.email,
            phone: adminData.phone || '',
            role: 'super_admin',
            department: 'Administration',
            createdAt: new Date().toISOString(),
            status: 'active',
        },
        permissions: [
            'manage_all_users',
            'view_all_analytics',
            'manage_classes',
            'manage_settings',
            'export_all_data',
            'manage_billing',
        ],
    };

    const adminRef = ref(firebaseDatabase, `${DB_PATHS.ORGANIZATIONS}/${orgId}/Users/Admins/${adminId}`);
    await set(adminRef, admin);

    return admin;
}

/**
 * Add parent to organization
 */
export async function addParentToOrg(orgId, parentKey, parentData) {
    const parent = {
        parentInfo: {
            uid: parentData.uid,
            name: parentData.name,
            email: parentData.email || '',
            phone: parentData.phone || '',
            preferredContact: parentData.preferredContact || 'email',
            authProvider: parentData.authProvider || 'google',
            profilePhoto: parentData.profilePhoto || '',
            address: parentData.address || {},
            occupation: parentData.occupation || '',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            status: 'active',
        },
        children: {},
        onboardingProgress: {
            completed: false,
            currentStep: 0,
            steps: {},
            startedAt: null,
            completedAt: null,
            totalTime: 0,
        },
        preferences: {
            notifications: {
                email: true,
                sms: false,
                push: true,
                weeklyReport: true,
                testCompletion: true,
                mentorFeedback: true,
            },
            language: 'en',
            timezone: 'America/Los_Angeles',
        },
    };

    const parentRef = ref(firebaseDatabase, `${DB_PATHS.ORGANIZATIONS}/${orgId}/Users/Parents/${parentKey}`);
    await set(parentRef, parent);

    return parent;
}

/**
 * Add child to parent
 */
export async function addChildToParent(orgId, parentKey, childData) {
    const childId = `student_${Date.now()}`;

    const child = {
        name: childData.name,
        grade: childData.grade,
        classId: childData.classId || null,
        rollNumber: childData.rollNumber || null,
        dateOfBirth: childData.dateOfBirth || null,
        gender: childData.gender || null,
        profilePhoto: childData.profilePhoto || '',
        mathConfidence: childData.mathConfidence || 5,
        learningStyle: childData.learningStyle || 'visual',
        specialNeeds: childData.specialNeeds || 'none',
        createdAt: new Date().toISOString(),
        status: 'active',
    };

    const childRef = ref(firebaseDatabase, `${DB_PATHS.ORGANIZATIONS}/${orgId}/Users/Parents/${parentKey}/children/${childId}`);
    await set(childRef, child);

    return { childId, ...child };
}

/**
 * Get user by ID and role
 */
export async function getUser(orgId, userType, userId) {
    const userRef = ref(firebaseDatabase, `${DB_PATHS.ORGANIZATIONS}/${orgId}/Users/${userType}/${userId}`);
    const snapshot = await get(userRef);

    return snapshot.exists() ? snapshot.val() : null;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate renewal date
 */
function calculateRenewalDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
}

/**
 * Get subscription limits based on tier
 */
function getSubscriptionLimits(tier) {
    const limits = {
        trial: {
            maxStudents: 50,
            currentStudents: 0,
            maxTeachers: 5,
            currentTeachers: 0,
            maxStorage: '5GB',
            currentStorage: '0GB',
        },
        starter: {
            maxStudents: 200,
            currentStudents: 0,
            maxTeachers: 10,
            currentTeachers: 0,
            maxStorage: '20GB',
            currentStorage: '0GB',
        },
        professional: {
            maxStudents: 1000,
            currentStudents: 0,
            maxTeachers: 50,
            currentTeachers: 0,
            maxStorage: '100GB',
            currentStorage: '0GB',
        },
        enterprise: {
            maxStudents: 'unlimited',
            currentStudents: 0,
            maxTeachers: 'unlimited',
            currentTeachers: 0,
            maxStorage: 'unlimited',
            currentStorage: '0GB',
        },
    };

    return limits[tier] || limits.trial;
}

/**
 * Get subscription features based on tier
 */
function getSubscriptionFeatures(tier) {
    const features = {
        trial: {
            parentPortal: true,
            mentorSystem: false,
            companionSupport: false,
            advancedAnalytics: false,
            customAssessments: false,
            apiAccess: false,
            whiteLabel: false,
            customDomain: false,
            ssoIntegration: false,
        },
        starter: {
            parentPortal: true,
            mentorSystem: false,
            companionSupport: false,
            advancedAnalytics: true,
            customAssessments: false,
            apiAccess: false,
            whiteLabel: false,
            customDomain: false,
            ssoIntegration: false,
        },
        professional: {
            parentPortal: true,
            mentorSystem: true,
            companionSupport: true,
            advancedAnalytics: true,
            customAssessments: true,
            apiAccess: true,
            whiteLabel: false,
            customDomain: false,
            ssoIntegration: false,
        },
        enterprise: {
            parentPortal: true,
            mentorSystem: true,
            companionSupport: true,
            advancedAnalytics: true,
            customAssessments: true,
            apiAccess: true,
            whiteLabel: true,
            customDomain: true,
            ssoIntegration: true,
        },
    };

    return features[tier] || features.trial;
}

/**
 * Get current academic year
 */
function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Academic year typically starts in August (month 7)
    if (month >= 7) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
}

/**
 * Generate grade list based on system
 */
function generateGradeList(system) {
    if (system === 'K-12') {
        return ['Kindergarten', ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];
    } else if (system === '1-10') {
        return Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`);
    }
    return [];
}

/**
 * Check if user has permission
 */
export function hasPermission(userPermissions, requiredPermission) {
    if (!userPermissions || !Array.isArray(userPermissions)) {
        return false;
    }

    // Platform admins have all permissions
    if (userPermissions.includes('*')) {
        return true;
    }

    return userPermissions.includes(requiredPermission);
}

/**
 * Check if subscription allows feature
 */
export function canUseFeature(org, featureName) {
    if (!org || !org.orgInfo || !org.orgInfo.subscription) {
        return false;
    }

    const { subscription } = org.orgInfo;

    // Check subscription status
    if (subscription.status !== SUBSCRIPTION_STATUS.ACTIVE &&
        subscription.status !== SUBSCRIPTION_STATUS.TRIAL) {
        return false;
    }

    // Check if feature is enabled
    return subscription.features[featureName] === true;
}

/**
 * Check if subscription limit is reached
 */
export function isLimitReached(org, limitType) {
    if (!org || !org.orgInfo || !org.orgInfo.subscription) {
        return true;
    }

    const { limits } = org.orgInfo.subscription;

    if (limitType === 'students') {
        if (limits.maxStudents === 'unlimited') return false;
        return limits.currentStudents >= limits.maxStudents;
    }

    if (limitType === 'teachers') {
        if (limits.maxTeachers === 'unlimited') return false;
        return limits.currentTeachers >= limits.maxTeachers;
    }

    return false;
}

