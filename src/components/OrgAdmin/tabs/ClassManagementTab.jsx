"use client";

import { useState, useEffect } from 'react';
import {
    Button, TextField, Card, CardContent,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Plus, Edit, Trash2, Users, BookOpen } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ClassManagementTab({ orgId, orgData }) {
    const [classes, setClasses] = useState([]);
    const [addClassModalOpen, setAddClassModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadClasses();
    }, [orgId]);

    const loadClasses = async () => {
        setLoading(true);
        try {
            // TODO: Fetch classes from Firebase
            setClasses([]);
        } catch (error) {
            console.error('Error loading classes:', error);
            toast.error('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

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
                        Class Management
                    </h2>
                    <p style={{ margin: 0, color: '#6B7280' }}>
                        Organize students into classes and assign teachers
                    </p>
                </div>

                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => setAddClassModalOpen(true)}
                >
                    Create Class
                </Button>
            </div>

            {/* Classes Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px' }}>
                    <p>Loading classes...</p>
                </div>
            ) : classes.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    background: '#F9FAFB',
                    borderRadius: '8px'
                }}>
                    <BookOpen size={48} style={{ color: '#9CA3AF', marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 8px 0', color: '#111827' }}>
                        No classes yet
                    </h3>
                    <p style={{ margin: '0 0 16px 0', color: '#6B7280' }}>
                        Create your first class to start organizing students
                    </p>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => setAddClassModalOpen(true)}
                    >
                        Create Class
                    </Button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {classes.map((classItem) => (
                        <ClassCard key={classItem.id} classData={classItem} />
                    ))}
                </div>
            )}

            {/* Add Class Modal */}
            <AddClassModal
                open={addClassModalOpen}
                onClose={() => setAddClassModalOpen(false)}
                orgId={orgId}
                onSuccess={() => {
                    loadClasses();
                    setAddClassModalOpen(false);
                }}
            />
        </div>
    );
}

// Class Card Component
function ClassCard({ classData }) {
    return (
        <Card>
            <CardContent>
                <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>
                        {classData.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
                        {classData.grade} • Section {classData.section}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Users size={16} style={{ color: '#6B7280' }} />
                            <span style={{ fontSize: '14px', color: '#6B7280' }}>Students</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                            {classData.studentCount || 0}
                        </p>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <BookOpen size={16} style={{ color: '#6B7280' }} />
                            <span style={{ fontSize: '14px', color: '#6B7280' }}>Teacher</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
                            {classData.teacherName || 'Not assigned'}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button size="small" variant="outlined" fullWidth startIcon={<Edit size={16} />}>
                        Edit
                    </Button>
                    <IconButton size="small" color="error">
                        <Trash2 size={16} />
                    </IconButton>
                </div>
            </CardContent>
        </Card>
    );
}

// Add Class Modal
function AddClassModal({ open, onClose, orgId, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        section: '',
        maxCapacity: 40,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // TODO: Create class in Firebase
            toast.success('Class created successfully!');
            onSuccess();
        } catch (error) {
            console.error('Error creating class:', error);
            toast.error('Failed to create class');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    <TextField
                        fullWidth
                        label="Class Name *"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Grade 7 - Section A"
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <TextField
                            label="Grade *"
                            value={formData.grade}
                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                            placeholder="Grade 7"
                        />

                        <TextField
                            label="Section *"
                            value={formData.section}
                            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                            placeholder="A"
                        />
                    </div>

                    <TextField
                        fullWidth
                        label="Max Capacity"
                        type="number"
                        value={formData.maxCapacity}
                        onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !formData.name || !formData.grade || !formData.section}
                >
                    {loading ? 'Creating...' : 'Create Class'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
