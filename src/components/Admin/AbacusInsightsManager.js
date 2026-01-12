'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Chip, IconButton, InputAdornment } from '@mui/material';
import { Search, UserCheck, UserX, Shield, Calculator, Users, RefreshCw } from 'lucide-react';
import { ref, get, update } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';

const AbacusInsightsManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Fetch all users with their abacusAdmin status
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const registrationsRef = ref(firebaseDatabase, 'NMD_2025/Registrations');
            const snapshot = await get(registrationsRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const userList = [];

                Object.entries(data).forEach(([key, userData]) => {
                    // Get display info
                    let displayName = 'Unknown';
                    let email = '';
                    let phone = userData.parentPhone || key;
                    let userType = userData.userType || 'parent';

                    // For teachers
                    if (userData.userType === 'teacher') {
                        displayName = userData.name || 'Teacher';
                        email = userData.email || '';
                    }
                    // For parents with children
                    else if (userData.children) {
                        const firstChild = Object.values(userData.children)[0];
                        displayName = firstChild?.name || 'Student';
                        email = userData.parentEmail || firstChild?.email || '';
                    }

                    userList.push({
                        id: key,
                        name: displayName,
                        email: email,
                        phone: phone,
                        userType: userType,
                        abacusAdmin: userData.abacusAdmin === true,
                        neetUploadEnabled: userData.neetUploadEnabled === true
                    });
                });

                // Sort: abacusAdmin first, then by name
                userList.sort((a, b) => {
                    if (a.abacusAdmin !== b.abacusAdmin) return b.abacusAdmin ? 1 : -1;
                    return a.name.localeCompare(b.name);
                });

                setUsers(userList);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setMessage({ type: 'error', text: 'Failed to load users' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Toggle abacusAdmin status for a user
    const toggleAbacusAdmin = async (userId, currentStatus) => {
        setUpdating(userId);
        try {
            const userRef = ref(firebaseDatabase, `NMD_2025/Registrations/${userId}`);
            await update(userRef, { abacusAdmin: !currentStatus });

            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, abacusAdmin: !currentStatus } : u
            ));

            setMessage({
                type: 'success',
                text: `AbacusInsights admin ${!currentStatus ? 'enabled' : 'disabled'} for user`
            });

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error updating user:', error);
            setMessage({ type: 'error', text: 'Failed to update user permissions' });
        } finally {
            setUpdating(null);
        }
    };

    // Filter users by search
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
    );

    // Count admins
    const adminCount = users.filter(u => u.abacusAdmin).length;

    return (
        <Box>
            {/* Header with stats */}
            <Box sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: 3,
                p: 4,
                mb: 4,
                color: 'white'
            }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Calculator size={32} />
                    <Typography variant="h5" fontWeight="bold">AbacusInsights Admin Management</Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    Grant or revoke access to the AbacusInsights exam administration portal.
                </Typography>
                <Box display="flex" gap={3}>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 3, py: 1.5, borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight="bold">{adminCount}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>Active Admins</Typography>
                    </Box>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 3, py: 1.5, borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight="bold">{users.length}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Users</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Message Alert */}
            {message.text && (
                <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
                    {message.text}
                </Alert>
            )}

            {/* Search and Refresh */}
            <Box display="flex" gap={2} mb={3}>
                <TextField
                    fullWidth
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={20} />
                            </InputAdornment>
                        )
                    }}
                    sx={{ maxWidth: 500 }}
                />
                <Button
                    variant="outlined"
                    startIcon={<RefreshCw size={18} />}
                    onClick={fetchUsers}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            {/* User List */}
            {loading ? (
                <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden'
                }}>
                    {/* Table Header */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1.5fr 1fr 1fr 120px',
                        gap: 2,
                        p: 2,
                        bgcolor: 'grey.50',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        color: 'text.secondary'
                    }}>
                        <Typography variant="body2" fontWeight="bold">Name</Typography>
                        <Typography variant="body2" fontWeight="bold">Contact</Typography>
                        <Typography variant="body2" fontWeight="bold">Type</Typography>
                        <Typography variant="body2" fontWeight="bold">Status</Typography>
                        <Typography variant="body2" fontWeight="bold" textAlign="center">Action</Typography>
                    </Box>

                    {/* User Rows */}
                    {filteredUsers.length === 0 ? (
                        <Box p={4} textAlign="center" color="text.secondary">
                            No users found matching your search
                        </Box>
                    ) : (
                        filteredUsers.map(user => (
                            <Box
                                key={user.id}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 120px',
                                    gap: 2,
                                    p: 2,
                                    alignItems: 'center',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    '&:hover': { bgcolor: 'action.hover' },
                                    bgcolor: user.abacusAdmin ? 'indigo.50' : 'transparent'
                                }}
                            >
                                <Box>
                                    <Typography fontWeight="medium">{user.name}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                        ID: {user.id}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2">{user.email || '-'}</Typography>
                                    <Typography variant="body2" color="text.secondary">{user.phone}</Typography>
                                </Box>
                                <Chip
                                    label={user.userType}
                                    size="small"
                                    color={user.userType === 'teacher' ? 'primary' : 'default'}
                                    variant="outlined"
                                />
                                <Box>
                                    {user.abacusAdmin ? (
                                        <Chip
                                            icon={<Shield size={14} />}
                                            label="Admin"
                                            size="small"
                                            color="success"
                                        />
                                    ) : (
                                        <Chip
                                            label="No Access"
                                            size="small"
                                            variant="outlined"
                                            color="default"
                                        />
                                    )}
                                </Box>
                                <Box textAlign="center">
                                    <Button
                                        size="small"
                                        variant={user.abacusAdmin ? 'outlined' : 'contained'}
                                        color={user.abacusAdmin ? 'error' : 'primary'}
                                        onClick={() => toggleAbacusAdmin(user.id, user.abacusAdmin)}
                                        disabled={updating === user.id}
                                        startIcon={
                                            updating === user.id ? (
                                                <CircularProgress size={14} />
                                            ) : user.abacusAdmin ? (
                                                <UserX size={14} />
                                            ) : (
                                                <UserCheck size={14} />
                                            )
                                        }
                                        sx={{ minWidth: 100 }}
                                    >
                                        {user.abacusAdmin ? 'Revoke' : 'Grant'}
                                    </Button>
                                </Box>
                            </Box>
                        ))
                    )}
                </Box>
            )}

            {/* Help Text */}
            <Box mt={4} p={3} sx={{ bgcolor: 'info.50', borderRadius: 2, border: '1px solid', borderColor: 'info.200' }}>
                <Typography variant="body2" color="info.dark">
                    <strong>ℹ️ How it works:</strong> Users with AbacusInsights admin access can:
                </Typography>
                <ul style={{ margin: '8px 0', paddingLeft: 24 }}>
                    <li><Typography variant="body2" color="info.dark">Create and manage exam papers (Paper-1, Paper-2, etc.)</Typography></li>
                    <li><Typography variant="body2" color="info.dark">Upload questions via CSV/Excel</Typography></li>
                    <li><Typography variant="body2" color="info.dark">Generate unique student UIDs for each test</Typography></li>
                    <li><Typography variant="body2" color="info.dark">View exam sessions and security violations</Typography></li>
                </ul>
                <Typography variant="body2" color="info.dark">
                    Access the portal at: <code style={{ background: '#e0e7ff', padding: '2px 6px', borderRadius: 4 }}>/abacusinsights/admin</code>
                </Typography>
            </Box>
        </Box>
    );
};

export default AbacusInsightsManager;
