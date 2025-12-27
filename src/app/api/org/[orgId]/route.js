import { NextResponse } from 'next/server';
import { getOrganization } from '@/backend/multiTenantSchema';

/**
 * API Route: Get organization by ID
 * GET /api/org/[orgId]
 */
export async function GET(request, { params }) {
    try {
        const { orgId } = params;

        if (!orgId) {
            return NextResponse.json(
                { error: 'Organization ID is required' },
                { status: 400 }
            );
        }

        const org = await getOrganization(orgId);

        if (!org) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        // Return public org data (don't expose sensitive info)
        return NextResponse.json({
            orgId,
            orgInfo: {
                name: org.orgInfo.name,
                type: org.orgInfo.type,
                branding: org.orgInfo.branding,
                settings: {
                    allowParentRegistration: org.orgInfo.settings.allowParentRegistration,
                    allowStudentSelfRegistration: org.orgInfo.settings.allowStudentSelfRegistration,
                    supportedGrades: org.orgInfo.settings.supportedGrades,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching organization:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
