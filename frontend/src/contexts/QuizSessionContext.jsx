/**
 * Quiz Session Context
 * Manages quiz state across components - migrated from Next.js
 */
import { createContext, useContext, useState, useRef, useCallback } from 'react'

const QuizSessionContext = createContext(null)

export function QuizSessionProvider({ children }) {
    const [quizState, setQuizState] = useState({
        userDetails: null,
        questionPaper: [],
        activeQuestionIndex: 0,
        remainingTime: 1800, // 30 minutes default
        startedAt: null,
        isSubmitted: false
    })

    const timeTakenRef = useRef(1800)

    // Initialize quiz session
    const initQuiz = useCallback((userDetails, questions) => {
        const initialState = {
            userDetails,
            questionPaper: questions.map(q => ({
                ...q,
                userAnswer: null,
                timeTaken: 0,
                markedForReview: false
            })),
            activeQuestionIndex: 0,
            remainingTime: 1800,
            startedAt: new Date().toISOString(),
            isSubmitted: false
        }

        setQuizState(initialState)
        timeTakenRef.current = 1800

        // Save to localStorage
        try {
            localStorage.setItem('quizSession', JSON.stringify(initialState))
        } catch (e) {
            console.error('Failed to save quiz session:', e)
        }

        return initialState
    }, [])

    // Restore quiz from localStorage
    const restoreQuiz = useCallback(() => {
        try {
            const stored = localStorage.getItem('quizSession')
            if (stored) {
                const parsed = JSON.parse(stored)
                if (parsed && parsed.userDetails && !parsed.isSubmitted) {
                    setQuizState(parsed)
                    timeTakenRef.current = parsed.remainingTime || 1800
                    return parsed
                }
            }
        } catch (e) {
            console.error('Failed to restore quiz session:', e)
        }
        return null
    }, [])

    // Update answer for current question
    const updateAnswer = useCallback((answer) => {
        setQuizState(prev => {
            const newPaper = [...prev.questionPaper]
            if (newPaper[prev.activeQuestionIndex]) {
                newPaper[prev.activeQuestionIndex] = {
                    ...newPaper[prev.activeQuestionIndex],
                    userAnswer: answer
                }
            }

            const newState = { ...prev, questionPaper: newPaper }

            // Persist
            try {
                localStorage.setItem('quizSession', JSON.stringify(newState))
            } catch (e) { }

            return newState
        })
    }, [])

    // Navigate to question
    const goToQuestion = useCallback((index) => {
        setQuizState(prev => {
            // Save time spent on current question
            const currentTime = timeTakenRef.current
            const newPaper = [...prev.questionPaper]

            const newState = {
                ...prev,
                questionPaper: newPaper,
                activeQuestionIndex: index,
                remainingTime: currentTime
            }

            try {
                localStorage.setItem('quizSession', JSON.stringify(newState))
            } catch (e) { }

            return newState
        })
    }, [])

    // Update time
    const updateTime = useCallback((time) => {
        timeTakenRef.current = time
        setQuizState(prev => ({ ...prev, remainingTime: time }))
    }, [])

    // Submit quiz
    const submitQuiz = useCallback(() => {
        setQuizState(prev => {
            const finalState = {
                ...prev,
                isSubmitted: true,
                completedAt: new Date().toISOString()
            }

            try {
                localStorage.setItem('quizSession', JSON.stringify(finalState))
            } catch (e) { }

            return finalState
        })
    }, [])

    // Clear quiz session
    const clearQuiz = useCallback(() => {
        setQuizState({
            userDetails: null,
            questionPaper: [],
            activeQuestionIndex: 0,
            remainingTime: 1800,
            startedAt: null,
            isSubmitted: false
        })
        timeTakenRef.current = 1800

        try {
            localStorage.removeItem('quizSession')
        } catch (e) { }
    }, [])

    const value = {
        ...quizState,
        timeTakenRef,
        initQuiz,
        restoreQuiz,
        updateAnswer,
        goToQuestion,
        updateTime,
        submitQuiz,
        clearQuiz
    }

    return (
        <QuizSessionContext.Provider value={value}>
            {children}
        </QuizSessionContext.Provider>
    )
}

export function useQuizSession() {
    const context = useContext(QuizSessionContext)
    if (!context) {
        throw new Error('useQuizSession must be used within QuizSessionProvider')
    }
    return context
}

export default QuizSessionContext
