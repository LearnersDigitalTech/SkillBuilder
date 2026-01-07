/**
 * DashboardClient Component
 * Main dashboard with profile management, reports, and progress - migrated from Next.js
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, LogOut, ChevronRight, Plus, Users,
    BookOpen, Clock, Award, Edit2, Trophy,
    TrendingUp, Target, Zap
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuizSession } from '@/contexts/QuizSessionContext'
import { usersApi, quizApi } from '@/api/client'
import toast from 'react-hot-toast'
import styles from './Dashboard.module.css'

export default function Dashboard() {
    const { user, userData, logout, loading, activeChildId, setActiveChildId, refreshUserData } = useAuth()
    const { initQuiz, clearQuiz } = useQuizSession()
    const navigate = useNavigate()

    const [showProfileList, setShowProfileList] = useState(false)
    const [reports, setReports] = useState([])
    const [fetchingReports, setFetchingReports] = useState(false)
    const [addChildOpen, setAddChildOpen] = useState(false)
    const [editChildOpen, setEditChildOpen] = useState(false)
    const [childForm, setChildForm] = useState({ name: '', grade: '' })
    const [activeTab, setActiveTab] = useState('assessments')

    const profileCardRef = useRef(null)

    // Close profile list when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileCardRef.current && !profileCardRef.current.contains(event.target)) {
                setShowProfileList(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Redirect teachers to teacher dashboard
    useEffect(() => {
        if (!loading && user && userData) {
            if (userData.user_type === 'teacher' || userData.user_type === 'admin') {
                navigate('/teacher-dashboard')
            }
        }
    }, [user, userData, loading, navigate])

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login')
        }
    }, [user, loading, navigate])

    // Fetch reports for active child
    useEffect(() => {
        const fetchReports = async () => {
            if (!activeChildId || !user) return

            setFetchingReports(true)
            try {
                const response = await quizApi.getResults()
                const allReports = response.data || []

                // Filter reports for active child
                const childReports = allReports.filter(r => r.child_id === activeChildId)
                setReports(childReports)
            } catch (error) {
                console.error('Error fetching reports:', error)
            } finally {
                setFetchingReports(false)
            }
        }

        fetchReports()
    }, [activeChildId, user])

    const handleLogout = async () => {
        clearQuiz()
        await logout()
        navigate('/')
    }

    const handleChildChange = (childId) => {
        setActiveChildId(childId)
        setShowProfileList(false)
    }

    const handleOpenAddChild = () => {
        setChildForm({ name: '', grade: '' })
        setAddChildOpen(true)
    }

    const handleSaveChild = async () => {
        if (!childForm.name || !childForm.grade) {
            toast.error('Please fill in all fields')
            return
        }

        try {
            const response = await usersApi.createChild(childForm)
            const newChild = response.data

            await refreshUserData()
            setActiveChildId(newChild.id)
            setAddChildOpen(false)
            toast.success('Profile created successfully!')
        } catch (error) {
            console.error('Error saving child:', error)
            toast.error('Failed to create profile')
        }
    }

    const handleEditChild = () => {
        if (!activeChild) return
        setChildForm({
            name: activeChild.name,
            grade: activeChild.grade
        })
        setEditChildOpen(true)
    }

    const handleUpdateChild = async () => {
        if (!childForm.name || !childForm.grade) {
            toast.error('Please fill in all fields')
            return
        }

        try {
            await usersApi.updateChild(activeChildId, childForm)
            await refreshUserData()
            setEditChildOpen(false)
            toast.success('Profile updated!')
        } catch (error) {
            console.error('Error updating child:', error)
            toast.error('Failed to update profile')
        }
    }

    const handleStartAssessment = () => {
        if (!activeChild) {
            toast.error('Please select a profile first')
            return
        }

        if (!activeChild.grade || activeChild.grade === 'Select Grade') {
            handleEditChild()
            toast.info('Please select your grade to continue')
            return
        }

        clearQuiz()
        navigate('/quiz')
    }

    const handleReportClick = (reportId) => {
        navigate(`/quiz/result/${reportId}`)
    }

    // Get active child data
    const children = userData?.children || []
    const activeChild = children.find(c => c.id === activeChildId) || children[0]

    // Separate reports by type
    const assessmentReports = reports.filter(r => r.type !== 'RAPID_MATH')
    const rapidMathReports = reports.filter(r => r.type === 'RAPID_MATH')

    if (loading) {
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
                {/* Profile Section */}
                <section ref={profileCardRef} className={styles.profileCard}>
                    <div className={styles.profileGradient} />

                    <div className={styles.profileContent}>
                        {/* Active Profile Header */}
                        {activeChild && (
                            <div className={styles.profileHeader}>
                                <div className={styles.avatar} onClick={handleEditChild}>
                                    <span>{activeChild.name?.charAt(0).toUpperCase() || 'U'}</span>
                                    <div className={styles.avatarStatus} />
                                </div>

                                <div className={styles.profileInfo}>
                                    <h3 className={styles.profileName}>{activeChild.name}</h3>
                                    <span className={styles.gradeBadge}>{activeChild.grade}</span>
                                </div>

                                <button onClick={handleEditChild} className={styles.editButton}>
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className={styles.profileActions}>
                            {!showProfileList ? (
                                <>
                                    <button onClick={handleStartAssessment} className={styles.primaryButton}>
                                        <Plus size={18} />
                                        Take New Test
                                    </button>

                                    <div className={styles.secondaryActions}>
                                        <button onClick={() => setShowProfileList(true)} className={styles.secondaryButton}>
                                            <Users size={16} />
                                            Switch Learner
                                        </button>
                                        <button onClick={handleOpenAddChild} className={styles.secondaryButton}>
                                            <Plus size={16} />
                                            Add Learner
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <AnimatePresence>
                                    <motion.div
                                        className={styles.profileList}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <p className={styles.profileListTitle}>Select Learner</p>

                                        <button onClick={handleOpenAddChild} className={styles.addProfileButton}>
                                            <Plus size={16} />
                                            Add New Learner
                                        </button>

                                        {children.filter(c => c.id !== activeChildId).map(child => (
                                            <div
                                                key={child.id}
                                                className={styles.profileListItem}
                                                onClick={() => handleChildChange(child.id)}
                                            >
                                                <div className={styles.profileListAvatar}>
                                                    {child.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div className={styles.profileListInfo}>
                                                    <p className={styles.profileListName}>{child.name}</p>
                                                    <p className={styles.profileListGrade}>{child.grade}</p>
                                                </div>
                                                <ChevronRight size={16} />
                                            </div>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Sign Out */}
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </section>

                {/* Reports Section */}
                <section className={styles.reportsSection}>
                    <h2 className={styles.sectionTitle}>Dashboard</h2>

                    {/* Tabs */}
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'assessments' ? styles.active : ''}`}
                            onClick={() => setActiveTab('assessments')}
                        >
                            Skill Assessments
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'rapid' ? styles.active : ''}`}
                            onClick={() => setActiveTab('rapid')}
                        >
                            Rapid Math
                        </button>
                    </div>

                    {/* Reports Content */}
                    <div className={styles.reportsContent}>
                        {fetchingReports ? (
                            <div className={styles.loader}>
                                <div className={styles.spinner}></div>
                                <p>Loading reports...</p>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'assessments' && (
                                    <>
                                        {assessmentReports.length > 0 ? (
                                            <div className={styles.reportsList}>
                                                {assessmentReports.slice(0, 5).map((report, index) => (
                                                    <div
                                                        key={report.id || index}
                                                        className={styles.reportCard}
                                                        onClick={() => handleReportClick(report.id)}
                                                    >
                                                        <div className={styles.reportIcon}>
                                                            <Trophy size={24} />
                                                        </div>
                                                        <div className={styles.reportInfo}>
                                                            <h4>Assessment #{assessmentReports.length - index}</h4>
                                                            <p>{new Date(report.completed_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className={styles.reportScore}>
                                                            <span className={styles.scoreValue}>
                                                                {Math.round((report.score / report.total_questions) * 100)}%
                                                            </span>
                                                            <span className={styles.scoreLabel}>
                                                                {report.score}/{report.total_questions}
                                                            </span>
                                                        </div>
                                                        <ChevronRight size={20} />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className={styles.emptyState}>
                                                <BookOpen size={48} />
                                                <h3>No assessments yet</h3>
                                                <p>Take your first test to see your progress here!</p>
                                                <button onClick={handleStartAssessment} className={styles.primaryButton}>
                                                    Start Assessment
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeTab === 'rapid' && (
                                    <>
                                        {rapidMathReports.length > 0 ? (
                                            <div className={styles.reportsList}>
                                                {rapidMathReports.slice(0, 5).map((report, index) => (
                                                    <div
                                                        key={report.id || index}
                                                        className={styles.reportCard}
                                                    >
                                                        <div className={`${styles.reportIcon} ${styles.rapidIcon}`}>
                                                            <Zap size={24} />
                                                        </div>
                                                        <div className={styles.reportInfo}>
                                                            <h4>Rapid Math #{rapidMathReports.length - index}</h4>
                                                            <p>{new Date(report.completed_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className={styles.reportScore}>
                                                            <span className={styles.scoreValue}>{report.score}</span>
                                                            <span className={styles.scoreLabel}>points</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className={styles.emptyState}>
                                                <Zap size={48} />
                                                <h3>No rapid math sessions</h3>
                                                <p>Practice quick calculations to improve speed!</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </section>
            </div>

            {/* Add Child Modal */}
            {addChildOpen && (
                <div className={styles.modalOverlay} onClick={() => setAddChildOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3>Add New Learner</h3>
                        <div className={styles.formGroup}>
                            <label>Name</label>
                            <input
                                type="text"
                                value={childForm.name}
                                onChange={e => setChildForm({ ...childForm, name: e.target.value })}
                                placeholder="Enter name"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Grade</label>
                            <select
                                value={childForm.grade}
                                onChange={e => setChildForm({ ...childForm, grade: e.target.value })}
                            >
                                <option value="">Select Grade</option>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={() => setAddChildOpen(false)} className={styles.cancelButton}>
                                Cancel
                            </button>
                            <button onClick={handleSaveChild} className={styles.saveButton}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Child Modal */}
            {editChildOpen && (
                <div className={styles.modalOverlay} onClick={() => setEditChildOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3>Edit Profile</h3>
                        <div className={styles.formGroup}>
                            <label>Name</label>
                            <input
                                type="text"
                                value={childForm.name}
                                onChange={e => setChildForm({ ...childForm, name: e.target.value })}
                                placeholder="Enter name"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Grade</label>
                            <select
                                value={childForm.grade}
                                onChange={e => setChildForm({ ...childForm, grade: e.target.value })}
                            >
                                <option value="">Select Grade</option>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={() => setEditChildOpen(false)} className={styles.cancelButton}>
                                Cancel
                            </button>
                            <button onClick={handleUpdateChild} className={styles.saveButton}>
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
