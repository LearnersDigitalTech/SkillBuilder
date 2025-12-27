"use client";

import { useState, useEffect } from 'react';
import { Button, Card, CardContent, Chip, TextField, InputAdornment } from '@mui/material';
import { Plus, Search, Building2, Users, TrendingUp, DollarSign } from 'lucide-react';
import CreateOrgModal from '@/components/Platform/CreateOrgModal';
import { listOrganizations } from '@/backend/multiTenantSchema';

export default function PlatformAdminDashboard() {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [createModalOpen, setCreateModalOpen] = useState(false);

    useEffect(() => {
        loadOrganizations();
    }, []);

    const loadOrganizations = async () => {
        try {
            setLoading(true);
            const orgs = await listOrganizations();
            setOrganizations(orgs);
        } catch (error) {
            console.error('Error loading organizations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrgs = organizations.filter((org) =>
        org.orgInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        totalOrgs: organizations.length,
        activeOrgs: organizations.filter(o => o.orgInfo?.subscription?.status === 'active').length,
        totalStudents: organizations.reduce((sum, o) => sum + (o.orgInfo?.subscription?.limits?.currentStudents || 0), 0),
        monthlyRevenue: organizations.reduce((sum, o) => {
            const tier = o.orgInfo?.subscription?.tier;
            const revenue = tier === 'starter' ? 99 : tier === 'professional' ? 399 : 0;
            return sum + revenue;
        }, 0),
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: 'bold' }}>
                        Platform Admin
                    </h1>
                    <p style={{ margin: 0, color: '#666' }}>
                        Manage all organizations and subscriptions
                    </p>
                </div>

                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => setCreateModalOpen(true)}
                    sx={{ height: 'fit-content' }}
                >
                    Create Organization
                </Button>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                <Card>
                    <CardContent>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                padding: '12px',
                                background: '#EEF2FF',
                                borderRadius: '12px',
                                color: '#4F46E5'
                            }}>
                                <Building2 size={24} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Total Organizations</p>
                                <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>
                                    {stats.totalOrgs}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                padding: '12px',
                                background: '#DCFCE7',
                                borderRadius: '12px',
                                color: '#16A34A'
                            }}>
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Active Subscriptions</p>
                                <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>
                                    {stats.activeOrgs}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                padding: '12px',
                                background: '#FEF3C7',
                                borderRadius: '12px',
                                color: '#D97706'
                            }}>
                                <Users size={24} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Total Students</p>
                                <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>
                                    {stats.totalStudents.toLocaleString()}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                padding: '12px',
                                background: '#DBEAFE',
                                borderRadius: '12px',
                                color: '#2563EB'
                            }}>
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Monthly Revenue</p>
                                <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>
                                    ${stats.monthlyRevenue.toLocaleString()}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <TextField
                fullWidth
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search size={20} />
                        </InputAdornment>
                    ),
                }}
                sx={{ marginBottom: '24px' }}
            />

            {/* Organizations List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loading ? (
                    <p>Loading organizations...</p>
                ) : filteredOrgs.length === 0 ? (
                    <Card>
                        <CardContent style={{ textAlign: 'center', padding: '48px' }}>
                            <p style={{ margin: 0, color: '#666' }}>No organizations found</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredOrgs.map((org) => (
                        <Card key={org.orgId}>
                            <CardContent>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <h3 style={{ margin: 0, fontSize: '20px' }}>
                                                {org.orgInfo?.name}
                                            </h3>
                                            <Chip
                                                label={org.orgInfo?.subscription?.tier || 'trial'}
                                                size="small"
                                                color={org.orgInfo?.subscription?.status === 'active' ? 'success' : 'default'}
                                            />
                                            <Chip
                                                label={org.orgInfo?.subscription?.status || 'trial'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </div>

                                        <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
                                            {org.orgInfo?.type} • {org.orgInfo?.branding?.subdomain}.skillbuilder.com
                                        </p>

                                        <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
                                            <span>
                                                <strong>Students:</strong> {org.orgInfo?.subscription?.limits?.currentStudents || 0} / {org.orgInfo?.subscription?.limits?.maxStudents || 0}
                                            </span>
                                            <span>
                                                <strong>Teachers:</strong> {org.orgInfo?.subscription?.limits?.currentTeachers || 0} / {org.orgInfo?.subscription?.limits?.maxTeachers || 0}
                                            </span>
                                            <span>
                                                <strong>Created:</strong> {new Date(org.orgInfo?.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <Button variant="outlined" size="small">
                                        Manage
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Organization Modal */}
            <CreateOrgModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={() => {
                    loadOrganizations();
                    setCreateModalOpen(false);
                }}
            />
        </div>
    );
}
