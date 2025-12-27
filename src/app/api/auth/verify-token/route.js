import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/backend/firebaseAdmin';

/**
 * API Route: Verify user token and get claims
 * POST /api/auth/verify-token
 * 
 * Body: {
 *   idToken: string
 * }
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { idToken } = body;

        if (!idToken) {
            return NextResponse.json(
                { error: 'ID token is required' },
                { status: 400 }
            );
        }

        // Verify token
        const decodedToken = await verifyIdToken(idToken);

        return NextResponse.json({
            success: true,
            user: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                orgId: decodedToken.orgId || null,
                role: decodedToken.role || null,
                permissions: decodedToken.permissions || [],
            },
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        return NextResponse.json(
            { error: 'Invalid or expired token', details: error.message },
            { status: 401 }
        );
    }
}
