'use client';
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Avatar,
    Divider,
    Tabs,
    Tab,
    Button
} from '@mui/material';
import { X, Download, Calendar, Clock, AlertTriangle, TrendingUp, Shield, Monitor } from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    Area,
    AreaChart
} from 'recharts';

const COLORS = {
    'tab-switch': '#ef4444',
    'fullscreen-exit': '#f97316',
    'copy-attempt': '#3b82f6',
    'paste-attempt': '#06b6d4',
    'keyboard-shortcut': '#8b5cf6',
    'screenshot-attempt': '#ec4899',
    'devtools-open': '#dc2626',
    'right-click': '#f59e0b'
};

const StudentDetailModal = ({ open, onClose, student }) => {
    const [activeTab, setActiveTab] = React.useState(0);

    if (!student) return null;

    // Prepare violation type data for pie chart
    const violationTypeData = Object.entries(student.violationTypes).map(([type, count]) => ({
        name: type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        value: count,
        color: COLORS[type] || '#64748b'
    }));

    // Prepare timeline data
    const timelineData = student.sessions
        .map(session => ({
            date: new Date(session.startTime?.toDate?.() || session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            violations: session.totalViolations || 0,
            timestamp: new Date(session.startTime?.toDate?.() || session.startTime).getTime()
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

    // Browser analytics
    const browserData = student.sessions.reduce((acc, session) => {
        const platform = session.browserInfo?.platform || 'Unknown';
        acc[platform] = (acc[platform] || 0) + (session.totalViolations || 0);
        return acc;
    }, {});

    const browserChartData = Object.entries(browserData).map(([name, violations]) => ({
        name,
        violations
    }));

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };

    const handleExport = () => {
        // Create CSV data
        const csvData = [
            ['Student Violation Report'],
            ['Student Name', student.childName],
            ['Risk Score', student.riskScore],
            ['Total Sessions', student.sessions.length],
            ['Total Violations', student.totalViolations],
            ['Auto-Submits', student.autoSubmits],
            [''],
            ['Session History'],
            ['Date', 'Test Type', 'Violations', 'Auto-Submit', 'Duration'],
            ...student.sessions.map(session => [
                formatDate(session.startTime),
                session.testType || 'Assessment',
                session.totalViolations || 0,
                session.autoSubmitted ? 'Yes' : 'No',
                session.endTime ? `${Math.round((new Date(session.endTime.toDate()) - new Date(session.startTime.toDate())) / 60000)} min` : 'In Progress'
            ])
        ];

        const csv = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${student.childName}_violations_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '90vh'
                }
            }}
        >
            {/* Header */}
            <DialogTitle sx={{ pb: 2, borderBottom: '1px solid #e5e7eb' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                            sx={{
                                bgcolor: student.riskInfo.color,
                                width: 56,
                                height: 56,
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                            }}
                        >
                            {student.childName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                {student.childName}
                            </Typography>
                            <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                                <Chip
                                    label={`Risk: ${student.riskScore}`}
                                    size="small"
                                    sx={{
                                        bgcolor: student.riskInfo.bgColor,
                                        color: student.riskInfo.color,
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Chip
                                    label={student.riskInfo.level}
                                    size="small"
                                    sx={{
                                        bgcolor: student.riskInfo.color,
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                        <Button
                            startIcon={<Download size={18} />}
                            variant="outlined"
                            size="small"
                            onClick={handleExport}
                        >
                            Export
                        </Button>
                        <IconButton onClick={onClose} size="small">
                            <X size={20} />
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {/* Quick Stats */}
                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: '#f0f9ff', border: '1px solid #bfdbfe' }}>
                            <CardContent sx={{ p: 2 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <Calendar size={18} color="#3b82f6" />
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Total Sessions
                                    </Typography>
                                </Box>
                                <Typography variant="h4" fontWeight="bold" color="#3b82f6">
                                    {student.sessions.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
                            <CardContent sx={{ p: 2 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <AlertTriangle size={18} color="#ef4444" />
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Total Violations
                                    </Typography>
                                </Box>
                                <Typography variant="h4" fontWeight="bold" color="#ef4444">
                                    {student.totalViolations}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: '#fef3c7', border: '1px solid #fde68a' }}>
                            <CardContent sx={{ p: 2 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <TrendingUp size={18} color="#f59e0b" />
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Auto-Submits
                                    </Typography>
                                </Box>
                                <Typography variant="h4" fontWeight="bold" color="#f59e0b">
                                    {student.autoSubmits}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                            <CardContent sx={{ p: 2 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <Shield size={18} color="#10b981" />
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Avg Violations
                                    </Typography>
                                </Box>
                                <Typography variant="h4" fontWeight="bold" color="#10b981">
                                    {(student.totalViolations / student.sessions.length).toFixed(1)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tabs */}
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Overview" />
                    <Tab label="Session History" />
                    <Tab label="Analytics" />
                </Tabs>

                {/* Tab Content */}
                {activeTab === 0 && (
                    <Grid container spacing={3}>
                        {/* Violation Timeline */}
                        <Grid item xs={12} md={8}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" mb={2}>
                                        Violation Timeline
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <AreaChart data={timelineData}>
                                            <defs>
                                                <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: 12 }} />
                                            <YAxis stroke="#64748b" style={{ fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                                                labelStyle={{ fontWeight: 'bold' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="violations"
                                                stroke="#ef4444"
                                                strokeWidth={2}
                                                fill="url(#colorViolations)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Violation Type Breakdown */}
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" mb={2}>
                                        Violation Types
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={violationTypeData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {violationTypeData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {activeTab === 1 && (
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell><strong>Date & Time</strong></TableCell>
                                    <TableCell><strong>Test Type</strong></TableCell>
                                    <TableCell align="center"><strong>Violations</strong></TableCell>
                                    <TableCell align="center"><strong>Auto-Submit</strong></TableCell>
                                    <TableCell><strong>Duration</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {student.sessions.map((session, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500}>
                                                {formatDate(session.startTime)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={session.testType === 'speed-test' ? 'Speed Test' : 'Assessment'}
                                                size="small"
                                                color={session.testType === 'speed-test' ? 'warning' : 'primary'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={session.totalViolations || 0}
                                                size="small"
                                                sx={{
                                                    bgcolor: session.totalViolations > 5 ? '#fee2e2' : '#f0fdf4',
                                                    color: session.totalViolations > 5 ? '#ef4444' : '#10b981',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {session.autoSubmitted ? (
                                                <Chip label="Yes" size="small" color="error" />
                                            ) : (
                                                <Chip label="No" size="small" color="success" variant="outlined" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {session.endTime ? (
                                                <Typography variant="body2">
                                                    {Math.round((new Date(session.endTime.toDate()) - new Date(session.startTime.toDate())) / 60000)} min
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">In Progress</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={session.endTime ? 'Completed' : 'Active'}
                                                size="small"
                                                color={session.endTime ? 'default' : 'success'}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {activeTab === 2 && (
                    <Grid container spacing={3}>
                        {/* Browser Analytics */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" mb={2}>
                                        Violations by Platform
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={browserChartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: 12 }} />
                                            <YAxis stroke="#64748b" style={{ fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                                            />
                                            <Bar dataKey="violations" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Violation Type List */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" mb={2}>
                                        Violation Breakdown
                                    </Typography>
                                    <Box display="flex" flexDirection="column" gap={2}>
                                        {violationTypeData.map((item, index) => (
                                            <Box key={index}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {item.name}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="bold" color={item.color}>
                                                        {item.value}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        width: '100%',
                                                        height: 8,
                                                        bgcolor: '#f1f5f9',
                                                        borderRadius: 4,
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: `${(item.value / student.totalViolations) * 100}%`,
                                                            height: '100%',
                                                            bgcolor: item.color,
                                                            borderRadius: 4
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default StudentDetailModal;
