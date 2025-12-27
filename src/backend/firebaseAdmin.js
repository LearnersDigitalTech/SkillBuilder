/**
 * Firebase Custom Claims Management
 * 
 * Server-side utilities for setting and managing Firebase custom claims
 * for role-based access control in multi-tenant environment
 */

import admin from 'firebase-admin';
import { ROLES, ROLE_PERMISSIONS } from './rbac';

// Initialize Firebase Admin SDK (if not already initialized)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
}

// ==================== CUSTOM CLAIMS MANAGEMENT ====================

/**
 * Set custom claims for a user
 */
export async function setUserClaims(uid, claims) {
    try {
        await admin.auth().setCustomUserClaims(uid, claims);
        return { success: true };
    } catch (error) {
        console.error('Error setting custom claims:', error);
        throw error;
    }
}

/**
 * Set organization and role claims for a user
 */
export async function setOrgAndRoleClaims(uid, orgId, role) {
    const permissions = ROLE_PERMISSIONS[role] || [];

    const claims = {
        orgId,
        role,
        permissions,
        updatedAt: Date.now(),
    };

    return await setUserClaims(uid, claims);
}

/**
 * Update user role within organization
 */
export async function updateUserRole(uid, newRole) {
    try {
        // Get current claims
        const user = await admin.auth().getUser(uid);
        const currentClaims = user.customClaims || {};

        // Update with new role and permissions
        const permissions = ROLE_PERMISSIONS[newRole] || [];
        const updatedClaims = {
            ...currentClaims,
            role: newRole,
            permissions,
            updatedAt: Date.now(),
        };

        await setUserClaims(uid, updatedClaims);
        return { success: true, claims: updatedClaims };
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
}

/**
 * Add user to organization
 */
export async function addUserToOrg(uid, orgId, role) {
    return await setOrgAndRoleClaims(uid, orgId, role);
}

/**
 * Remove user from organization
 */
export async function removeUserFromOrg(uid) {
    const claims = {
        orgId: null,
        role: null,
        permissions: [],
        updatedAt: Date.now(),
    };

    return await setUserClaims(uid, claims);
}

/**
 * Get user claims
 */
export async function getUserClaims(uid) {
    try {
        const user = await admin.auth().getUser(uid);
        return user.customClaims || {};
    } catch (error) {
        console.error('Error getting user claims:', error);
        throw error;
    }
}

/**
 * Verify user has required permission
 */
export async function verifyUserPermission(uid, requiredPermission) {
    try {
        const claims = await getUserClaims(uid);
        const permissions = claims.permissions || [];

        // Platform admins have all permissions
        if (permissions.includes('*')) {
            return true;
        }

        return permissions.includes(requiredPermission);
    } catch (error) {
        console.error('Error verifying permission:', error);
        return false;
    }
}

/**
 * Verify user belongs to organization
 */
export async function verifyUserInOrg(uid, orgId) {
    try {
        const claims = await getUserClaims(uid);
        return claims.orgId === orgId;
    } catch (error) {
        console.error('Error verifying org membership:', error);
        return false;
    }
}

// ==================== BULK OPERATIONS ====================

/**
 * Set claims for multiple users
 */
export async function bulkSetClaims(userClaims) {
    const results = [];

    for (const { uid, claims } of userClaims) {
        try {
            await setUserClaims(uid, claims);
            results.push({ uid, success: true });
        } catch (error) {
            results.push({ uid, success: false, error: error.message });
        }
    }

    return results;
}

/**
 * Add multiple users to organization
 */
export async function bulkAddUsersToOrg(users, orgId) {
    const userClaims = users.map(({ uid, role }) => ({
        uid,
        claims: {
            orgId,
            role,
            permissions: ROLE_PERMISSIONS[role] || [],
            updatedAt: Date.now(),
        },
    }));

    return await bulkSetClaims(userClaims);
}

// ==================== FIREBASE AUTH HELPERS ====================

/**
 * Create user with email and password
 */
export async function createAuthUser(email, password, displayName) {
    try {
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName,
            emailVerified: false,
        });

        return userRecord;
    } catch (error) {
        console.error('Error creating auth user:', error);
        throw error;
    }
}

/**
 * Delete user from Firebase Auth
 */
export async function deleteAuthUser(uid) {
    try {
        await admin.auth().deleteUser(uid);
        return { success: true };
    } catch (error) {
        console.error('Error deleting auth user:', error);
        throw error;
    }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email) {
    try {
        const link = await admin.auth().generatePasswordResetLink(email);
        return { success: true, link };
    } catch (error) {
        console.error('Error sending password reset:', error);
        throw error;
    }
}

/**
 * Verify ID token and get claims
 */
export async function verifyIdToken(idToken) {
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying ID token:', error);
        throw error;
    }
}

// ==================== EXPORT ====================

export default {
    setUserClaims,
    setOrgAndRoleClaims,
    updateUserRole,
    addUserToOrg,
    removeUserFromOrg,
    getUserClaims,
    verifyUserPermission,
    verifyUserInOrg,
    bulkSetClaims,
    bulkAddUsersToOrg,
    createAuthUser,
    deleteAuthUser,
    sendPasswordReset,
    verifyIdToken,
};
