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
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Professional Background Layering */}
            <div className="absolute inset-0 z-0">
                {/* Brand Orange Glows */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#f05a28]/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#f05a28]/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '3s' }} />

                {/* Mesh Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.15]"
                    style={{
                        backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
                        backgroundSize: '30px 30px',
                        maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
                    }} />
            </div>

            <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center space-y-6">
                {/* Logo Section - More Integrated */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white px-8 py-5 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(240,90,40,0.3)] border border-white/20 transition-transform duration-500 hover:scale-105">
                        <img
                            src="/images/abacus-logo.png"
                            alt="AbacusInsights"
                            className="h-10 md:h-12 w-auto object-contain"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#f05a28]/10 border border-[#f05a28]/20 backdrop-blur-xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#f05a28] animate-ping" />
                        <span className="text-[9px] font-black text-[#f05a28] uppercase tracking-[0.3em]">Official Assessment Node</span>
                    </div>
                </div>

                {/* Main Card - Compact & Premium */}
                <div className="w-full bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden">
                    {!validatedData ? (
                        <div className="p-8 md:p-10">
                            <div className="flex flex-col items-center text-center space-y-2 mb-8">
                                <h2 className="text-2xl font-black text-white tracking-tight">Identity Access</h2>
                                <p className="text-slate-400 text-xs font-medium max-w-[280px]">
                                    Enter your unique security credential to unlock your assigned assessment session.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Candidate UID</label>
                                        <KeyRound size={12} className="text-[#f05a28]/50" />
                                    </div>
                                    <input
                                        type="text"
                                        value={uid}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setUid(val);
                                            setError('');
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleValidateUID()}
                                        placeholder="000000"
                                        className="w-full px-6 py-5 bg-black/40 border-2 border-slate-800 rounded-2xl text-[#f05a28] text-3xl font-mono tracking-[0.4em] placeholder:text-slate-800 focus:outline-none focus:border-[#f05a28]/40 focus:ring-8 focus:ring-[#f05a28]/5 transition-all text-center"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-3 text-red-400 text-[11px] font-bold bg-red-500/5 border border-red-500/10 p-4 rounded-xl animate-shake">
                                        <AlertCircle size={14} className="flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleValidateUID}
                                    disabled={loading || uid.length !== 6}
                                    className="w-full py-5 bg-gradient-to-br from-[#f05a28] to-[#ff8c00] text-white font-black rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(240,90,40,0.4)] uppercase tracking-widest text-xs"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Authenticating
                                        </>
                                    ) : (
                                        <>
                                            Unlock Assessment
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {/* Profile Header */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 border-b border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#f05a28]/5 rounded-full blur-2xl -mr-16 -mt-16" />
                                <span className="text-[10px] font-black text-[#f05a28] uppercase tracking-[0.4em] mb-2 block">Authorized Candidate</span>
                                <h2 className="text-3xl font-black text-white leading-none tracking-tight">{validatedData.student.name}</h2>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center text-center">
                                        <FileText size={14} className="text-[#f05a28] mb-2" />
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Module</p>
                                        <p className="text-white font-bold text-xs truncate w-full">{validatedData.assignedPaper?.name || validatedData.test.name}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center text-center">
                                        <Clock size={14} className="text-[#f05a28] mb-2" />
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Time</p>
                                        <p className="text-white font-bold text-xs">{validatedData.assignedPaper?.duration || validatedData.test.duration} MINS</p>
                                    </div>
                                </div>

                                {/* Modern Instructions */}
                                <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <ShieldCheck size={14} className="text-emerald-500" />
                                        <h4 className="font-black text-slate-300 text-[10px] uppercase tracking-widest">Protocol Sync</h4>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            "Auto-fullscreen enforcement",
                                            "Proctored environment active",
                                            "Tab persistence monitoring",
                                            "Cloud-sync auto-save active"
                                        ].map((text, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-4 h-[1px] bg-[#f05a28]/30" />
                                                <span className="text-[10px] text-slate-400 font-medium">{text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-2">
                                    <button
                                        onClick={handleStartExam}
                                        className="w-full py-5 bg-gradient-to-br from-[#f05a28] to-[#ff8c00] text-white font-black rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(240,90,40,0.4)] uppercase tracking-widest text-xs"
                                    >
                                        Initialize session
                                        <ArrowRight size={16} />
                                    </button>

                                    <button
                                        onClick={() => {
                                            setValidatedData(null);
                                            setUid('');
                                        }}
                                        className="text-[9px] font-black text-slate-600 hover:text-white transition-colors uppercase tracking-[0.3em] flex items-center justify-center gap-2"
                                    >
                                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                                        Swap Credential
                                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Powered By Section - Cleaner */}
                <div className="flex flex-col items-center space-y-4 pt-4 opacity-40 hover:opacity-100 transition-opacity duration-700">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em]">Powered by Technology from</span>
                    <div className="bg-white/95 px-5 py-3 rounded-2xl shadow-xl flex items-center justify-center group border border-white/20">
                        <img
                            src="/images/learners-logo.png"
                            alt="Learners"
                            className="h-8 w-auto object-contain transition-all duration-500"
                        />
                    </div>
                </div>

                {/* Quote Section */}
                <div className="text-center max-w-[320px] pt-4">
                    <p className="text-slate-600 italic text-[10px] leading-relaxed">"{quote.text}"</p>
                    <div className="h-px w-8 bg-slate-800 mx-auto my-3" />
                    <p className="text-slate-700 text-[8px] font-black uppercase tracking-[0.3em]">{quote.author}</p>
                </div>
            </div>
        </div>
    );
}
