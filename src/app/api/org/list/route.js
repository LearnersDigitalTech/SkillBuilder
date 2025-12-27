import { NextResponse } from 'next/server';
import { ref, get } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';

/**
 * API Route: List all organizations
 * GET /api/org/list
 * 
 * This route fetches organizations using client-side Firebase
 * Make sure Firebase security rules allow authenticated users to read organizations
 */
export async function GET(request) {
    try {
        const orgsRef = ref(firebaseDatabase, 'SkillBuilder_Platform/Organizations');
        const snapshot = await get(orgsRef);

        if (!snapshot.exists()) {
            return NextResponse.json([]);
        }

        const orgs = snapshot.val();
        const orgList = Object.entries(orgs).map(([orgId, orgData]) => ({
            orgId,
            ...orgData,
        }));

        return NextResponse.json(orgList);
    } catch (error) {
        console.error('Error listing organizations:', error);

        // Return more detailed error for debugging
        return NextResponse.json(
            {
                error: 'Failed to list organizations',
                details: error.message,
                code: error.code || 'UNKNOWN'
            },
            { status: 500 }
        );
    }
}
