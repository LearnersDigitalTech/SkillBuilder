'use client';
import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Stack
} from '@mui/material';
import { AlertTriangle, ChevronDown, Clock, User, FileText } from 'lucide-react';

const ViolationsList = () => {
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchViolations = async () => {
            try {
                const res = await fetch('/api/security');
                if (!res.ok) throw new Error('Failed to fetch security violations');
                const data = await res.json();
                setViolations(data.sessions || []);
            } catch (err) {
                console.error('Error fetching violations:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchViolations();
    }, []);

    const getViolationColor = (type) => {
        switch (type) {
            case 'tab-switch':
                return 'error';
            case 'fullscreen-exit':
                return 'warning';
            case 'copy-attempt':
            case 'paste-attempt':
                return 'info';
            case 'keyboard-shortcut':
                return 'secondary';
            case 'screenshot-attempt':
                return 'error';
            case 'devtools-open':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };

    const formatDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return 'In Progress';
        const start = startTime.toDate ? startTime.toDate() : new Date(startTime);
        const end = endTime.toDate ? endTime.toDate() : new Date(endTime);
        const duration = Math.floor((end - start) / 1000 / 60); // minutes
        return `${duration} min`;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                Error loading violations: {error}
            </Alert>
        );
    }

    if (violations.length === 0) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                No security violations recorded yet.
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                Security Violations Log
            </Typography>

            {violations.map((session) => (
                <Accordion key={session.id} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ChevronDown />}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                            <AlertTriangle size={20} color={session.autoSubmitted ? '#f44336' : '#ff9800'} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {session.childName || 'Unknown Student'} - {session.testType === 'assessment' ? 'Assessment' : 'Speed Test'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatDate(session.startTime)} • {session.totalViolations} violation(s)
                                    {session.autoSubmitted && ' • Auto-Submitted'}
                                </Typography>
                            </Box>
                            <Chip
                                label={session.autoSubmitted ? 'Auto-Submitted' : 'Completed'}
                                color={session.autoSubmitted ? 'error' : 'success'}
                                size="small"
                            />
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack spacing={2}>
                            {/* Session Info */}
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Session Details
                                </Typography>
                                <Stack direction="row" spacing={3} flexWrap="wrap">
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">User ID</Typography>
                                        <Typography variant="body2">{session.userId}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Child ID</Typography>
                                        <Typography variant="body2">{session.childId || 'N/A'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Duration</Typography>
                                        <Typography variant="body2">{formatDuration(session.startTime, session.endTime)}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Browser</Typography>
                                        <Typography variant="body2">{session.browserInfo?.platform || 'Unknown'}</Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            {/* Violations Table */}
                            {session.violations && session.violations.length > 0 && (
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><strong>Time</strong></TableCell>
                                                <TableCell><strong>Type</strong></TableCell>
                                                <TableCell><strong>Details</strong></TableCell>
                                                <TableCell><strong>Warning Shown</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {session.violations.map((violation, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{formatDate(violation.timestamp)}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={violation.type}
                                                            color={getViolationColor(violation.type)}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{violation.details}</TableCell>
                                                    <TableCell>
                                                        {violation.warningShown ? '✓' : '✗'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};

export default ViolationsList;
