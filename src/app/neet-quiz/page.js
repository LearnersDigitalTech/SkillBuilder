"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/homepage/Header';
import { Loader2, KeyRound, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { getQuizByCode } from '@/services/quizService';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function NeetQuizEntryPage() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code.trim() || code.length < 6) {
            toast.warning('Please enter a valid 6-character quiz code');
            return;
        }

        setLoading(true);
        try {
            const quiz = await getQuizByCode(code.trim().toUpperCase());
            if (quiz) {
                router.push(`/neet-quiz/${quiz.shareableId}`);
            } else {
                toast.error('Quiz not found. Please check the code and try again.');
            }
        } catch (error) {
            console.error('Error finding quiz:', error);
            toast.error('Failed to find quiz');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <Header />
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Hero Section */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Sparkles size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 mb-2">NEET Quiz</h1>
                        <p className="text-slate-600">Enter the quiz code provided by your teacher</p>
                    </div>

                    {/* Code Entry Card */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                                    <KeyRound size={16} />
                                    Quiz Code
                                </label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                                    placeholder="XXXXXX"
                                    maxLength={6}
                                    className="w-full p-4 text-center text-3xl font-mono font-bold tracking-[0.5em] border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all uppercase"
                                    disabled={loading}
                                />
                                <p className="text-sm text-slate-400 mt-2 text-center">
                                    Enter the 6-character code
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || code.length < 6}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        Finding Quiz...
                                    </>
                                ) : (
                                    <>
                                        Start Quiz
                                        <ArrowRight size={24} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Alternative Options */}
                    <div className="text-center">
                        <p className="text-slate-500 mb-4">Or practice without a code</p>
                        <Link
                            href="/neet"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                        >
                            <BookOpen size={18} />
                            NEET Practice
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
