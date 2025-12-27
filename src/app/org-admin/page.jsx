"use client";

import OrgAdminDashboard from '@/components/OrgAdmin/OrgAdminDashboard';
import { OrgProvider } from '@/context/OrgContext';

export default function OrgAdminPage() {
    return (
        <OrgProvider>
            <OrgAdminDashboard />
        </OrgProvider>
    );
}
