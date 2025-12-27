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
    IconButton
} from '@mui/material';
import { Users, GraduationCap, UserPlus, X, Check, Trash2 } from 'lucide-react';
import { ref, get, remove } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';
import {
    getAllTeachers,
    getTeacherDetails,
    assignGradesToTeacher,
    assignStudentsToTeacher,
    getStudentsByGrade,
    removeGradeFromTeacher,
    removeStudentFromTeacher
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

    // Fetch all teachers on mount
    useEffect(() => {
        fetchTeachers();
    }, []);

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

        // Load students from ALL selected grades
        const allStudents = [];
        for (const grade of grades) {
            const students = await getStudentsByGrade(grade);
            allStudents.push(...students);
        }

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
        if (!selectedTeacher || !user || selectedGradesForStudents.length === 0) return;

        setSavingStudents(true);

        // Build students array with required fields
        const studentsToAssign = availableStudents
            .filter(student => selectedStudents.includes(student.uid))
            .map(student => ({
                uid: student.uid,
                childId: student.childId,
                grade: student.grade
            }));

        const success = await assignStudentsToTeacher(selectedTeacher.uid, studentsToAssign, user.uid);

        if (success) {
            // Refresh teacher details and list
            const details = await getTeacherDetails(selectedTeacher.uid);
            setTeacherDetails(details);
            await fetchTeachers();
        }

        setSavingStudents(false);
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
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Manage Teacher Assignments</Typography>
                        <IconButton onClick={handleCloseDetails} size="small">
                            <X size={20} />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {loadingDetails ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : teacherDetails ? (
                        <Stack spacing={3}>
                            {/* Teacher Info */}
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Teacher Information
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography><strong>Name:</strong> {teacherDetails.name}</Typography>
                                    <Typography><strong>Email:</strong> {teacherDetails.email}</Typography>
                                    <Typography><strong>Ticket Code:</strong> {teacherDetails.ticketCode}</Typography>
                                    <Typography><strong>School:</strong> {teacherDetails.schoolName}</Typography>
                                </Paper>
                            </Box>

                            {/* Grade Assignment */}
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Assign Grades
                                </Typography>
                                <Autocomplete
                                    multiple
                                    options={GRADE_OPTIONS}
                                    value={selectedGrades}
                                    onChange={(e, newValue) => setSelectedGrades(newValue)}
                                    renderInput={(params) => (
                                        <TextField {...params} placeholder="Select grades..." />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => {
                                            const { key, ...tagProps } = getTagProps({ index });
                                            return (
                                                <Chip
                                                    key={key}
                                                    label={option}
                                                    {...tagProps}
                                                    onDelete={() => handleRemoveGrade(option)}
                                                />
                                            );
                                        })
                                    }
                                />
                                <Button
                                    variant="contained"
                                    startIcon={savingGrades ? <CircularProgress size={16} /> : <Check size={16} />}
                                    onClick={handleSaveGrades}
                                    disabled={savingGrades}
                                    sx={{ mt: 2 }}
                                >
                                    Save Grades
                                </Button>
                            </Box>

                            {/* Student Assignment */}
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Assign Students
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                    Select one or more grades to view and assign students
                                </Typography>

                                <Autocomplete
                                    multiple
                                    options={teacherDetails.assignments.assignedGrades}
                                    value={selectedGradesForStudents}
                                    onChange={(e, newValue) => handleGradesSelectForStudents(newValue || [])}
                                    renderInput={(params) => (
                                        <TextField {...params} placeholder="Select grades to assign students from..." />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => {
                                            const { key, ...tagProps } = getTagProps({ index });
                                            return (
                                                <Chip
                                                    key={key}
                                                    label={option}
                                                    size="small"
                                                    color="primary"
                                                    {...tagProps}
                                                />
                                            );
                                        })
                                    }
                                    sx={{ mb: 2 }}
                                />

                                {loadingStudents ? (
                                    <Box display="flex" justifyContent="center" py={2}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : selectedGradesForStudents.length > 0 && availableStudents.length > 0 ? (
                                    <>
                                        <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                                            {availableStudents.map((student) => (
                                                <FormControlLabel
                                                    key={`${student.uid}-${student.childId}`}
                                                    control={
                                                        <Checkbox
                                                            checked={selectedStudents.includes(student.uid)}
                                                            onChange={() => handleToggleStudent(student.uid)}
                                                        />
                                                    }
                                                    label={`${student.name} (${student.email})`}
                                                    sx={{ display: 'block' }}
                                                />
                                            ))}
                                        </Paper>
                                        <Button
                                            variant="contained"
                                            startIcon={savingStudents ? <CircularProgress size={16} /> : <Check size={16} />}
                                            onClick={handleSaveStudents}
                                            disabled={savingStudents}
                                            sx={{ mt: 2 }}
                                        >
                                            Save Student Assignments
                                        </Button>
                                    </>
                                ) : selectedGradesForStudents.length > 0 ? (
                                    <Alert severity="info">No students found in the selected grade(s)</Alert>
                                ) : null}
                            </Box>

                            {/* Currently Assigned Students */}
                            {Object.keys(teacherDetails.assignments.students).length > 0 && (
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Currently Assigned Students
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Stack spacing={1}>
                                            {Object.entries(teacherDetails.assignments.students).map(([uid, data]) => (
                                                <Box
                                                    key={uid}
                                                    display="flex"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                >
                                                    <Typography variant="body2">
                                                        {data.grade} - Student UID: {uid.substring(0, 8)}...
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleRemoveStudent(uid)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Paper>
                                </Box>
                            )}
                        </Stack>
                    ) : (
                        <Alert severity="error">Failed to load teacher details</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetails}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TeacherManagement;
