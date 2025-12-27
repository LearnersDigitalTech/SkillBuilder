"use client";

import { useState, useEffect } from 'react';
import {
    Button, TextField, Select, MenuItem, FormControl, InputLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
    InputAdornment, Tabs, Tab, Box
} from '@mui/material';
import { Search, UserPlus, Upload, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { ref, get } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';

export default function UserManagementTab({ orgId, orgData }) {
    const [userType, setUserType] = useState('teachers');
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [addUserModalOpen, setAddUserModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('UserManagementTab mounted, orgId:', orgId);
        if (orgId) {
            loadUsers();
        }
    }, [userType, orgId]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            console.log('🔍 Loading users for orgId:', orgId, 'userType:', userType);

            // Map user type to Firebase path
            const userTypePath = {
                'teachers': 'Teachers',
                'students': 'Students',
                'parents': 'Parents',
                'mentors': 'Mentors',
                'companions': 'Companions'
            }[userType];

            const usersPath = `SkillBuilder_Platform/Organizations/${orgId}/Users/${userTypePath}`;
            console.log('📍 Fetching from path:', usersPath);

            const usersRef = ref(firebaseDatabase, usersPath);
            const snapshot = await get(usersRef);

            console.log('📦 Snapshot exists:', snapshot.exists());

            if (snapshot.exists()) {
                const usersData = snapshot.val();
                console.log('📊 Raw users data:', usersData);

                const usersList = Object.entries(usersData).map(([userId, userData]) => {
                    console.log(`Processing user ${userId}:`, userData);

                    // Extract user info from different possible structures
                    const userInfo = userData.teacherInfo || userData.studentInfo || userData.parentInfo ||
                        userData.mentorInfo || userData.companionInfo || userData;

                    return {
                        id: userId,
                        name: userInfo.name || 'Unknown',
                        email: userInfo.email || '',
                        phone: userInfo.phone || '',
                        status: userInfo.status || 'active',
                        createdAt: userInfo.createdAt || new Date().toISOString(),
                    };
                });

                console.log('✅ Processed users list:', usersList);
                setUsers(usersList);
            } else {
                console.log('❌ No users found at path:', usersPath);
                setUsers([]);
            }
        } catch (error) {
            console.error('❌ Error loading users:', error);
            toast.error(`Failed to load users: ${error.message}`);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <div>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
                        User Management
                    </h2>
                    <p style={{ margin: 0, color: '#6B7280' }}>
                        Manage teachers, students, parents, and other users
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                        variant="outlined"
                        startIcon={<Upload size={18} />}
                    >
                        Import CSV
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<UserPlus size={18} />}
                        onClick={() => setAddUserModalOpen(true)}
                    >
                        Add User
                    </Button>
                </div>
            </div>

            {/* User Type Tabs */}
            <Tabs
                value={userType}
                onChange={(e, newValue) => setUserType(newValue)}
                sx={{ marginBottom: '24px', borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab value="teachers" label="Teachers" />
                <Tab value="students" label="Students" />
                <Tab value="parents" label="Parents" />
                <Tab value="mentors" label="Mentors" />
                <Tab value="companions" label="Companions" />
            </Tabs>

            {/* Search */}
            <TextField
                fullWidth
                placeholder={`Search ${userType}...`}
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

            {/* Users Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px' }}>
                    <p>Loading users...</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    background: '#F9FAFB',
                    borderRadius: '8px'
                }}>
                    <UserPlus size={48} style={{ color: '#9CA3AF', marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 8px 0', color: '#111827' }}>
                        No {userType} yet
                    </h3>
                    <p style={{ margin: '0 0 16px 0', color: '#6B7280' }}>
                        Get started by adding your first {userType.slice(0, -1)}
                    </p>
                    <Button
                        variant="contained"
                        startIcon={<UserPlus size={18} />}
                        onClick={() => setAddUserModalOpen(true)}
                    >
                        Add {userType.slice(0, -1)}
                    </Button>
                </div>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Joined</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.status}
                                            size="small"
                                            color={user.status === 'active' ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small">
                                            <Edit size={18} />
                                        </IconButton>
                                        <IconButton size="small">
                                            <Trash2 size={18} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add User Modal */}
            <AddUserModal
                open={addUserModalOpen}
                onClose={() => setAddUserModalOpen(false)}
                userType={userType}
                orgId={orgId}
                onSuccess={() => {
                    loadUsers();
                    setAddUserModalOpen(false);
                }}
            />
        </div>
    );
}

// Add User Modal Component
function AddUserModal({ open, onClose, userType, orgId, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            console.log('💾 Saving user:', formData, 'to orgId:', orgId, 'as:', userType);

            // Import Firebase functions
            const { ref, set, push } = await import('firebase/database');
            const { firebaseDatabase } = await import('@/backend/firebaseHandler');

            // Map user type to Firebase path and info key
            const userTypePath = {
                'teachers': { path: 'Teachers', infoKey: 'teacherInfo' },
                'students': { path: 'Students', infoKey: 'studentInfo' },
                'parents': { path: 'Parents', infoKey: 'parentInfo' },
                'mentors': { path: 'Mentors', infoKey: 'mentorInfo' },
                'companions': { path: 'Companions', infoKey: 'companionInfo' }
            }[userType];

            // Generate unique user ID
            const userId = `${userType.slice(0, -1)}_${Date.now()}`;

            // Create user data object
            const userData = {
                [userTypePath.infoKey]: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || '',
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    ...(formData.subject && { subject: formData.subject }),
                }
            };

            // Save to Firebase
            const userPath = `SkillBuilder_Platform/Organizations/${orgId}/Users/${userTypePath.path}/${userId}`;
            console.log('📍 Saving to path:', userPath);
            console.log('📦 User data:', userData);

            const userRef = ref(firebaseDatabase, userPath);
            await set(userRef, userData);

            console.log('✅ User saved successfully!');
            toast.success(`${userType.slice(0, -1)} added successfully!`);

            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
            });

            onSuccess();
        } catch (error) {
            console.error('❌ Error adding user:', error);
            toast.error(`Failed to add user: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New {userType.slice(0, -1)}</DialogTitle>
            <DialogContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    <TextField
                        fullWidth
                        label="Full Name *"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., John Doe"
                    />

                    <TextField
                        fullWidth
                        label="Email *"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g., john@example.com"
                    />

                    <TextField
                        fullWidth
                        label="Phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g., +1234567890"
                    />

                    {userType === 'teachers' && (
                        <FormControl fullWidth>
                            <InputLabel>Subject</InputLabel>
                            <Select
                                value={formData.subject || ''}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                label="Subject"
                            >
                                <MenuItem value="mathematics">Mathematics</MenuItem>
                                <MenuItem value="science">Science</MenuItem>
                                <MenuItem value="english">English</MenuItem>
                                <MenuItem value="social_studies">Social Studies</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !formData.name || !formData.email}
                >
                    {loading ? 'Adding...' : 'Add User'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
