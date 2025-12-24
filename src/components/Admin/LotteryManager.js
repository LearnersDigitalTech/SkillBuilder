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
    InputAdornment
} from '@mui/material';
import { RefreshCw, Download, Trash2, Search, Filter, Calendar } from 'lucide-react';
import { ref, get, remove } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';

const LotteryManager = () => {
    const [registrations, setRegistrations] = useState([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [gradeFilter, setGradeFilter] = useState('All');
    const [userTypeFilter, setUserTypeFilter] = useState('All'); // 'All', 'parent', 'guest'
    const [dateFilter, setDateFilter] = useState('');

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const registrationsRef = ref(firebaseDatabase, 'Lottery/Registrations');
            const snapshot = await get(registrationsRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const formattedData = Object.entries(data).map(([key, val]) => ({
                    id: key,
                    ...val,
                    // Ensure userType exists for older records (default to parent if missing)
                    userType: val.userType || 'parent'
                })).sort((a, b) => b.timestamp - a.timestamp); // Newest first
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

        // 1. Search (Name, Phone, Ticket)
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(item =>
                (item.studentName && item.studentName.toLowerCase().includes(lowerTerm)) ||
                (item.parentName && item.parentName.toLowerCase().includes(lowerTerm)) ||
                (item.phoneNumber && item.phoneNumber.includes(lowerTerm)) ||
                (item.ticketCode && item.ticketCode.toLowerCase().includes(lowerTerm))
            );
        }

        // 2. Grade Filter
        if (gradeFilter !== 'All') {
            result = result.filter(item => String(item.studentGrade) === String(gradeFilter));
        }

        // 3. User Type Filter
        if (userTypeFilter !== 'All') {
            result = result.filter(item => item.userType === userTypeFilter);
        }

        // 4. Date Filter
        if (dateFilter) {
            result = result.filter(item => {
                const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
                return itemDate === dateFilter;
            });
        }

        setFilteredRegistrations(result);
    }, [searchTerm, gradeFilter, userTypeFilter, dateFilter, registrations]);

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this entry?")) {
            try {
                const itemRef = ref(firebaseDatabase, `Lottery/Registrations/${id}`);
                await remove(itemRef);
                const newRegs = registrations.filter(item => item.id !== id);
                setRegistrations(newRegs);
                // Filtering effect will auto-update filteredRegistrations
            } catch (error) {
                console.error("Error deleting entry:", error);
            }
        }
    };

    const handleExport = () => {
        const headers = ["Ticket Code", "User Type", "Student Name", "Parent Name", "Phone", "Grade", "Date"];
        const csvContent = [
            headers.join(","),
            ...filteredRegistrations.map(row => [
                row.ticketCode,
                row.userType,
                `"${row.studentName}"`,
                `"${row.parentName}"`,
                row.phoneNumber,
                row.studentGrade,
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
                        placeholder="Search Name, Phone, Ticket..."
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
                        <MenuItem value="guest">Guest</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Grade"
                        size="small"
                        value={gradeFilter}
                        onChange={(e) => setGradeFilter(e.target.value)}
                        sx={{ minWidth: 120, bgcolor: 'white' }}
                    >
                        <MenuItem value="All">All Grades</MenuItem>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                            <MenuItem key={g} value={g}>Grade {g}</MenuItem>
                        ))}
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

                    {(searchTerm || gradeFilter !== 'All' || userTypeFilter !== 'All' || dateFilter) && (
                        <Button
                            variant="text"
                            color="error"
                            size="small"
                            onClick={() => {
                                setSearchTerm('');
                                setGradeFilter('All');
                                setUserTypeFilter('All');
                                setDateFilter('');
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </Stack>
            </Box>

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
                                <TableCell sx={{ fontWeight: 'bold' }}>User Type</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Parent Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRegistrations.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>
                                        <Chip
                                            label={row.ticketCode}
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
                                            label={row.userType === 'guest' ? 'Guest' : 'Parent'}
                                            size="small"
                                            color={row.userType === 'guest' ? 'secondary' : 'default'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>{row.studentName}</TableCell>
                                    <TableCell>{row.parentName}</TableCell>
                                    <TableCell>{row.phoneNumber}</TableCell>
                                    <TableCell>Grade {row.studentGrade}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                        {new Date(row.timestamp).toLocaleDateString()} {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </TableCell>
                                    <TableCell align="right">
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
        </Paper>
    );
};

export default LotteryManager;
