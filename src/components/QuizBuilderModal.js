"use client";
import React, { useState, useEffect } from 'react';
import { X, Loader2, Plus, Minus, Clock, FileText, Link2, Copy, Check, Sparkles } from 'lucide-react';
import { createQuiz } from '@/services/quizService';
import { toast } from 'react-toastify';

/**
 * Quiz Builder Modal - Create custom quizzes from multiple chapters
 */
export default function QuizBuilderModal({
    isOpen,
    onClose,
    subject,
    chapters,
    teacherUid
}) {
    const [title, setTitle] = useState('');
    const [timeMinutes, setTimeMinutes] = useState(60);
    const [selectedChapters, setSelectedChapters] = useState({});
    const [creating, setCreating] = useState(false);
    const [createdQuiz, setCreatedQuiz] = useState(null);
    const [copied, setCopied] = useState(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setTimeMinutes(60);
            setSelectedChapters({});
            setCreatedQuiz(null);
        }
    }, [isOpen]);

    // Calculate totals
    const totalQuestions = Object.values(selectedChapters).reduce((sum, count) => sum + count, 0);
    const selectedChapterCount = Object.values(selectedChapters).filter(c => c > 0).length;

    // Handle chapter question count change
    const handleChapterCount = (chapterId, delta) => {
        const chapter = chapters.find(c => c.id === chapterId);
        const maxQuestions = chapter?.questionCount || 0;
        const current = selectedChapters[chapterId] || 0;
        const newValue = Math.max(0, Math.min(maxQuestions, current + delta));

        setSelectedChapters(prev => ({
            ...prev,
            [chapterId]: newValue
        }));
    };

    // Set specific count for a chapter
    const setChapterCount = (chapterId, value) => {
        const chapter = chapters.find(c => c.id === chapterId);
        const maxQuestions = chapter?.questionCount || 0;
        const numValue = parseInt(value) || 0;
        const clampedValue = Math.max(0, Math.min(maxQuestions, numValue));

        setSelectedChapters(prev => ({
            ...prev,
            [chapterId]: clampedValue
        }));
    };

    // Create the quiz
    const handleCreate = async () => {
        if (!title.trim()) {
            toast.warning('Please enter a quiz title');
            return;
        }
        if (totalQuestions === 0) {
            toast.warning('Please select at least one question');
            return;
        }
        if (timeMinutes < 5) {
            toast.warning('Minimum time is 5 minutes');
            return;
        }

        setCreating(true);

        // Build chapter selection array
        const chapterSelection = Object.entries(selectedChapters)
            .filter(([_, count]) => count > 0)
            .map(([chapterId, count]) => {
                const chapter = chapters.find(c => c.id === chapterId);
                return {
                    chapterId,
                    chapterName: chapter?.name || 'Unknown',
                    count
                };
            });

        const result = await createQuiz({
            subject: subject.id,
            subjectName: subject.name,
            title: title.trim(),
            chapters: chapterSelection,
            totalQuestions,
            timeMinutes,
            type: 'overall',
            createdBy: teacherUid
        });

        if (result.success) {
            setCreatedQuiz({
                quizCode: result.quizCode,
                shareableId: result.shareableId,
                shareableUrl: `${window.location.origin}/quiz/${result.shareableId}`
            });
            toast.success('Quiz created successfully!');
        } else {
            toast.error('Failed to create quiz');
        }

        setCreating(false);
    };

    // Copy to clipboard
    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
            toast.success('Copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <div className="flex items-center gap-3">
                        <Sparkles size={24} />
                        <div>
                            <h2 className="text-xl font-bold">Create Quiz</h2>
                            <p className="text-sm opacity-80">{subject?.name} • Select chapters and set question count</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {!createdQuiz ? (
                    <>
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Quiz Title */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Quiz Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Unit Test 1 - Organic Chemistry"
                                    className="w-full p-4 border-2 border-slate-200 rounded-xl text-lg font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                />
                            </div>

                            {/* Time Limit */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Clock size={16} />
                                    Time Limit (minutes)
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={timeMinutes}
                                        onChange={(e) => setTimeMinutes(Math.max(5, parseInt(e.target.value) || 5))}
                                        min={5}
                                        max={240}
                                        className="w-24 p-3 border-2 border-slate-200 rounded-xl text-center text-lg font-bold focus:border-indigo-500"
                                    />
                                    <div className="flex gap-2">
                                        {[30, 45, 60, 90, 120].map(mins => (
                                            <button
                                                key={mins}
                                                onClick={() => setTimeMinutes(mins)}
                                                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${timeMinutes === mins
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {mins}m
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Chapter Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <FileText size={16} />
                                    Select Chapters & Question Count
                                </label>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto border border-slate-200 rounded-xl p-3">
                                    {chapters.length === 0 ? (
                                        <p className="text-center text-slate-400 py-4">No chapters available</p>
                                    ) : (
                                        chapters.map(chapter => (
                                            <div
                                                key={chapter.id}
                                                className={`p-4 rounded-xl border-2 transition-all ${(selectedChapters[chapter.id] || 0) > 0
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-slate-200 bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-bold text-slate-800">{chapter.name}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {chapter.questionCount || 0} questions available
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleChapterCount(chapter.id, -5)}
                                                            className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center font-bold"
                                                            disabled={!chapter.questionCount}
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            value={selectedChapters[chapter.id] || 0}
                                                            onChange={(e) => setChapterCount(chapter.id, e.target.value)}
                                                            className="w-16 p-2 border border-slate-300 rounded-lg text-center font-bold"
                                                            min={0}
                                                            max={chapter.questionCount || 0}
                                                            disabled={!chapter.questionCount}
                                                        />
                                                        <button
                                                            onClick={() => handleChapterCount(chapter.id, 5)}
                                                            className="w-8 h-8 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center font-bold"
                                                            disabled={!chapter.questionCount}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-indigo-600">{totalQuestions}</p>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Questions</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-purple-600">{selectedChapterCount}</p>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Chapters</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-emerald-600">{timeMinutes}</p>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Minutes</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 px-6 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={creating || totalQuestions === 0 || !title.trim()}
                                    className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={18} />
                                            Create Quiz
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Success State - Show Quiz Details */
                    <div className="flex-1 p-8 text-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={40} className="text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Quiz Created!</h3>
                        <p className="text-slate-500 mb-8">Share the code or link with your students</p>

                        {/* Quiz Code */}
                        <div className="bg-indigo-50 p-6 rounded-2xl mb-4">
                            <p className="text-sm font-bold text-indigo-600 uppercase mb-2">Quiz Code</p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-4xl font-black text-indigo-700 tracking-widest">
                                    {createdQuiz.quizCode}
                                </span>
                                <button
                                    onClick={() => copyToClipboard(createdQuiz.quizCode, 'code')}
                                    className={`p-2 rounded-lg transition-all ${copied === 'code'
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-indigo-200 text-indigo-700 hover:bg-indigo-300'
                                        }`}
                                >
                                    {copied === 'code' ? <Check size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Shareable Link */}
                        <div className="bg-purple-50 p-6 rounded-2xl mb-8">
                            <p className="text-sm font-bold text-purple-600 uppercase mb-2 flex items-center justify-center gap-2">
                                <Link2 size={16} />
                                Shareable Link
                            </p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={createdQuiz.shareableUrl}
                                    readOnly
                                    className="flex-1 p-3 bg-white border border-purple-200 rounded-xl text-sm text-purple-700 font-mono"
                                />
                                <button
                                    onClick={() => copyToClipboard(createdQuiz.shareableUrl, 'link')}
                                    className={`p-3 rounded-xl transition-all ${copied === 'link'
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-purple-200 text-purple-700 hover:bg-purple-300'
                                        }`}
                                >
                                    {copied === 'link' ? <Check size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
