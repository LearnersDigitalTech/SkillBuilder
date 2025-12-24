'use client';
import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    TextField,
    InputAdornment,
    Chip,
    IconButton,
    Avatar,
    LinearProgress,
    Tooltip
} from '@mui/material';
import { Search, TrendingUp, Users, AlertTriangle, Shield, ChevronRight, Calendar } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/backend/firebaseHandler';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import StudentDetailModal from './StudentDetailModal';

// Risk score calculation
const calculateRiskScore = (studentData) => {
    const { sessions, totalViolations, autoSubmits, violationTypes } = studentData;

    if (sessions.length === 0) return 0;

    const tabSwitches = violationTypes['tab-switch'] || 0;
    const fullscreenExits = violationTypes['fullscreen-exit'] || 0;
    const copyAttempts = (violationTypes['copy-attempt'] || 0) + (violationTypes['paste-attempt'] || 0);
    const keyboardShortcuts = violationTypes['keyboard-shortcut'] || 0;

    const rawScore = (
        (tabSwitches * 10) +
        (fullscreenExits * 8) +
        (copyAttempts * 5) +
        (keyboardShortcuts * 7) +
        (autoSubmits * 50)
    ) / sessions.length;

    return Math.min(Math.round(rawScore), 100);
};

// Get risk level and color
const getRiskLevel = (score) => {
    if (score >= 75) return { level: 'Critical', color: '#ef4444', bgColor: '#fee2e2' };
    if (score >= 50) return { level: 'High', color: '#f97316', bgColor: '#ffedd5' };
    if (score >= 25) return { level: 'Medium', color: '#f59e0b', bgColor: '#fef3c7' };
    return { level: 'Low', color: '#10b981', bgColor: '#d1fae5' };
};

