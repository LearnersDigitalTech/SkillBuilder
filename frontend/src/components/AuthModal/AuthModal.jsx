/**
 * AuthModal Component
 * Migrated from Next.js - Handles Google/Email login, profile selection, registration
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, GraduationCap, Plus, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { authApi, usersApi } from '@/api/client'
import toast from 'react-hot-toast'
import styles from './AuthModal.module.css'

export default function AuthModal({ open, onClose, onSuccess, redirectPath = '/dashboard' }) {
    const [step, setStep] = useState('CHOOSE_METHOD') // CHOOSE_METHOD, REGISTER, SELECT_PROFILE
    const [loading, setLoading] = useState(false)
    const [profileSelecting, setProfileSelecting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Form state
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [userProfiles, setUserProfiles] = useState(null)
    const [registrationData, setRegistrationData] = useState({
        name: '',
        grade: ''
    })

    const { loginWithGoogle, refreshUserData, userData } = useAuth()
    const navigate = useNavigate()

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setStep('CHOOSE_METHOD')
            setEmail('')
            setPassword('')
            setLoading(false)
            setUserProfiles(null)
            setRegistrationData({ name: '', grade: '' })
        }
    }, [open])

    // Profile selection handler
    const handleSelectProfile = async (childId, childProfile) => {
        if (!childProfile.grade || childProfile.grade === 'Select Grade') {
            setRegistrationData({
                name: childProfile.name || '',
                grade: ''
            })
            setStep('REGISTER')
            toast.info('Please select your grade to continue.')
            return
        }

        setProfileSelecting(true)

        try {
            // Update active child in localStorage
            const userKey = userData?.firebase_uid
            if (userKey && typeof window !== 'undefined') {
                localStorage.setItem(`activeChild_${userKey}`, childId)
            }

            toast.success(`Welcome ${childProfile.name}!`)
            onSuccess && onSuccess({ childId, childProfile })

            setTimeout(() => {
                if (redirectPath && redirectPath !== 'NONE') {
                    if (redirectPath === '/practice' && childProfile.grade) {
                        const gradeDigit = childProfile.grade.replace(/\D/g, '')
                        navigate(`/practice?grade=${gradeDigit}`)
                    } else {
                        navigate(redirectPath)
                    }
                }
                onClose()
                setProfileSelecting(false)
            }, 1000)
        } catch (error) {
            console.error('Profile selection error:', error)
            toast.error('Failed to select profile')
            setProfileSelecting(false)
        }
    }

    // Google Sign-In
    const handleGoogleSignIn = async () => {
        setLoading(true)
        try {
            await loginWithGoogle()

            // After Firebase auth, check backend for user data
            await refreshUserData()

            const response = await authApi.getProfile()
            const userData = response.data

            if (userData.user_type === 'teacher' || userData.user_type === 'admin') {
                toast.success(`Welcome back, ${userData.name || 'Teacher'}!`)
                onClose()
                navigate('/teacher-dashboard')
                return
            }

            // Check for children profiles
            if (userData.children && userData.children.length > 0) {
                if (userData.children.length === 1) {
                    handleSelectProfile(userData.children[0].id, userData.children[0])
                    return
                }

                // Multiple profiles
                setUserProfiles(userData.children)
                setStep('SELECT_PROFILE')
                toast.success('Welcome back! Select a profile.')
            } else {
                // New user or no children
                setRegistrationData({
                    ...registrationData,
                    name: ''
                })
                setStep('REGISTER')
            }
        } catch (error) {
            console.error('Google sign-in error:', error)
            if (error.code === 'auth/popup-closed-by-user') {
                toast.info('Sign-in cancelled')
            } else if (error.response?.status === 404) {
                // New user - go to registration
                setStep('REGISTER')
            } else {
                toast.error('Google sign-in failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    // Email Sign-In
    const handleEmailSignIn = async () => {
        if (!email || !password) {
            toast.error('Please enter both User ID and password')
            return
        }

        setLoading(true)
        try {
            // Allow login with "S1001" by checking for @
            let authEmail = email
            if (!email.includes('@')) {
                authEmail = `${email}@lgs.com`
            }

            await signInWithEmailAndPassword(auth, authEmail, password)
            await refreshUserData()

            const response = await authApi.getProfile()
            const userDataFromApi = response.data

            if (userDataFromApi.user_type === 'teacher' || userDataFromApi.user_type === 'admin') {
                toast.success(`Welcome back, ${userDataFromApi.name || 'Teacher'}!`)
                onClose()
                navigate('/teacher-dashboard')
                return
            }

            if (userDataFromApi.children && userDataFromApi.children.length > 0) {
                if (userDataFromApi.children.length === 1) {
                    handleSelectProfile(userDataFromApi.children[0].id, userDataFromApi.children[0])
                    return
                }

                setUserProfiles(userDataFromApi.children)
                setStep('SELECT_PROFILE')
                toast.success('Welcome back! Select a profile.')
            } else {
                setStep('REGISTER')
            }
        } catch (error) {
            console.error('Email sign-in error:', error)
            toast.error('Login failed. Check your User ID and password.')
        } finally {
            setLoading(false)
        }
    }

    // Registration handler
    const handleRegisterStart = async () => {
        if (!registrationData.grade) {
            toast.error('Please select a grade to continue')
            return
        }

        setLoading(true)
        try {
            const childName = registrationData.name || 'Student 1'

            // Create child profile via API
            const response = await usersApi.createChild({
                name: childName,
                grade: registrationData.grade
            })

            const newChild = response.data

            toast.success('Registration Successful!')
            handleSelectProfile(newChild.id, newChild)
        } catch (error) {
            console.error('Registration error:', error)
            toast.error('Failed to start assessment. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!open) return null

    // Loading overlay
    if (profileSelecting) {
        return (
            <div className={styles.overlay}>
                <div className={styles.loadingCard}>
                    <div className={styles.spinner} />
                    <h2>Preparing Your Assessment</h2>
                    <p>Setting up your personalized math challenge...</p>
                </div>
            </div>
        )
    }

    return (
        <AnimatePresence>
            <div className={styles.overlay} onClick={onClose}>
                <motion.div
                    className={styles.modal}
                    onClick={e => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                >
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerContent}>
                            {step === 'CHOOSE_METHOD' && 'Sign In'}
                            {step === 'SELECT_PROFILE' && 'Select Profile'}
                            {step === 'REGISTER' && (
                                <div className={styles.headerWithIcon}>
                                    <GraduationCap size={28} className={styles.headerIcon} />
                                    <span>Select Your Grade</span>
                                </div>
                            )}
                        </div>
                        <button onClick={onClose} className={styles.closeButton}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className={styles.content}>
                        {/* CHOOSE METHOD */}
                        {step === 'CHOOSE_METHOD' && (
                            <div className={styles.stepContainer}>
                                {/* Email/Password Login */}
                                <div className={styles.emailLoginContainer}>
                                    <div className={styles.inputGroup}>
                                        <Mail className={styles.inputIcon} size={20} />
                                        <input
                                            type="text"
                                            placeholder="User ID (e.g. S1001)"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <Lock className={styles.inputIcon} size={20} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={styles.input}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className={styles.eyeButton}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleEmailSignIn}
                                        className={styles.actionButton}
                                        disabled={loading}
                                    >
                                        {loading ? 'Signing In...' : 'Sign In'}
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className={styles.divider}>
                                    <span>OR</span>
                                </div>

                                {/* Google Button */}
                                <button
                                    onClick={handleGoogleSignIn}
                                    className={styles.googleButton}
                                    disabled={loading}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path d="M23.52 12.29C23.52 11.43 23.44 10.61 23.29 9.81H12V14.41H18.45C18.17 15.89 17.33 17.15 16.06 18H16.07L19.92 20.98C22.18 18.9 23.52 15.82 23.52 12.29Z" fill="#4285F4" />
                                        <path d="M12 24C15.24 24 17.96 22.92 19.93 21.01L16.08 18.03C15 18.75 13.62 19.19 12 19.19C8.87 19.19 6.22 17.07 5.27 14.22H1.28V17.31C3.25 21.23 7.31 24 12 24Z" fill="#34A853" />
                                        <path d="M5.27 14.22C5.03 13.5 4.9 12.75 4.9 12C4.9 11.25 5.03 10.5 5.27 9.77V6.69H1.28C0.46 8.31 0 10.11 0 12C0 13.89 0.46 15.68 1.28 17.31L5.27 14.22Z" fill="#FBBC05" />
                                        <path d="M12 4.81C13.76 4.81 15.34 5.42 16.59 6.61L20.01 3.2C17.95 1.28 15.23 0 12 0C7.31 0 3.25 2.77 1.28 6.69L5.27 9.77C6.22 6.93 8.87 4.81 12 4.81Z" fill="#EA4335" />
                                    </svg>
                                    Sign in with Google
                                </button>
                            </div>
                        )}

                        {/* SELECT PROFILE */}
                        {step === 'SELECT_PROFILE' && userProfiles && (
                            <div className={styles.stepContainer}>
                                <p className={styles.stepDescription}>Select who is taking the test</p>

                                <div className={styles.profileList}>
                                    {/* Add New Student */}
                                    <div
                                        className={`${styles.profileListItem} ${styles.addProfileItem}`}
                                        onClick={() => setStep('REGISTER')}
                                    >
                                        <div className={styles.profileListAvatar}>
                                            <Plus size={18} />
                                        </div>
                                        <div className={styles.profileListInfo}>
                                            <div className={styles.profileListName}>Add Student</div>
                                        </div>
                                    </div>

                                    {/* Existing Profiles */}
                                    {userProfiles.map((profile) => (
                                        <div
                                            key={profile.id}
                                            className={styles.profileListItem}
                                            onClick={() => handleSelectProfile(profile.id, profile)}
                                        >
                                            <div className={styles.profileListAvatar}>
                                                {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div className={styles.profileListInfo}>
                                                <div className={styles.profileListName}>{profile.name}</div>
                                                <div className={styles.profileListGrade}>{profile.grade}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setStep('CHOOSE_METHOD')}
                                    className={styles.backButton}
                                    disabled={loading}
                                >
                                    Sign in with different account
                                </button>
                            </div>
                        )}

                        {/* REGISTER */}
                        {step === 'REGISTER' && (
                            <div className={styles.stepContainer}>
                                <div className={styles.formGrid}>
                                    <div className={styles.inputGroup}>
                                        <User className={styles.inputIcon} size={20} />
                                        <input
                                            type="text"
                                            placeholder="Enter student name"
                                            value={registrationData.name}
                                            onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                                            className={styles.input}
                                            autoFocus
                                        />
                                    </div>

                                    <div className={styles.gradeSection}>
                                        <select
                                            value={registrationData.grade}
                                            onChange={(e) => setRegistrationData({ ...registrationData, grade: e.target.value })}
                                            className={styles.gradeSelect}
                                        >
                                            <option value="" disabled>Select Grade</option>
                                            {[...Array(12)].map((_, i) => (
                                                <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={handleRegisterStart}
                                    disabled={loading}
                                    className={styles.actionButton}
                                >
                                    {loading ? 'Starting...' : 'Start Assessment →'}
                                </button>

                                {userProfiles && (
                                    <button
                                        onClick={() => setStep('SELECT_PROFILE')}
                                        className={styles.backButton}
                                    >
                                        Back to Profiles
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
