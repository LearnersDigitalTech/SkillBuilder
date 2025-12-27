'use client';
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    CircularProgress,
    Button,
    TextField,
    MenuItem,
    Stack,
    InputAdornment,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import { RefreshCw, Download, Trash2, Search, Filter, Calendar, Eye, User, Phone, Mail, School, Briefcase, Star, Gift, Users } from 'lucide-react';
import { ref, get, remove } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';


const LotteryManager = () => {
    const [registrations, setRegistrations] = useState([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState(null);

    const handleView = (registration) => {
        setSelectedRegistration(registration);
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
        setSelectedRegistration(null);
    };

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState('All'); // 'All', 'parent', 'student', 'teacher', 'other'
    const [dateFilter, setDateFilter] = useState('');

    // Random Picker State
    // (Moved to dedicated LotteryDraw component)


    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const registrationsRef = ref(firebaseDatabase, 'Lottery/Registrations');
            const snapshot = await get(registrationsRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const formattedData = Object.entries(data).map(([key, val]) => {
                    // Normalize data for display
                    let details = "N/A";

                    // Determine effective user type for display
                    let effectiveUserType = (val.userType || 'parent').toLowerCase();

                    if (val.ticketCode) {
                        const code = String(val.ticketCode).toUpperCase();
                        if (code.startsWith('O')) effectiveUserType = 'other';
                        else if (code.startsWith('G')) effectiveUserType = 'guest';
                    }

                    if (val.userType === 'parent') {
                        if (val.children && Array.isArray(val.children)) {
                            details = val.children.map(c => `${c.name} (Gr ${c.grade})`).join(", ");
                        } else if (val.studentName && val.studentName !== "N/A") {
                            // Backward compatibility or flat structure
                            details = `${val.studentName} (${val.studentGrade || 'N/A'})`;
                        } else if (effectiveUserType === 'guest') {
                            details = `Profession: ${val.profession || 'N/A'}`;
                        } else {
                            details = "No children listed";
                        }
                    } else if (val.userType === 'student') {
                        details = `Grade ${val.studentGrade} | ${val.schoolName || 'N/A'}`;
                    } else if (val.userType === 'teacher') {
                        details = `School: ${val.schoolName || 'N/A'}`;
                    } else if (effectiveUserType === 'guest') {
                        details = `Profession: ${val.profession || 'N/A'}`;
                    }

                    return {
                        id: key,
                        ...val,
                        userType: val.userType || 'parent', // Keep original for logic if needed
                        effectiveUserType: effectiveUserType, // Use this for display/export
                        displayDetails: details,
                        displayName: val.name || val.parentName || val.studentName || "Unknown"
                    };
                }).sort((a, b) => b.timestamp - a.timestamp); // Newest first

                setRegistrations(formattedData);
                setFilteredRegistrations(formattedData);
            } else {
                setRegistrations([]);
                setFilteredRegistrations([]);
            }
        } catch (error) {
            console.error("Error fetching lottery data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    // Effect for Filtering
    useEffect(() => {
        let result = registrations;

        // 1. Search (Name, Phone, Ticket, Email)
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(item =>
                (item.displayName && item.displayName.toLowerCase().includes(lowerTerm)) ||
                (item.email && item.email.toLowerCase().includes(lowerTerm)) ||
                (item.phoneNumber && item.phoneNumber.includes(lowerTerm)) ||
                (item.ticketCode && item.ticketCode.toLowerCase().includes(lowerTerm)) ||
                (item.displayDetails && item.displayDetails.toLowerCase().includes(lowerTerm))
            );
        }

        // 2. User Type Filter (Use effective type)
        if (userTypeFilter !== 'All') {
            result = result.filter(item => item.effectiveUserType === userTypeFilter);
        }

        // 3. Date Filter
        if (dateFilter) {
            result = result.filter(item => {
                const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
                return itemDate === dateFilter;
            });
        }

        setFilteredRegistrations(result);
    }, [searchTerm, userTypeFilter, dateFilter, registrations]);

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this entry?")) {
            try {
                const itemRef = ref(firebaseDatabase, `Lottery/Registrations/${id}`);
                await remove(itemRef);
                const newRegs = registrations.filter(item => item.id !== id);
                setRegistrations(newRegs);
            } catch (error) {
                console.error("Error deleting entry:", error);
            }
        }
    };

    const handleExport = () => {
        const headers = ["Ticket Code", "Users", "User Name", "Phone", "Email", "Details (School/Children)", "Date"];
        const csvContent = [
            headers.join(","),
            ...filteredRegistrations.map(row => [
                row.ticketCode,
                row.effectiveUserType, // Export effective type
                `"${row.displayName}"`,
                row.phoneNumber,
                row.email || "N/A",
                `"${row.displayDetails}"`, // This will now include Profession for Guests
                new Date(row.timestamp).toLocaleString()
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `lottery_registrations_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Lottery Registrations
                    <Chip label={registrations.length} color="primary" size="small" sx={{ ml: 2, borderRadius: 1 }} />
                </Typography>
                <Box>
                    <Button
                        startIcon={<Download size={18} />}
                        variant="outlined"
                        sx={{ mr: 2 }}
                        onClick={handleExport}
                        disabled={filteredRegistrations.length === 0}
                    >
                        Export CSV
                    </Button>
                    <Button
                        startIcon={<RefreshCw size={18} />}
                        variant="contained"
                        onClick={fetchRegistrations}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {/* Filters Section */}
            <Box sx={{ mb: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                    <TextField
                        placeholder="Search Name, Phone, Email..."
                        size="small"
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={18} color="gray" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flex: 2, bgcolor: 'white' }}
                    />

                    <TextField
                        select
                        label="User Type"
                        size="small"
                        value={userTypeFilter}
                        onChange={(e) => setUserTypeFilter(e.target.value)}
                        sx={{ minWidth: 120, bgcolor: 'white' }}
                    >
                        <MenuItem value="All">All Users</MenuItem>
                        <MenuItem value="parent">Parent</MenuItem>
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="teacher">Teacher</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                    </TextField>

                    <TextField
                        type="date"
                        label="Date"
                        size="small"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 150, bgcolor: 'white' }}
                    />

                    {(searchTerm || userTypeFilter !== 'All' || dateFilter) && (
                        <Button
                            variant="text"
                            color="error"
                            size="small"
                            onClick={() => {
                                setSearchTerm('');
                                setUserTypeFilter('All');
                                setDateFilter('');
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </Stack>
            </Box>

            {/* Live Draw Link */}
            <Paper
                sx={{
                    mb: 4,
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 3
                }}
            >
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    🎉 Ready for the Grand Draw?
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                    Access the dedicated full-screen interface for the live lottery ceremony.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    href="/lottery-draw"
                    target="_blank"
                    sx={{
                        bgcolor: 'white',
                        color: '#764ba2',
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                    }}
                >
                    Open Live Draw Page 🚀
                </Button>
            </Paper>

            {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress />
                </Box>
            ) : filteredRegistrations.length === 0 ? (
                <Box textAlign="center" py={8} color="text.secondary">
                    <Typography>No registrations found matching your filters.</Typography>
                </Box>
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Ticket Code</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Users</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>User Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Details (School/Children)</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRegistrations.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>
                                        <Chip
                                            label={row.ticketCode || "N/A"}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(37, 99, 235, 0.1)',
                                                color: '#2563eb',
                                                fontWeight: 'bold',
                                                fontFamily: 'monospace'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.effectiveUserType} // Use effective type
                                            size="small"
                                            color={
                                                row.effectiveUserType === 'student' ? 'primary' :
                                                    row.effectiveUserType === 'teacher' ? 'warning' :
                                                        row.effectiveUserType === 'parent' ? 'success' : 'default'
                                            }
                                            variant="outlined"
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{row.displayName}</TableCell>
                                    <TableCell>{row.phoneNumber}</TableCell>
                                    <TableCell>{row.email || "N/A"}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                                            {row.displayDetails}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                        {new Date(row.timestamp).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" color="primary" onClick={() => handleView(row)} sx={{ mr: 1 }}>
                                            <Eye size={18} />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                                            <Trash2 size={18} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Details Modal */}
            {/* Details Modal */}
            <Dialog
                open={openModal}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, overflow: 'hidden' }
                }}
            >
                <Box sx={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', p: 3, borderBottom: '1px solid #e2e8f0' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                            Registration Details
                        </Typography>
                        {selectedRegistration && (
                            <Chip
                                label={selectedRegistration.effectiveUserType.toUpperCase()}
                                color={
                                    selectedRegistration.effectiveUserType === 'student' ? 'primary' :
                                        selectedRegistration.effectiveUserType === 'teacher' ? 'warning' :
                                            selectedRegistration.effectiveUserType === 'parent' ? 'success' : 'default'
                                }
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                            />
                        )}
                    </Box>
                </Box>

                <DialogContent sx={{ p: 4 }}>
                    {selectedRegistration && (
                        <Grid container spacing={3}>
                            {/* Ticket Card - Prominent */}
                            <Grid item xs={12}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        bgcolor: '#eff6ff',
                                        border: '1px dashed #bfdbfe',
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column',
                                        gap: 1
                                    }}
                                >
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold" letterSpacing={1}>
                                        LUCKY TICKET NUMBER
                                    </Typography>
                                    <Typography variant="h3" fontWeight="bold" color="primary" sx={{ fontFamily: 'monospace' }}>
                                        {selectedRegistration.ticketCode}
                                    </Typography>
                                </Paper>
                            </Grid>

                            {/* Personal Details */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary" mb={2} fontWeight="bold">
                                    PERSONAL INFO
                                </Typography>
                                <Stack spacing={2}>
                                    <Box display="flex" gap={2} alignItems="center">
                                        <Box sx={{ p: 1, bgcolor: '#f1f5f9', borderRadius: 1 }}><User size={18} color="#64748b" /></Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Name</Typography>
                                            <Typography variant="body1" fontWeight={500}>{selectedRegistration.displayName}</Typography>
                                        </Box>
                                    </Box>
                                    <Box display="flex" gap={2} alignItems="center">
                                        <Box sx={{ p: 1, bgcolor: '#f1f5f9', borderRadius: 1 }}><Phone size={18} color="#64748b" /></Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Phone</Typography>
                                            <Typography variant="body1" fontWeight={500}>{selectedRegistration.phoneNumber}</Typography>
                                        </Box>
                                    </Box>
                                    <Box display="flex" gap={2} alignItems="center">
                                        <Box sx={{ p: 1, bgcolor: '#f1f5f9', borderRadius: 1 }}><Mail size={18} color="#64748b" /></Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Email</Typography>
                                            <Typography variant="body1" fontWeight={500}>{selectedRegistration.email || "N/A"}</Typography>
                                        </Box>
                                    </Box>
                                </Stack>
                            </Grid>

                            {/* Role Details */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary" mb={2} fontWeight="bold">
                                    ROLE DETAILS
                                </Typography>
                                <Stack spacing={2}>
                                    {selectedRegistration.effectiveUserType === 'parent' && (
                                        <Box display="flex" gap={2} alignItems="flex-start">
                                            <Box sx={{ p: 1, bgcolor: '#f0fdf4', borderRadius: 1 }}><Users size={18} color="#16a34a" /></Box>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">Total Children</Typography>
                                                <Typography variant="body1" fontWeight={500}>{selectedRegistration.displayDetails}</Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {selectedRegistration.effectiveUserType === 'guest' && (
                                        <Box display="flex" gap={2} alignItems="center">
                                            <Box sx={{ p: 1, bgcolor: '#fefce8', borderRadius: 1 }}><Briefcase size={18} color="#ca8a04" /></Box>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">Profession</Typography>
                                                <Typography variant="body1" fontWeight={500}>{selectedRegistration.profession || selectedRegistration.displayDetails.replace('Profession: ', '')}</Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {(selectedRegistration.effectiveUserType === 'student' || selectedRegistration.effectiveUserType === 'teacher') && (
                                        <Box display="flex" gap={2} alignItems="center">
                                            <Box sx={{ p: 1, bgcolor: '#fff7ed', borderRadius: 1 }}><School size={18} color="#ea580c" /></Box>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">School & Info</Typography>
                                                <Typography variant="body1" fontWeight={500}>{selectedRegistration.displayDetails}</Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    <Box display="flex" gap={2} alignItems="center">
                                        <Box sx={{ p: 1, bgcolor: '#fef2f2', borderRadius: 1 }}><Calendar size={18} color="#ef4444" /></Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Registered On</Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {new Date(selectedRegistration.timestamp).toLocaleString(undefined, {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={handleClose} variant="outlined" color="inherit">Close</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default LotteryManager;
