/**
 * QuizResult Page
 * Displays quiz results with score, breakdown, and detailed analysis
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    Trophy, Star, CheckCircle, XCircle, Clock,
    ArrowLeft, Home, RotateCcw, ChevronDown
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { quizApi } from '@/api/client'
import { Header, Footer } from '@/components/Layout'
import toast from 'react-hot-toast'
import styles from './QuizResult.module.css'

export default function QuizResult() {
    const { attemptId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [loading, setLoading] = useState(true)
    const [result, setResult] = useState(null)
    const [showDetails, setShowDetails] = useState(false)

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const response = await quizApi.getResult(attemptId)
                setResult(response.data)
            } catch (error) {
                console.error('Error fetching result:', error)
                toast.error('Failed to load results')
                navigate('/dashboard')
            } finally {
                setLoading(false)
            }
        }

        if (attemptId) {
            fetchResult()
        }
    }, [attemptId, navigate])

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading your results...</p>
            </div>
        )
    }

    if (!result) {
        return (
            <div className={styles.errorContainer}>
                <p>Results not found</p>
                <Link to="/dashboard">Go to Dashboard</Link>
            </div>
        )
    }

    const score = result.score || 0
    const total = result.total_questions || 0
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0
    const timeSpent = result.total_time || 0

    const getGrade = (pct) => {
        if (pct >= 90) return { grade: 'A+', color: '#10b981', message: 'Outstanding!' }
        if (pct >= 80) return { grade: 'A', color: '#22c55e', message: 'Excellent!' }
        if (pct >= 70) return { grade: 'B', color: '#3b82f6', message: 'Great job!' }
        if (pct >= 60) return { grade: 'C', color: '#f59e0b', message: 'Good effort!' }
        if (pct >= 50) return { grade: 'D', color: '#f97316', message: 'Keep practicing!' }
        return { grade: 'F', color: '#ef4444', message: 'More practice needed' }
    }

    const { grade, color, message } = getGrade(percentage)

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}m ${secs}s`
    }

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Results Card */}
                    <div className={styles.resultsCard}>
                        {/* Trophy */}
                        <div className={styles.trophySection}>
                            <div className={styles.trophy} style={{ background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)` }}>
                                <Trophy size={64} style={{ color }} />
                            </div>
                            <h1 className={styles.title}>Assessment Complete!</h1>
                            <p className={styles.subtitle}>{message}</p>
                        </div>

                        {/* Score Circle */}
                        <div className={styles.scoreSection}>
                            <div className={styles.scoreCircle} style={{ borderColor: color }}>
                                <span className={styles.scoreValue} style={{ color }}>{percentage}%</span>
                                <span className={styles.scoreLabel}>Score</span>
                            </div>
                            <div className={styles.gradeBox} style={{ background: `${color}15`, borderColor: color }}>
                                <span className={styles.grade} style={{ color }}>Grade {grade}</span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <CheckCircle className={styles.statIcon} style={{ color: '#10b981' }} />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>{score}</span>
                                    <span className={styles.statLabel}>Correct</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <XCircle className={styles.statIcon} style={{ color: '#ef4444' }} />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>{total - score}</span>
                                    <span className={styles.statLabel}>Incorrect</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <Star className={styles.statIcon} style={{ color: '#f59e0b' }} />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>{total}</span>
                                    <span className={styles.statLabel}>Total</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <Clock className={styles.statIcon} style={{ color: '#3b82f6' }} />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>{formatTime(timeSpent)}</span>
                                    <span className={styles.statLabel}>Time Taken</span>
                                </div>
                            </div>
                        </div>

                        {/* Question Details Toggle */}
                        <button
                            className={styles.detailsToggle}
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            {showDetails ? 'Hide' : 'View'} Question Details
                            <ChevronDown
                                size={20}
                                style={{ transform: showDetails ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                            />
                        </button>

                        {/* Question Details */}
                        {showDetails && result.answers && (
                            <div className={styles.questionDetails}>
                                {result.answers.map((answer, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.questionItem} ${answer.is_correct ? styles.correct : styles.incorrect}`}
                                    >
                                        <div className={styles.questionNumber}>Q{index + 1}</div>
                                        <div className={styles.questionContent}>
                                            <p className={styles.questionText}>{answer.question || `Question ${index + 1}`}</p>
                                            <div className={styles.answerRow}>
                                                <span className={styles.yourAnswer}>
                                                    Your answer: <strong>{answer.user_answer || 'Not answered'}</strong>
                                                </span>
                                                {!answer.is_correct && (
                                                    <span className={styles.correctAnswer}>
                                                        Correct: <strong>{answer.correct_answer}</strong>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.questionStatus}>
                                            {answer.is_correct ? (
                                                <CheckCircle size={24} style={{ color: '#10b981' }} />
                                            ) : (
                                                <XCircle size={24} style={{ color: '#ef4444' }} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className={styles.actions}>
                            <Link to="/dashboard" className={styles.dashboardButton}>
                                <Home size={18} />
                                Dashboard
                            </Link>
                            <Link to="/quiz" className={styles.retryButton}>
                                <RotateCcw size={18} />
                                Take Another Test
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
