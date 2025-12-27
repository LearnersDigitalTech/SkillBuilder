"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, TextField, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Stepper, Step, StepLabel } from '@mui/material';
import { Building2, Mail, Phone, Globe, Palette, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { createOrganization } from '@/backend/multiTenantSchema';

const steps = ['Basic Info', 'Contact Details', 'Subscription', 'Branding'];

export default function CreateOrgModal({ open, onClose, onSuccess }) {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Basic Info
        name: '',
        legalName: '',
        type: 'school',
        subdomain: '',

        // Contact
        contactEmail: '',
        supportEmail: '',
        contactPhone: '',
        website: '',

        // Address
        street: '',
        city: '',
        state: '',
        country: 'USA',
        zipCode: '',
        timezone: 'America/Los_Angeles',

        // Subscription
        subscriptionTier: 'trial',

        // Branding
        primaryColor: '#1E40AF',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        logo: '',

        // Admin User
        adminName: '',
        adminEmail: '',
        adminPhone: '',
    });

    const handleNext = () => {
        // Validation
        if (activeStep === 0) {
            if (!formData.name || !formData.subdomain) {
                toast.error('Please fill in required fields');
                return;
            }
        }

        if (activeStep === 1) {
            if (!formData.contactEmail) {
                toast.error('Please provide a contact email');
                return;
            }
        }
        
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const orgData = {
                name: formData.name,
                legalName: formData.legalName || formData.name,
                type: formData.type,
                subdomain: formData.subdomain,

                contactEmail: formData.contactEmail,
                supportEmail: formData.supportEmail || formData.contactEmail,
                contactPhone: formData.contactPhone,
                website: formData.website,

                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    zipCode: formData.zipCode,
                    timezone: formData.timezone,
                },

                subscriptionTier: formData.subscriptionTier,

                primaryColor: formData.primaryColor,
                secondaryColor: formData.secondaryColor,
                accentColor: formData.accentColor,
                logo: formData.logo,

                adminUser: formData.adminEmail ? {
                    name: formData.adminName,
                    email: formData.adminEmail,
                    phone: formData.adminPhone,
                } : null,

                createdBy: 'platform_admin', // TODO: Get from auth context
            };

            const result = await createOrganization(orgData);

            toast.success(`Organization "${result.orgInfo.name}" created successfully!`);

            if (onSuccess) {
                onSuccess(result);
            }

            onClose();
            resetForm();
        } catch (error) {
            console.error('Error creating organization:', error);
            toast.error(error.message || 'Failed to create organization');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setActiveStep(0);
        setFormData({
            name: '',
            legalName: '',
            type: 'school',
            subdomain: '',
            contactEmail: '',
            supportEmail: '',
            contactPhone: '',
            website: '',
            street: '',
            city: '',
            state: '',
            country: 'USA',
            zipCode: '',
            timezone: 'America/Los_Angeles',
            subscriptionTier: 'trial',
            primaryColor: '#1E40AF',
            secondaryColor: '#10B981',
            accentColor: '#F59E0B',
            logo: '',
            adminName: '',
            adminEmail: '',
            adminPhone: '',
        });
    };

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Auto-generate subdomain from name
        if (field === 'name' && !formData.subdomain) {
            const subdomain = value.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
            setFormData((prev) => ({ ...prev, subdomain }));
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Create New Organization</span>
                <Button onClick={onClose} sx={{ minWidth: 'auto', p: 1 }}>
                    <X size={20} />
                </Button>
            </DialogTitle>

            <DialogContent>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {/* Step 1: Basic Info */}
                {activeStep === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <TextField
                            fullWidth
                            label="Organization Name *"
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="Greenwood High School"
                            InputProps={{
                                startAdornment: <Building2 size={20} style={{ marginRight: 8, color: '#666' }} />
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Legal Name"
                            value={formData.legalName}
                            onChange={(e) => updateField('legalName', e.target.value)}
                            placeholder="Greenwood Educational Trust"
                        />

                        <FormControl fullWidth>
                            <InputLabel>Organization Type</InputLabel>
                            <Select
                                value={formData.type}
                                onChange={(e) => updateField('type', e.target.value)}
                                label="Organization Type"
                            >
                                <MenuItem value="school">School</MenuItem>
                                <MenuItem value="coaching_center">Coaching Center</MenuItem>
                                <MenuItem value="district">School District</MenuItem>
                                <MenuItem value="university">University</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Subdomain *"
                            value={formData.subdomain}
                            onChange={(e) => updateField('subdomain', e.target.value)}
                            placeholder="greenwood"
                            helperText={`Will be accessible at: ${formData.subdomain || 'subdomain'}.skillbuilder.com`}
                        />
                    </div>
                )}

                {/* Step 2: Contact Details */}
                {activeStep === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <TextField
                            fullWidth
                            label="Primary Email *"
                            type="email"
                            value={formData.contactEmail}
                            onChange={(e) => updateField('contactEmail', e.target.value)}
                            placeholder="admin@greenwood.edu"
                            InputProps={{
                                startAdornment: <Mail size={20} style={{ marginRight: 8, color: '#666' }} />
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Support Email"
                            type="email"
                            value={formData.supportEmail}
                            onChange={(e) => updateField('supportEmail', e.target.value)}
                            placeholder="support@greenwood.edu"
                        />

                        <TextField
                            fullWidth
                            label="Phone Number"
                            value={formData.contactPhone}
                            onChange={(e) => updateField('contactPhone', e.target.value)}
                            placeholder="+1-555-0100"
                            InputProps={{
                                startAdornment: <Phone size={20} style={{ marginRight: 8, color: '#666' }} />
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Website"
                            value={formData.website}
                            onChange={(e) => updateField('website', e.target.value)}
                            placeholder="https://greenwood.edu"
                            InputProps={{
                                startAdornment: <Globe size={20} style={{ marginRight: 8, color: '#666' }} />
                            }}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <TextField
                                label="City"
                                value={formData.city}
                                onChange={(e) => updateField('city', e.target.value)}
                            />
                            <TextField
                                label="State"
                                value={formData.state}
                                onChange={(e) => updateField('state', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Subscription */}
                {activeStep === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <FormControl fullWidth>
                            <InputLabel>Subscription Tier</InputLabel>
                            <Select
                                value={formData.subscriptionTier}
                                onChange={(e) => updateField('subscriptionTier', e.target.value)}
                                label="Subscription Tier"
                            >
                                <MenuItem value="trial">Trial (14 days, 50 students)</MenuItem>
                                <MenuItem value="starter">Starter ($99/mo, 200 students)</MenuItem>
                                <MenuItem value="professional">Professional ($399/mo, 1000 students)</MenuItem>
                                <MenuItem value="enterprise">Enterprise (Custom pricing)</MenuItem>
                            </Select>
                        </FormControl>

                        <div style={{
                            padding: '16px',
                            background: '#f3f4f6',
                            borderRadius: '8px',
                            marginTop: '16px'
                        }}>
                            <h4 style={{ margin: '0 0 12px 0' }}>Features Included:</h4>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {formData.subscriptionTier === 'trial' && (
                                    <>
                                        <li>Parent Portal</li>
                                        <li>Basic Tests</li>
                                        <li>14-day trial period</li>
                                    </>
                                )}
                                {formData.subscriptionTier === 'starter' && (
                                    <>
                                        <li>Parent Portal</li>
                                        <li>Class Management</li>
                                        <li>Basic Analytics</li>
                                    </>
                                )}
                                {formData.subscriptionTier === 'professional' && (
                                    <>
                                        <li>All Starter features</li>
                                        <li>Mentor System</li>
                                        <li>Companion Support</li>
                                        <li>Advanced Analytics</li>
                                        <li>Custom Assessments</li>
                                        <li>API Access</li>
                                    </>
                                )}
                                {formData.subscriptionTier === 'enterprise' && (
                                    <>
                                        <li>All Professional features</li>
                                        <li>White Label</li>
                                        <li>Custom Domain</li>
                                        <li>SSO Integration</li>
                                        <li>Dedicated Support</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Step 4: Branding */}
                {activeStep === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                                    Primary Color
                                </label>
                                <input
                                    type="color"
                                    value={formData.primaryColor}
                                    onChange={(e) => updateField('primaryColor', e.target.value)}
                                    style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                                    Secondary Color
                                </label>
                                <input
                                    type="color"
                                    value={formData.secondaryColor}
                                    onChange={(e) => updateField('secondaryColor', e.target.value)}
                                    style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                                    Accent Color
                                </label>
                                <input
                                    type="color"
                                    value={formData.accentColor}
                                    onChange={(e) => updateField('accentColor', e.target.value)}
                                    style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                                />
                            </div>
                        </div>

                        <TextField
                            fullWidth
                            label="Logo URL (optional)"
                            value={formData.logo}
                            onChange={(e) => updateField('logo', e.target.value)}
                            placeholder="https://example.com/logo.png"
                        />

                        <div style={{
                            padding: '24px',
                            background: formData.primaryColor,
                            color: 'white',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <h3 style={{ margin: 0 }}>Preview</h3>
                            <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
                                {formData.name || 'Organization Name'}
                            </p>
                        </div>

                        <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

                        <h4 style={{ margin: '0 0 12px 0' }}>Initial Admin User (Optional)</h4>

                        <TextField
                            fullWidth
                            label="Admin Name"
                            value={formData.adminName}
                            onChange={(e) => updateField('adminName', e.target.value)}
                            placeholder="John Smith"
                        />

                        <TextField
                            fullWidth
                            label="Admin Email"
                            type="email"
                            value={formData.adminEmail}
                            onChange={(e) => updateField('adminEmail', e.target.value)}
                            placeholder="john.smith@greenwood.edu"
                        />
                    </div>
                )}

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                    <Button
                        onClick={handleBack}
                        disabled={activeStep === 0 || loading}
                        variant="outlined"
                    >
                        Back
                    </Button>

                    {activeStep === steps.length - 1 ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            variant="contained"
                            color="primary"
                        >
                            {loading ? <CircularProgress size={24} /> : 'Create Organization'}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            variant="contained"
                            color="primary"
                        >
                            Next
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}


