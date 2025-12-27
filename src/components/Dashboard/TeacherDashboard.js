"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/homepage/Header";
import Footer from "@/components/Footer/Footer.component";
import { CircularProgress, Card, CardContent, Chip } from "@mui/material";
import { GraduationCap, Users, LogOut, ChevronRight, BookOpen } from "lucide-react";
import { getAssignedGrades, getStudentsByGrade, getStudentCountsByGrade } from "@/services/teacherDataService";
import Styles from "../../app/dashboard/Dashboard.module.css";

const GRADE_OPTIONS = ["Pre-KG", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];

const TeacherDashboard = () => {
    const { user, userData, isTeacher, logout, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [assignedGrades, setAssignedGrades] = useState([]);
    const [students, setStudents] = useState([]);
    const [studentCounts, setStudentCounts] = useState({});
    const [loadingGrades, setLoadingGrades] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Search, filter, and pagination state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name'); // 'name' | 'recent'
    const [currentPage, setCurrentPage] = useState(1);
    const STUDENTS_PER_PAGE = 12;

    // Redirect if not a teacher
    useEffect(() => {
        if (!loading && !isTeacher) {
            router.replace("/");
        }
    }, [loading, isTeacher, router]);

    // Fetch assigned grades on mount
    useEffect(() => {
        const fetchGrades = async () => {
            if (user && isTeacher) {
                setLoadingGrades(true);
                const grades = await getAssignedGrades(user.uid);
                const counts = await getStudentCountsByGrade(user.uid);
                setAssignedGrades(grades);
                setStudentCounts(counts);
                setLoadingGrades(false);
            }
        };

        fetchGrades();
    }, [user, isTeacher]);

    // Auto-select grade from URL parameter
    useEffect(() => {
        const gradeParam = searchParams.get('grade');
        if (gradeParam && assignedGrades.includes(gradeParam) && !selectedGrade) {
            setSelectedGrade(gradeParam);
        }
    }, [searchParams, assignedGrades, selectedGrade]);

    // Fetch students when grade is selected
    useEffect(() => {
        const fetchStudents = async () => {
            if (selectedGrade && user) {
                setLoadingStudents(true);
                const studentList = await getStudentsByGrade(user.uid, selectedGrade);
                setStudents(studentList);
                setLoadingStudents(false);
            }
        };

        fetchStudents();
    }, [selectedGrade, user]);

    const handleLogout = async () => {
        await logout();
        router.replace("/");
    };

    const handleGradeSelect = (grade) => {
        setSelectedGrade(grade);
    };

    const handleBackToGrades = () => {
        // Navigate to dashboard without grade parameter to show grade selection
        router.push('/teacher-dashboard');
        // Clear state
        setSelectedGrade(null);
        setStudents([]);
        setCurrentPage(1);
        setSearchTerm('');
    };

    const handleStudentClick = (student) => {
        console.log("🖱️ Student clicked:", student);
        console.log("  UID:", student.uid);
        console.log("  ChildId:", student.childId);
        router.push(`/teacher-dashboard/student/${student.uid}?childId=${student.childId}`);
    };

    if (loading || loadingGrades) {
        return (
            <div className={Styles.loadingContainer}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className={Styles.pageWrapper}>
            <Header />

            <div className={Styles.dashboardContainer}>
                {/* Teacher Profile Section */}
                <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-10 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex gap-4 mb-4">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white dark:ring-slate-800">
                                {userData?.name?.charAt(0).toUpperCase() || 'T'}
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-center">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight mb-1">
                                    {userData?.name || 'Teacher'}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Chip
                                        label="Teacher"
                                        size="small"
                                        sx={{
                                            backgroundColor: '#8b5cf6',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '10px'
                                        }}
                                    />
                                    {userData?.ticketCode && (
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            ID: {userData.ticketCode}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" />
                                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Assigned Grades</span>
                                </div>
                                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{assignedGrades.length}</p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-100 dark:border-purple-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users size={16} className="text-purple-600 dark:text-purple-400" />
                                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Total Students</span>
                                </div>
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                    {Object.values(studentCounts).reduce((sum, count) => sum + count, 0)}
                                </p>
                            </div>
                        </div>

                        {/* Sign Out */}
                        <button
                            onClick={handleLogout}
                            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-all duration-200 text-xs font-bold flex items-center justify-center gap-2 group"
                        >
                            <LogOut size={14} className="group-hover:stroke-red-500 transition-colors" />
                            Sign Out
                        </button>
                    </div>
                </section>

                {/* Main Content */}
                <section className={Styles.reportsSection}>
                    {!selectedGrade ? (
                        // Grade Selection View
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                    Select Grade
                                </h2>
                            </div>

                            {assignedGrades.length === 0 ? (
                                <div className="text-center py-16">
                                    <GraduationCap size={64} className="mx-auto text-slate-300 mb-4" />
                                    <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                        No Grades Assigned
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-500">
                                        Please contact the administrator to get grade assignments.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {GRADE_OPTIONS.map((grade) => {
                                        const isAssigned = assignedGrades.includes(grade);
                                        const studentCount = studentCounts[grade] || 0;

                                        return (
                                            <button
                                                key={grade}
                                                onClick={() => isAssigned && handleGradeSelect(grade)}
                                                disabled={!isAssigned}
                                                className={`
                                                    relative p-6 rounded-2xl border-2 transition-all duration-200
                                                    ${isAssigned
                                                        ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 hover:shadow-lg cursor-pointer'
                                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                                                    }
                                                `}
                                            >
                                                <div className="text-center">
                                                    <GraduationCap
                                                        size={32}
                                                        className={`mx-auto mb-2 ${isAssigned ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
                                                    />
                                                    <h3 className={`text-lg font-bold mb-1 ${isAssigned ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>
                                                        {grade}
                                                    </h3>
                                                    {isAssigned && (
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            {studentCount} {studentCount === 1 ? 'student' : 'students'}
                                                        </p>
                                                    )}
                                                </div>
                                                {isAssigned && (
                                                    <ChevronRight
                                                        size={20}
                                                        className="absolute top-4 right-4 text-indigo-400"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    ) : (
                        // Student List View
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <button
                                        onClick={handleBackToGrades}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold mb-2 flex items-center gap-1"
                                    >
                                        ← Back to Grades
                                    </button>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                        {selectedGrade} Students
                                    </h2>
                                </div>
                            </div>

                            {/* Search and Filter Bar */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Search */}
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Search by name or email..."
                                            value={searchTerm}
                                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Sort */}
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="name">Sort by Name</option>
                                        <option value="recent">Recently Added</option>
                                    </select>
                                </div>
                            </div>

                            {loadingStudents ? (
                                <div className="flex justify-center py-16">
                                    <CircularProgress />
                                </div>
                            ) : students.length === 0 ? (
                                <div className="text-center py-16">
                                    <Users size={64} className="mx-auto text-slate-300 mb-4" />
                                    <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                        No Students Assigned
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-500">
                                        No students have been assigned to you for this grade yet.
                                    </p>
                                </div>
                            ) : (() => {
                                // Filter students by search term
                                const filteredStudents = students.filter(student =>
                                    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
                                );

                                // Sort students
                                const sortedStudents = [...filteredStudents].sort((a, b) => {
                                    if (sortBy === 'name') {
                                        return a.name.localeCompare(b.name);
                                    } else if (sortBy === 'recent') {
                                        return (b.assignedAt || 0) - (a.assignedAt || 0);
                                    }
                                    return 0;
                                });

                                // Paginate
                                const totalPages = Math.ceil(sortedStudents.length / STUDENTS_PER_PAGE);
                                const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
                                const paginatedStudents = sortedStudents.slice(startIndex, startIndex + STUDENTS_PER_PAGE);

                                return (
                                    <>
                                        {/* Results Info */}
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Showing {startIndex + 1}-{Math.min(startIndex + STUDENTS_PER_PAGE, sortedStudents.length)} of {sortedStudents.length} students
                                                {searchTerm && ` (filtered from ${students.length} total)`}
                                            </p>
                                        </div>

                                        {paginatedStudents.length === 0 ? (
                                            <div className="text-center py-16">
                                                <Users size={64} className="mx-auto text-slate-300 mb-4" />
                                                <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                                    No students found
                                                </h3>
                                                <p className="text-slate-500 dark:text-slate-500">
                                                    Try adjusting your search term
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {paginatedStudents.map((student) => (
                                                        <div
                                                            key={`${student.uid}-${student.childId}`}
                                                            onClick={() => handleStudentClick(student)}
                                                            className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group"
                                                        >
                                                            <div className="flex items-start gap-4">
                                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                                                                    {student.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 truncate group-hover:text-indigo-600 transition-colors">
                                                                        {student.name}
                                                                    </h3>
                                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                                                        {student.grade}
                                                                    </p>
                                                                    {student.email && (
                                                                        <p className="text-xs text-slate-400 truncate">
                                                                            {student.email}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <ChevronRight
                                                                    size={20}
                                                                    className="text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Pagination */}
                                                {totalPages > 1 && (
                                                    <div className="flex justify-center items-center gap-2 mt-8">
                                                        <button
                                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                            disabled={currentPage === 1}
                                                            className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                        >
                                                            Previous
                                                        </button>

                                                        <div className="flex gap-1">
                                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                                <button
                                                                    key={page}
                                                                    onClick={() => setCurrentPage(page)}
                                                                    className={`w-10 h-10 rounded-lg transition-colors ${currentPage === page
                                                                        ? 'bg-indigo-600 text-white'
                                                                        : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                                        }`}
                                                                >
                                                                    {page}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <button
                                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                            disabled={currentPage === totalPages}
                                                            className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                );
                            })()}
                        </>
                    )}
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default TeacherDashboard;
