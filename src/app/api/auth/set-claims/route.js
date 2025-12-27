import { NextResponse } from 'next/server';
import { setOrgAndRoleClaims, updateUserRole, addUserToOrg } from '@/backend/firebaseAdmin';
import { ROLES } from '@/backend/rbac';

/**
 * API Route: Set user role and organization
 * POST /api/auth/set-claims
 * 
 * Body: {
 *   uid: string,
 *   orgId: string,
 *   role: string
 * }
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { uid, orgId, role } = body;

        // Validation
        if (!uid || !orgId || !role) {
            return NextResponse.json(
                { error: 'Missing required fields: uid, orgId, role' },
                { status: 400 }
            );
        }

        // Validate role
        if (!Object.values(ROLES).includes(role)) {
            return NextResponse.json(
                { error: `Invalid role: ${role}` },
                { status: 400 }
            );
        }

        // Set claims
        const result = await setOrgAndRoleClaims(uid, orgId, role);

        return NextResponse.json({
            success: true,
            message: `Claims set successfully for user ${uid}`,
            claims: {
                orgId,
                role,
            },
        });
    } catch (error) {
        console.error('Error setting claims:', error);
        return NextResponse.json(
            { error: 'Failed to set user claims', details: error.message },
            { status: 500 }
        );
    }
}
