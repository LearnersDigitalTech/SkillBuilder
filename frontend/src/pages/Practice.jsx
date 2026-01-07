/**
 * Practice Page
 * Grade-based practice selection - migrated from Next.js
 */
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    GraduationCap, Play, Clock, Target, ArrowRight,
    BookOpen, Brain, Calculator
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuizSession } from '@/contexts/QuizSessionContext'
import { Header, Footer } from '@/components/Layout'
import toast from 'react-hot-toast'
import styles from './Practice.module.css'

const GRADE_OPTIONS = [
    { grade: 'Grade 1', icon: '🔢', topics: 'Numbers, Counting, Basic Addition' },
    { grade: 'Grade 2', icon: '➕', topics: 'Addition, Subtraction, Shapes' },
    { grade: 'Grade 3', icon: '✖️', topics: 'Multiplication, Division, Fractions' },
    { grade: 'Grade 4', icon: '📐', topics: 'Geometry, Decimals, Measurements' },
    { grade: 'Grade 5', icon: '📊', topics: 'Percentages, Ratios, Data' },
    { grade: 'Grade 6', icon: '🔺', topics: 'Algebra Basics, Geometry, Statistics' },
    { grade: 'Grade 7', icon: '📈', topics: 'Linear Equations, Proportions' },
    { grade: 'Grade 8', icon: '🎯', topics: 'Quadratics, Coordinate Geometry' },
    { grade: 'Grade 9', icon: '🧮', topics: 'Advanced Algebra, Trigonometry' },
    { grade: 'Grade 10', icon: '🎓', topics: 'Calculus Prep, Advanced Topics' },
]

export default function Practice() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user, userData } = useAuth()
    const { initQuiz } = useQuizSession()

    const [selectedGrade, setSelectedGrade] = useState(null)
    const [loading, setLoading] = useState(false)

    // Check URL for pre-selected grade
    useEffect(() => {
        const gradeParam = searchParams.get('grade')
        if (gradeParam) {
            const gradeMatch = GRADE_OPTIONS.find(g =>
                g.grade.toLowerCase().includes(gradeParam.toLowerCase()) ||
                gradeParam === 'SAT' || gradeParam === 'NEET'
            )
            if (gradeMatch) {
                setSelectedGrade(gradeMatch.grade)
            }
        }
    }, [searchParams])

    const handleStartPractice = async () => {
        if (!selectedGrade) {
            toast.error('Please select a grade')
            return
        }

        if (!user) {
            toast.error('Please login to start practice')
            navigate('/login')
            return
        }

        setLoading(true)

        // Initialize quiz session with selected grade
        const childName = userData?.children?.[0]?.name || userData?.name || 'Student'
        initQuiz({ name: childName, grade: selectedGrade }, [])

        // Navigate to quiz
        navigate('/quiz')
    }

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Hero */}
                    <div className={styles.hero}>
                        <div className={styles.heroIcon}>
                            <BookOpen size={40} />
                        </div>
                        <h1>Practice Zone</h1>
                        <p>Select your grade and start practicing math</p>
                    </div>

                    {/* Grade Selection */}
                    <div className={styles.gradeGrid}>
                        {GRADE_OPTIONS.map((option) => (
                            <button
                                key={option.grade}
                                onClick={() => setSelectedGrade(option.grade)}
                                className={`${styles.gradeCard} ${selectedGrade === option.grade ? styles.selected : ''}`}
                            >
                                <span className={styles.gradeIcon}>{option.icon}</span>
                                <h3>{option.grade}</h3>
                                <p>{option.topics}</p>
                                {selectedGrade === option.grade && (
                                    <div className={styles.checkmark}>✓</div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Start Button */}
                    {selectedGrade && (
                        <div className={styles.startSection}>
                            <div className={styles.sessionInfo}>
                                <div className={styles.infoItem}>
                                    <Clock size={18} />
                                    <span>30 minutes</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <Target size={18} />
                                    <span>15-20 questions</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <Brain size={18} />
                                    <span>Adaptive difficulty</span>
                                </div>
                            </div>

                            <button
                                onClick={handleStartPractice}
                                disabled={loading}
                                className={styles.startButton}
                            >
                                {loading ? 'Starting...' : `Start ${selectedGrade} Practice`}
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* Features */}
                    <div className={styles.features}>
                        <div className={styles.featureCard}>
                            <Calculator size={32} className={styles.featureIcon} />
                            <h3>Topic-Based Questions</h3>
                            <p>Questions tailored to your grade curriculum</p>
                        </div>
                        <div className={styles.featureCard}>
                            <Target size={32} className={styles.featureIcon} />
                            <h3>Instant Feedback</h3>
                            <p>Know your results immediately after submission</p>
                        </div>
                        <div className={styles.featureCard}>
                            <Brain size={32} className={styles.featureIcon} />
                            <h3>Track Progress</h3>
                            <p>Monitor improvement over multiple sessions</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
