/**
 * Quiz List Page
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { quizApi } from '@/api/client'

export default function Quiz() {
    const { activeChild } = useAuth()
    const [quizzes, setQuizzes] = useState([])
    const [grades, setGrades] = useState([])
    const [selectedGrade, setSelectedGrade] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await quizApi.getGrades()
                setGrades(response.data.grades || [])

                // Default to active child's grade or first available
                if (activeChild?.grade && response.data.grades?.includes(activeChild.grade)) {
                    setSelectedGrade(activeChild.grade)
                } else if (response.data.grades?.length > 0) {
                    setSelectedGrade(response.data.grades[0])
                }
            } catch (error) {
                console.error('Error fetching grades:', error)
            }
        }
        fetchGrades()
    }, [activeChild?.grade])

    useEffect(() => {
        const fetchQuizzes = async () => {
            if (!selectedGrade) return

            setLoading(true)
            try {
                const response = await quizApi.list({ grade: selectedGrade })
                setQuizzes(response.data)
            } catch (error) {
                console.error('Error fetching quizzes:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchQuizzes()
    }, [selectedGrade])

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
                            ← Back
                        </Link>
                        <h1 className="font-bold text-xl text-primary">Quizzes</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Grade Filter */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Grade
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {grades.map((grade) => (
                            <button
                                key={grade}
                                onClick={() => setSelectedGrade(grade)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedGrade === grade
                                        ? 'bg-primary text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {grade}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quiz List */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading quizzes...</div>
                ) : quizzes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No quizzes available for {selectedGrade}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz, index) => (
                            <motion.div
                                key={quiz.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    to={`/quiz/${quiz.id}`}
                                    className="block bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${quiz.is_practice
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                            }`}>
                                            {quiz.is_practice ? 'Practice' : 'Test'}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {quiz.duration_minutes} min
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        {quiz.title}
                                    </h3>

                                    {quiz.description && (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                            {quiz.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">
                                            {quiz.total_questions} questions
                                        </span>
                                        <span className="text-primary font-medium">
                                            Start →
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
