"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation/Navigation.component";
import Footer from "@/components/Footer/Footer.component";
import { CircularProgress, Tabs, Tab } from "@mui/material";
import { ArrowLeft, User, Award, Zap, Clock } from "lucide-react";
import { getStudentDashboardData } from "@/services/teacherDataService";
import ProgressChart from "./ProgressChart";
import Styles from "../../app/dashboard/Dashboard.module.css";

const TeacherStudentView = ({ studentUid }) => {
    const { user, isTeacher, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const childId = searchParams.get('childId');

    const [studentData, setStudentData] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    // Redirect if not a teacher
    useEffect(() => {
        if (!loading && !isTeacher) {
            router.replace("/");
        }
    }, [loading, isTeacher, router]);

    // Fetch student data
    useEffect(() => {
        const fetchData = async () => {
            console.log("🔍 TeacherStudentView - Fetching data...");
            console.log("  User:", user?.uid);
            console.log("  IsTeacher:", isTeacher);
            console.log("  StudentUid:", studentUid);
            console.log("  ChildId:", childId);

            if (user && isTeacher && studentUid && childId) {
                setLoadingData(true);
                console.log("✅ All params present, calling getStudentDashboardData...");

                try {
                    const data = await getStudentDashboardData(user.uid, studentUid, childId);
                    console.log("📊 Student data received:", data);
                    setStudentData(data);
                } catch (error) {
                    console.error("❌ Error fetching student data:", error);
                    setStudentData(null);
                } finally {
                    setLoadingData(false);
                }
            } else {
                console.log("⚠️ Missing required params for data fetch");
                setLoadingData(false);
            }
        };

        fetchData();
    }, [user, isTeacher, studentUid, childId]);

    const handleBack = () => {
        // Navigate back to teacher dashboard with grade parameter
        // This will auto-select the grade and show the student list
        if (studentInfo?.grade) {
            router.push(`/teacher-dashboard?grade=${encodeURIComponent(studentInfo.grade)}`);
        } else {
            router.push('/teacher-dashboard');
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading || loadingData) {
        return (
            <div className={Styles.loadingContainer}>
                <CircularProgress />
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className={Styles.pageWrapper}>
                <Navigation />
                <div className={Styles.dashboardContainer}>
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-slate-600 mb-4">Student Not Found</h2>
                        <button
                            onClick={handleBack}
                            className="text-indigo-600 hover:text-indigo-700 font-semibold"
                        >
                            ← Go Back
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const { studentInfo, reports } = studentData;

    // Process reports similar to DashboardClient
    let rapidMathReports = [];
    let assessmentReports = [];

    if (reports) {
        let allReports = [];

        if (reports.summary) {
            allReports.push({ id: 'root', ...reports });
        }

        Object.entries(reports).forEach(([key, val]) => {
            if (key !== 'summary' && val && typeof val === 'object' && val.summary) {
                allReports.push({ id: key, ...val });
            }
        });

        allReports.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

        const seenIds = new Set();
        const uniqueReports = [];
        allReports.forEach(report => {
            if (!report.summary || !report.summary.totalQuestions) return;
            const identifier = report.id || new Date(report.timestamp).getTime();
            if (!seenIds.has(identifier)) {
                seenIds.add(identifier);
                uniqueReports.push(report);
            }
        });

        uniqueReports.forEach(report => {
            if (report.type === 'RAPID_MATH') {
                rapidMathReports.push(report);
            } else {
                assessmentReports.push(report);
            }
        });
    }

    const handleAssessmentClick = (data) => {
        if (data && data.id) {
            // Pass student UID and childId so the report page can fetch the correct data
            router.push(`/quiz/quiz-result?reportId=${data.id}&studentUid=${studentUid}&childId=${childId}&teacherView=true`);
        }
    };

    const handleRapidMathClick = (data) => {
        if (data && data.id) {
            // Pass student UID and childId so the report page can fetch the correct data
            router.push(`/rapid-math/test/summary?reportId=${data.id}&studentUid=${studentUid}&childId=${childId}&teacherView=true`);
        }
    };

    return (
        <div className={Styles.pageWrapper}>
            <Navigation />

            <div className={Styles.dashboardContainer}>
                {/* Breadcrumb Navigation */}
                <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
                    {/* Breadcrumb Trail */}
                    <div className="flex items-center gap-2 text-sm mb-6">
                        <button
                            onClick={() => router.push('/teacher-dashboard')}
                            className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                        >
                            Teacher Dashboard
                        </button>
                        <span className="text-slate-400">/</span>
                        <button
                            onClick={handleBack}
                            className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                        >
                            {studentInfo?.grade || 'Students'}
                        </button>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                            {studentInfo?.name || 'Student'}
                        </span>
                    </div>

                    {/* Student Info Card */}
                    <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {studentInfo?.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                {studentInfo?.name || 'Student'}
                            </h2>
                            <div className="flex flex-col gap-1 text-sm">
                                <span className="text-slate-600 dark:text-slate-400">
                                    {studentInfo?.grade}
                                </span>
                                {studentInfo?.email && (
                                    <span className="text-slate-500 dark:text-slate-500 truncate" title={studentInfo.email}>
                                        {studentInfo.email}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dashboard Content */}
                <section className={Styles.reportsSection}>
                    <h2><strong>Student Performance Dashboard</strong></h2>

                    {!reports ? (
                        <div className={Styles.emptyState}>
                            <img src="/empty-state.svg" alt="No data" className={Styles.emptyImage} />
                            <p>This student hasn't taken any assessments yet.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {/* Report Tabs */}
                            <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                                <Tabs
                                    value={activeTab}
                                    onChange={handleTabChange}
                                    aria-label="report tabs"
                                    sx={{
                                        '& .MuiTab-root': {
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            color: '#64748b',
                                            minHeight: '48px',
                                            '&.Mui-selected': { color: '#2563eb' }
                                        },
                                        '& .MuiTabs-indicator': { backgroundColor: '#2563eb', height: 3, borderRadius: '3px 3px 0 0' }
                                    }}
                                >
                                    <Tab label="Skill Assessments" />
                                    <Tab label="Rapid Math" />
                                </Tabs>
                            </div>

                            {/* Content Area */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                                {/* Chart */}
                                <div className="lg:col-span-2">
                                    {activeTab === 0 && assessmentReports.length > 0 && (
                                        <ProgressChart
                                            data={assessmentReports}
                                            type="ASSESSMENT"
                                            onPointClick={handleAssessmentClick}
                                        />
                                    )}
                                    {activeTab === 1 && rapidMathReports.length > 0 && (
                                        <ProgressChart
                                            data={rapidMathReports}
                                            type="RAPID_MATH"
                                            onPointClick={handleRapidMathClick}
                                        />
                                    )}

                                    {/* Empty States */}
                                    {activeTab === 0 && assessmentReports.length === 0 && (
                                        <div className={Styles.emptyState}>
                                            <img src="/empty-state.svg" alt="No assessments" className={Styles.emptyImage} />
                                            <p>No skill assessments taken yet.</p>
                                        </div>
                                    )}
                                    {activeTab === 1 && rapidMathReports.length === 0 && (
                                        <div className={Styles.emptyState}>
                                            <img src="/empty-state.svg" alt="No rapid math" className={Styles.emptyImage} />
                                            <p>No rapid math challenges taken yet.</p>
                                        </div>
                                    )}
                                </div>

                                {/* History List */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[440px]">
                                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Assessment History</h3>
                                        </div>

                                        <div className="overflow-y-auto flex-1 p-2 space-y-2">
                                            {(activeTab === 0 ? assessmentReports : rapidMathReports).length > 0 ? (
                                                (activeTab === 0 ? assessmentReports : rapidMathReports)
                                                    .slice(0, 20)
                                                    .map((report, index) => (
                                                        <div
                                                            key={report.id || index}
                                                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                                                            onClick={() => activeTab === 0 ? handleAssessmentClick(report) : handleRapidMathClick(report)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeTab === 0 ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'} group-hover:scale-105 transition-transform`}>
                                                                    {activeTab === 0 ? <Award size={20} /> : <Zap size={20} />}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                                                                        {activeTab === 0 ? `Test ${assessmentReports.length - index}` : "Rapid Math"}
                                                                    </h4>
                                                                    <p className="text-[11px] font-medium text-slate-500">
                                                                        {new Date(report.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(report.timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="text-right">
                                                                <div className={`text-sm font-bold ${activeTab === 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                                                                    {Math.round(report.summary.accuracyPercent)}%
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center opacity-60">
                                                    <div className="mb-2"><Clock size={32} /></div>
                                                    <span className="text-sm">No recent activity</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default TeacherStudentView;
