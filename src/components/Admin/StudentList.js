import React, { useState, useMemo, useRef } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip,
    Box,
    TextField,
    MenuItem,
    Grid,
    FormControl,
    InputLabel,
    Select,
    Slider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Avatar,
    Divider,
    useTheme,
    ToggleButton,
    ToggleButtonGroup,
    InputAdornment,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Eye,
    User,
    Mail,
    Phone,
    Calendar,
    Award,
    Download,
    X,
    CheckCircle,
    XCircle,
    AlertCircle,
    Trash2,
    FileSpreadsheet,
    Zap,
    BookOpen,
    Search,
    ChevronDown,
    Clock
} from 'lucide-react';
import MathRenderer from '@/components/MathRenderer/MathRenderer.component';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import * as XLSX from 'xlsx';

const StudentList = ({ students, onDelete, assessmentType = 'standard' }) => {
    const theme = useTheme();
    const chartRef = useRef(null);
    const [selectedGrade, setSelectedGrade] = useState('All');
    const [minScore, setMinScore] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    // Derived view mode from prop
    const viewMode = assessmentType;

    // Get unique grades for filter dropdown
    const uniqueGrades = useMemo(() => {
        const grades = new Set(students.map(s => s.grade).filter(Boolean));
        return Array.from(grades).sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.replace(/\D/g, '')) || 0;
            return numA - numB;
        });
    }, [students]);

    // Filter students
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const gradeMatch = selectedGrade === 'All' || student.grade === selectedGrade;

            let score = 0;
            if (viewMode === 'standard') {
                score = (student.marks !== null && student.marks !== undefined) ? student.marks : 0;
            } else {
                score = (student.rapidMath?.marks !== undefined) ? student.rapidMath.marks : 0;
            }

            const scoreMatch = score >= minScore;

            // Search Filter
            const term = searchTerm.toLowerCase();
            const nameMatch = student.name?.toLowerCase().includes(term);
            const phoneMatch = student.phoneNumber?.toLowerCase().includes(term);
            const emailMatch = student.email?.toLowerCase().includes(term);
            const searchMatch = !searchTerm || nameMatch || phoneMatch || emailMatch;

            return gradeMatch && scoreMatch && searchMatch;
        });
    }, [students, selectedGrade, minScore, viewMode, searchTerm]);

    const handleView = (student) => {
        setSelectedStudent(student);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedStudent(null);
    };

    const handleDeleteClick = (student) => {
        setStudentToDelete(student);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (studentToDelete && onDelete) {
            onDelete(studentToDelete.id);
        }
        setDeleteConfirmOpen(false);
        setStudentToDelete(null);
    };

    const handleCancelDelete = () => {
        setDeleteConfirmOpen(false);
        setStudentToDelete(null);
    };

    const handleExportExcel = () => {
        const dataToExport = filteredStudents.map(student => {
            if (viewMode === 'standard') {
                return {
                    Name: student.name,
                    Grade: student.grade,
                    PhoneNumber: student.phoneNumber,
                    Email: student.email || 'N/A',
                    Marks: (student.marks !== null && student.marks !== undefined) ? `${student.marks}%` : 'Not Attempted',
                    DateJoined: student.date ? new Date(student.date).toLocaleDateString() : 'N/A',
                    Status: (student.marks !== null && student.marks !== undefined)
                        ? (student.marks >= 40 ? "PASSED" : "FAILED")
                        : "NOT ATTEMPTED"
                };
            } else {
                return {
                    Name: student.name,
                    Email: student.email || 'N/A',
                    RapidMathScore: (student.rapidMath?.marks !== undefined) ? `${student.rapidMath.marks}%` : 'Not Attempted',
                    TimeTaken: student.rapidMath?.timeTaken ? `${Math.floor(student.rapidMath.timeTaken / 60)}m ${student.rapidMath.timeTaken % 60}s` : 'N/A',
                    TotalQuestions: student.rapidMath?.totalQuestions || 'N/A',
                    Date: student.rapidMath?.date ? new Date(student.rapidMath.date).toLocaleDateString() : 'N/A',
                    Status: (student.rapidMath?.marks !== undefined) ? "COMPLETED" : "NOT ATTEMPTED"
                };
            }
        });

        const sheetName = viewMode === 'standard' ? "Standard_Assessment" : "Rapid_Math";
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, `Student_List_${sheetName}.xlsx`);
    };

    const handleDownload = async () => {
        if (!selectedStudent) return;

        // Helper to load logo
        const loadLogo = () => new Promise(resolve => {
            const img = new Image();
            img.src = '/logo.svg';
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve({ data: canvas.toDataURL('image/png'), w: img.width, h: img.height });
            };
            img.onerror = () => resolve(null);
        });

        const logo = await loadLogo();

        // Determine which data to show
        const isRapid = viewMode === 'rapid';
        const marks = isRapid ? (selectedStudent.rapidMath?.marks) : selectedStudent.marks;
        const date = isRapid ? (selectedStudent.rapidMath?.date) : selectedStudent.date;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // --- Design Elements ---

        // 1. Page Border
        doc.setDrawColor(0, 0, 0); // Black
        doc.setLineWidth(3); // Thick
        doc.rect(6, 6, pageWidth - 12, pageHeight - 12); // Outer border (Adjusted for clipping)

        // 2. Header Background (White)
        doc.setFillColor(255, 255, 255);
        doc.rect(6, 6, pageWidth - 12, 40, 'F');

        // Logo Container removed (background is already white)

        // Add Logo (Centered in white box)
        if (logo) {
            const maxH = 24;
            const maxW = 44;
            let logoH = maxH;
            let logoW = (logo.w / logo.h) * logoH;

            if (logoW > maxW) {
                logoW = maxW;
                logoH = (logo.h / logo.w) * logoW;
            }

            const xPos = 12 + (50 - logoW) / 2;
            const yPosLogo = 10 + (30 - logoH) / 2;

            doc.addImage(logo.data, 'PNG', xPos, yPosLogo, logoW, logoH);
        }

        // 3. Header Text
        doc.setTextColor(0, 0, 0); // Black
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(isRapid ? "RAPID MATH REPORT" : "STUDENT REPORT CARD", 70, 27);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Skill Conquest Academy", 70, 35);

        // --- Student Details Section ---

        let yPos = 60;
        const leftColX = 20;
        const rightColX = 110;

        // Section Title
        doc.setTextColor(33, 150, 243); // Blue
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("STUDENT PROFILE", 20, yPos);

        // Divider Line
        doc.setDrawColor(200, 200, 200); // Light Gray
        doc.setLineWidth(1.5);
        doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);

        yPos += 15;

        // Details Content
        doc.setTextColor(60, 60, 60); // Dark Gray
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");

        const addDetail = (label, value, x, y) => {
            doc.setFont("helvetica", "bold");
            doc.text(`${label}:`, x, y);
            doc.setFont("helvetica", "normal");
            doc.text(value || 'N/A', x + 35, y);
        };

        addDetail("Name", selectedStudent.name, leftColX, yPos);
        addDetail("Grade", selectedStudent.grade, rightColX, yPos);

        yPos += 10;
        addDetail("Phone", selectedStudent.phoneNumber, leftColX, yPos);
        addDetail("Email", selectedStudent.email, rightColX, yPos);

        yPos += 10;
        addDetail("Date", date ? new Date(date).toLocaleDateString() : 'N/A', leftColX, yPos);

        // Status Badge (Text representation)
        const status = (marks !== null && marks !== undefined)
            ? (marks >= 40 ? "PASSED" : "FAILED") // Or logic for Rapid Math?
            : "NOT ATTEMPTED";

        if (!isRapid) {
            doc.setFont("helvetica", "bold");
            doc.text("Status:", rightColX, yPos);
            if (status === "PASSED") doc.setTextColor(0, 128, 0);
            else if (status === "FAILED") doc.setTextColor(255, 0, 0);
            else doc.setTextColor(100, 100, 100);
            doc.text(status, rightColX + 35, yPos);
        }

        // --- Performance Section ---

        yPos += 25;
        doc.setTextColor(33, 150, 243); // Blue
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PERFORMANCE OVERVIEW", 20, yPos);
        doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);

        yPos += 15;

        // Marks Display
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        const marksText = (marks !== null && marks !== undefined)
            ? `Final Score: ${marks}%`
            : "Final Score: Not Attempted";
        doc.text(marksText, 20, yPos);

        // Chart removed from PDF by user request

        // --- Footer ---
        const footerY = pageHeight - 15;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, footerY);
        doc.text("Skill Conquest - Empowering Learners", pageWidth - 20, footerY, { align: "right" });

        // Save the PDF
        doc.save(`${selectedStudent.name.replace(/\s+/g, '_')}_${isRapid ? 'RapidMath' : 'Report'}.pdf`);
    };

    const getChartData = (student) => {
        const isRapid = viewMode === 'rapid';
        let val = isRapid ? student.rapidMath?.marks : student.marks;

        if (val === null || val === undefined) return [];
        return [
            { name: 'Score', value: val },
            { name: 'Lost', value: 100 - val }
        ];
    };

    const COLORS = ['#00C49F', '#FF8042'];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">
                    {viewMode === 'standard' ? 'Student Details' : 'Rapid Math Results'}
                </Typography>

                {/* Toggle removed, controlled by props now */}
            </Box>

            {/* Filters */}
            <Paper sx={{
                p: 3,
                mb: 4,
                borderRadius: 4,
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9',
                background: 'ffffff'
            }}>
                <Grid container spacing={3} alignItems="center">
                    {/* Search Field */}
                    <Grid item xs={12} md={5}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search Student Name, Phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={20} color="#64748b" />
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: '12px',
                                    fieldset: { borderColor: '#e2e8f0' },
                                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                    bgcolor: '#f8fafc',
                                    fontSize: '0.95rem'
                                }
                            }}
                        />
                    </Grid>

                    {/* Grade Filter */}
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ fontWeight: 500, color: '#64748b' }}>Filter by Grade</InputLabel>
                            <Select
                                value={selectedGrade}
                                label="Filter by Grade"
                                onChange={(e) => setSelectedGrade(e.target.value)}
                                sx={{
                                    borderRadius: '12px',
                                    bgcolor: '#f8fafc',
                                    '.MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' }
                                }}
                            >
                                <MenuItem value="All">All Grades</MenuItem>
                                {uniqueGrades.map((grade) => (
                                    <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Min Score Filter */}
                    <Grid item xs={12} md={2}>
                        <Box sx={{ px: 1 }}>
                            <Typography gutterBottom variant="caption" color="text.secondary" fontWeight="600">
                                Min Score: {minScore}%
                            </Typography>
                            <Slider
                                value={minScore}
                                onChange={(e, newValue) => setMinScore(newValue)}
                                valueLabelDisplay="auto"
                                min={0}
                                max={100}
                                size="small"
                                sx={{
                                    color: '#3b82f6',
                                    '& .MuiSlider-thumb': { boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }
                                }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={2} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<FileSpreadsheet size={18} />}
                            onClick={handleExportExcel}
                            size="medium"
                            sx={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)',
                                color: 'white',
                                width: '100%',
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            Export Excel
                        </Button>
                        <Typography variant="caption" color="text.fourth" align="center" fontWeight="500" sx={{ color: '#94a3b8' }}>
                            {filteredStudents.length} Students Found
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
                <Table sx={{ minWidth: 650 }} aria-label="student table">
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                            {/* Standard Columns */}
                            {viewMode === 'standard' && <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>}
                            {viewMode === 'standard' && <TableCell sx={{ fontWeight: 'bold' }}>Phone Number</TableCell>}

                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{viewMode === 'standard' ? 'Latest Marks' : 'Rapid Math Score'}</TableCell>
                            {viewMode === 'rapid' && <TableCell sx={{ fontWeight: 'bold' }}>Time Taken</TableCell>}
                            {viewMode === 'rapid' && <TableCell sx={{ fontWeight: 'bold' }}>Total Ques.</TableCell>}
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, index) => {
                                const marks = viewMode === 'rapid' ? student.rapidMath?.marks : student.marks;
                                const date = viewMode === 'rapid' ? student.rapidMath?.date : student.date;

                                return (
                                    <TableRow
                                        key={index}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                                            {student.name}
                                        </TableCell>

                                        {viewMode === 'standard' && <TableCell>{student.grade}</TableCell>}
                                        {viewMode === 'standard' && <TableCell>{student.phoneNumber}</TableCell>}

                                        <TableCell>{student.email || 'N/A'}</TableCell>
                                        <TableCell>
                                            {(marks !== null && marks !== undefined) ? `${marks}%` : 'N/A'}
                                        </TableCell>

                                        {viewMode === 'rapid' && (
                                            <TableCell>
                                                {student.rapidMath?.timeTaken ? `${Math.floor(student.rapidMath.timeTaken / 60)}m ${student.rapidMath.timeTaken % 60}s` : '-'}
                                            </TableCell>
                                        )}
                                        {viewMode === 'rapid' && (
                                            <TableCell>
                                                {student.rapidMath?.totalQuestions || '-'}
                                            </TableCell>
                                        )}

                                        <TableCell>
                                            {date ? new Date(date).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {(marks !== null && marks !== undefined) ? (
                                                <Chip
                                                    label={marks >= 40 ? "Passed" : "Failed"}
                                                    color={marks >= 40 ? "success" : "error"}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ) : (
                                                <Chip label="Not Attempted" size="small" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="primary" onClick={() => handleView(student)}>
                                                <Eye size={20} />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDeleteClick(student)}>
                                                <Trash2 size={20} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No student records found.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Enhanced Student Details Modal */}
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        overflow: 'hidden'
                    }
                }}
            >
                <Box sx={{
                    background: 'linear-gradient(135deg, #2196F3 30%, #21CBF3 90%)',
                    color: 'white',
                    p: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'white', color: '#2196F3', width: 56, height: 56 }}>
                            <User size={32} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                {selectedStudent?.name}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                                {viewMode === 'standard'
                                    ? `Grade ${selectedStudent?.grade} Student`
                                    : "Rapid Math Challenger"}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                        <X />
                    </IconButton>
                </Box>

                <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
                    {selectedStudent && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {/* Row 1: Profile & Pie Chart */}
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: '100%', border: '1px solid #e0e0e0' }}>
                                        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <User size={20} /> Personal Details
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Phone size={20} color="#666" />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                                                    <Typography variant="body1" fontWeight="500">{selectedStudent.phoneNumber}</Typography>
                                                </Box>
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Mail size={20} color="#666" />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Email Address</Typography>
                                                    <Typography variant="body1" fontWeight="500">{selectedStudent.email || 'N/A'}</Typography>
                                                </Box>
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Calendar size={20} color="#666" />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Date Joined</Typography>
                                                    <Typography variant="body1" fontWeight="500">
                                                        {selectedStudent.date ? new Date(selectedStudent.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: '100%', border: '1px solid #e0e0e0' }}>
                                        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Award size={20} /> Performance Overview
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        {(() => {
                                            const marks = viewMode === 'rapid' ? selectedStudent.rapidMath?.marks : selectedStudent.marks;
                                            if (marks !== null && marks !== undefined) {
                                                return (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <Box ref={chartRef} key={`chart-${selectedStudent.id}-${marks}`} sx={{ width: '100%', maxWidth: 300, height: 200, position: 'relative' }}>
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <PieChart>
                                                                    <Pie data={getChartData(selectedStudent)} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" stroke="none">
                                                                        {getChartData(selectedStudent).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                                    </Pie>
                                                                    <RechartsTooltip />
                                                                    <Legend verticalAlign="bottom" height={36} />
                                                                </PieChart>
                                                            </ResponsiveContainer>
                                                            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -65%)', textAlign: 'center' }}>
                                                                <Typography variant="h4" fontWeight="bold">{marks}%</Typography>
                                                                <Typography variant="caption">Score</Typography>
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, bgcolor: marks >= 40 ? '#e8f5e9' : '#ffebee', p: 1, px: 2, borderRadius: 10 }}>
                                                            {marks >= 40 ? <CheckCircle size={18} color="green" /> : <XCircle size={18} color="red" />}
                                                            <Typography variant="subtitle2" color={marks >= 40 ? "success.main" : "error.main"} fontWeight="bold">
                                                                Result: {marks >= 40 ? "PASSED" : "FAILED"}
                                                            </Typography>
                                                        </Box>

                                                        {/* Summary Stats Grid */}
                                                        {(() => {
                                                            const currentSummary = viewMode === 'rapid'
                                                                ? selectedStudent.rapidMath?.report?.summary
                                                                : selectedStudent.summary;

                                                            if (currentSummary) {
                                                                return (
                                                                    <Box sx={{ width: '100%', mt: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                                                        <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0', textAlign: 'center' }}>
                                                                            <Typography variant="h6" color="success.main" fontWeight="bold">{currentSummary.correct || 0}</Typography>
                                                                            <Typography variant="caption" color="text.secondary">Correct</Typography>
                                                                        </Box>
                                                                        <Box sx={{ p: 1.5, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fecaca', textAlign: 'center' }}>
                                                                            <Typography variant="h6" color="error.main" fontWeight="bold">{currentSummary.wrong || 0}</Typography>
                                                                            <Typography variant="caption" color="text.secondary">Wrong</Typography>
                                                                        </Box>
                                                                        <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                                                            <Typography variant="h6" color="text.secondary" fontWeight="bold">{(currentSummary.totalQuestions || 0) - (currentSummary.attempted || 0)}</Typography>
                                                                            <Typography variant="caption" color="text.secondary">Skipped</Typography>
                                                                        </Box>
                                                                        <Box sx={{ p: 1.5, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe', textAlign: 'center' }}>
                                                                            <Typography variant="h6" color="primary.main" fontWeight="bold">
                                                                                {currentSummary.totalTime ? `${Math.floor(currentSummary.totalTime / 60)}m ${currentSummary.totalTime % 60}s` : '0m 0s'}
                                                                            </Typography>
                                                                            <Typography variant="caption" color="text.secondary">Time Taken</Typography>
                                                                        </Box>
                                                                    </Box>
                                                                );
                                                            }
                                                            return null;
                                                        })()}

                                                        {/* Feedback Section - Specific to report type */}
                                                        <Box sx={{ mt: 3, width: '100%', p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0', textAlign: 'left' }}>
                                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold">
                                                                Detailed Feedback
                                                            </Typography>

                                                            {viewMode === 'standard' ? (
                                                                selectedStudent.topicFeedback ? (
                                                                    Object.entries(selectedStudent.topicFeedback).map(([topic, data]) => (
                                                                        <Box key={topic} sx={{ mb: 2, p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #eee' }}>
                                                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                                                                                {topic}
                                                                            </Typography>

                                                                            <Box sx={{ mb: 1 }}>
                                                                                <Typography variant="caption" color="success.main" fontWeight="bold" display="block">
                                                                                    What went well:
                                                                                </Typography>
                                                                                <Typography variant="body2" color="text.secondary">
                                                                                    {data.positiveFeedback}
                                                                                </Typography>
                                                                            </Box>

                                                                            <Box>
                                                                                <Typography variant="caption" color="error.main" fontWeight="bold" display="block">
                                                                                    Needs Improvement:
                                                                                </Typography>
                                                                                <Typography variant="body2" color="text.secondary">
                                                                                    {data.improvementFeedback}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                    ))
                                                                ) : (
                                                                    <Typography variant="body2" color="text.primary" sx={{ fontStyle: 'italic' }}>
                                                                        "{selectedStudent.feedback}"
                                                                    </Typography>
                                                                )
                                                            ) : (
                                                                // Rapid Math Feedback (Usually simpler)
                                                                <Typography variant="body2" color="text.primary">
                                                                    Rapid Math Challenge completed with {selectedStudent.rapidMath?.marks}% accuracy.
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                );
                                            }
                                            return <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Data</Box>
                                        })()}
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Row 2: Detailed Analysis */}
                            {selectedStudent.perQuestionReport && selectedStudent.perQuestionReport.length > 0 && (
                                <Box>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                                        <BookOpen size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                        Detailed Question Analysis
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {selectedStudent.perQuestionReport.map((q, idx) => (
                                            <Accordion key={idx} variant="outlined" sx={{ borderRadius: 2, bgcolor: 'white', '&:before': { display: 'none' } }}>
                                                <AccordionSummary expandIcon={<ChevronDown />}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                                        <Chip label={`Q${idx + 1}`} size="small" color={q.isCorrect ? "success" : "error"} variant={q.isCorrect ? "filled" : "outlined"} />
                                                        <Typography variant="subtitle2" sx={{ flexGrow: 1, fontWeight: 600 }}>
                                                            <MathRenderer content={typeof q.question === 'string' ? q.question.substring(0, 50) + (q.question.length > 50 ? '...' : '') : 'Question Image'} />
                                                        </Typography>
                                                        {q.timeTaken && (
                                                            <Chip icon={<Clock size={14} />} label={`${Math.round(q.timeTaken)}s`} size="small" variant="outlined" />
                                                        )}
                                                        {q.image && <Typography variant="caption" color="text.secondary">(Image)</Typography>}
                                                    </Box>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle2" color="text.secondary">Question:</Typography>
                                                            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                                                                <MathRenderer content={q.question || ''} />
                                                            </Box>
                                                            {q.image && (
                                                                <Box mt={1}>
                                                                    <img src={q.image} alt="Question" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
                                                                </Box>
                                                            )}
                                                        </Grid>
                                                        <Grid item xs={12} md={6}>
                                                            <Typography variant="subtitle2" color="text.secondary">Your Answer:</Typography>
                                                            <Box sx={{ p: 1.5, bgcolor: q.isCorrect ? '#f0fdf4' : '#fef2f2', borderRadius: 1, border: '1px solid', borderColor: q.isCorrect ? '#bbf7d0' : '#fecaca', minHeight: 40 }}>
                                                                <Typography color={q.isCorrect ? "success.main" : "error.main"} fontWeight="500">
                                                                    {q.type === 'factorTree' ? 'Factor Tree Interaction' : (q.userAnswer || 'Not Attempted')}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12} md={6}>
                                                            <Typography variant="subtitle2" color="text.secondary">Correct Answer:</Typography>
                                                            <Box sx={{ p: 1.5, bgcolor: '#f0f9ff', borderRadius: 1, border: '1px solid #bae6fd', minHeight: 40 }}>
                                                                <Typography color="primary.main" fontWeight="500">
                                                                    {q.type === 'factorTree' ? 'Check details' : (q.correctAnswer || 'N/A')}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Row 3: Topic Feedback & Learning Plan */}
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: '100%', border: '1px solid #e0e0e0' }}>
                                        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">Topic Feedback</Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        {selectedStudent.topicFeedback ? (
                                            Object.entries(selectedStudent.topicFeedback).map(([topic, data]) => (
                                                <Box key={topic} sx={{ mb: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" color="primary">{topic}</Typography>
                                                    <Typography variant="caption" color="success.main" display="block">Good: {data.positiveFeedback}</Typography>
                                                    <Typography variant="caption" color="error.main" display="block">Improve: {data.improvementFeedback}</Typography>
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography variant="body2">{selectedStudent.feedback}</Typography>
                                        )}
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: '100%', border: '1px solid #e0e0e0' }}>
                                        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">Learning Plan</Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        {selectedStudent.learningPlan && selectedStudent.learningPlan.length > 0 ? (
                                            <Box>
                                                {selectedStudent.learningPlan.map((day, idx) => (
                                                    <Box key={idx} sx={{ mb: 1.5, p: 1.5, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fcd34d' }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" color="orange">Day {day.day}: {day.skillCategory}</Typography>
                                                        <Typography variant="body2" sx={{ mt: 0.5 }}>{day.selfLearn}</Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No learning plan generated yet.</Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
                    <Button onClick={handleClose} color="inherit" sx={{ mr: 1 }}>Close</Button>
                    <Button
                        onClick={handleDownload}
                        variant="contained"
                        color="primary"
                        startIcon={<Download size={18} />}
                        sx={{
                            px: 3,
                            borderRadius: 2,
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
                        }}
                    >
                        Download Report
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={handleCancelDelete}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the student <strong>{studentToDelete?.name}</strong>?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="inherit">Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StudentList;
