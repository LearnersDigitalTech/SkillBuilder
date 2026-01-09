"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/app/homepage/Header';
import { Loader2, Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, FolderOpen, Send, RotateCcw, Trophy, Target, XCircle } from 'lucide-react';
import { getQuizByShareableId, incrementQuizAttempt } from '@/services/quizService';
import { getRandomChapterQuestions } from '@/services/neetQuestionService';
import KaTeXRenderer from '@/components/KaTeXRenderer';

/**
 * Shuffle array using Fisher-Yates algorithm
 */
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Shuffle options and return new correct answer
 */
const shuffleOptions = (question) => {
    const optionLetters = ['A', 'B', 'C', 'D'];
    const originalOptions = question.options || [
        question.optionA,
        question.optionB,
        question.optionC,
        question.optionD
    ];

    // Create indexed options
    const indexed = originalOptions.map((opt, i) => ({
        text: opt,
        originalIndex: i
    }));

    // Shuffle
    const shuffled = shuffleArray(indexed);

    // Find new correct answer position
    const originalCorrectIndex = optionLetters.indexOf(question.correctAnswer);
    const newCorrectIndex = shuffled.findIndex(opt => opt.originalIndex === originalCorrectIndex);

    return {
        ...question,
        options: shuffled.map(opt => opt.text),
        correctAnswer: optionLetters[newCorrectIndex],
        originalCorrectAnswer: question.correctAnswer
    };
};

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const shareableId = params?.id;

    // Quiz state
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Quiz progress state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [results, setResults] = useState(null);

    // Fetch quiz on mount
    useEffect(() => {
        const fetchQuiz = async () => {
            if (!shareableId) {
                setError('No quiz ID provided');
                setLoading(false);
                return;
            }

            try {
                const quizData = await getQuizByShareableId(shareableId);
                if (!quizData) {
                    setError('Quiz not found');
                    setLoading(false);
                    return;
                }

                if (quizData.status !== 'active') {
                    setError('This quiz is no longer active');
                    setLoading(false);
                    return;
                }

                setQuiz(quizData);
                setTimeLeft(quizData.timeMinutes * 60);

                // Fetch questions from each chapter
                const allQuestions = [];
                for (const chapter of quizData.chapters) {
                    const chapterQuestions = await getRandomChapterQuestions(
                        quizData.subject,
                        chapter.chapterId,
                        chapter.count
                    );
                    // Add chapter info to each question
                    chapterQuestions.forEach(q => {
                        q.chapterName = chapter.chapterName;
                    });
                    allQuestions.push(...chapterQuestions);
                }

                // Shuffle all questions
                const shuffledQuestions = shuffleArray(allQuestions);

                // Shuffle options for each question
                const finalQuestions = shuffledQuestions.map(q => shuffleOptions(q));

                setQuestions(finalQuestions);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching quiz:', err);
                setError('Failed to load quiz');
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [shareableId]);

    // Timer effect
    useEffect(() => {
        if (!quizStarted || quizSubmitted || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quizStarted, quizSubmitted, timeLeft]);

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle answer selection
    const handleAnswer = (letter) => {
        setAnswers(prev => ({
            ...prev,
            [currentIndex]: letter
        }));
    };

    // Navigate questions
    const goToQuestion = (index) => {
        if (index >= 0 && index < questions.length) {
            setCurrentIndex(index);
        }
    };

    // Start quiz
    const handleStart = async () => {
        setQuizStarted(true);
        await incrementQuizAttempt(quiz.id);
    };

    // Submit quiz
    const handleSubmit = useCallback(() => {
        if (quizSubmitted) return;

        setQuizSubmitted(true);

        // Calculate results
        let correct = 0;
        let incorrect = 0;
        let unanswered = 0;

        questions.forEach((q, idx) => {
            const userAnswer = answers[idx];
            if (!userAnswer) {
                unanswered++;
            } else if (userAnswer === q.correctAnswer) {
                correct++;
            } else {
                incorrect++;
            }
        });

        // NEET marking: +4 for correct, -1 for incorrect
        const score = (correct * 4) - (incorrect * 1);
        const maxScore = questions.length * 4;
        const percentage = Math.round((correct / questions.length) * 100);

        setResults({
            correct,
            incorrect,
            unanswered,
            score,
            maxScore,
            percentage,
            totalQuestions: questions.length
        });
    }, [quizSubmitted, questions, answers]);

    // Restart quiz
    const handleRestart = () => {
        setQuizStarted(false);
        setQuizSubmitted(false);
        setCurrentIndex(0);
        setAnswers({});
        setTimeLeft(quiz.timeMinutes * 60);
        setResults(null);

        // Re-shuffle questions and options
        const shuffledQuestions = shuffleArray(questions);
        const finalQuestions = shuffledQuestions.map(q => shuffleOptions(q));
        setQuestions(finalQuestions);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-indigo-50">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Loading quiz...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-rose-50">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center bg-white p-8 rounded-3xl shadow-lg max-w-md">
                        <AlertCircle size={64} className="text-rose-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Quiz Not Found</h2>
                        <p className="text-slate-600 mb-6">{error}</p>
                        <button
                            onClick={() => router.push('/neet')}
                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                        >
                            Go to NEET Practice
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Results screen
    if (quizSubmitted && results) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-emerald-50">
                <Header />
                <div className="flex-grow container mx-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                            {/* Result Header */}
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white text-center">
                                <Trophy size={64} className="mx-auto mb-4" />
                                <h1 className="text-3xl font-black mb-2">Quiz Complete!</h1>
                                <p className="opacity-90">{quiz.title}</p>
                            </div>

                            {/* Score */}
                            <div className="p-8 text-center border-b">
                                <div className="text-6xl font-black text-indigo-600 mb-2">
                                    {results.percentage}%
                                </div>
                                <p className="text-slate-600">
                                    Score: <span className="font-bold">{results.score}</span> / {results.maxScore}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 divide-x border-b">
                                <div className="p-6 text-center">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <CheckCircle className="text-emerald-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-emerald-600">{results.correct}</div>
                                    <div className="text-xs text-slate-500 uppercase font-bold">Correct</div>
                                </div>
                                <div className="p-6 text-center">
                                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <XCircle className="text-rose-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-rose-600">{results.incorrect}</div>
                                    <div className="text-xs text-slate-500 uppercase font-bold">Incorrect</div>
                                </div>
                                <div className="p-6 text-center">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Target className="text-slate-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-slate-600">{results.unanswered}</div>
                                    <div className="text-xs text-slate-500 uppercase font-bold">Skipped</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-6 flex gap-4">
                                <button
                                    onClick={() => setQuizSubmitted(false)}
                                    className="flex-1 py-4 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2"
                                >
                                    Review Answers
                                </button>
                                <button
                                    onClick={handleRestart}
                                    className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={18} />
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Start screen
    if (!quizStarted) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-indigo-50">
                <Header />
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white text-center">
                            <h1 className="text-3xl font-black mb-2">{quiz.title}</h1>
                            <p className="opacity-90">{quiz.subjectName}</p>
                        </div>

                        <div className="p-8">
                            {/* Quiz Info */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-indigo-50 p-4 rounded-xl text-center">
                                    <Target className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-indigo-700">{quiz.totalQuestions}</div>
                                    <div className="text-xs text-indigo-600 font-bold uppercase">Questions</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-xl text-center">
                                    <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-purple-700">{quiz.timeMinutes}</div>
                                    <div className="text-xs text-purple-600 font-bold uppercase">Minutes</div>
                                </div>
                            </div>

                            {/* Chapters */}
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Chapters Included</h3>
                                <div className="space-y-2">
                                    {quiz.chapters.map((ch, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <FolderOpen size={16} className="text-slate-400" />
                                                <span className="font-medium text-slate-700">{ch.chapterName}</span>
                                            </div>
                                            <span className="text-sm font-bold text-indigo-600">{ch.count} Q</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-amber-50 p-4 rounded-xl mb-8 text-sm text-amber-800">
                                <p className="font-bold mb-2">📋 Instructions:</p>
                                <ul className="space-y-1">
                                    <li>• +4 marks for correct answer</li>
                                    <li>• -1 mark for wrong answer</li>
                                    <li>• 0 marks for unanswered</li>
                                    <li>• Questions and options are randomized</li>
                                </ul>
                            </div>

                            <button
                                onClick={handleStart}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                            >
                                Start Quiz
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz taking screen
    const currentQuestion = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const isReviewMode = quizSubmitted === false && results !== null;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            {/* Fixed Header */}
            <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-bold text-slate-800">{quiz.title}</h1>
                            <p className="text-xs text-slate-500">{quiz.subjectName}</p>
                        </div>

                        {/* Timer */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${timeLeft < 60 ? 'bg-rose-100 text-rose-700' :
                                timeLeft < 300 ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-700'
                            }`}>
                            <Clock size={18} />
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow container mx-auto px-4 py-6">
                <div className="max-w-3xl mx-auto">
                    {/* Question Card */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                        {/* Question Header */}
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                                {currentIndex + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                        {currentQuestion.chapterName}
                                    </span>
                                </div>
                                <div className="text-lg text-slate-800">
                                    <KaTeXRenderer text={currentQuestion.question} />
                                </div>
                                {currentQuestion.imageUrl && (
                                    <img
                                        src={currentQuestion.imageUrl}
                                        alt="Question"
                                        className="mt-4 max-w-full rounded-xl border"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, idx) => {
                                const letter = ['A', 'B', 'C', 'D'][idx];
                                const isSelected = answers[currentIndex] === letter;
                                const isCorrect = letter === currentQuestion.correctAnswer;
                                const showResult = isReviewMode;

                                let optionClass = 'border-slate-200 bg-white hover:border-indigo-300';
                                if (isSelected && !showResult) {
                                    optionClass = 'border-indigo-500 bg-indigo-50';
                                }
                                if (showResult) {
                                    if (isCorrect) {
                                        optionClass = 'border-emerald-500 bg-emerald-50';
                                    } else if (isSelected && !isCorrect) {
                                        optionClass = 'border-rose-500 bg-rose-50';
                                    }
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => !showResult && handleAnswer(letter)}
                                        disabled={showResult}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${optionClass}`}
                                    >
                                        <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold shrink-0 ${isSelected
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {letter}
                                        </span>
                                        <span className="flex-1 text-slate-700">
                                            <KaTeXRenderer text={option} />
                                        </span>
                                        {showResult && isCorrect && (
                                            <CheckCircle className="text-emerald-600 shrink-0" />
                                        )}
                                        {showResult && isSelected && !isCorrect && (
                                            <XCircle className="text-rose-600 shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => goToQuestion(currentIndex - 1)}
                            disabled={currentIndex === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>

                        <span className="text-sm text-slate-500">
                            {currentIndex + 1} of {questions.length}
                        </span>

                        {currentIndex < questions.length - 1 ? (
                            <button
                                onClick={() => goToQuestion(currentIndex + 1)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                            >
                                Next
                                <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isReviewMode}
                                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50"
                            >
                                <Send size={18} />
                                Submit
                            </button>
                        )}
                    </div>

                    {/* Question Navigator */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-slate-700">Question Navigator</h3>
                            <span className="text-sm text-slate-500">
                                {answeredCount} / {questions.length} answered
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {questions.map((_, idx) => {
                                const isAnswered = answers[idx] !== undefined;
                                const isCurrent = idx === currentIndex;
                                const isCorrectInReview = isReviewMode && answers[idx] === questions[idx].correctAnswer;
                                const isWrongInReview = isReviewMode && answers[idx] && answers[idx] !== questions[idx].correctAnswer;

                                let btnClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                                if (isCurrent) {
                                    btnClass = 'bg-indigo-600 text-white ring-2 ring-indigo-300';
                                } else if (isCorrectInReview) {
                                    btnClass = 'bg-emerald-500 text-white';
                                } else if (isWrongInReview) {
                                    btnClass = 'bg-rose-500 text-white';
                                } else if (isAnswered) {
                                    btnClass = 'bg-indigo-100 text-indigo-700';
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => goToQuestion(idx)}
                                        className={`w-10 h-10 rounded-lg font-bold transition-all ${btnClass}`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
