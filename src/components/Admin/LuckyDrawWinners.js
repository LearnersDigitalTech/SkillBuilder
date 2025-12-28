'use client';
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Chip,
    IconButton,
    Button,
    Container,
    Divider,
    TextField,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import { ref, get, remove } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';
import { Trash2, Trophy, RefreshCw, Crown, Layers, Filter } from 'lucide-react';

const WinnerCard = ({ winner, onDelete }) => {
    const getColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'student': return '#2563eb';
            case 'parent': return '#059669';
            case 'teacher': return '#d97706';
            case 'guest': return '#7c3aed';
            default: return '#6b7280';
        }
    };
    const color = getColor(winner.role);

    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                border: `1px solid ${color}20`,
                background: `linear-gradient(135deg, #ffffff 0%, ${color}05 100%)`,
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 10px 20px -5px ${color}30`
                }
            }}
        >
            <Box position="absolute" top={-10} right={-10} sx={{ opacity: 0.1, transform: 'rotate(15deg)', zIndex: 0 }}>
                <Crown size={120} color={color} />
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2} position="relative" zIndex={1}>
                <Chip
                    label={winner.role?.toUpperCase() || 'WINNER'}
                    sx={{
                        bgcolor: color,
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                    }}
                    size="small"
                />
                <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log("Delete clicked for:", winner.id);
                        onDelete(winner.id, winner.displayName);
                    }}
                    sx={{ bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#ffebee' } }}
                >
                    <Trash2 size={16} />
                </IconButton>
            </Box>

            <Typography variant="h4" fontWeight="900" sx={{ color: color, mb: 1, fontFamily: 'monospace', position: 'relative', zIndex: 1 }}>
                {winner.ticketCode}
            </Typography>

            <Typography variant="h6" fontWeight="bold" noWrap title={winner.displayName} gutterBottom sx={{ position: 'relative', zIndex: 1 }}>
                {winner.displayName}
            </Typography>

            {winner.displayDetails && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '20px', position: 'relative', zIndex: 1 }}>
                    {winner.displayDetails}
                </Typography>
            )}

            <Box display="flex" alignItems="center" gap={1} mt={2} sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="caption" color="text.disabled">
                    Won on {new Date(winner.timestamp).toLocaleDateString()}
                </Typography>
            </Box>
        </Paper>
    );
};

const LuckyDrawWinners = () => {
    const [groupedWinners, setGroupedWinners] = useState({});
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('All'); // 'All', 'parent', 'student', 'teacher', 'guest'

    const fetchWinners = async () => {
        setLoading(true);
        try {
            const winnersRef = ref(firebaseDatabase, 'Lottery/Winners');
            const snapshot = await get(winnersRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const allWinners = Object.entries(data).map(([key, val]) => ({
                    ...val,
                    id: key, // Ensure key overwrites any internal 'id' from val
                    registrationId: val.id // Optional: Preserve original registration ID if needed
                }));

                // Group by Round
                const groups = {};
                allWinners.forEach(winner => {
                    const round = winner.round || 'Round 1';
                    if (!groups[round]) groups[round] = [];
                    groups[round].push(winner);
                });

                // Sort winners within groups by timestamp (optional)
                Object.keys(groups).forEach(round => {
                    groups[round].sort((a, b) => b.timestamp - a.timestamp);
                });

                setGroupedWinners(groups);
            } else {
                setGroupedWinners({});
            }
        } catch (error) {
            console.error("Error fetching winners:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWinners();
    }, []);

    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

    const handleDeleteClick = (id, name) => {
        setDeleteDialog({ open: true, id, name });
    };

    const confirmDelete = async () => {
        if (!deleteDialog.id) return;

        // Optimistic UI Update: Remove immediately from UI
        setGroupedWinners(prevGroups => {
            const newGroups = { ...prevGroups };
            Object.keys(newGroups).forEach(round => {
                newGroups[round] = newGroups[round].filter(w => w.id !== deleteDialog.id);
            });
            return newGroups;
        });

        const idToDelete = deleteDialog.id; // Capture ID
        const nameToDelete = deleteDialog.name;

        // Close dialog immediately
        setDeleteDialog({ open: false, id: null, name: '' });

        try {
            const winnerRef = ref(firebaseDatabase, `Lottery/Winners/${idToDelete}`);
            await remove(winnerRef);
            console.log("Winner deleted successfully from Firebase");
            // No need to fetchWinners() if we trusted the optimistic update, 
            // but we can do it silently in background if we wanted. 
            // For now, let's just stick to the local update to prevent "flickering".
        } catch (error) {
            console.error("Error deleting winner:", error);
            alert("Failed to delete winner: " + error.message);
            fetchWinners(); // Revert/Refresh on error
        }
    };

    const handleCloseDialog = () => {
        setDeleteDialog({ open: false, id: null, name: '' });
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Trophy size={32} color="#f59e0b" />
                        Lucky Draw Winners
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        History of all lucky draw winners grouped by rounds
                    </Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <TextField
                        select
                        size="small"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        variant="outlined"
                        sx={{ minWidth: 150, bgcolor: 'white' }}
                        InputProps={{
                            startAdornment: <Filter size={16} style={{ marginRight: 8, color: '#64748b' }} />
                        }}
                    >
                        <MenuItem value="All">All Winners</MenuItem>
                        <MenuItem value="student">Students</MenuItem>
                        <MenuItem value="parent">Parents</MenuItem>
                        <MenuItem value="teacher">Teachers</MenuItem>
                        <MenuItem value="guest">Guests</MenuItem>
                    </TextField>
                    <Button
                        startIcon={<RefreshCw size={20} />}
                        onClick={fetchWinners}
                        variant="outlined"
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" py={10}>
                    <CircularProgress />
                </Box>
            ) : Object.keys(groupedWinners).length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                        No winners recorded yet. Start a draw! 🎲
                    </Typography>
                </Paper>
            ) : (
                <Box>
                    {Object.entries(groupedWinners).map(([roundName, winners]) => {
                        const filteredWinners = filterType === 'All'
                            ? winners
                            : winners.filter(w => w.role?.toLowerCase() === filterType.toLowerCase() || (filterType === 'guest' && ['guest', 'other'].includes(w.role?.toLowerCase())));

                        if (filteredWinners.length === 0) return null;

                        return (
                            <Box key={roundName} mb={6}>
                                <Box display="flex" alignItems="center" gap={2} mb={3}>
                                    <Layers size={24} color="#64748b" />
                                    <Typography variant="h5" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                        {roundName}
                                    </Typography>
                                    <Chip label={`${filteredWinners.length} Winners`} size="small" />
                                    <Divider sx={{ flexGrow: 1, ml: 2 }} />
                                </Box>
                                <Grid container spacing={3}>
                                    {filteredWinners.map((winner) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={winner.id}>
                                            <WinnerCard winner={winner} onDelete={handleDeleteClick} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        );
                    })}
                </Box>
            )}

            <Dialog
                open={deleteDialog.open}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirm Deletion"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to remove <strong>{deleteDialog.name}</strong> from the winners list?
                        <br /><br />
                        <span style={{ fontSize: '0.9em', color: '#d32f2f' }}>
                            Note: This <strong>only</strong> removes them from the winners display. Their lottery registration ticket remains active in the pool.
                        </span>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default LuckyDrawWinners;
