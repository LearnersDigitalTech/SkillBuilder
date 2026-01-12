"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
    Loader2, ChevronLeft, ChevronRight, Flag, Clock,
    CheckCircle2, AlertTriangle, Send
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
    getQuestions, createSession, updateSessionAnswers,
    completeSession, logSessionViolation, validateStudentUID,
    getStudentSession
} from '@/services/abacusTestService';
import { SecureTestEnvironment } from '@/components/Security';
import RichText from '@/components/RichText/RichText';
import QuestionRenderer from '@/components/AbacusInsights/QuestionRenderer';
import CameraProctor from '@/components/AbacusInsights/CameraProctor';

// Seeded random number generator (Mulberry32)
function mulberry32(seed) {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// Simple hash function for seeding
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// Fisher-Yates shuffle with seed
function seededShuffle(array, seed) {
    const random = mulberry32(seed);
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Inspiring quotes for completion screen
const COMPLETION_QUOTES = [
    { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Your limitation—it's only your imagination.", author: "Unknown" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
    { text: "Great things never come from comfort zones.", author: "Unknown" },
    { text: "Dream it. Wish it. Do it.", author: "Unknown" },
    { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
    { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" }
];

export default function AbacusExamPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const testId = params.testId;

    // States
    const [loading, setLoading] = useState(true);
    const [examData, setExamData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState(new Set());
    const [sessionId, setSessionId] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [examCompleted, setExamCompleted] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [completionQuote, setCompletionQuote] = useState(null);
    const hasInitialized = useRef(false);
    const answersRef = useRef({}); // Ref to track latest answers for auto-save callbacks

    // Set a random quote after mount to avoid hydration mismatch
    useEffect(() => {
        setCompletionQuote(COMPLETION_QUOTES[Math.floor(Math.random() * COMPLETION_QUOTES.length)]);
    }, []);

    // Initialize exam
    useEffect(() => {
        const initExam = async () => {
            if (hasInitialized.current) return;
            hasInitialized.current = true;

            try {
                // Check for existing active session in localStorage first (Recovery)
                const sessionData = localStorage.getItem('abacus_exam_session');
                const pendingData = localStorage.getItem('abacus_pending_exam');

                let sessionToRecover = null;
                let pending = null;

                if (sessionData) {
                    const parsed = JSON.parse(sessionData);
                    if (parsed.testId === testId && parsed.status === 'in-progress') {
                        sessionToRecover = parsed;
                    }
                }

                if (pendingData) {
                    pending = JSON.parse(pendingData);
                }

                if (!sessionToRecover && (!pending || pending.testId !== testId)) {
                    toast.error('Session expired. Please login again.');
                    router.push('/abacusinsights/test');
                    return;
                }

                const studentUid = sessionToRecover?.uid || pending?.uid;
                if (!studentUid) {
                    toast.error('Student identification lost. Please login again.');
                    router.push('/abacusinsights/test');
                    return;
                }

                // Validate UID and get test/paper details
                const validation = await validateStudentUID(studentUid);
                if (!validation.valid) {
                    toast.error(validation.error || 'Session invalid');
                    localStorage.removeItem('abacus_pending_exam');
                    localStorage.removeItem('abacus_exam_session');
                    router.push('/abacusinsights/test');
                    return;
                }

                // Get the assigned paper details
                const paperId = sessionToRecover?.assignedPaperId || pending?.assignedPaperId || validation.assignedPaperId || testId;
                const assignedPaper = validation.assignedPaper || validation.test;
                const paperName = pending?.assignedPaperName || assignedPaper.name;
                const paperDuration = pending?.duration || assignedPaper.duration || 60;
                const shuffleEnabled = pending?.shuffleQuestions ?? assignedPaper.shuffleQuestions;
                const practicalRandomCount = assignedPaper.practicalRandomCount;

                // Get questions from the ASSIGNED PAPER
                const questionsData = await getQuestions(paperId);
                if (questionsData.length === 0) {
                    toast.error('No questions found for your assigned paper');
                    router.push('/abacusinsights/test');
                    return;
                }

                // Create session first to get a stable session (ideally we should check for existing)
                // For now, we'll continue with the current flow of creating new ones on start

                // Shuffle logic
                const seed = hashCode(studentUid + paperId);

                // Separate MCQs and Practical
                const mcqs = questionsData.filter(q => q.type !== 'coding' && q.type !== 'sql');
                const practicals = questionsData.filter(q => q.type === 'coding' || q.type === 'sql');

                // Check for existing session in database
                const existingSession = await getStudentSession(testId, studentUid);
                let currentSessionId = null;
                let currentAssignedQuestionIds = null;
                let assignedAnswers = {};
                let finalPracticalSet = [];

                if (existingSession) {
                    currentSessionId = existingSession.id;
                    currentAssignedQuestionIds = existingSession.assignedQuestions;
                    assignedAnswers = existingSession.answers || {};
                    setAnswers(assignedAnswers);

                    // If resuming, filter questions by the ones originally assigned
                    if (currentAssignedQuestionIds) {
                        finalPracticalSet = practicals.filter(q => currentAssignedQuestionIds.includes(q.id));
                    } else {
                        finalPracticalSet = practicals;
                    }
                } else {
                    // New Session: Handle Randomization
                    finalPracticalSet = practicals;
                    if (practicalRandomCount && practicalRandomCount < practicals.length) {
                        // Pick N random practical questions using a stable seed
                        const shuffledPracticals = seededShuffle(practicals, seed);
                        finalPracticalSet = shuffledPracticals.slice(0, practicalRandomCount);
                    }

                    // Create new session with the assigned questions (list of IDs)
                    currentSessionId = await createSession(testId, studentUid, {
                        name: pending?.studentName || validation.student.name,
                        assignedPaper: paperId,
                        assignedQuestions: finalPracticalSet.map(q => q.id)
                    });
                    currentAssignedQuestionIds = finalPracticalSet.map(q => q.id);
                }

                if (!currentSessionId) {
                    toast.error('Failed to start exam session');
                    router.push('/abacusinsights/test');
                    return;
                }

                // Combine back: Admin might want MCQs first then Practical, or all shuffled
                const combinedQuestions = [...mcqs, ...finalPracticalSet];

                // Final shuffle of the combined set if enabled
                const shuffledQuestions = shuffleEnabled !== false
                    ? seededShuffle(combinedQuestions, seed)
                    : combinedQuestions;

                // Shuffle options for each question
                const questionsWithShuffledOptions = shuffledQuestions.map((q, idx) => {
                    const optionSeed = hashCode(studentUid + q.id);
                    if (q.type === 'coding' || q.type === 'sql' || !q.options) {
                        return { ...q, displayNumber: idx + 1 };
                    }

                    const originalOptions = q.options.map((opt, i) => ({
                        text: opt,
                        originalIndex: i
                    }));
                    const shuffledOptions = seededShuffle(originalOptions, optionSeed);

                    // Map correct answer to new position
                    const correctOriginalIndex = q.correctAnswer.charCodeAt(0) - 65;
                    const newCorrectIndex = shuffledOptions.findIndex(opt => opt.originalIndex === correctOriginalIndex);

                    return {
                        ...q,
                        displayNumber: idx + 1,
                        shuffledOptions,
                        shuffledCorrectAnswer: String.fromCharCode(65 + newCorrectIndex)
                    };
                });

                setQuestions(questionsWithShuffledOptions);
                setExamData({
                    test: { ...validation.test, name: paperName }, // Use paper name for display
                    student: validation.student,
                    uid: studentUid,
                    assignedPaperId: paperId
                });
                setSessionId(currentSessionId);

                // Calculate remaining time based on session start time
                let remainingSeconds = paperDuration * 60;
                if (existingSession && existingSession.startTime) {
                    const startTime = new Date(existingSession.startTime);
                    const now = new Date();
                    const elapsedSeconds = Math.floor((now - startTime) / 1000);
                    remainingSeconds = Math.max(0, (paperDuration * 60) - elapsedSeconds);
                }
                setTimeRemaining(remainingSeconds);

                // Save session for recovery (Include UID for reconnection)
                localStorage.setItem('abacus_exam_session', JSON.stringify({
                    sessionId: currentSessionId,
                    testId,
                    uid: studentUid,
                    assignedPaperId: paperId,
                    status: 'in-progress'
                }));

                // Clear pending data (Only once successfully initialized)
                if (pendingData) {
                    localStorage.removeItem('abacus_pending_exam');
                }
                setLoading(false);

            } catch (error) {
                console.error('Error initializing exam:', error);
                toast.error('Failed to load exam');
                router.push('/abacusinsights/test');
            }
        };

        initExam();
    }, [testId, router]);

    // Timer
    useEffect(() => {
        if (timeRemaining === null || examCompleted) return;

        if (timeRemaining <= 0) {
            handleAutoSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, examCompleted]);

    // Sync ref with state
    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    // Auto-save answers periodically and on page leave
    useEffect(() => {
        if (!sessionId) return;

        // Decoupled timer: Saves every 5 seconds regardless of typing activity
        const saveInterval = setInterval(() => {
            const currentAnswers = answersRef.current;
            if (Object.keys(currentAnswers).length > 0) {
                updateSessionAnswers(sessionId, currentAnswers);
            }
        }, 5000);

        // Emergency save on refresh/close
        const handleBeforeUnload = () => {
            const currentAnswers = answersRef.current;
            if (Object.keys(currentAnswers).length > 0) {
                // Note: fetch with keepalive or synchronous XHR would be better for reliability,
                // but updateSessionAnswers (Firebase update) is usually fast enough to fire.
                updateSessionAnswers(sessionId, currentAnswers);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(saveInterval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [sessionId]);

    // Format time
    const formatTime = useCallback((seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Handle answer selection
    const handleAnswerSelect = useCallback((questionId, selectedShuffledLetter) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) return;

        let finalValue = selectedShuffledLetter;

        // If it's an MCQ with shuffled options, map back to original letter
        if (question.shuffledOptions && (selectedShuffledLetter?.length === 1)) {
            const shuffledIndex = selectedShuffledLetter.charCodeAt(0) - 65;
            const originalIndex = question.shuffledOptions[shuffledIndex]?.originalIndex;
            if (originalIndex !== undefined) {
                finalValue = String.fromCharCode(65 + originalIndex);
            }
        }

        setAnswers(prev => {
            const newAnswers = {
                ...prev,
                [questionId]: finalValue
            };

            // Immediate save for MCQ selections
            if (question.type !== 'coding' && question.type !== 'sql') {
                updateSessionAnswers(sessionId, newAnswers);
            }

            return newAnswers;
        });
    }, [questions, sessionId]);

    // Handle mark for review
    const handleMarkForReview = useCallback((questionId) => {
        setMarkedForReview(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    }, []);

    // Navigate to question
    const goToQuestion = useCallback((index) => {
        if (index >= 0 && index < questions.length) {
            setCurrentIndex(index);
        }
    }, [questions.length]);

    // Navigation functions
    const nextQuestion = () => goToQuestion(currentIndex + 1);
    const prevQuestion = () => goToQuestion(currentIndex - 1);

    // Submit exam
    const handleSubmit = async (autoSubmitted = false) => {
        if (submitting) return;
        setSubmitting(true);

        try {
            await completeSession(sessionId, {
                answers,
                autoSubmitted
            });

            // Clear session storage
            localStorage.removeItem('abacus_exam_session');

            setExamCompleted(true);
            setShowConfirmSubmit(false);
        } catch (error) {
            console.error('Error submitting exam:', error);
            toast.error('Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAutoSubmit = () => {
        handleSubmit(true);
    };

    // Log security violation
    const handleViolation = useCallback((type, count) => {
        if (sessionId) {
            logSessionViolation(sessionId, {
                type,
                count,
                details: `${type} violation #${count}`
            });
        }
    }, [sessionId]);

    // Current question
    const currentQuestion = questions[currentIndex];

    // Stats
    const stats = useMemo(() => {
        const answered = Object.keys(answers).length;
        const unanswered = questions.length - answered;
        const reviewed = markedForReview.size;
        return { answered, unanswered, reviewed };
    }, [answers, questions.length, markedForReview.size]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-indigo-500 mx-auto mb-4" />
                    <p className="text-white text-lg">Preparing your exam...</p>
                    <p className="text-slate-400 text-sm mt-2">Please wait while we set up your secure environment</p>
                </div>
            </div>
        );
    }

    // Exam completed state
    if (examCompleted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 flex items-center justify-center p-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 text-center max-w-lg">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                        <CheckCircle2 size={48} className="text-white" />
                    </div>

                    <h1 className="text-3xl font-black text-white mb-4">
                        Thank You for Attending!
                    </h1>

                    <p className="text-emerald-200/80 mb-8">
                        Your exam has been submitted successfully. We appreciate your dedication and effort.
                    </p>

                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 mb-8">
                        <p className="text-xl text-white italic mb-3">
                            "{completionQuote.text}"
                        </p>
                        <p className="text-emerald-300/60 text-sm">
                            — {completionQuote.author}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-emerald-200/60 text-sm">
                            You may now close this window or
                        </p>
                        <button
                            onClick={() => {
                                localStorage.removeItem('abacus_exam_session');
                                router.push('/abacusinsights/test');
                            }}
                            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition border border-white/20"
                        >
                            Return to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <SecureTestEnvironment
            testName={examData?.test?.name || "AbacusInsights Exam"}
            testType="abacus-test"
            testId={testId}
            maxTabSwitches={4}
            enableFullscreen={true}
            enableRightClickBlock={true}
            enableTabSwitchDetection={true}
            enableScreenshotDetection={true}
            onViolation={handleViolation}
            onAutoSubmit={handleAutoSubmit}
        >
            <div className="min-h-screen bg-slate-100 flex flex-col">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="font-bold text-slate-800">{examData?.test?.name}</h1>
                            <p className="text-xs text-slate-500">{examData?.student?.name}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Stats */}
                            <div className="hidden sm:flex items-center gap-4 text-xs">
                                <span className="text-emerald-600 font-medium">
                                    ✓ {stats.answered} Answered
                                </span>
                                <span className="text-slate-400">
                                    ○ {stats.unanswered} Remaining
                                </span>
                                {stats.reviewed > 0 && (
                                    <span className="text-amber-600 font-medium">
                                        ⚑ {stats.reviewed} Marked
                                    </span>
                                )}
                            </div>

                            {/* Timer */}
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold ${timeRemaining < 300 ? 'bg-red-100 text-red-600 animate-pulse' :
                                timeRemaining < 600 ? 'bg-amber-100 text-amber-600' :
                                    'bg-slate-100 text-slate-700'
                                }`}>
                                <Clock size={16} />
                                {formatTime(timeRemaining)}
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={() => setShowConfirmSubmit(true)}
                                className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
                            >
                                <Send size={16} />
                                <span className="hidden sm:inline">Submit</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex flex-col lg:flex-row h-0 min-h-0 bg-slate-100/50">
                    {/* Question Area */}
                    <main className={`flex-1 overflow-hidden flex flex-col`}>
                        <div className={`flex-1 flex flex-col lg:flex-row h-full ${(currentQuestion?.type === 'coding' || currentQuestion?.type === 'sql') ? 'p-4 lg:p-6 gap-6' : 'p-4 lg:p-8 overflow-y-auto'}`}>

                            <div className={`flex-1 flex flex-col ${currentQuestion?.type === 'coding' || currentQuestion?.type === 'sql' ? 'bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden' : ''}`}>
                                {/* Part Indicator & Question Content */}
                                <div className={`flex-1 flex flex-col ${currentQuestion?.type === 'coding' || currentQuestion?.type === 'sql' ? 'overflow-y-auto p-6 lg:p-8 custom-scrollbar' : ''}`}>
                                    <div className="mb-6 flex items-center justify-between">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${currentQuestion?.type === 'coding' || currentQuestion?.type === 'sql'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-indigo-100 text-indigo-700'
                                            }`}>
                                            {currentQuestion?.type === 'coding' || currentQuestion?.type === 'sql' ? 'Part 2: Practical' : 'Part 1: MCQ'}
                                        </span>
                                        {currentQuestion?.type === 'coding' && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Execution Environment: Standard Node.js / Python</span>}
                                    </div>

                                    <div className="flex-1">
                                        {currentQuestion && (
                                            <QuestionRenderer
                                                question={currentQuestion}
                                                answer={answers[currentQuestion.id]}
                                                onChange={handleAnswerSelect}
                                                hideInput={currentQuestion?.type === 'coding' || currentQuestion?.type === 'sql'}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Navigation Footer for MCQ (Inside the scroll area) */}
                                {!(currentQuestion?.type === 'coding' || currentQuestion?.type === 'sql') && (
                                    <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between pb-8">
                                        <button
                                            onClick={prevQuestion}
                                            disabled={currentIndex === 0}
                                            className="px-6 py-2 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-white transition disabled:opacity-30 flex items-center gap-2"
                                        >
                                            <ChevronLeft size={20} />
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handleMarkForReview(currentQuestion.id)}
                                            className={`px-6 py-2 rounded-xl font-medium transition flex items-center gap-2 ${markedForReview.has(currentQuestion.id) ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'border border-slate-200 text-slate-600 hover:bg-white'}`}
                                        >
                                            <Flag size={18} />
                                            {markedForReview.has(currentQuestion.id) ? 'Marked' : 'Mark for Review'}
                                        </button>
                                        <button
                                            onClick={currentIndex === questions.length - 1 ? () => setShowConfirmSubmit(true) : nextQuestion}
                                            className={`px-8 py-2 font-black rounded-xl transition shadow-lg flex items-center gap-2 ${currentIndex === questions.length - 1 ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                                        >
                                            {currentIndex === questions.length - 1 ? 'Finish Test' : 'Next Question'}
                                            {currentIndex === questions.length - 1 ? <Send size={18} /> : <ChevronRight size={20} />}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Coding Input (Independent Scroll) */}
                            {(currentQuestion?.type === 'coding' || currentQuestion?.type === 'sql') && (
                                <div className="lg:w-3/5 flex flex-col h-full gap-4">
                                    <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex gap-1.5">
                                                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-inner"></div>
                                                    <div className="w-3 h-3 rounded-full bg-amber-400 shadow-inner"></div>
                                                    <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-inner"></div>
                                                </div>
                                                <span className="ml-4 font-mono text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                    {currentQuestion.type === 'sql' ? 'DATABASE_QUERY.SQL' : 'MAIN_SOLUTION.JS'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                Auto-saving
                                            </div>
                                        </div>
                                        <textarea
                                            value={answers[currentQuestion.id] || ""}
                                            onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                                            spellCheck={false}
                                            placeholder={currentQuestion.type === 'sql' ? "-- START TYPING YOUR SQL HERE..." : "// START CODING YOUR SOLUTION HERE..."}
                                            className="flex-1 p-8 font-mono text-sm resize-none focus:outline-none bg-slate-50/20 leading-relaxed text-slate-700"
                                        />
                                        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex justify-between items-center uppercase tracking-widest">
                                            <span>Ready for submission</span>
                                            <span>Characters: {(answers[currentQuestion.id] || "").length}</span>
                                        </div>
                                    </div>

                                    {/* Split View Navigation Controls */}
                                    <div className="flex items-center justify-between pb-2">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={prevQuestion}
                                                disabled={currentIndex === 0}
                                                className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition disabled:opacity-30 shadow-sm flex items-center gap-2 text-sm"
                                            >
                                                <ChevronLeft size={18} />
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => handleMarkForReview(currentQuestion.id)}
                                                className={`px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2 text-sm shadow-sm ${markedForReview.has(currentQuestion.id) ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white border border-slate-200 text-slate-600'}`}
                                            >
                                                <Flag size={16} />
                                                Mark
                                            </button>
                                        </div>
                                        <button
                                            onClick={currentIndex === questions.length - 1 ? () => setShowConfirmSubmit(true) : nextQuestion}
                                            className={`px-10 py-2.5 text-white font-black rounded-xl transition shadow-lg flex items-center gap-2 text-sm ${currentIndex === questions.length - 1 ? 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700' : 'bg-slate-800 hover:bg-slate-900'}`}
                                        >
                                            {currentIndex === questions.length - 1 ? 'Finish Practical' : 'Continue'}
                                            {currentIndex === questions.length - 1 ? <Send size={18} /> : <ChevronRight size={18} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>

                    {/* Question Palette */}
                    <aside className="w-full lg:w-72 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-4 overflow-y-auto flex flex-col">
                        <div className="flex-1">
                            {/* Part 1 Palette */}
                            <div className="mb-6">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Part 1: Objectives</h3>
                                <div className="grid grid-cols-8 lg:grid-cols-5 gap-2">
                                    {questions.filter(q => q.type !== 'coding' && q.type !== 'sql').map((q) => {
                                        const idx = questions.indexOf(q);
                                        const isAnswered = answers[q.id] !== undefined && answers[q.id] !== "";
                                        const isMarked = markedForReview.has(q.id);
                                        const isCurrent = idx === currentIndex;

                                        return (
                                            <button
                                                key={q.id}
                                                onClick={() => goToQuestion(idx)}
                                                className={`w-10 h-10 rounded-lg text-xs font-bold transition ${isCurrent
                                                    ? 'ring-2 ring-indigo-600 ring-offset-2'
                                                    : ''
                                                    } ${isMarked
                                                        ? 'bg-amber-100 text-amber-700 border-2 border-amber-400 shadow-sm'
                                                        : isAnswered
                                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100'
                                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {idx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Part 2 Palette (Conditional) */}
                            {questions.some(q => q.type === 'coding' || q.type === 'sql') && (
                                <div className="mb-6">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Part 2: Practical</h3>
                                    <div className="grid grid-cols-8 lg:grid-cols-5 gap-2">
                                        {questions.filter(q => q.type === 'coding' || q.type === 'sql').map((q) => {
                                            const idx = questions.indexOf(q);
                                            const isAnswered = answers[q.id] !== undefined && answers[q.id] !== "";
                                            const isMarked = markedForReview.has(q.id);
                                            const isCurrent = idx === currentIndex;

                                            return (
                                                <button
                                                    key={q.id}
                                                    onClick={() => goToQuestion(idx)}
                                                    className={`w-10 h-10 rounded-lg text-xs font-bold transition ${isCurrent
                                                        ? 'ring-2 ring-purple-600 ring-offset-2'
                                                        : ''
                                                        } ${isMarked
                                                            ? 'bg-amber-100 text-amber-700 border-2 border-amber-400 shadow-sm'
                                                            : isAnswered
                                                                ? 'bg-purple-500 text-white shadow-md shadow-purple-100'
                                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Legend */}
                        <div className="space-y-2 mt-auto pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                                <span>MCQ Resolved</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded bg-purple-500"></span>
                                <span>Practical Done</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded bg-slate-100 shadow-inner"></span>
                                <span>Pending</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400"></span>
                                <span>Review Later</span>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Camera Proctoring (Now Optional via Admin) */}
                {examData?.test?.cameraEnabled !== false && (
                    <CameraProctor
                        sessionId={sessionId}
                        onViolation={handleViolation}
                    />
                )}

                {/* Submit Confirmation Modal */}
                {showConfirmSubmit && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="text-amber-500" size={24} />
                                <h3 className="text-lg font-bold text-slate-800">Submit Exam?</h3>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-emerald-600">{stats.answered}</p>
                                        <p className="text-xs text-slate-500">Answered</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-400">{stats.unanswered}</p>
                                        <p className="text-xs text-slate-500">Unanswered</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-amber-500">{stats.reviewed}</p>
                                        <p className="text-xs text-slate-500">Marked</p>
                                    </div>
                                </div>
                            </div>

                            {stats.unanswered > 0 && (
                                <p className="text-amber-600 text-sm mb-4">
                                    ⚠️ You have {stats.unanswered} unanswered question{stats.unanswered > 1 ? 's' : ''}.
                                </p>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmSubmit(false)}
                                    className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                                >
                                    Review Again
                                </button>
                                <button
                                    onClick={() => handleSubmit(false)}
                                    disabled={submitting}
                                    className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Send size={16} />
                                    )}
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SecureTestEnvironment>
    );
}
