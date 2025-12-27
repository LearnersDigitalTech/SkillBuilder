"use client";

import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Organization Context
 * Provides organization data to all components based on subdomain/domain
 */

const OrgContext = createContext(null);

export function OrgProvider({ children }) {
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadOrganization() {
            try {
                setLoading(true);

                // Get organization ID from various sources
                const orgId = await getOrgIdFromRequest();

                if (orgId) {
                    // Fetch organization data
                    const orgData = await fetchOrgData(orgId);
                    setOrg(orgData);

                    // Apply branding if available
                    if (orgData?.orgInfo?.branding) {
                        applyOrgBranding(orgData.orgInfo.branding);
                    }
                } else {
                    // No org context - might be on marketing site or platform admin
                    setOrg(null);
                }
            } catch (err) {
                console.error('Error loading organization:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadOrganization();
    }, []);

    const value = {
        org,
        orgId: org?.orgInfo?.orgId || null,
        orgInfo: org?.orgInfo || null,
        loading,
        error,
        refreshOrg: async () => {
            if (org?.orgInfo?.orgId) {
                const fresh = await fetchOrgData(org.orgInfo.orgId);
                setOrg(fresh);
            }
        },
    };

    return (
        <OrgContext.Provider value={value}>
            {children}
        </OrgContext.Provider>
    );
}

export const useOrg = () => {
    const context = useContext(OrgContext);
    if (context === undefined) {
        throw new Error('useOrg must be used within OrgProvider');
    }
    return context;
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get organization ID from request context
 */
async function getOrgIdFromRequest() {
    if (typeof window === 'undefined') {
        return null;
    }

    // Method 1: Check for org ID in URL params (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const urlOrgId = urlParams.get('orgId');
    if (urlOrgId) {
        return urlOrgId;
    }

    // Method 2: Extract from subdomain
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];

    // Skip common non-org subdomains
    if (['www', 'admin', 'api', 'localhost'].includes(subdomain)) {
        return null;
    }

    // Check if it's a custom domain or subdomain
    try {
        const response = await fetch(`/api/org/resolve?hostname=${hostname}`);
        if (response.ok) {
            const data = await response.json();
            return data.orgId;
        }
    } catch (error) {
        console.error('Error resolving organization:', error);
    }

    return null;
}

/**
 * Fetch organization data from API
 */
async function fetchOrgData(orgId) {
    try {
        const response = await fetch(`/api/org/${orgId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch organization data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching org data:', error);
        throw error;
    }
}

/**
 * Apply organization branding to the page
 */
function applyOrgBranding(branding) {
    if (!branding) return;

    // Apply CSS variables
    const root = document.documentElement;

    if (branding.primaryColor) {
        root.style.setProperty('--org-primary-color', branding.primaryColor);
    }

    if (branding.secondaryColor) {
        root.style.setProperty('--org-secondary-color', branding.secondaryColor);
    }

    if (branding.accentColor) {
        root.style.setProperty('--org-accent-color', branding.accentColor);
    }

    // Update favicon
    if (branding.favicon) {
        let favicon = document.querySelector('link[rel="icon"]');
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
        }
        favicon.href = branding.favicon;
    }

    // Apply custom CSS if provided
    if (branding.customCSS) {
        let styleEl = document.getElementById('org-custom-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'org-custom-styles';
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = branding.customCSS;
    }
}
