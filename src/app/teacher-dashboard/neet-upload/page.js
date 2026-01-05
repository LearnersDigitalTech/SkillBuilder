"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/app/homepage/Header';
import Footer from '@/components/Footer/Footer.component';
import { ArrowLeft, UploadCloud, CheckCircle2, FileSpreadsheet, Loader2, Trash2, FileText, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import * as XLSX from 'xlsx';
import { saveNeetQuestions, getNeetQuestions, deleteNeetQuestion, clearNeetQuestions } from '@/services/neetQuestionService';
import { toast } from 'react-toastify';
import QuestionPreviewModal from '@/components/QuestionPreviewModal';
import KaTeXRenderer from '@/components/KaTeXRenderer';

const SUBJECTS = [
    { id: 'physics', name: 'Physics', color: 'bg-blue-500', icon: '⚛️' },
    { id: 'chemistry', name: 'Chemistry', color: 'bg-emerald-500', icon: '🧪' },
    { id: 'biology', name: 'Biology', color: 'bg-rose-500', icon: '🧬' }
];

const NeetUploadPage = () => {
    const { user, userData, isTeacher, loading } = useAuth();
    const router = useRouter();
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadMode, setUploadMode] = useState('excel'); // 'excel' or 'ai'
    const [previewQuestions, setPreviewQuestions] = useState(null);
    const [aiProgress, setAiProgress] = useState('');

    // Redirect if not authorized
    useEffect(() => {
        if (!loading) {
            if (!isTeacher || !userData?.neetUploadEnabled) {
                router.replace('/teacher-dashboard');
                toast.error("You don't have permission to access this page.");
            }
        }
    }, [loading, isTeacher, userData, router]);

    const fetchQuestions = useCallback(async (subject) => {
        setLoadingQuestions(true);
        const data = await getNeetQuestions(subject);
        setQuestions(data);
        setLoadingQuestions(false);
    }, []);

    const handleDeleteQuestion = async (id) => {
        if (!selectedSubject) return;
        if (confirm("Are you sure you want to delete this question?")) {
            const success = await deleteNeetQuestion(selectedSubject.id, id);
            if (success) {
                toast.success("Question deleted");
                fetchQuestions(selectedSubject.id);
            } else {
                toast.error("Failed to delete question");
            }
        }
    };

    const handleClearAll = async () => {
        if (!selectedSubject) return;
        if (confirm(`Are you sure you want to delete ALL ${questions.length} questions for ${selectedSubject.name}? This cannot be undone.`)) {
            const success = await clearNeetQuestions(selectedSubject.id);
            if (success) {
                toast.success("All questions cleared");
                fetchQuestions(selectedSubject.id);
            } else {
                toast.error("Failed to clear questions");
            }
        }
    };

    useEffect(() => {
        if (selectedSubject) {
            fetchQuestions(selectedSubject.id);
        }
    }, [selectedSubject, fetchQuestions]);

    // Excel Upload Handler
    const handleExcelFile = async (file) => {
        if (!selectedSubject) {
            toast.warning("Please select a subject first");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                setUploading(true);
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    toast.error("The file is empty or invalid.");
                    setUploading(false);
                    return;
                }

                const formattedQuestions = jsonData.map((row, index) => {
                    const getVal = (keys) => {
                        const foundKey = Object.keys(row).find(k =>
                            keys.map(key => key.toLowerCase().replace(/\s/g, ''))
                                .includes(k.toLowerCase().replace(/\s/g, ''))
                        );
                        return foundKey ? row[foundKey] : null;
                    };

                    return {
                        no: getVal(['No', 'Question No', 'Number']) || index + 1,
                        question: getVal(['Question', 'Text', 'Q']) || "",
                        options: [
                            getVal(['A', 'Option A', 'Choice A']) || "",
                            getVal(['B', 'Option B', 'Choice B']) || "",
                            getVal(['C', 'Option C', 'Choice C']) || "",
                            getVal(['D', 'Option D', 'Choice D']) || ""
                        ],
                        correctAnswer: getVal(['Answer', 'Correct Answer', 'Correct', 'Ans']) || "",
                        explanation: getVal(['Explanation', 'Exp', 'Solution']) || "",
                        index: index
                    };
                }).filter(q => q.question && q.correctAnswer);

                if (formattedQuestions.length === 0) {
                    toast.error("No valid questions found. Please check the template.");
                    setUploading(false);
                    return;
                }

                const success = await saveNeetQuestions(selectedSubject.id, formattedQuestions, user.uid, 'excel');
                if (success) {
                    toast.success(`Successfully uploaded ${formattedQuestions.length} questions!`);
                    fetchQuestions(selectedSubject.id);
                } else {
                    toast.error("Failed to save questions to database.");
                }
            } catch (error) {
                console.error("Error parsing file:", error);
                toast.error("Error parsing Excel file. Make sure it's a valid XLSX file.");
            } finally {
                setUploading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // AI Document Upload Handler
    const handleAIDocumentFile = async (file) => {
        if (!selectedSubject) {
            toast.warning("Please select a subject first");
            return;
        }

        try {
            setUploading(true);
            setAiProgress('Uploading document...');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('subject', selectedSubject.id);

            setAiProgress('Extracting text and images...');
            const response = await fetch('/api/upload-document', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            setAiProgress('AI is analyzing questions...');
            const result = await response.json();

            if (result.success && result.questions) {
                setAiProgress('');
                setPreviewQuestions(result.questions);

                if (result.demoMode) {
                    toast.info(`🎭 DEMO MODE: Showing ${result.questions.length} sample questions. (Gemini API unavailable)`, {
                        duration: 5000
                    });
                } else {
                    toast.success(`Extracted ${result.questions.length} questions! Review and save.`);
                }
            } else {
                throw new Error('No questions extracted');
            }

        } catch (error) {
            console.error("Error processing document:", error);
            toast.error(error.message || "Failed to process document");
            setAiProgress('');
        } finally {
            setUploading(false);
        }
    };

    const handleFile = (file) => {
        if (uploadMode === 'excel') {
            handleExcelFile(file);
        } else {
            handleAIDocumentFile(file);
        }
    };

    const handleSaveAIQuestions = async (editedQuestions) => {
        try {
            const success = await saveNeetQuestions(selectedSubject.id, editedQuestions, user.uid, 'ai_document');
            if (success) {
                toast.success(`Successfully saved ${editedQuestions.length} questions!`);
                setPreviewQuestions(null);
                fetchQuestions(selectedSubject.id);
            } else {
                toast.error("Failed to save questions to database.");
            }
        } catch (error) {
            console.error("Error saving questions:", error);
            toast.error("Failed to save questions");
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const onDragLeave = () => {
        setDragActive(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6 transition-colors font-medium"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Dashboard</span>
                </button>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full lg:w-80 space-y-4">
                        {/* Subject Selection */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Select Subject</h2>
                            <div className="space-y-3">
                                {SUBJECTS.map((sub) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => setSelectedSubject(sub)}
                                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${selectedSubject?.id === sub.id
                                            ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                                            : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                                            }`}
                                    >
                                        <span className="text-2xl">{sub.icon}</span>
                                        <span className={`font-bold ${selectedSubject?.id === sub.id ? 'text-indigo-700' : 'text-slate-600'}`}>
                                            {sub.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Upload Mode Selection */}
                        {selectedSubject && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Upload Method</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setUploadMode('ai')}
                                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${uploadMode === 'ai'
                                            ? 'border-purple-500 bg-purple-50 shadow-sm'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <Sparkles size={20} className={uploadMode === 'ai' ? 'text-purple-600' : 'text-slate-400'} />
                                        <div className="text-left flex-1">
                                            <div className={`font-bold text-sm ${uploadMode === 'ai' ? 'text-purple-700' : 'text-slate-700'}`}>
                                                AI Document Upload
                                            </div>
                                            <div className="text-xs text-slate-500">PDF/Word with auto-extraction</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setUploadMode('excel')}
                                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${uploadMode === 'excel'
                                            ? 'border-green-500 bg-green-50 shadow-sm'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <FileSpreadsheet size={20} className={uploadMode === 'excel' ? 'text-green-600' : 'text-slate-400'} />
                                        <div className="text-left flex-1">
                                            <div className={`font-bold text-sm ${uploadMode === 'excel' ? 'text-green-700' : 'text-slate-700'}`}>
                                                Excel Upload
                                            </div>
                                            <div className="text-xs text-slate-500">Traditional template method</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Template Download */}
                        {selectedSubject && uploadMode === 'excel' && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Excel Template</h3>
                                <p className="text-xs text-slate-500 mb-4">
                                    Use columns: <span className="font-mono bg-slate-100 px-1">Question No</span>,
                                    <span className="font-mono bg-slate-100 px-1">Question</span>,
                                    <span className="font-mono bg-slate-100 px-1">Option A-D</span>,
                                    <span className="font-mono bg-slate-100 px-1">Correct Answer</span>,
                                    <span className="font-mono bg-slate-100 px-1">Explanation</span>
                                </p>
                                <button
                                    className="w-full py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition"
                                    onClick={() => {
                                        const ws = XLSX.utils.json_to_sheet([{ "Question No": 1, Question: "Sample Question?", "Option A": "Choice 1", "Option B": "Choice 2", "Option C": "Choice 3", "Option D": "Choice 4", "Correct Answer": "A", Explanation: "Why A is correct" }]);
                                        const wb = XLSX.utils.book_new();
                                        XLSX.utils.book_append_sheet(wb, ws, "Template");
                                        XLSX.writeFile(wb, `NEET_${selectedSubject.name}_Template.xlsx`);
                                    }}
                                >
                                    Download Template
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        {!selectedSubject ? (
                            <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-200 text-center">
                                <FileSpreadsheet size={64} className="mx-auto text-slate-200 mb-6" />
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">Subject Required</h2>
                                <p className="text-slate-500">Please select a subject from the left to start uploading questions.</p>
                            </div>
                        ) : (
                            <>
                                {/* Stats Header */}
                                <div className={`p-8 rounded-3xl shadow-sm border border-white relative overflow-hidden text-white ${selectedSubject.color}`}>
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <h1 className="text-3xl font-black mb-1">NEET {selectedSubject.name}</h1>
                                            <p className="opacity-90 font-medium">Question Management Portal</p>
                                        </div>
                                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30 text-center">
                                            <span className="block text-2xl font-black leading-none">{questions.length}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Questions</span>
                                        </div>
                                    </div>

                                    {questions.length > 0 && (
                                        <div className="relative z-10 mt-6 flex justify-end">
                                            <button
                                                onClick={handleClearAll}
                                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-xs font-bold transition-all text-white backdrop-blur-md"
                                            >
                                                <Trash2 size={14} />
                                                Clear All Questions
                                            </button>
                                        </div>
                                    )}
                                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                                </div>

                                {/* Upload Dropzone */}
                                <div
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                    className={`relative p-10 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${dragActive
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        accept={uploadMode === 'excel' ? '.xlsx, .xls, .csv' : '.pdf, .doc, .docx'}
                                        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={uploading}
                                    />
                                    {uploading ? (
                                        <div className="flex flex-col items-center">
                                            <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
                                            <p className="font-bold text-slate-700">
                                                {aiProgress || 'Processing File...'}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                                {uploadMode === 'ai' ? (
                                                    <Sparkles size={32} className="text-purple-500" />
                                                ) : (
                                                    <UploadCloud size={32} className="text-slate-400" />
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 mb-1">
                                                {uploadMode === 'ai' ? 'Upload PDF/Word Document' : 'Upload Excel File'}
                                            </h3>
                                            <p className="text-slate-500 text-sm max-w-sm">
                                                {uploadMode === 'ai'
                                                    ? 'AI will automatically extract questions, formulas, and images'
                                                    : 'Drag and drop your Excel/CSV file here or '}
                                                <span className="text-indigo-600 font-bold underline">browse files</span>
                                            </p>
                                            {uploadMode === 'ai' && (
                                                <div className="mt-4 text-xs text-slate-400">
                                                    Supports: PDF, Word (.doc, .docx) • Max 10MB
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Questions List */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            Recently Uploaded
                                            {loadingQuestions && <Loader2 size={16} className="animate-spin text-slate-400" />}
                                        </h2>
                                    </div>

                                    {questions.length === 0 && !loadingQuestions ? (
                                        <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400">
                                            No questions found for this subject.
                                        </div>
                                    ) : (
                                        <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                            {questions.map((q, idx) => (
                                                <div key={q.id || idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-4 hover:border-indigo-200 transition-colors group">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600 font-bold shrink-0 border border-indigo-100">
                                                            {q.no}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                                <div className="flex-1">
                                                                    <KaTeXRenderer text={q.question} className="text-slate-800 font-bold" />
                                                                    {q.uploadMethod === 'ai_document' && (
                                                                        <span className="ml-2 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                                                            AI
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleDeleteQuestion(q.id)}
                                                                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-xl transition-all border border-rose-200 bg-rose-50 shadow-sm"
                                                                    title="Delete Question"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                                                {q.options?.map((opt, i) => (
                                                                    <div key={i} className={`p-2 rounded-lg text-sm border ${String.fromCharCode(65 + i) === q.correctAnswer ? 'bg-emerald-50 border-emerald-100 text-emerald-700 font-medium' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                                                        <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                                                                        <KaTeXRenderer text={opt} />
                                                                        {String.fromCharCode(65 + i) === q.correctAnswer && <CheckCircle2 size={12} className="inline ml-2" />}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {q.explanation && (
                                                                <div className="text-xs p-3 bg-indigo-50 rounded-lg text-indigo-700 border border-indigo-100">
                                                                    <span className="font-bold">Explanation:</span> <KaTeXRenderer text={q.explanation} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer />

            {/* AI Preview Modal */}
            {previewQuestions && (
                <QuestionPreviewModal
                    questions={previewQuestions}
                    onClose={() => setPreviewQuestions(null)}
                    onSave={handleSaveAIQuestions}
                    subject={selectedSubject}
                />
            )}
        </div>
    );
};

export default NeetUploadPage;
