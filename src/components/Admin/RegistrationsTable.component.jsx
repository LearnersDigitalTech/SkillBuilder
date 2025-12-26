import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, CircularProgress, Box, Chip
} from '@mui/material';
import { ref, get } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';
import { Search } from 'lucide-react';

const RegistrationsTable = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const registrationsRef = ref(firebaseDatabase, 'NMD_2025/Registrations');
                const snapshot = await get(registrationsRef);

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const formattedData = Object.entries(data).flatMap(([key, user]) => {
                        // User might have children, or be a single user.
                        // The new structure saves profile data at user level too if registered via new form.

                        // Priority 1: Check for top-level role/school data (New Flow)
                        if (user.role) {
                            return [{
                                id: key,
                                name: user.name || "N/A",
                                phone: user.phone || user.parentPhone || key,
                                email: user.email || user.parentEmail || "N/A",
                                school: user.schoolName || "N/A",
                                role: user.role || "N/A",
                                subRoles: user.extraRoles ? (Array.isArray(user.extraRoles) ? user.extraRoles.join(", ") : Object.keys(user.extraRoles).filter(k => user.extraRoles[k]).join(", ")) : "N/A",
                                grade: user.role === 'Student' ? (user.grade || "N/A") : "N/A",
                                createdAt: user.createdAt || "N/A"
                            }];
                        }

                        // Priority 2: Check children (Old Flow / Student Flow)
                        if (user.children) {
                            return Object.entries(user.children).map(([childId, child]) => ({
                                id: childId,
                                name: child.name || "N/A",
                                phone: user.parentPhone || key,
                                email: child.email || user.parentEmail || "N/A",
                                school: child.schoolName || "N/A",
                                role: child.role || "Student", // Default to student for old records
                                subRoles: child.extraRoles ? (Array.isArray(child.extraRoles) ? child.extraRoles.join(", ") : "") : "N/A",
                                grade: child.grade || "N/A",
                                createdAt: child.createdAt || "N/A"
                            }));
                        }

                        return [];
                    });

                    // Sort by newest first
                    formattedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setRegistrations(formattedData);
                }
            } catch (error) {
                console.error("Error fetching registrations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRegistrations();
    }, []);

    const filteredRegistrations = registrations.filter(reg =>
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone.includes(searchTerm) ||
        reg.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="div">
                    User Registrations ({registrations.length})
                </Typography>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={20} style={{ position: 'absolute', left: '10px', color: '#666' }} />
                    <input
                        type="text"
                        placeholder="Search name, phone, school..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '8px 8px 8px 36px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            width: '250px'
                        }}
                    />
                </div>
            </Box>
            <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader aria-label="registrations table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>School</TableCell>
                            <TableCell>Sub-Roles / Grade</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRegistrations.map((row) => (
                            <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={row.role}
                                        size="small"
                                        color={row.role === 'Student' ? 'primary' : row.role === 'Teacher' ? 'secondary' : 'default'}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>{row.school}</TableCell>
                                <TableCell>
                                    {row.role === 'Student' ? row.grade : row.subRoles}
                                </TableCell>
                                <TableCell>{row.phone}</TableCell>
                                <TableCell>{row.email}</TableCell>
                                <TableCell>
                                    {row.createdAt !== "N/A" ? new Date(row.createdAt).toLocaleDateString() : "N/A"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default RegistrationsTable;
