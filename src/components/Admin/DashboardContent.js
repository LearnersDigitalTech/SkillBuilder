'use client';
import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, CircularProgress, Container, Button, Stack } from '@mui/material';
import { Users, CheckCircle, XCircle, FileText, LayoutDashboard, List, Trophy, AlertTriangle, Gift, GraduationCap } from 'lucide-react';
import { ref, get, remove } from 'firebase/database';
import { firebaseDatabase, db } from '@/backend/firebaseHandler';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import StatCard from './StatCard';
import { MarksBarChart, StudentsAreaChart } from './Charts';
import StudentList from './StudentList';
import PuzzleManager from './PuzzleManager';
import SecurityDashboard from './SecurityDashboard';
import TeacherManagement from './TeacherManagement';
import dynamic from 'next/dynamic';

const LotteryManager = dynamic(() => import('./LotteryManager'), { ssr: false });
const LuckyDrawWinners = dynamic(() => import('./LuckyDrawWinners'), { ssr: false });

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
                const res = await fetch('/api/admin/students');
                if (!res.ok) throw new Error("Failed to fetch admin data");

                const data = await res.json();
                const rawStudents = data.students || [];

                let studentCount = 0;
                let reportCount = 0;
                let totalScoreSum = 0;
                let perfectScoreCount = 0;

                const students = [];
                const gradeMarks = {};
                const allDates = [];

                rawStudents.forEach(row => {
                    studentCount++;

                    // Parse Reports
                    // row.reports is an array of report objects { id, data, created_at, report_type }
                    // We need to map this to the format expected by the dashboard UI
                    // UI expects history array with parsed data

                    const rawReports = row.reports || [];
                    const processedHistory = [];

                    rawReports.forEach(r => {
                        // Parse data content (JSON/JSONB)
                        let reportData = r.data || {};
                        // Ensure summary structure
                        let summary = reportData.summary || null;
                        let accuracy = 0;

                        if (summary && summary.accuracyPercent !== undefined) {
                            accuracy = summary.accuracyPercent;
                        }

                        processedHistory.push({
                            ...reportData,
                            reportId: r.id, // Internal ID
                            date: r.created_at, // Use created_at
                            timestamp: new Date(r.created_at).getTime(),
                            marks: accuracy,
                            feedback: reportData.generalFeedback || "No feedback available",
                            topicFeedback: reportData.topicFeedback || null,
                            perQuestionReport: reportData.perQuestionReport || [],
                            learningPlan: reportData.learningPlan || [],
                            learningPlanSummary: reportData.learningPlanSummary || ""
                        });
                    });

                    // Sort descending
                    processedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

                    let latest = processedHistory[0] || {};
                    let latestMarks = latest.marks;
                    let latestDate = latest.date;
                    let fullSummary = latest.summary;

                    // Metrics
                    if (processedHistory.length > 0) {
                        reportCount += processedHistory.length;
                        processedHistory.forEach(rep => {
                            totalScoreSum += (rep.marks || 0);
                            if (rep.marks === 100) perfectScoreCount++;

                            const grade = row.grade || "Unknown";
                            if (!gradeMarks[grade]) gradeMarks[grade] = { total: 0, count: 0 };
                            gradeMarks[grade].total += (rep.marks || 0);
                            gradeMarks[grade].count++;
                        });
                    }

                    // Push to student list
                    students.push({
                        name: row.name,
                        grade: row.grade,
                        phoneNumber: row.parent?.phone || "N/A",
                        email: row.parent?.email || "N/A",
                        marks: latestMarks,
                        date: latestDate,
                        id: row.id, // Internal ID for deletion
                        reportParentKey: row.parent?.uid || "N/A",
                        reportId: latest.reportId,
                        feedback: latest.feedback,
                        topicFeedback: latest.topicFeedback,
                        summary: fullSummary || {},
                        perQuestionReport: latest.perQuestionReport || [],
                        learningPlan: latest.learningPlan,
                        learningPlanSummary: latest.learningPlanSummary,
                        attemptCount: processedHistory.length,
                        history: processedHistory,
                        rapidMath: null // TODO: Rapid Math if needed later
                    });

                    if (row.createdAt) {
                        allDates.push(new Date(row.createdAt));
                    }
                });

                // Chart Data Logic
                const allGrades = Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`);
                const marksData = allGrades.map(grade => {
                    const data = gradeMarks[grade];
                    return {
                        name: grade,
                        avg: data ? Math.round(data.total / data.count) : 0
                    };
                });

                setRawStudentDates(allDates);

                // Set Stats
                setStats({
                    totalStudents: students.length,
                    totalPassed: reportCount > 0 ? Math.min(Math.round(totalScoreSum / reportCount), 100) + '%' : '0%',
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
            const res = await fetch(`/api/admin/students/${studentId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error("Failed to delete student");

            // 3. Update local state
            setStudentList(prevList => prevList.filter(student => student.id !== studentId));
            setStats(prevStats => ({
                ...prevStats,
                totalStudents: prevStats.totalStudents - 1
            }));

            // Re-calc summary stats if needed, or just decrement count
            // If we want exact average score recalculation, we'd need to re-run the aggregation logic 
            // or fetch fresh data. For now, simple decrement is okay for UX responsiveness.

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
            <Stack direction="row" spacing={2} mb={4} justifyContent="center" flexWrap="wrap">
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
                <Button
                    variant={view === 'puzzles' ? 'contained' : 'outlined'}
                    startIcon={<FileText size={20} />}
                    onClick={() => setView('puzzles')}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Puzzles
                </Button>
                <Button
                    variant={view === 'security' ? 'contained' : 'outlined'}
                    startIcon={<AlertTriangle size={20} />}
                    onClick={() => setView('security')}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Security
                </Button>
                <Button
                    variant={view === 'lottery' ? 'contained' : 'outlined'}
                    startIcon={<Gift size={20} />}
                    onClick={() => setView('lottery')}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Lottery
                </Button>
                <Button
                    variant={view === 'lucky_winners' ? 'contained' : 'outlined'}
                    startIcon={<Trophy size={20} />}
                    onClick={() => setView('lucky_winners')}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Lucky Draw Winners
                </Button>
                <Button
                    variant={view === 'teachers' ? 'contained' : 'outlined'}
                    startIcon={<GraduationCap size={20} />}
                    onClick={() => setView('teachers')}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Teachers
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
                                title="Average Score"
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
            ) : view === 'puzzles' ? (
                <PuzzleManager />
            ) : view === 'security' ? (
                <SecurityDashboard />
            ) : view === 'lottery' ? (
                <LotteryManager />
            ) : view === 'lucky_winners' ? (
                <LuckyDrawWinners />
            ) : view === 'teachers' ? (
                <TeacherManagement />
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
