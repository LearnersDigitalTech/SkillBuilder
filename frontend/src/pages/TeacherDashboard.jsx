/**
 * TeacherDashboard Component
 * Teacher view with grade selection, student list - migrated from Next.js
 */
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    GraduationCap, Users, LogOut, ChevronRight,
    BookOpen, Search, ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { teacherApi } from '@/api/client'
import toast from 'react-hot-toast'
import styles from './TeacherDashboard.module.css'

const GRADE_OPTIONS = ['Pre-KG', 'LKG', 'UKG', ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)]
const STUDENTS_PER_PAGE = 12

export default function TeacherDashboard() {
    const { user, userData, logout, loading } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [selectedGrade, setSelectedGrade] = useState(null)
    const [assignedGrades, setAssignedGrades] = useState([])
    const [students, setStudents] = useState([])
    const [studentCounts, setStudentCounts] = useState({})
    const [loadingGrades, setLoadingGrades] = useState(true)
    const [loadingStudents, setLoadingStudents] = useState(false)

    // Search, filter, and pagination
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('name')
    const [currentPage, setCurrentPage] = useState(1)

    // Redirect if not a teacher
    useEffect(() => {
        if (!loading && userData) {
            if (userData.user_type !== 'teacher' && userData.user_type !== 'admin') {
                navigate('/dashboard')
            }
        } else if (!loading && !user) {
            navigate('/login')
        }
    }, [loading, userData, user, navigate])

    // Fetch assigned grades
    useEffect(() => {
        const fetchGrades = async () => {
            if (!user) return

            setLoadingGrades(true)
            try {
                const response = await teacherApi.getProfile()
                const data = response.data

                setAssignedGrades(data.assigned_grades || [])
                setStudentCounts(data.student_counts || {})
            } catch (error) {
                console.error('Error fetching grades:', error)
                toast.error('Failed to load grades')
            } finally {
                setLoadingGrades(false)
            }
        }

        fetchGrades()
    }, [user])

    // Auto-select grade from URL
    useEffect(() => {
        const gradeParam = searchParams.get('grade')
        if (gradeParam && assignedGrades.includes(gradeParam) && !selectedGrade) {
            setSelectedGrade(gradeParam)
        }
    }, [searchParams, assignedGrades, selectedGrade])

    // Fetch students when grade is selected
    useEffect(() => {
        const fetchStudents = async () => {
            if (!selectedGrade) return

            setLoadingStudents(true)
            try {
                const response = await teacherApi.getStudents(selectedGrade)
                setStudents(response.data || [])
            } catch (error) {
                console.error('Error fetching students:', error)
                toast.error('Failed to load students')
            } finally {
                setLoadingStudents(false)
            }
        }

        fetchStudents()
    }, [selectedGrade])

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    const handleGradeSelect = (grade) => {
        setSelectedGrade(grade)
        setCurrentPage(1)
        setSearchTerm('')
    }

    const handleBackToGrades = () => {
        setSelectedGrade(null)
        setStudents([])
        setCurrentPage(1)
        setSearchTerm('')
    }

    const handleStudentClick = (student) => {
        navigate(`/teacher/student/${student.id}`)
    }

    // Filter and sort students
    const filteredStudents = students.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
        if (sortBy === 'recent') return (b.created_at || 0) - (a.created_at || 0)
        return 0
    })

    // Pagination
    const totalPages = Math.ceil(sortedStudents.length / STUDENTS_PER_PAGE)
    const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE
    const paginatedStudents = sortedStudents.slice(startIndex, startIndex + STUDENTS_PER_PAGE)
    const totalStudents = Object.values(studentCounts).reduce((sum, count) => sum + count, 0)

    if (loading || loadingGrades) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                {/* Teacher Profile Section */}
                <section className={styles.profileCard}>
                    <div className={styles.profileGradient} />

                    <div className={styles.profileContent}>
                        <div className={styles.profileHeader}>
                            <div className={styles.avatar}>
                                {userData?.name?.charAt(0).toUpperCase() || 'T'}
                            </div>
                            <div className={styles.profileInfo}>
                                <h3 className={styles.profileName}>{userData?.name || 'Teacher'}</h3>
                                <span className={styles.roleBadge}>Teacher</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className={styles.statsGrid}>
                            <div className={`${styles.statCard} ${styles.indigo}`}>
                                <div className={styles.statIcon}>
                                    <BookOpen size={16} />
                                </div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statLabel}>Assigned Grades</span>
                                    <span className={styles.statValue}>{assignedGrades.length}</span>
                                </div>
                            </div>
                            <div className={`${styles.statCard} ${styles.purple}`}>
                                <div className={styles.statIcon}>
                                    <Users size={16} />
                                </div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statLabel}>Total Students</span>
                                    <span className={styles.statValue}>{totalStudents}</span>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleLogout} className={styles.logoutButton}>
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </section>

                {/* Main Content */}
                <section className={styles.mainContent}>
                    {!selectedGrade ? (
                        // Grade Selection View
                        <>
                            <h2 className={styles.sectionTitle}>Select Grade</h2>

                            {assignedGrades.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <GraduationCap size={64} />
                                    <h3>No Grades Assigned</h3>
                                    <p>Please contact the administrator to get grade assignments.</p>
                                </div>
                            ) : (
                                <div className={styles.gradeGrid}>
                                    {GRADE_OPTIONS.map((grade) => {
                                        const isAssigned = assignedGrades.includes(grade)
                                        const count = studentCounts[grade] || 0

                                        return (
                                            <button
                                                key={grade}
                                                onClick={() => isAssigned && handleGradeSelect(grade)}
                                                disabled={!isAssigned}
                                                className={`${styles.gradeCard} ${isAssigned ? styles.assigned : styles.disabled}`}
                                            >
                                                <GraduationCap size={32} className={styles.gradeIcon} />
                                                <h3 className={styles.gradeName}>{grade}</h3>
                                                {isAssigned && (
                                                    <p className={styles.gradeCount}>
                                                        {count} {count === 1 ? 'student' : 'students'}
                                                    </p>
                                                )}
                                                {isAssigned && (
                                                    <ChevronRight size={20} className={styles.gradeArrow} />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </>
                    ) : (
                        // Student List View
                        <>
                            <div className={styles.studentListHeader}>
                                <div>
                                    <button onClick={handleBackToGrades} className={styles.backButton}>
                                        <ArrowLeft size={16} />
                                        Back to Grades
                                    </button>
                                    <h2 className={styles.sectionTitle}>{selectedGrade} Students</h2>
                                </div>
                            </div>

                            {/* Search and Filter */}
                            <div className={styles.filterBar}>
                                <div className={styles.searchWrapper}>
                                    <Search size={18} className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        className={styles.searchInput}
                                    />
                                </div>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className={styles.sortSelect}
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="recent">Recently Added</option>
                                </select>
                            </div>

                            {loadingStudents ? (
                                <div className={styles.loadingContainer}>
                                    <div className={styles.spinner}></div>
                                </div>
                            ) : paginatedStudents.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <Users size={64} />
                                    <h3>{searchTerm ? 'No students found' : 'No Students Assigned'}</h3>
                                    <p>{searchTerm ? 'Try adjusting your search term' : 'No students have been assigned for this grade yet.'}</p>
                                </div>
                            ) : (
                                <>
                                    <p className={styles.resultsInfo}>
                                        Showing {startIndex + 1}-{Math.min(startIndex + STUDENTS_PER_PAGE, sortedStudents.length)} of {sortedStudents.length} students
                                        {searchTerm && ` (filtered from ${students.length} total)`}
                                    </p>

                                    <div className={styles.studentGrid}>
                                        {paginatedStudents.map((student) => (
                                            <div
                                                key={student.id}
                                                onClick={() => handleStudentClick(student)}
                                                className={styles.studentCard}
                                            >
                                                <div className={styles.studentAvatar}>
                                                    {student.name?.charAt(0).toUpperCase() || 'S'}
                                                </div>
                                                <div className={styles.studentInfo}>
                                                    <h4 className={styles.studentName}>{student.name}</h4>
                                                    <p className={styles.studentGrade}>{student.grade}</p>
                                                    {student.email && (
                                                        <p className={styles.studentEmail}>{student.email}</p>
                                                    )}
                                                </div>
                                                <ChevronRight size={20} className={styles.studentArrow} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className={styles.pagination}>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className={styles.pageButton}
                                            >
                                                Previous
                                            </button>
                                            <div className={styles.pageNumbers}>
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className={styles.pageButton}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    )
}