const SecurityDashboard = () => {
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRiskFilter, setSelectedRiskFilter] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedStudent(null);
    };

    useEffect(() => {
        const fetchViolations = async () => {
            try {
                const violationsRef = collection(db, 'testViolations');
                const q = query(violationsRef, orderBy('startTime', 'desc'));
                const querySnapshot = await getDocs(q);

                const violationsData = [];
                querySnapshot.forEach((doc) => {
                    violationsData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                setViolations(violationsData);
            } catch (err) {
                console.error('Error fetching violations:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchViolations();
    }, []);

    // Aggregate data by student
    const studentData = useMemo(() => {
        const aggregated = violations.reduce((acc, session) => {
            const key = session.childId || session.userId || 'unknown';

            if (!acc[key]) {
                acc[key] = {
                    childId: key,
                    childName: session.childName || 'Unknown Student',
                    sessions: [],
                    totalViolations: 0,
                    autoSubmits: 0,
                    violationTypes: {},
                    lastActivity: null
                };
            }

            acc[key].sessions.push(session);
            acc[key].totalViolations += session.totalViolations || 0;
            if (session.autoSubmitted) acc[key].autoSubmits++;

            // Track last activity
            const sessionTime = session.startTime?.toDate?.() || new Date(session.startTime);
            if (!acc[key].lastActivity || sessionTime > acc[key].lastActivity) {
                acc[key].lastActivity = sessionTime;
            }

            // Count violation types
            if (session.violations) {
                session.violations.forEach(v => {
                    acc[key].violationTypes[v.type] =
                        (acc[key].violationTypes[v.type] || 0) + 1;
                });
            }

            return acc;
        }, {});

        // Calculate risk scores
        Object.values(aggregated).forEach(student => {
            student.riskScore = calculateRiskScore(student);
            student.riskInfo = getRiskLevel(student.riskScore);
        });

        return Object.values(aggregated);
    }, [violations]);

    // Filter students
    const filteredStudents = useMemo(() => {
        return studentData.filter(student => {
            const matchesSearch = student.childName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRisk = selectedRiskFilter === 'all' ||
                student.riskInfo.level.toLowerCase() === selectedRiskFilter.toLowerCase();
            return matchesSearch && matchesRisk;
        }).sort((a, b) => b.riskScore - a.riskScore);
    }, [studentData, searchTerm, selectedRiskFilter]);

    // Calculate overview stats
    const stats = useMemo(() => {
        return {
            totalStudents: studentData.length,
            highRiskStudents: studentData.filter(s => s.riskScore >= 50).length,
            totalViolations: studentData.reduce((sum, s) => sum + s.totalViolations, 0),
            autoSubmits: studentData.reduce((sum, s) => sum + s.autoSubmits, 0)
        };
    }, [studentData]);

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
                Error loading security data: {error}
            </Alert>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{
                    background: 'linear-gradient(45deg, #ef4444 30%, #f97316 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Security Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Real-time monitoring and risk assessment for all students
                </Typography>
            </Box>

            {/* Overview Stats */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h3" fontWeight="bold">{stats.totalStudents}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Students Monitored</Typography>
                                </Box>
                                <Users size={40} style={{ opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h3" fontWeight="bold">{stats.highRiskStudents}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>High Risk</Typography>
                                </Box>
                                <AlertTriangle size={40} style={{ opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h3" fontWeight="bold">{stats.totalViolations}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Violations</Typography>
                                </Box>
                                <Shield size={40} style={{ opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h3" fontWeight="bold">{stats.autoSubmits}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Auto-Submits</Typography>
                                </Box>
                                <TrendingUp size={40} style={{ opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters */}
            <Box mb={3} display="flex" gap={2} flexWrap="wrap" alignItems="center">
                <TextField
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ minWidth: 300 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={20} />
                            </InputAdornment>
                        ),
                    }}
                />
                <Box display="flex" gap={1}>
                    {['all', 'critical', 'high', 'medium', 'low'].map(risk => (
                        <Chip
                            key={risk}
                            label={risk.charAt(0).toUpperCase() + risk.slice(1)}
                            onClick={() => setSelectedRiskFilter(risk)}
                            color={selectedRiskFilter === risk ? 'primary' : 'default'}
                            variant={selectedRiskFilter === risk ? 'filled' : 'outlined'}
                        />
                    ))}
                </Box>
            </Box>

            {/* Student Grid */}
            {filteredStudents.length === 0 ? (
                <Alert severity="info">No students found matching your criteria.</Alert>
            ) : (
                <Grid container spacing={3}>
                    {filteredStudents.map((student) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={student.childId}>
                            <Card
                                onClick={() => handleStudentClick(student)}
                                sx={{
                                    height: '100%',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6
                                    },
                                    border: `2px solid ${student.riskInfo.color}20`
                                }}
                            >
                                <CardContent>
                                    {/* Student Header */}
                                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                                        <Avatar
                                            sx={{
                                                bgcolor: student.riskInfo.color,
                                                width: 48,
                                                height: 48,
                                                fontSize: '1.25rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {student.childName.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box flex={1}>
                                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                                {student.childName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {student.sessions.length} session{student.sessions.length !== 1 ? 's' : ''}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Risk Score */}
                                    <Box mb={2}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                            <Typography variant="caption" fontWeight="600">Risk Score</Typography>
                                            <Chip
                                                label={student.riskInfo.level}
                                                size="small"
                                                sx={{
                                                    bgcolor: student.riskInfo.bgColor,
                                                    color: student.riskInfo.color,
                                                    fontWeight: 'bold',
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={student.riskScore}
                                                sx={{
                                                    flex: 1,
                                                    height: 8,
                                                    borderRadius: 4,
                                                    bgcolor: `${student.riskInfo.color}20`,
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: student.riskInfo.color,
                                                        borderRadius: 4
                                                    }
                                                }}
                                            />
                                            <Typography variant="h6" fontWeight="bold" color={student.riskInfo.color}>
                                                {student.riskScore}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Quick Stats */}
                                    <Box display="flex" justifyContent="space-between" mb={2}>
                                        <Box textAlign="center">
                                            <Typography variant="h6" fontWeight="bold">{student.totalViolations}</Typography>
                                            <Typography variant="caption" color="text.secondary">Violations</Typography>
                                        </Box>
                                        <Box textAlign="center">
                                            <Typography variant="h6" fontWeight="bold">{student.autoSubmits}</Typography>
                                            <Typography variant="caption" color="text.secondary">Auto-Submits</Typography>
                                        </Box>
                                        <Box textAlign="center">
                                            <Typography variant="h6" fontWeight="bold">
                                                {Object.keys(student.violationTypes).length}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">Types</Typography>
                                        </Box>
                                    </Box>

                                    {/* Last Activity */}
                                    <Box display="flex" alignItems="center" gap={1} pt={2} borderTop="1px solid #e0e0e0">
                                        <Calendar size={14} color="#666" />
                                        <Typography variant="caption" color="text.secondary">
                                            Last: {student.lastActivity ? new Date(student.lastActivity).toLocaleDateString() : 'N/A'}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Student Detail Modal */}
            <StudentDetailModal
                open={modalOpen}
                onClose={handleCloseModal}
                student={selectedStudent}
            />
        </Box>
    );
};

export default SecurityDashboard;
