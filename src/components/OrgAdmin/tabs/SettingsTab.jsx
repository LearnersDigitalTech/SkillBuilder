"use client";

import { useState } from 'react';
import { Button, TextField, Switch, FormControlLabel, Card, CardContent, Divider } from '@mui/material';
import { Save, Palette, Bell, Shield, Database } from 'lucide-react';
import { toast } from 'react-toastify';
import { updateOrganization } from '@/backend/multiTenantSchema';

export default function SettingsTab({ orgId, orgData, onUpdate }) {
    const [settings, setSettings] = useState({
        // General
        name: orgData?.orgInfo?.name || '',
        legalName: orgData?.orgInfo?.legalName || '',
        website: orgData?.orgInfo?.contactInfo?.website || '',

        // Branding
        primaryColor: orgData?.orgInfo?.branding?.primaryColor || '#1E40AF',
        secondaryColor: orgData?.orgInfo?.branding?.secondaryColor || '#10B981',
        logo: orgData?.orgInfo?.branding?.logo || '',

        // Features
        allowParentRegistration: orgData?.orgInfo?.settings?.allowParentRegistration ?? true,
        requireAdminApproval: orgData?.orgInfo?.settings?.requireAdminApproval ?? true,
        enableLeaderboards: orgData?.orgInfo?.settings?.enableLeaderboards ?? true,

        // Notifications
        emailNotifications: orgData?.orgInfo?.settings?.emailNotifications ?? true,
        smsNotifications: orgData?.orgInfo?.settings?.smsNotifications ?? false,
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateOrganization(orgId, {
                name: settings.name,
                legalName: settings.legalName,
                'contactInfo/website': settings.website,
                'branding/primaryColor': settings.primaryColor,
                'branding/secondaryColor': settings.secondaryColor,
                'branding/logo': settings.logo,
                'settings/allowParentRegistration': settings.allowParentRegistration,
                'settings/requireAdminApproval': settings.requireAdminApproval,
                'settings/enableLeaderboards': settings.enableLeaderboards,
                'settings/emailNotifications': settings.emailNotifications,
                'settings/smsNotifications': settings.smsNotifications,
            });

            toast.success('Settings updated successfully!');
            onUpdate();
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ maxWidth: '800px' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
                        Organization Settings
                    </h2>
                    <p style={{ margin: 0, color: '#6B7280' }}>
                        Manage your organization's configuration and preferences
                    </p>
                </div>

                {/* General Settings */}
                <Card sx={{ marginBottom: '24px' }}>
                    <CardContent>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Database size={20} style={{ color: '#6B7280' }} />
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                                General Information
                            </h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <TextField
                                fullWidth
                                label="Organization Name"
                                value={settings.name}
                                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                            />

                            <TextField
                                fullWidth
                                label="Legal Name"
                                value={settings.legalName}
                                onChange={(e) => setSettings({ ...settings, legalName: e.target.value })}
                            />

                            <TextField
                                fullWidth
                                label="Website"
                                value={settings.website}
                                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                                placeholder="https://yourschool.edu"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Branding */}
                <Card sx={{ marginBottom: '24px' }}>
                    <CardContent>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Palette size={20} style={{ color: '#6B7280' }} />
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                                Branding
                            </h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                        Primary Color
                                    </label>
                                    <input
                                        type="color"
                                        value={settings.primaryColor}
                                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                        style={{ width: '100%', height: '40px', cursor: 'pointer', borderRadius: '4px' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                        Secondary Color
                                    </label>
                                    <input
                                        type="color"
                                        value={settings.secondaryColor}
                                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                                        style={{ width: '100%', height: '40px', cursor: 'pointer', borderRadius: '4px' }}
                                    />
                                </div>
                            </div>

                            <TextField
                                fullWidth
                                label="Logo URL"
                                value={settings.logo}
                                onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                                placeholder="https://example.com/logo.png"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Features */}
                <Card sx={{ marginBottom: '24px' }}>
                    <CardContent>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Shield size={20} style={{ color: '#6B7280' }} />
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                                Features & Permissions
                            </h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.allowParentRegistration}
                                        onChange={(e) => setSettings({ ...settings, allowParentRegistration: e.target.checked })}
                                    />
                                }
                                label="Allow parent self-registration"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.requireAdminApproval}
                                        onChange={(e) => setSettings({ ...settings, requireAdminApproval: e.target.checked })}
                                    />
                                }
                                label="Require admin approval for new users"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.enableLeaderboards}
                                        onChange={(e) => setSettings({ ...settings, enableLeaderboards: e.target.checked })}
                                    />
                                }
                                label="Enable leaderboards"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card sx={{ marginBottom: '24px' }}>
                    <CardContent>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Bell size={20} style={{ color: '#6B7280' }} />
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                                Notifications
                            </h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.emailNotifications}
                                        onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                    />
                                }
                                label="Email notifications"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.smsNotifications}
                                        onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                                    />
                                }
                                label="SMS notifications"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<Save size={20} />}
                    onClick={handleSave}
                    disabled={loading}
                    fullWidth
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}
