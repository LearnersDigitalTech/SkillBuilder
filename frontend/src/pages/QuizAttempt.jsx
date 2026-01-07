/**
 * QuizClient Component
 * Main quiz-taking interface - migrated from Next.js
 * Handles question display, answer saving, timer, and submission
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Star, Clock, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react'
import { useQuizSession } from '@/contexts/QuizSessionContext'
import { useAuth } from '@/contexts/AuthContext'
import { quizApi } from '@/api/client'
import { Timer, QuestionPalette } from '@/components/Quiz'
import { TypeMCQ, TypeUserInput } from '@/components/QuestionTypes'
import { Header } from '@/components/Layout'
import toast from 'react-hot-toast'
import styles from './QuizAttempt.module.css'

export default function QuizAttempt() {
    const navigate = useNavigate()
    const { user, userData } = useAuth()
    const {
        userDetails,
        questionPaper,
        activeQuestionIndex,
        remainingTime,
        initQuiz,
        restoreQuiz,
        updateAnswer,
        goToQuestion,
        updateTime,
        submitQuiz,
        clearQuiz
    } = useQuizSession()

    const [loading, setLoading] = useState(true)
    const [showIntro, setShowIntro] = useState(true)
    const [attemptCount, setAttemptCount] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [showNamePrompt, setShowNamePrompt] = useState(false)
    const [childName, setChildName] = useState('')

    const timeTakeRef = useRef(1800)
    const lastTimeRef = useRef(1800)

    // Initialize quiz on mount
    useEffect(() => {
        const initializeQuiz = async () => {
            // Try to restore from localStorage first
            const restoredSession = restoreQuiz()

            if (restoredSession && restoredSession.questionPaper?.length > 0) {
                setShowIntro(false)
                setLoading(false)
                return
            }

            // Check if we have user details
            if (!userDetails && !userData) {
                toast.error('Please start the assessment from your dashboard')
                navigate('/dashboard')
                return
            }

            // Fetch questions from API
            try {
                const grade = userDetails?.grade || userData?.children?.[0]?.grade
                if (!grade || grade === 'Select Grade') {
                    toast.warning('Please select a grade first')
                    navigate('/dashboard')
                    return
                }

                const response = await quizApi.start({ grade })
                const questions = response.data.questions || []

                if (questions.length === 0) {
                    toast.error('No questions available for this grade')
                    navigate('/dashboard')
                    return
                }

                // Initialize quiz session with questions
                initQuiz(userDetails || { name: userData?.name, grade }, questions)
                setAttemptCount(response.data.attempt_number || 1)
                setLoading(false)
            } catch (error) {
                console.error('Error initializing quiz:', error)
                toast.error('Failed to load questions. Please try again.')
                navigate('/dashboard')
            }
        }

        initializeQuiz()
    }, [])

    // Current question
    const currentQuestion = useMemo(() => {
        if (!questionPaper || questionPaper.length === 0) return null
        return questionPaper[activeQuestionIndex] || null
    }, [questionPaper, activeQuestionIndex])

    const isLastQuestion = activeQuestionIndex === (questionPaper?.length || 0) - 1

    // Handle answer update
    const handleAnswerChange = (answer) => {
        updateAnswer(answer)
    }

    // Handle navigation
    const handleNext = () => {
        if (isLastQuestion) {
            handleSubmitPrompt()
        } else {
            goToQuestion(activeQuestionIndex + 1)
        }
    }

    const handlePrevious = () => {
        if (activeQuestionIndex > 0) {
            goToQuestion(activeQuestionIndex - 1)
        }
    }

    const handleQuestionSelect = (index) => {
        goToQuestion(index)
    }

    // Handle timer update
    const handleTimeUpdate = (time) => {
        timeTakeRef.current = time
        updateTime(time)
    }

    // Handle time finished
    const handleTimeFinished = () => {
        toast.error('Time is up! Submitting your answers...')
        handleFinalSubmit()
    }

    // Show name prompt before submit
    const handleSubmitPrompt = () => {
        const userName = userDetails?.name || userData?.name
        if (!userName || userName === 'Student 1' || userName.trim() === '') {
            setShowNamePrompt(true)
        } else {
            handleFinalSubmit()
        }
    }

    // Final submit
    const handleFinalSubmit = async () => {
        setSubmitting(true)
        setShowNamePrompt(false)

        try {
            // Calculate score
            let correctCount = 0
            const answers = questionPaper.map(q => {
                const isCorrect = String(q.userAnswer).toLowerCase() === String(q.correctAnswer).toLowerCase()
                if (isCorrect) correctCount++
                return {
                    question_id: q.id,
                    user_answer: q.userAnswer,
                    correct_answer: q.correctAnswer,
                    is_correct: isCorrect,
                    time_taken: q.timeTaken || 0
                }
            })

            // Submit to API
            const result = await quizApi.submit({
                answers,
                total_time: 1800 - remainingTime,
                score: correctCount,
                total_questions: questionPaper.length
            })

            submitQuiz()
            toast.success('Quiz submitted successfully!')

            // Navigate to results
            navigate(`/quiz/result/${result.data.attempt_id}`)
        } catch (error) {
            console.error('Error submitting quiz:', error)
            toast.error('Failed to submit quiz. Please try again.')
            setSubmitting(false)
        }
    }

    // Exit quiz
    const handleExit = () => {
        if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
            clearQuiz()
            navigate('/dashboard')
        }
    }

    // Start quiz from intro
    const handleStartQuiz = () => {
        setShowIntro(false)
    }

    // Loading state
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Preparing your assessment...</p>
            </div>
        )
    }

    // Intro screen
    if (showIntro) {
        const ordinal = attemptCount === 1 ? '1st' : attemptCount === 2 ? '2nd' : attemptCount === 3 ? '3rd' : `${attemptCount}th`

        return (
            <div className={styles.introContainer}>
                <div className={styles.introCard}>
                    <div className={styles.introIcon}>
                        <Trophy size={48} />
                    </div>
                    <h1 className={styles.introTitle}>
                        Your {ordinal} Assessment
                    </h1>
                    <p className={styles.introSubtitle}>
                        Welcome, {userDetails?.name || 'Student'}!
                    </p>
                    <div className={styles.introInfo}>
                        <div className={styles.infoItem}>
                            <Clock size={20} />
                            <span>30 minutes</span>
                        </div>
                        <div className={styles.infoItem}>
                            <Star size={20} />
                            <span>{questionPaper?.length || 0} questions</span>
                        </div>
                    </div>
                    <div className={styles.introButtons}>
                        <button onClick={handleExit} className={styles.exitButton}>
                            Exit
                        </button>
                        <button onClick={handleStartQuiz} className={styles.startButton}>
                            Start Assessment
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Submitting state
    if (submitting) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Submitting your answers...</p>
            </div>
        )
    }

    return (
        <div className={styles.quizPage}>
            <Header />

            <div className={styles.quizContainer}>
                {/* Top Bar */}
                <div className={styles.topBar}>
                    <div className={styles.progress}>
                        Question {activeQuestionIndex + 1} of {questionPaper?.length || 0}
                    </div>
                    <Timer
                        initialTime={remainingTime}
                        onTimeUpdate={handleTimeUpdate}
                        onTimeFinished={handleTimeFinished}
                    />
                </div>

                <div className={styles.mainContent}>
                    {/* Question Area */}
                    <div className={styles.questionArea}>
                        {currentQuestion && (
                            <>
                                <div className={styles.questionHeader}>
                                    <span className={styles.questionNumber}>
                                        Q{activeQuestionIndex + 1}
                                    </span>
                                    {currentQuestion.topic && (
                                        <span className={styles.topicBadge}>
                                            {currentQuestion.topic}
                                        </span>
                                    )}
                                </div>

                                {/* Render question based on type */}
                                {(currentQuestion.type === 'MCQ' || currentQuestion.options) ? (
                                    <TypeMCQ
                                        question={currentQuestion.question}
                                        options={currentQuestion.options}
                                        userAnswer={currentQuestion.userAnswer}
                                        onChange={handleAnswerChange}
                                        onNext={handleNext}
                                        isLastQuestion={isLastQuestion}
                                        imageUrl={currentQuestion.imageUrl}
                                    />
                                ) : (
                                    <TypeUserInput
                                        question={currentQuestion.question}
                                        userAnswer={currentQuestion.userAnswer}
                                        onChange={handleAnswerChange}
                                        onNext={handleNext}
                                        isLastQuestion={isLastQuestion}
                                        inputType={currentQuestion.inputType || 'text'}
                                        imageUrl={currentQuestion.imageUrl}
                                    />
                                )}
                            </>
                        )}

                        {/* Navigation Buttons */}
                        <div className={styles.navigationButtons}>
                            <button
                                onClick={handlePrevious}
                                disabled={activeQuestionIndex === 0}
                                className={styles.navButton}
                            >
                                <ArrowLeft size={18} />
                                Previous
                            </button>
                            <button
                                onClick={handleNext}
                                className={`${styles.navButton} ${isLastQuestion ? styles.submitBtn : ''}`}
                            >
                                {isLastQuestion ? 'Submit' : 'Next'}
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Question Palette - Desktop */}
                    <div className={styles.paletteContainer}>
                        <QuestionPalette
                            questions={questionPaper || []}
                            activeQuestionIndex={activeQuestionIndex}
                            onSelect={handleQuestionSelect}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            isLastQuestion={isLastQuestion}
                        />
                    </div>
                </div>
            </div>

            {/* Name Prompt Modal */}
            {showNamePrompt && (
                <div className={styles.modalOverlay}>
                    <div className={styles.nameModal}>
                        <h3>Enter Your Name</h3>
                        <p>Please enter your name before submitting</p>
                        <input
                            type="text"
                            value={childName}
                            onChange={(e) => setChildName(e.target.value)}
                            placeholder="Your name"
                            className={styles.nameInput}
                            autoFocus
                        />
                        <div className={styles.modalButtons}>
                            <button onClick={() => setShowNamePrompt(false)} className={styles.cancelButton}>
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (childName.trim()) {
                                        handleFinalSubmit()
                                    }
                                }}
                                disabled={!childName.trim()}
                                className={styles.submitButton}
                            >
                                Submit Quiz
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
