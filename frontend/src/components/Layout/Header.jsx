/**
 * Header Component
 * Fixed header with navigation, mobile menu, auth modal - migrated from Next.js
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, User, X, Menu, GraduationCap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from '@/components/AuthModal/AuthModal'
import styles from './Header.module.css'

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [authModalOpen, setAuthModalOpen] = useState(false)
    const [redirectPath, setRedirectPath] = useState(null)
    const [showGradeSelector, setShowGradeSelector] = useState(false)
    const [selectedGrade, setSelectedGrade] = useState('')
    const [menuOpen, setMenuOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    const menuRef = useRef(null)
    const hamburgerRef = useRef(null)

    const { user, userData, loading } = useAuth()
    const navigate = useNavigate()

    const isTeacher = userData?.user_type === 'teacher' || userData?.user_type === 'admin'

    // Check for session in localStorage
    const [hasSession, setHasSession] = useState(false)

    useEffect(() => {
        const checkSession = () => {
            if (typeof window !== 'undefined') {
                const quizSession = window.localStorage.getItem('quizSession')
                if (quizSession) {
                    try {
                        const parsed = JSON.parse(quizSession)
                        if (parsed?.userDetails) {
                            setHasSession(true)
                            return
                        }
                    } catch (e) { }
                }
            }
            setHasSession(false)
        }
        checkSession()
    }, [user])

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > window.innerHeight - 100)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            const isMob = window.innerWidth < 768
            setIsMobile(isMob)
            if (!isMob) setMenuOpen(false)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Click outside to close menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuOpen &&
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                hamburgerRef.current &&
                !hamburgerRef.current.contains(event.target)
            ) {
                setMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [menuOpen])

    const handleTakeTest = () => {
        if (user || hasSession) {
            setShowGradeSelector(true)
        } else {
            setRedirectPath('NONE')
            setAuthModalOpen(true)
        }
    }

    const handleSatPractice = () => {
        if (user) {
            navigate('/practice?grade=SAT')
        } else {
            setRedirectPath('/practice?grade=SAT')
            setAuthModalOpen(true)
        }
    }

    const handleNeetPractice = () => {
        if (user || hasSession) {
            navigate('/neet')
        } else {
            setRedirectPath('/neet')
            setAuthModalOpen(true)
        }
    }

    const handleGradeSelect = () => {
        if (selectedGrade) {
            setShowGradeSelector(false)
            navigate(`/practice?grade=${selectedGrade}`)
        }
    }

    return (
        <>
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={styles.header}
            >
                <div className={styles.container}>
                    {/* Logo */}
                    <Link to="/" className={styles.logo}>
                        <img
                            src="/LearnersLogoTransparent.png"
                            alt="Learners Logo"
                            className={styles.logoImage}
                            onError={(e) => { e.target.style.display = 'none' }}
                        />
                        <span className={styles.logoText}>Skill Builder</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className={styles.desktopNav}>
                        {!isTeacher && (
                            <>
                                <button onClick={handleTakeTest} className={styles.navLink}>
                                    Practice
                                </button>
                                <Link to="/rapid-math" className={styles.navLink}>
                                    Rapid Math
                                </Link>
                                <button onClick={handleSatPractice} className={styles.navLink}>
                                    SAT
                                </button>
                                <button onClick={handleNeetPractice} className={styles.navLink}>
                                    NEET Exam
                                </button>
                            </>
                        )}
                    </nav>

                    {/* Auth Buttons */}
                    <div className={styles.authSection}>
                        <AnimatePresence mode="wait">
                            {isScrolled && !isMobile ? (
                                <motion.div
                                    key="journey"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                >
                                    <Link to="/lottery" className={styles.ctaButton}>
                                        Begin your Journey
                                        <motion.span
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <ArrowRight size={16} />
                                        </motion.span>
                                    </Link>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="auth"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                >
                                    {user || hasSession ? (
                                        <button
                                            onClick={() => navigate(isTeacher ? '/teacher-dashboard' : '/dashboard')}
                                            className={styles.profileButton}
                                        >
                                            <User size={16} />
                                            {isTeacher ? 'Dashboard' : 'Profile'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setAuthModalOpen(true)}
                                            className={styles.loginButton}
                                        >
                                            Log in
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        ref={hamburgerRef}
                        className={styles.hamburger}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            ref={menuRef}
                            className={styles.mobileMenu}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <nav className={styles.mobileNav}>
                                {!isTeacher && (
                                    <>
                                        <button onClick={() => { handleTakeTest(); setMenuOpen(false); }} className={styles.mobileNavLink}>
                                            Practice
                                        </button>
                                        <Link to="/rapid-math" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>
                                            Rapid Math
                                        </Link>
                                        <button onClick={() => { handleSatPractice(); setMenuOpen(false); }} className={styles.mobileNavLink}>
                                            SAT
                                        </button>
                                        <button onClick={() => { handleNeetPractice(); setMenuOpen(false); }} className={styles.mobileNavLink}>
                                            NEET Exam
                                        </button>
                                    </>
                                )}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            {/* Auth Modal */}
            <AuthModal
                open={authModalOpen}
                redirectPath={redirectPath}
                onClose={() => {
                    setAuthModalOpen(false)
                    setRedirectPath(null)
                }}
                onSuccess={() => {
                    setAuthModalOpen(false)
                    if (redirectPath === 'NONE') {
                        setShowGradeSelector(true)
                        setRedirectPath(null)
                    }
                }}
            />

            {/* Grade Selection Modal */}
            {showGradeSelector && (
                <div className={styles.modalOverlay} onClick={() => setShowGradeSelector(false)}>
                    <div className={styles.gradeModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.gradeModalHeader}>
                            <GraduationCap size={24} className={styles.gradeIcon} />
                            <h3>Select Your Grade</h3>
                            <button onClick={() => setShowGradeSelector(false)} className={styles.closeButton}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.gradeModalContent}>
                            <select
                                value={selectedGrade}
                                onChange={(e) => setSelectedGrade(e.target.value)}
                                className={styles.gradeSelect}
                            >
                                <option value="">Select Grade</option>
                                {[...Array(10)].map((_, i) => (
                                    <option key={i + 1} value={(i + 1).toString()}>
                                        Grade {i + 1}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleGradeSelect}
                                disabled={!selectedGrade}
                                className={styles.startButton}
                            >
                                Start Practice
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header spacer */}
            <div className={styles.headerSpacer} />
        </>
    )
}
