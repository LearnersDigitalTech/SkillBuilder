'use client';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    CircularProgress,
    Autocomplete,
    Checkbox,
    FormControlLabel,
    Stack,
    Alert,
    IconButton,
    Avatar,
    Grid,
    Divider,
    Tooltip,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Card,
    InputAdornment,
    Switch
} from '@mui/material';
import {
    ChevronRight,
    Search,
    Filter,
    Save,
    Trash2,
    Users,
    BookOpen,
    School,
    GraduationCap,
    Clock,
    Mail,
    Phone,
    MapPin,
    Hash,
    Check,
    X,
    UserPlus,
    AlertCircle
} from 'lucide-react';
import { toast } from "react-toastify";
import { ref, get, remove } from 'firebase/database';
import { firebaseDatabase, auth } from '@/backend/firebaseHandler';
import {
    getAllTeachers,
    getTeacherDetails,
    assignGradesToTeacher,
    assignStudentsToTeacher,
    getStudentsByGrade,
    removeGradeFromTeacher,
    removeStudentFromTeacher,
    getStudentDetailsBatch,
    resetTeacherAssignments
} from '@/services/adminTeacherService';
import { useAuth } from '@/context/AuthContext';

const GRADE_OPTIONS = Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`);

const TeacherManagement = () => {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [teacherDetails, setTeacherDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Grade assignment state
    const [selectedGrades, setSelectedGrades] = useState([]);
    const [savingGrades, setSavingGrades] = useState(false);

    // Student assignment state
    const [selectedGradesForStudents, setSelectedGradesForStudents] = useState([]); // Changed to array for multi-select
    const [availableStudents, setAvailableStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [savingStudents, setSavingStudents] = useState(false);
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [showSelectedOnly, setShowSelectedOnly] = useState(false);

    // Assigned Students List State
    const [assignedStudentDetails, setAssignedStudentDetails] = useState([]);
    const [loadingAssignedStudents, setLoadingAssignedStudents] = useState(false);
    const [assignedSearchTerm, setAssignedSearchTerm] = useState('');

    // Derived unique schools from available students
    const availableSchools = [...new Set(availableStudents.map(s => s.schoolName || 'Unknown School'))].sort();

    // Derived state for filtered students
    const filteredStudents = availableStudents.filter(student => {
        const matchesSearch = (student.name?.toLowerCase() || '').includes(studentSearchTerm.toLowerCase()) ||
            (student.email?.toLowerCase() || '').includes(studentSearchTerm.toLowerCase());
        const matchesSchool = selectedSchool ? (student.schoolName || 'Unknown School') === selectedSchool : true;
        const matchesFilter = showSelectedOnly ? selectedStudents.includes(student.uid) : true;
        return matchesSearch && matchesFilter && matchesSchool;
        return matchesSearch && matchesFilter && matchesSchool;
    });

    // Derived state for filtered ASSIGNED students
    const filteredAssignedStudents = assignedStudentDetails.filter(student =>
        (student.name?.toLowerCase() || '').includes(assignedSearchTerm.toLowerCase()) ||
        (student.email?.toLowerCase() || '').includes(assignedSearchTerm.toLowerCase()) ||
        (student.schoolName?.toLowerCase() || '').includes(assignedSearchTerm.toLowerCase())
    );

    // Select All / Deselect All Handler
    const handleSelectAll = (checked) => {
        if (checked) {
            // Select all currently visible (filtered) students
            const newSelected = new Set([...selectedStudents, ...filteredStudents.map(s => s.uid)]);
            setSelectedStudents(Array.from(newSelected));
        } else {
            // Deselect all currently visible students
            const visibleIds = filteredStudents.map(s => s.uid);
            setSelectedStudents(selectedStudents.filter(id => !visibleIds.includes(id)));
        }
    };

    // Fetch all teachers on mount
    useEffect(() => {
        fetchTeachers();
    }, []);

    // Hydrate assigned students when teacher details change
    useEffect(() => {
        const fetchAssignedDetails = async () => {
            if (!teacherDetails?.assignments?.students) {
                setAssignedStudentDetails([]);
                return;
            }

            const studentsMap = teacherDetails.assignments.students;
            const studentsList = Object.entries(studentsMap).map(([uid, data]) => ({
                uid,
                childId: data.childId || 'default'
            }));

            if (studentsList.length === 0) {
                setAssignedStudentDetails([]);
                return;
            }

            setLoadingAssignedStudents(true);
            const details = await getStudentDetailsBatch(studentsList);
            setAssignedStudentDetails(details);
            setLoadingAssignedStudents(false);
        };

        fetchAssignedDetails();
    }, [teacherDetails]);

    const fetchTeachers = async () => {
        setLoading(true);
        const data = await getAllTeachers();
        setTeachers(data);
        setLoading(false);
    };

    const handleOpenDetails = async (teacher) => {
        setSelectedTeacher(teacher);
        setDetailModalOpen(true);
        setLoadingDetails(true);

        const details = await getTeacherDetails(teacher.uid);
        setTeacherDetails(details);
        setSelectedGrades(details?.assignments.assignedGrades || []);
        setLoadingDetails(false);
    };

    const handleCloseDetails = () => {
        setDetailModalOpen(false);
        setSelectedTeacher(null);
        setTeacherDetails(null);
        setSelectedGrades([]);
        setSelectedGradesForStudents([]); // Reset to empty array
        setAvailableStudents([]);
        setSelectedStudents([]);
    };

    const handleSaveGrades = async () => {
        if (!selectedTeacher || !user) return;

        setSavingGrades(true);
        const success = await assignGradesToTeacher(selectedTeacher.uid, selectedGrades, user.uid);

        if (success) {
            // Refresh teacher details and list
            const details = await getTeacherDetails(selectedTeacher.uid);
            setTeacherDetails(details);
            await fetchTeachers();
        }

        setSavingGrades(false);
    };

    const handleGradesSelectForStudents = async (grades) => {
        setSelectedGradesForStudents(grades);
        setLoadingStudents(true);

        // Load students from ALL selected grades with deduplication
        const studentMap = new Map();
        for (const grade of grades) {
            const students = await getStudentsByGrade(grade);
            students.forEach(student => {
                // Use the same composite key as list rendering to ensure uniqueness based on what React uses
                const key = `${student.uid}_${student.childId}`;
                if (!studentMap.has(key)) {
                    studentMap.set(key, student);
                }
            });
        }

        const allStudents = Array.from(studentMap.values());
        setAvailableStudents(allStudents);

        // Pre-select already assigned students
        const assignedStudentUids = Object.keys(teacherDetails?.assignments.students || {});
        setSelectedStudents(assignedStudentUids);

        setLoadingStudents(false);
    };

    const handleToggleStudent = (studentUid) => {
        setSelectedStudents(prev => {
            if (prev.includes(studentUid)) {
                return prev.filter(uid => uid !== studentUid);
            } else {
                return [...prev, studentUid];
            }
        });
    };

    const handleSaveStudents = async () => {
        // Fallback to direct auth check if context is slow/missing
        // Since Admin Dashboard uses cookies, client-side Firebase Auth might be null.
        // We allow the operation to proceed with a placeholder ID if DB rules allow it.
        const currentUser = user || auth.currentUser;
        const adminUid = currentUser?.uid || 'admin';

        console.log('Save Students Clicked', { selectedTeacher, currentUser, adminUid, grades: selectedGradesForStudents });

        if (!selectedTeacher) {
            toast.error("Error: No teacher selected.");
            return;
        }

        // Removed strict check for !currentUser because Admin might have cookie session only

        if (selectedGradesForStudents.length === 0) {
            toast.warning("Please select at least one grade to assign students from.");
            return;
        }

        setSavingStudents(true);

        // Ensure grades are saved first to maintain consistency
        await assignGradesToTeacher(selectedTeacher.uid, selectedGrades, adminUid);

        // Build students array with required fields
        const studentsToAssign = availableStudents
            .filter(student => selectedStudents.includes(student.uid))
            .map(student => ({
                uid: student.uid,
                childId: student.childId,
                grade: student.grade
            }));

        const success = await assignStudentsToTeacher(selectedTeacher.uid, studentsToAssign, adminUid);

        if (success) {
            // Refresh teacher details and list
            const details = await getTeacherDetails(selectedTeacher.uid);
            setTeacherDetails(details);
            await fetchTeachers();
            toast.success("Assignment saved successfully!");
        } else {
            toast.error("Failed to save assignments. Please try again.");
        }

        setSavingStudents(false);
    };

    const handleResetAssignments = async () => {
        if (!selectedTeacher) return;

        if (confirm('Are you sure you want to remove ALL assigned grades and students from this teacher? This action cannot be undone.')) {
            const adminUid = user?.uid || 'admin'; // Fallback
            const success = await resetTeacherAssignments(selectedTeacher.uid, adminUid);

            if (success) {
                toast.success("All assignments reset successfully.");
                // Clear local state
                setSelectedGrades([]);
                setSelectedStudents([]);
                setAvailableStudents([]);
                setSelectedGradesForStudents([]);
                setAssignedStudentDetails([]);

                // Refresh data
                const details = await getTeacherDetails(selectedTeacher.uid);
                setTeacherDetails(details);
                await fetchTeachers();
            } else {
                toast.error("Failed to reset assignments.");
            }
        }
    };

    const handleRemoveGrade = async (grade) => {
        if (!selectedTeacher) return;

        const success = await removeGradeFromTeacher(selectedTeacher.uid, grade);
        if (success) {
            const details = await getTeacherDetails(selectedTeacher.uid);
            setTeacherDetails(details);
            setSelectedGrades(details?.assignments.assignedGrades || []);
            await fetchTeachers();
        }
    };

    const handleRemoveStudent = async (studentUid) => {
        if (!selectedTeacher) return;

        const success = await removeStudentFromTeacher(selectedTeacher.uid, studentUid);
        if (success) {
            const details = await getTeacherDetails(selectedTeacher.uid);
            setTeacherDetails(details);
            await fetchTeachers();
        }
    };

    const handleDeleteTeacher = async (teacher) => {
        if (!confirm(`Are you sure you want to delete teacher "${teacher.name}"? This will remove them from all systems and they will not be able to log in.`)) {
            return;
        }

        try {
            const ticketCode = teacher.ticketCode;
            const teacherUid = teacher.uid;

            console.log(`🗑️ Deleting teacher: ${teacher.name} (${ticketCode})`);

            // 1. Delete from NMD_2025/Registrations using UID
            const uidRef = ref(firebaseDatabase, `NMD_2025/Registrations/${teacherUid}`);
            const uidSnapshot = await get(uidRef);
            if (uidSnapshot.exists()) {
                await remove(uidRef);
                console.log(`✅ Deleted from NMD_2025/Registrations/${teacherUid}`);
            }

            // 2. Delete from NMD_2025/Registrations using ticketCode as key
            if (ticketCode) {
                const ticketCodeRef = ref(firebaseDatabase, `NMD_2025/Registrations/${ticketCode}`);
                const ticketSnapshot = await get(ticketCodeRef);
                if (ticketSnapshot.exists()) {
                    await remove(ticketCodeRef);
                    console.log(`✅ Deleted from NMD_2025/Registrations/${ticketCode}`);
                }

                // 3. Delete from Lottery/Registrations (search by ticketCode)
                const lotteryRef = ref(firebaseDatabase, 'Lottery/Registrations');
                const lotterySnapshot = await get(lotteryRef);

                if (lotterySnapshot.exists()) {
                    const lotteryRegs = lotterySnapshot.val();
                    for (const [key, value] of Object.entries(lotteryRegs)) {
                        if (value.ticketCode === ticketCode) {
                            const itemRef = ref(firebaseDatabase, `Lottery/Registrations/${key}`);
                            await remove(itemRef);
                            console.log(`✅ Deleted from Lottery/Registrations/${key}`);
                        }
                    }
                }
            }

            console.log("✅ Successfully deleted teacher from all locations");
            alert("Teacher deleted successfully from all systems!");

            // Refresh the teacher list
            await fetchTeachers();

        } catch (error) {
            console.error("Error deleting teacher:", error);
            alert("Failed to delete teacher. Please try again or contact support.");
        }
    };

    const filteredTeachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Teacher Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage teacher assignments and permissions
                    </Typography>
                </Box>
                <Chip
                    icon={<Users size={16} />}
                    label={`${teachers.length} Teachers`}
                    color="primary"
                    variant="outlined"
                />
            </Box>

            {/* Search */}
            <TextField
                fullWidth
                placeholder="Search by name, ticket code, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 3 }}
            />

            {/* Teachers Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Ticket Code</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>School</strong></TableCell>
                            <TableCell align="center"><strong>Assigned Grades</strong></TableCell>
                            <TableCell align="center"><strong>Total Students</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTeachers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        No teachers found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTeachers.map((teacher) => (
                                <TableRow key={teacher.uid} hover>
                                    <TableCell>{teacher.name}</TableCell>
                                    <TableCell>
                                        <Chip label={teacher.ticketCode} size="small" color="primary" variant="outlined" />
                                    </TableCell>
                                    <TableCell>{teacher.email}</TableCell>
                                    <TableCell>{teacher.schoolName}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={teacher.assignedGradesCount}
                                            size="small"
                                            color={teacher.assignedGradesCount > 0 ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={teacher.totalStudents}
                                            size="small"
                                            color={teacher.totalStudents > 0 ? 'info' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<UserPlus size={16} />}
                                                onClick={() => handleOpenDetails(teacher)}
                                            >
                                                Manage
                                            </Button>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteTeacher(teacher)}
                                                title="Delete Teacher"
                                            >
                                                <Trash2 size={18} />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Teacher Detail Modal */}
            <Dialog
                open={detailModalOpen}
                onClose={handleCloseDetails}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, overflow: 'hidden' }
                }}
            >
                {/* Modal Header */}
                <Box
                    sx={{
                        p: 3,
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                    }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                            sx={{
                                width: 64,
                                height: 64,
                                bgcolor: 'white',
                                color: 'primary.main',
                                fontWeight: 'bold',
                                fontSize: '1.5rem',
                                boxShadow: 3
                            }}
                        >
                            {teacherDetails?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                {teacherDetails?.name}
                            </Typography>
                            <Box display="flex" gap={2} mt={0.5} opacity={0.9}>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <Mail size={14} />
                                    <Typography variant="body2">{teacherDetails?.email}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <Hash size={14} />
                                    <Typography variant="body2">{teacherDetails?.ticketCode}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={handleCloseDetails}
                        sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                        <X size={24} />
                    </IconButton>
                </Box>

                <DialogContent sx={{ p: 4, bgcolor: '#f8fafc' }}>
                    {loadingDetails ? (
                        <Box display="flex" justifyContent="center" py={8}>
                            <CircularProgress size={40} />
                        </Box>
                    ) : teacherDetails ? (
                        <Grid container spacing={4}>
                            {/* Left Column: School Info & Stats */}
                            <Grid item xs={12} md={3}>
                                <Stack spacing={3}>
                                    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: 'white' }}>
                                        <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <School size={16} /> SCHOOL DETAILS
                                        </Typography>
                                        <Typography variant="body1" fontWeight="500" gutterBottom>
                                            {teacherDetails.schoolName}
                                        </Typography>
                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Users size={16} /> ASSIGNMENT STATS
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="body2" color="text.secondary">Grades Assigned</Typography>
                                                <Chip label={selectedGrades.length} size="small" color="primary" sx={{ height: 24 }} />
                                            </Box>
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="body2" color="text.secondary">Students Assigned</Typography>
                                                <Chip label={Object.keys(teacherDetails.assignments.students || {}).length} size="small" color="success" sx={{ height: 24 }} />
                                            </Box>
                                        </Stack>
                                    </Paper>

                                    {/* Grade Assignment (Moved to Left) */}
                                    <Box>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary', fontWeight: 600 }}>
                                            <BookOpen size={20} color="#1976d2" /> Assign Grades
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Select the grades this teacher is responsible for.
                                        </Typography>

                                        <Paper elevation={0} variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'white' }}>
                                            <Autocomplete
                                                multiple
                                                options={GRADE_OPTIONS}
                                                value={selectedGrades}
                                                onChange={(e, newValue) => setSelectedGrades(newValue)}
                                                renderInput={(params) => (
                                                    <TextField {...params} placeholder={selectedGrades.length === 0 ? "Select grades..." : ""} variant="standard" />
                                                )}
                                                renderTags={(value, getTagProps) =>
                                                    value.map((option, index) => {
                                                        const { key, ...tagProps } = getTagProps({ index });
                                                        return (
                                                            <Chip
                                                                key={key}
                                                                label={option}
                                                                {...tagProps}
                                                                color="primary"
                                                                variant="filled"
                                                                onDelete={() => handleRemoveGrade(option)}
                                                                sx={{ m: 0.5 }}
                                                            />
                                                        );
                                                    })
                                                }
                                            />
                                            <Box display="flex" justifyContent="flex-end" mt={2}>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={savingGrades ? <CircularProgress size={16} color="inherit" /> : <Check size={16} />}
                                                    onClick={handleSaveGrades}
                                                    disabled={savingGrades}
                                                    disableElevation
                                                >
                                                    Update Grades
                                                </Button>
                                            </Box>
                                        </Paper>
                                    </Box>

                                    {/* Action Buttons */}
                                    <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'error.50', borderColor: 'error.200' }}>
                                        <Typography variant="subtitle2" color="error.main" fontWeight="bold" gutterBottom>
                                            Danger Zone
                                        </Typography>
                                        <Button
                                            fullWidth
                                            color="error"
                                            size="small"
                                            startIcon={<Trash2 size={16} />}
                                            onClick={handleResetAssignments}
                                        >
                                            Reset All Assignments
                                        </Button>
                                    </Paper>
                                </Stack>
                            </Grid>

                            {/* Right Column: Assignments */}
                            <Grid item xs={12} md={9}>
                                <Stack spacing={4}>
                                    {/* Student Assignment */}
                                    <Box>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary', fontWeight: 600 }}>
                                            <UserPlus size={20} color="#2e7d32" /> Assign Students
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Filter by grade and select students to assign.
                                        </Typography>

                                        <Paper elevation={0} variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'white' }}>
                                            <Autocomplete
                                                fullWidth
                                                multiple
                                                key={`student-assign-grades-${selectedGrades.length}`}
                                                options={selectedGrades || []}
                                                value={selectedGradesForStudents}
                                                onChange={(e, newValue) => handleGradesSelectForStudents(newValue || [])}
                                                noOptionsText={selectedGrades.length === 0 ? "⚠️ Select grades above first" : "No grades available"}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        fullWidth
                                                        placeholder="Which grades to load students from?"
                                                        helperText="Select one or more grades to populate the student list below"
                                                    />
                                                )}
                                                renderTags={(value, getTagProps) =>
                                                    value.map((option, index) => {
                                                        const { key, ...tagProps } = getTagProps({ index });
                                                        return (
                                                            <Chip
                                                                key={key}
                                                                label={option}
                                                                size="small"
                                                                color="info"
                                                                variant="outlined"
                                                                {...tagProps}
                                                            />
                                                        );
                                                    })
                                                }
                                                sx={{ mb: 3 }}
                                            />

                                            {loadingStudents ? (
                                                <Box display="flex" justifyContent="center" py={4} bgcolor="grey.50" borderRadius={2}>
                                                    <Stack alignItems="center" spacing={1}>
                                                        <CircularProgress size={24} />
                                                        <Typography variant="caption" color="text.secondary">Loading students...</Typography>
                                                    </Stack>
                                                </Box>
                                            ) : selectedGradesForStudents.length > 0 && availableStudents.length > 0 ? (
                                                <>
                                                    {/* Controls: Search & Select All */}
                                                    <Box display="flex" flexDirection="column" gap={2} mb={2}>
                                                        <Box display="flex" gap={2}>
                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                placeholder="Search students by name or email..."
                                                                value={studentSearchTerm}
                                                                onChange={(e) => setStudentSearchTerm(e.target.value)}
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <Search size={18} color="#9e9e9e" />
                                                                        </InputAdornment>
                                                                    ),
                                                                }}
                                                            />
                                                            <Autocomplete
                                                                size="small"
                                                                options={availableSchools}
                                                                value={selectedSchool}
                                                                onChange={(e, newValue) => setSelectedSchool(newValue)}
                                                                renderInput={(params) => <TextField {...params} placeholder="Filter by School" sx={{ minWidth: 200 }} />}
                                                                renderOption={(props, option) => {
                                                                    const { key, ...otherProps } = props;
                                                                    return (
                                                                        <li key={key} {...otherProps} style={{ fontSize: '0.85rem' }}>
                                                                            <School size={14} style={{ marginRight: 8, opacity: 0.6 }} />
                                                                            {option}
                                                                        </li>
                                                                    );
                                                                }}
                                                            />
                                                        </Box>
                                                        <Box display="flex" justifyContent="space-between" alignItems="center" px={1}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={filteredStudents.length > 0 && filteredStudents.every(s => selectedStudents.includes(s.uid))}
                                                                        indeterminate={
                                                                            filteredStudents.some(s => selectedStudents.includes(s.uid)) &&
                                                                            !filteredStudents.every(s => selectedStudents.includes(s.uid))
                                                                        }
                                                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                                                        size="small"
                                                                    />
                                                                }
                                                                label={<Typography variant="body2" color="text.primary">Select All ({filteredStudents.length})</Typography>}
                                                            />

                                                            <FormControlLabel
                                                                control={
                                                                    <Switch
                                                                        size="small"
                                                                        checked={showSelectedOnly}
                                                                        onChange={(e) => setShowSelectedOnly(e.target.checked)}
                                                                    />
                                                                }
                                                                label={<Typography variant="body2" color="text.secondary">Show Selected Only ({selectedStudents.length})</Typography>}
                                                            />
                                                            <Box flexGrow={1} />
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                startIcon={savingStudents ? <CircularProgress size={16} color="inherit" /> : <Check size={16} />}
                                                                onClick={handleSaveStudents}
                                                                disabled={savingStudents}
                                                                disableElevation
                                                            >
                                                                Save Assignments
                                                            </Button>
                                                        </Box>
                                                    </Box>

                                                    <Box
                                                        sx={{
                                                            maxHeight: 400,
                                                            overflowY: 'auto',
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: 2,
                                                            mb: 2,
                                                            bgcolor: 'white'
                                                        }}
                                                    >
                                                        <List dense disablePadding>
                                                            {filteredStudents.length === 0 ? (
                                                                <Box py={4} textAlign="center">
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        No students match your search
                                                                    </Typography>
                                                                </Box>
                                                            ) : (
                                                                filteredStudents.map((student) => {
                                                                    const isSelected = selectedStudents.includes(student.uid);
                                                                    return (
                                                                        <ListItem
                                                                            key={`${student.uid}_${student.childId}`}
                                                                            disablePadding
                                                                        >
                                                                            <ListItemButton
                                                                                onClick={() => handleToggleStudent(student.uid)}
                                                                                sx={{
                                                                                    bgcolor: isSelected ? 'primary.50' : 'transparent',
                                                                                    borderBottom: '1px solid #f0f0f0',
                                                                                    '&:hover': { bgcolor: isSelected ? 'primary.100' : 'grey.50' }
                                                                                }}
                                                                            >
                                                                                <ListItemIcon sx={{ minWidth: 40 }}>
                                                                                    <Checkbox
                                                                                        edge="start"
                                                                                        checked={isSelected}
                                                                                        disableRipple
                                                                                        size="small"
                                                                                    />
                                                                                </ListItemIcon>
                                                                                <ListItemText
                                                                                    primary={
                                                                                        <Typography variant="body2" fontWeight={isSelected ? 600 : 400}>
                                                                                            {student.name}
                                                                                        </Typography>
                                                                                    }
                                                                                    secondary={student.email}
                                                                                />
                                                                                <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
                                                                                    <Chip
                                                                                        label={student.grade}
                                                                                        size="small"
                                                                                        variant="outlined"
                                                                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                                                                    />
                                                                                    {(student.schoolName && student.schoolName !== 'Unknown School' && student.schoolName !== 'N/A') && (
                                                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                                                            {student.schoolName}
                                                                                        </Typography>
                                                                                    )}
                                                                                </Box>
                                                                            </ListItemButton>
                                                                        </ListItem>
                                                                    );
                                                                })
                                                            )}
                                                        </List>
                                                    </Box>

                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="caption" color="text.secondary">
                                                            {selectedStudents.length} students selected
                                                        </Typography>
                                                    </Box>
                                                </>
                                            ) : selectedGradesForStudents.length > 0 ? (
                                                <Alert severity="info" variant="outlined">No students found in the selected grade(s)</Alert>
                                            ) : (
                                                <Box p={3} bgcolor="grey.50" borderRadius={2} textAlign="center">
                                                    <Typography variant="body2" color="text.secondary">
                                                        Select a grade above to see available students
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Paper>
                                    </Box>

                                    {/* Currently Assigned Students Quick View */}
                                    {assignedStudentDetails.length > 0 && (
                                        <Box>
                                            <Stack direction="row" spacing={2} alignItems="center" mb={1} justifyContent="space-between">
                                                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                                    Currently Assigned ({assignedStudentDetails.length})
                                                </Typography>
                                                <TextField
                                                    size="small"
                                                    placeholder="Search assigned students..."
                                                    value={assignedSearchTerm}
                                                    onChange={(e) => setAssignedSearchTerm(e.target.value)}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Search size={14} />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    sx={{ width: 200, '& .MuiInputBase-root': { fontSize: '0.8rem' } }}
                                                />
                                            </Stack>

                                            <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, bgcolor: 'grey.50', maxHeight: 300, overflow: 'auto' }}>
                                                {loadingAssignedStudents ? (
                                                    <Box p={3} display="flex" justifyContent="center">
                                                        <CircularProgress size={24} />
                                                    </Box>
                                                ) : filteredAssignedStudents.length > 0 ? (
                                                    <List dense disablePadding>
                                                        {filteredAssignedStudents.map((student) => (
                                                            <ListItem
                                                                key={`${student.uid}_${student.childId}`}
                                                                divider
                                                                secondaryAction={
                                                                    <IconButton
                                                                        edge="end"
                                                                        aria-label="delete"
                                                                        size="small"
                                                                        onClick={() => handleRemoveStudent(student.uid)}
                                                                        color="error"
                                                                    >
                                                                        <X size={16} />
                                                                    </IconButton>
                                                                }
                                                                sx={{ bgcolor: 'white' }}
                                                            >
                                                                <ListItemAvatar>
                                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                                                                        {student.name?.charAt(0) || '?'}
                                                                    </Avatar>
                                                                </ListItemAvatar>
                                                                <ListItemText
                                                                    primary={
                                                                        <Box display="flex" alignItems="center" gap={1}>
                                                                            <Typography variant="body2" fontWeight={600}>
                                                                                {student.name}
                                                                            </Typography>
                                                                            <Chip label={student.grade} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                                        </Box>
                                                                    }
                                                                    secondary={
                                                                        <Box display="flex" flexDirection="column">
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                {student.email}
                                                                            </Typography>
                                                                            {student.schoolName && student.schoolName !== 'Unknown School' && (
                                                                                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                                                    {student.schoolName}
                                                                                </Typography>
                                                                            )}
                                                                        </Box>
                                                                    }
                                                                    secondaryTypographyProps={{ component: 'div' }}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                ) : (
                                                    <Box p={2} textAlign="center">
                                                        <Typography variant="caption" color="text.secondary">
                                                            No matching students found.
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Paper>
                                        </Box>
                                    )}

                                </Stack>
                            </Grid>
                        </Grid >
                    ) : (
                        <Alert severity="error">Failed to load teacher details</Alert>
                    )}
                </DialogContent >
                <Divider />
                <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Button onClick={handleCloseDetails} color="inherit">Close</Button>
                </DialogActions>
            </Dialog >
        </Box >
    );
};

export default TeacherManagement;
