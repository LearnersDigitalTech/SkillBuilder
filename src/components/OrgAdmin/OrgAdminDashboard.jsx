"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Tabs, Tab, Box, Button, Chip, CircularProgress } from '@mui/material';
import {
    Users, GraduationCap, BookOpen, TrendingUp,
    Settings, BarChart3, School, LogIn
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UserManagementTab from './tabs/UserManagementTab';
import ClassManagementTab from './tabs/ClassManagementTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import SettingsTab from './tabs/SettingsTab';

export default function OrgAdminDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [orgId, setOrgId] = useState(null);
    const [orgData, setOrgData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        activeTests: 0,
    });

    useEffect(() => {
        loadOrgData();
    }, []);

    const loadOrgData = async () => {
        try {
            setLoading(true);

            // Fetch list of organizations
            const listResponse = await fetch('/api/org/list');
            if (!listResponse.ok) {
                throw new Error('Failed to fetch organizations');
            }

            const orgs = await listResponse.json();

            if (orgs && orgs.length > 0) {
                // Use the first organization for now
                const firstOrg = orgs[0];
                setOrgId(firstOrg.orgId);
                setOrgData(firstOrg);

                // Calculate stats
                const students = firstOrg?.orgInfo?.subscription?.limits?.currentStudents || 0;
                const teachers = firstOrg?.orgInfo?.subscription?.limits?.currentTeachers || 0;

                setStats({
                    totalStudents: students,
                    totalTeachers: teachers,
                    totalClasses: 0,
                    activeTests: 0,
                });
            }
        } catch (error) {
            console.error('Error loading org data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                gap: '16px'
            }}>
                <CircularProgress size={48} />
                <p style={{ color: '#6B7280' }}>Loading organization dashboard...</p>
            </div>
        );
    }

    // Show error if no organization found
    if (!orgData) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <h2>No organization found</h2>
                <p>Please create an organization first from the Platform Admin dashboard.</p>
                <Button
                    variant="contained"
                    onClick={() => router.push('/platform-admin')}
                    style={{ marginTop: '16px' }}
                >
                    Go to Platform Admin
                </Button>
            </div>
        );
    }

    const subscriptionStatus = orgData?.orgInfo?.subscription?.status;
    const subscriptionTier = orgData?.orgInfo?.subscription?.tier;

    return (
        <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
            {/* Header */}
            <div style={{
                background: 'white',
                borderBottom: '1px solid #E5E7EB',
                padding: '20px 32px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    maxWidth: '1400px',
                    margin: '0 auto'
                }}>
                    <div>
                        <h1 style={{
                            margin: '0 0 8px 0',
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: '#111827'
                        }}>
                            {orgData?.orgInfo?.name}
                        </h1>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <Chip
                                label={subscriptionTier}
                                size="small"
                                color={subscriptionStatus === 'active' ? 'success' : 'default'}
                                sx={{ textTransform: 'capitalize' }}
                            />
                            <span style={{ fontSize: '14px', color: '#6B7280' }}>
                                {orgData?.orgInfo?.type}
                            </span>
                            <span style={{ fontSize: '14px', color: '#6B7280' }}>
                                • {orgData?.orgInfo?.branding?.subdomain}.skillbuilder.com
                            </span>
                            {user && (
                                <span style={{ fontSize: '14px', color: '#3B82F6', fontWeight: 500 }}>
                                    • {user.email || user.phoneNumber}
                                </span>
                            )}
                        </div>
                    </div>

                    <Button
                        variant="outlined"
                        startIcon={<Settings size={18} />}
                        onClick={() => setActiveTab(3)}
                    >
                        Settings
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
                {/* Statistics Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px'
                }}>
                    <StatCard
                        icon={<Users size={24} />}
                        title="Total Students"
                        value={stats.totalStudents}
                        subtitle={`Limit: ${orgData?.orgInfo?.subscription?.limits?.maxStudents}`}
                        color="#3B82F6"
                        bgColor="#EFF6FF"
                    />

                    <StatCard
                        icon={<GraduationCap size={24} />}
                        title="Teachers"
                        value={stats.totalTeachers}
                        subtitle={`Limit: ${orgData?.orgInfo?.subscription?.limits?.maxTeachers}`}
                        color="#10B981"
                        bgColor="#ECFDF5"
                    />

                    <StatCard
                        icon={<BookOpen size={24} />}
                        title="Classes"
                        value={stats.totalClasses}
                        subtitle="Active classes"
                        color="#F59E0B"
                        bgColor="#FEF3C7"
                    />

                    <StatCard
                        icon={<TrendingUp size={24} />}
                        title="Active Tests"
                        value={stats.activeTests}
                        subtitle="Assigned this week"
                        color="#8B5CF6"
                        bgColor="#F3E8FF"
                    />
                </div>

                {/* Tabs */}
                <Card>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={activeTab}
                            onChange={(e, newValue) => setActiveTab(newValue)}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab
                                icon={<Users size={18} />}
                                label="Users"
                                iconPosition="start"
                            />
                            <Tab
                                icon={<School size={18} />}
                                label="Classes"
                                iconPosition="start"
                            />
                            <Tab
                                icon={<BarChart3 size={18} />}
                                label="Analytics"
                                iconPosition="start"
                            />
                            <Tab
                                icon={<Settings size={18} />}
                                label="Settings"
                                iconPosition="start"
                            />
                        </Tabs>
                    </Box>

                    <CardContent sx={{ p: 0 }}>
                        {activeTab === 0 && <UserManagementTab orgId={orgId} orgData={orgData} />}
                        {activeTab === 1 && <ClassManagementTab orgId={orgId} orgData={orgData} />}
                        {activeTab === 2 && <AnalyticsTab orgId={orgId} orgData={orgData} />}
                        {activeTab === 3 && <SettingsTab orgId={orgId} orgData={orgData} onUpdate={loadOrgData} />}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Statistics Card Component
function StatCard({ icon, title, value, subtitle, color, bgColor }) {
    return (
        <Card>
            <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        padding: '12px',
                        background: bgColor,
                        borderRadius: '12px',
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {icon}
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>
                            {title}
                        </p>
                        <h3 style={{ margin: '4px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>
                            {value}
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9CA3AF' }}>
                            {subtitle}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
