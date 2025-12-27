import { NextResponse } from 'next/server';
import { getOrgBySubdomain, getOrgByCustomDomain } from '@/backend/multiTenantSchema';

/**
 * API Route: Resolve organization from hostname
 * GET /api/org/resolve?hostname=greenwood.skillbuilder.com
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const hostname = searchParams.get('hostname');

        if (!hostname) {
            return NextResponse.json(
                { error: 'Hostname parameter is required' },
                { status: 400 }
            );
        }

        // Try custom domain first
        let org = await getOrgByCustomDomain(hostname);

        // If not found, try subdomain
        if (!org) {
            const subdomain = hostname.split('.')[0];
            org = await getOrgBySubdomain(subdomain);
        }

        if (!org) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            orgId: org.orgId,
            name: org.orgInfo?.name,
            subdomain: org.orgInfo?.branding?.subdomain,
        });
    } catch (error) {
        console.error('Error resolving organization:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
