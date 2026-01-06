import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/api/client';

export default function QuizPage() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);
    const [timeSpent, setTimeSpent] = useState(0);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const childId = user?.children?.[0]?.id;
    const grade = user?.children?.[0]?.grade;

    useEffect(() => {
        // Timer
        const timer = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Load questions (placeholder - will be implemented in backend)
        const loadQuestions = async () => {
            try {
                // For now, create sample questions
                const sampleQuestions = Array.from({ length: 10 }, (_, i) => ({
                    id: i + 1,
                    question: `Sample Math Question ${i + 1}`,
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    correctAnswer: 0
                }));

                setQuestions(sampleQuestions);
                setAnswers(new Array(sampleQuestions.length).fill(null));
                setLoading(false);
            } catch (error) {
                toast.error('Failed to load questions');
                setLoading(false);
            }
        };

        loadQuestions();
    }, [grade]);

    const submitMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post('/quiz/submit', data);
            return response.data;
        },
        onSuccess: (data) => {
            toast.success('Quiz submitted successfully!');
            navigate(`/results/${data.data.result.id}`);
        },
        onError: () => {
            toast.error('Failed to submit quiz');
        }
    });

    const handleAnswer = (answerIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answerIndex;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = () => {
        if (answers.some(a => a === null)) {
            toast.warning('Please answer all questions before submitting');
            return;
        }

        const formattedAnswers = questions.map((q, i) => ({
            questionId: q.id,
            answer: answers[i],
            isCorrect: answers[i] === q.correctAnswer
        }));

        submitMutation.mutate({
            childId,
            grade,
            answers: formattedAnswers,
            timeSpent
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading quiz...</div>
            </div>
        );
    }

    if (!questions.length) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">No questions available</h2>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-sm text-gray-600">
                            Question {currentQuestion + 1} of {questions.length}
                        </div>
                        <div className="text-sm text-gray-600">
                            Time: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-4">
                    <h2 className="text-2xl font-semibold mb-6">{question.question}</h2>

                    <div className="space-y-3">
                        {question.options.map((option: string, index: number) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition ${answers[currentQuestion] === index
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <span className="font-semibold mr-2">
                                    {String.fromCharCode(65 + index)}.
                                </span>
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    {currentQuestion === questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitMutation.isPending}
                            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {submitMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Next
                        </button>
                    )}
                </div>

                {/* Question Palette */}
                <div className="bg-white rounded-lg shadow-md p-4 mt-4">
                    <h3 className="font-semibold mb-3">Question Palette</h3>
                    <div className="grid grid-cols-10 gap-2">
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestion(index)}
                                className={`w-10 h-10 rounded ${index === currentQuestion
                                        ? 'bg-blue-600 text-white'
                                        : answers[index] !== null
                                            ? 'bg-green-100 text-green-700 border border-green-300'
                                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
