"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, KeyRound, ArrowRight, ShieldCheck, Clock, FileText, AlertCircle } from 'lucide-react';
import { validateStudentUID } from '@/services/abacusTestService';
import { toast } from 'react-toastify';

// Inspiring quotes for the landing page
const QUOTES = [
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Education is the passport to the future.", author: "Malcolm X" }
];

export default function AbacusTestLoginPage() {
    const router = useRouter();
    const [uid, setUid] = useState('');
    const [loading, setLoading] = useState(false);
    const [validatedData, setValidatedData] = useState(null);
    const [error, setError] = useState('');
    const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    // Check for existing session
    useEffect(() => {
        const savedSession = localStorage.getItem('abacus_exam_session');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                // If session exists and not completed, redirect to exam
                if (session.sessionId && session.status === 'in-progress') {
                    router.push(`/abacusinsights/test/${session.testId}?session=${session.sessionId}`);
                }
            } catch (e) {
                localStorage.removeItem('abacus_exam_session');
            }
        }
    }, [router]);

    const handleValidateUID = async () => {
        if (uid.length !== 6) {
            setError('Please enter a valid 6-digit UID');
            return;
        }

        setLoading(true);
        setError('');
        setValidatedData(null);

        const result = await validateStudentUID(uid);
        setLoading(false);

        if (result.valid) {
            setValidatedData(result);
        } else {
            setError(result.error || 'Invalid UID');
        }
    };

    const handleStartExam = () => {
        if (!validatedData) return;

        // Save session info to localStorage for recovery
        // Use assigned paper ID for fetching questions, not registration test
        localStorage.setItem('abacus_pending_exam', JSON.stringify({
            uid,
            testId: validatedData.testId,
            testName: validatedData.test.name,
            studentName: validatedData.student.name,
            assignedPaperId: validatedData.assignedPaperId,
            assignedPaperName: validatedData.assignedPaper?.name || validatedData.test.name,
            duration: validatedData.assignedPaper?.duration || validatedData.test.duration,
            shuffleQuestions: validatedData.assignedPaper?.shuffleQuestions ?? validatedData.test.shuffleQuestions
        }));

        router.push(`/abacusinsights/test/${validatedData.testId}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">AbacusInsights</h1>
                    <p className="text-indigo-200/80">Secure Exam Portal</p>
                </div>

                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                    {!validatedData ? (
                        // Login Form
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-white mb-2">Enter Your UID</h2>
                            <p className="text-indigo-200/60 text-sm mb-6">
                                Enter the 6-digit unique ID provided to you
                            </p>

                            <div className="space-y-4">
                                <div className="relative">
                                    <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" />
                                    <input
                                        type="text"
                                        value={uid}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setUid(val);
                                            setError('');
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleValidateUID()}
                                        placeholder="Enter 6-digit UID"
                                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg font-mono tracking-widest placeholder:text-indigo-300/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleValidateUID}
                                    disabled={loading || uid.length !== 6}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            Verify UID
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Test Info & Start
                        <div>
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
                                <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                                    <ShieldCheck size={16} />
                                    UID Verified Successfully
                                </div>
                                <h2 className="text-2xl font-black text-white">{validatedData.student.name}</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <FileText size={18} className="text-indigo-400" />
                                        <div>
                                            <p className="text-xs text-indigo-300/60">Assigned Paper</p>
                                            <p className="text-white font-bold">{validatedData.assignedPaper?.name || validatedData.test.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock size={18} className="text-indigo-400" />
                                        <div>
                                            <p className="text-xs text-indigo-300/60">Duration</p>
                                            <p className="text-white font-bold">{validatedData.assignedPaper?.duration || validatedData.test.duration} Minutes</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Notice */}
                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                                    <h4 className="font-bold text-amber-400 text-sm mb-2">⚠️ Important Notice</h4>
                                    <ul className="text-xs text-amber-200/80 space-y-1">
                                        <li>• The exam will run in fullscreen mode</li>
                                        <li>• Do not switch tabs or windows</li>
                                        <li>• 4 tab switches = automatic submission</li>
                                        <li>• Copy/paste is disabled</li>
                                    </ul>
                                </div>

                                <button
                                    onClick={handleStartExam}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
                                >
                                    Start Exam
                                    <ArrowRight size={20} />
                                </button>

                                <button
                                    onClick={() => {
                                        setValidatedData(null);
                                        setUid('');
                                    }}
                                    className="w-full py-2 text-indigo-300/60 hover:text-white text-sm transition"
                                >
                                    Use Different UID
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quote */}
                <div className="mt-8 text-center">
                    <p className="text-indigo-200/60 italic text-sm">"{quote.text}"</p>
                    <p className="text-indigo-300/40 text-xs mt-1">— {quote.author}</p>
                </div>
            </div>
        </div>
    );
}
