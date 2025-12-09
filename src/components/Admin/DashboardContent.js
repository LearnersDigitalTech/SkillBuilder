'use client';
import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, CircularProgress, Container, Button, Stack } from '@mui/material';
import { Users, CheckCircle, XCircle, FileText, LayoutDashboard, List, Trophy } from 'lucide-react';
import { ref, get, remove } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';
import StatCard from './StatCard';
import { MarksBarChart, StudentsAreaChart } from './Charts';
import StudentList from './StudentList';

const DashboardContent = ({ logoutAction }) => {
    const [view, setView] = useState('overview'); // 'overview' | 'students'
    const [growthFilter, setGrowthFilter] = useState('month'); // 'day', 'month', 'year'
    const [rawStudentDates, setRawStudentDates] = useState([]);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalPassed: 0,
        totalPerfectScores: 0,
        totalReports: 0,
    });
    const [chartData, setChartData] = useState({
        marksByGrade: [],
        studentGrowth: []
    });
    const [studentList, setStudentList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Registrations
                const registrationsRef = ref(firebaseDatabase, 'NMD_2025/Registrations');
                const registrationsSnapshot = await get(registrationsRef);

                // Fetch Reports
                const reportsRef = ref(firebaseDatabase, 'NMD_2025/Reports');
                const reportsSnapshot = await get(reportsRef);

                let studentCount = 0;
                let reportCount = 0;
                let passedCount = 0;
                let perfectScoreCount = 0;

                const students = [];
                const gradeMarks = {}; // { "Grade 5": { total: 0, count: 0 } }
                const allDates = [];


                if (registrationsSnapshot.exists()) {
                    const regs = registrationsSnapshot.val();
                    const reportsData = reportsSnapshot.exists() ? reportsSnapshot.val() : {};

                    // Create a normalized map for reports: last 10 digits -> original key
                    const normalizedReports = {};
                    Object.keys(reportsData).forEach(key => {
                        const normalizedKey = key.replace(/\D/g, '').slice(-10);
                        normalizedReports[normalizedKey] = key;
                    });

                    Object.entries(regs).forEach(([phoneKey, user]) => { // phoneKey is usually last 10 digits
                        const normalizedPhoneKey = phoneKey.replace(/\D/g, '').slice(-10);

                        if (user.children) {
                            Object.entries(user.children).forEach(([childId, child]) => {
                                studentCount++;

                                // Student List Data Preparation
                                let latestMarks = null;
                                let latestDate = null;
                                let latest = {}; // Default empty object

                                // Find reports for this child using normalized key
                                const reportKey = normalizedReports[normalizedPhoneKey];
                                if (reportKey && reportsData[reportKey][childId]) {
                                    const childReports = reportsData[reportKey][childId];
                                    let allReports = [];

                                    // Determine if it's a single report or a map of reports
                                    if (childReports.timestamp) {
                                        allReports = [childReports];
                                    } else {
                                        // Helper to extract timestamp from Firebase Push ID
                                        const getTimestampFromId = (id) => {
                                            const PUSH_CHARS = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
                                            let time = 0;
                                            for (let i = 0; i < 8; i++) {
                                                time = time * 64 + PUSH_CHARS.indexOf(id.charAt(i));
                                            }
                                            return time;
                                        };

                                        // Map reports to include timestamp
                                        allReports = Object.entries(childReports).map(([key, val]) => {
                                            if (typeof val !== 'object') return null;
                                            let ts = val.timestamp;
                                            if (!ts) {
                                                const numKey = Number(key);
                                                if (!isNaN(numKey) && numKey > 1000000000000) {
                                                    ts = numKey;
                                                } else if (key.length >= 8) {
                                                    const pushTs = getTimestampFromId(key);
                                                    if (pushTs > 1000000000000 && pushTs < 3000000000000) {
                                                        ts = pushTs;
                                                    }
                                                }
                                            }
                                            return { ...val, timestamp: ts || 0 };
                                        }).filter(Boolean);
                                    }

                                    // Sort reports by timestamp descending
                                    allReports.sort((a, b) => b.timestamp - a.timestamp);

                                    if (allReports.length > 0) {
                                        // Separate logic for Standard vs Rapid Math
                                        const standardReports = allReports.filter(r => r.type !== 'RAPID_MATH');
                                        const rapidMathReports = allReports.filter(r => r.type === 'RAPID_MATH');

                                        // --- PROCESS STANDARD REPORTS ---
                                        if (standardReports.length > 0) {
                                            latest = standardReports[0];

                                            // Handle stringified feedback for latest report
                                            if (typeof latest.generalFeedbackStringified === 'string') {
                                                try {
                                                    const parsed = JSON.parse(latest.generalFeedbackStringified);
                                                    latest = { ...latest, ...parsed };
                                                } catch (e) {
                                                    console.error("Error parsing feedback:", e);
                                                }
                                            }

                                            // Calculate marks for latest report
                                            let accuracy = 0;
                                            // Handle both new 'summary' format and old 'perQuestionReport' format
                                            if (latest.summary && latest.summary.accuracyPercent !== undefined) {
                                                accuracy = latest.summary.accuracyPercent;
                                            } else if (latest.perQuestionReport && Array.isArray(latest.perQuestionReport)) {
                                                const total = latest.perQuestionReport.length;
                                                const correct = latest.perQuestionReport.filter(q => q.isCorrect).length;
                                                accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
                                            }

                                            latestMarks = accuracy;
                                            latestDate = latest.timestamp;

                                            // Aggregate Stats (Only for Standard Reports as per current logic)
                                            reportCount += standardReports.length;
                                            standardReports.forEach(rep => {
                                                let repAccuracy = 0;
                                                if (rep.summary && rep.summary.accuracyPercent !== undefined) {
                                                    repAccuracy = rep.summary.accuracyPercent;
                                                } else if (rep.perQuestionReport && Array.isArray(rep.perQuestionReport)) {
                                                    const total = rep.perQuestionReport.length;
                                                    const correct = rep.perQuestionReport.filter(q => q.isCorrect).length;
                                                    repAccuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
                                                }

                                                if (repAccuracy >= 40) passedCount++;
                                                if (repAccuracy === 100) perfectScoreCount++;

                                                // Aggregate for Marks Chart
                                                const grade = child.grade || "Unknown";
                                                if (!gradeMarks[grade]) gradeMarks[grade] = { total: 0, count: 0 };
                                                gradeMarks[grade].total += repAccuracy;
                                                gradeMarks[grade].count++;
                                            });
                                        }

                                        // --- PROCESS RAPID MATH REPORTS ---
                                        let latestRapid = null;
                                        if (rapidMathReports.length > 0) {
                                            latestRapid = rapidMathReports[0];
                                        }

                                        students.push({
                                            name: child.name,
                                            grade: child.grade,
                                            phoneNumber: user.parentPhone || phoneKey, // Fallback to key if parentPhone missing
                                            email: child.email,
                                            marks: latestMarks,
                                            date: latestDate,
                                            id: phoneKey, // Add ID for deletion
                                            feedback: latest.generalFeedback || "No feedback available",
                                            topicFeedback: latest.topicFeedback || null,
                                            rapidMath: latestRapid ? {
                                                marks: latestRapid.summary?.accuracyPercent || 0,
                                                date: latestRapid.timestamp,
                                                timeTaken: latestRapid.summary?.timeTaken || 0,
                                                totalQuestions: latestRapid.summary?.totalQuestions || 0,
                                                report: latestRapid
                                            } : null
                                        });

                                    } else {
                                        // Reports exist for other types but filter results in empty? Or raw array implies existing but logic says 0.
                                        // Basically if reports existed but none were pushed (e.g. invalid?), we might fall here.
                                        // But if (allReports.length > 0) is true, we push.
                                        // So we only need the else for when (allReports.length === 0).
                                        students.push({
                                            name: child.name,
                                            grade: child.grade,
                                            phoneNumber: user.parentPhone || phoneKey,
                                            email: child.email,
                                            marks: null,
                                            date: null,
                                            id: phoneKey,
                                            feedback: "No feedback available",
                                            topicFeedback: null,
                                            rapidMath: null
                                        });
                                    }
                                } else {
                                    // No reports key found
                                    students.push({
                                        name: child.name,
                                        grade: child.grade,
                                        phoneNumber: user.parentPhone || phoneKey,
                                        email: child.email,
                                        marks: null,
                                        date: null,
                                        id: phoneKey,
                                        feedback: "No feedback available",
                                        topicFeedback: null,
                                        rapidMath: null
                                    });
                                }

                                // Aggregate for Growth Chart (using createdAt)
                                if (child.createdAt) {
                                    allDates.push(new Date(child.createdAt));
                                }
                            });
                        }
                    });
                }

                // Process Chart Data
                const marksData = Object.entries(gradeMarks).map(([grade, data]) => ({
                    name: grade,
                    avg: Math.round(data.total / data.count)
                })).sort((a, b) => {
                    const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
                    const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
                    return numA - numB;
                });

                setRawStudentDates(allDates);

                setStats({
                    totalStudents: studentCount,
                    totalPassed: passedCount,
                    totalPerfectScores: perfectScoreCount,
                    totalReports: reportCount,
                });
                setStudentList(students);
                setChartData(prev => ({
                    ...prev,
                    marksByGrade: marksData
                }));

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Effect to process growth data whenever filter or raw dates change
    useEffect(() => {
        if (rawStudentDates.length === 0) return;

        const growthMap = {};

        rawStudentDates.forEach(dateObj => {
            let key;
            if (growthFilter === 'day') {
                key = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
            } else if (growthFilter === 'month') {
                key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
            } else if (growthFilter === 'year') {
                key = `${dateObj.getFullYear()}`; // YYYY
            }
            growthMap[key] = (growthMap[key] || 0) + 1;
        });

        const sortedKeys = Object.keys(growthMap).sort();
        let cumulative = 0;
        const growthData = sortedKeys.map(key => {
            cumulative += growthMap[key];
            return {
                name: key,
                students: cumulative
            };
        });

        setChartData(prev => ({
            ...prev,
            studentGrowth: growthData
        }));
    }, [growthFilter, rawStudentDates]);

    const handleDeleteStudent = async (studentId) => {
        try {
            // Remove from Firebase
            const studentRef = ref(firebaseDatabase, `NMD_2025/Registrations/${studentId}`);
            await remove(studentRef);

            // Update local state
            setStudentList(prevList => prevList.filter(student => student.id !== studentId));
            setStats(prevStats => ({
                ...prevStats,
                totalStudents: prevStats.totalStudents - 1
            }));
        } catch (error) {
            console.error("Error deleting student:", error);
            alert("Failed to delete student. Please try again.");
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <div>
                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Admin Dashboard
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Real-time overview of student performance
                    </Typography>
                </div>
                <form action={logoutAction}>
                    <button type="submit" style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '1px solid #ff4444',
                        background: 'transparent',
                        color: '#ff4444',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}>
                        Logout
                    </button>
                </form>
            </Box>

            {/* Navigation Tabs */}
            <Stack direction="row" spacing={2} mb={4}>
                <Button
                    variant={view === 'overview' ? 'contained' : 'outlined'}
                    startIcon={<LayoutDashboard size={20} />}
                    onClick={() => setView('overview')}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Overview
                </Button>
                <Button
                    variant={view === 'students' ? 'contained' : 'outlined'}
                    startIcon={<List size={20} />}
                    onClick={() => setView('students')}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Students
                </Button>
                <Button
                    variant={view === 'rapid_math' ? 'contained' : 'outlined'}
                    startIcon={<Trophy size={20} />}
                    onClick={() => setView('rapid_math')}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Rapid Math
                </Button>
            </Stack>

            {view === 'overview' ? (
                <>
                    {/* Stat Cards */}
                    <Grid container spacing={3} mb={6}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Total Students"
                                value={stats.totalStudents}
                                icon={<Users size={24} />}
                                color="#2196f3"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Total Passed"
                                value={stats.totalPassed}
                                icon={<CheckCircle size={24} />}
                                color="#4caf50"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="100% Club"
                                value={stats.totalPerfectScores}
                                icon={<Trophy size={24} />}
                                color="#FFD700"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Total Reports"
                                value={stats.totalReports}
                                icon={<FileText size={24} />}
                                color="#ff9800"
                            />
                        </Grid>
                    </Grid>

                    {/* Charts */}
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <MarksBarChart data={chartData.marksByGrade} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <StudentsAreaChart
                                data={chartData.studentGrowth}
                                filter={growthFilter}
                                onFilterChange={setGrowthFilter}
                            />
                        </Grid>
                    </Grid>
                </>
            ) : (
                <StudentList
                    students={studentList}
                    onDelete={handleDeleteStudent}
                    assessmentType={view === 'rapid_math' ? 'rapid' : 'standard'}
                />
            )}
        </Container>
    );
};

export default DashboardContent;
