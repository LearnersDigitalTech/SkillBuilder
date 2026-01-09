"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/app/homepage/Header';
import Footer from '@/components/Footer/Footer.component';
import { ArrowLeft, UploadCloud, CheckCircle2, FileSpreadsheet, Loader2, Trash2, FileText, Sparkles, Edit2, Save, X, Upload, Image as ImageIcon, XCircle, Plus, FolderOpen, ToggleLeft, ToggleRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import * as XLSX from 'xlsx';
import { saveNeetQuestions, getNeetQuestions, deleteNeetQuestion, clearNeetQuestions, updateNeetQuestion, saveQuestionsToChapter, getChapterQuestions, deleteChapterQuestion } from '@/services/neetQuestionService';
import { getChapters, createChapter, updateChapter, toggleChapterPractice, updateChapterQuestionCount, deleteChapter } from '@/services/chapterService';
import { toast } from 'react-toastify';
import QuestionPreviewModal from '@/components/QuestionPreviewModal';
import QuizBuilderModal from '@/components/QuizBuilderModal';
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
    const [uploadMode, setUploadMode] = useState('ai'); // 'excel' or 'ai' - default to AI
    const [previewQuestions, setPreviewQuestions] = useState(null);
    const [aiProgress, setAiProgress] = useState('');

    // Chapter management state
    const [chapters, setChapters] = useState([]);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [showCreateChapter, setShowCreateChapter] = useState(false);
    const [newChapterName, setNewChapterName] = useState('');
    const [creatingChapter, setCreatingChapter] = useState(false);
    const [loadingChapters, setLoadingChapters] = useState(false);

    // Edit state for Recently Uploaded questions
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [savingEdit, setSavingEdit] = useState(false);

    // Quiz Builder state
    const [showQuizBuilder, setShowQuizBuilder] = useState(false);

    // Redirect if not authorized
    useEffect(() => {
        if (!loading) {
            if (!isTeacher || !userData?.neetUploadEnabled) {
                router.replace('/teacher-dashboard');
                toast.error("You don't have permission to access this page.");
            }
        }
    }, [loading, isTeacher, userData, router]);

    // Fetch chapters when subject changes
    const fetchChapters = useCallback(async (subject) => {
        setLoadingChapters(true);
        const data = await getChapters(subject);
        setChapters(data);
        setLoadingChapters(false);
        setSelectedChapter(null); // Reset chapter selection
    }, []);

    // Fetch questions - now supports both legacy and chapter-based
    const fetchQuestions = useCallback(async (subject, chapterId = null) => {
        setLoadingQuestions(true);
        let data;
        if (chapterId) {
            data = await getChapterQuestions(subject, chapterId);
        } else {
            data = await getNeetQuestions(subject);
        }
        setQuestions(data);
        setLoadingQuestions(false);
    }, []);

    const handleDeleteQuestion = async (id) => {
        if (!selectedSubject) return;
        if (confirm("Are you sure you want to delete this question?")) {
            let success;
            if (selectedChapter) {
                success = await deleteChapterQuestion(selectedSubject.id, selectedChapter.id, id);
                if (success) {
                    await updateChapterQuestionCount(selectedSubject.id, selectedChapter.id, -1);
                }
            } else {
                success = await deleteNeetQuestion(selectedSubject.id, id);
            }
            if (success) {
                toast.success("Question deleted");
                fetchQuestions(selectedSubject.id, selectedChapter?.id);
                if (selectedChapter) fetchChapters(selectedSubject.id);
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

    // Fetch chapters and questions when subject changes
    useEffect(() => {
        if (selectedSubject) {
            fetchChapters(selectedSubject.id);
            // Don't fetch questions here - wait for chapter selection
            setQuestions([]); // Clear questions until chapter is selected
        }
    }, [selectedSubject, fetchChapters]);

    // Fetch questions when chapter changes
    useEffect(() => {
        if (selectedSubject && selectedChapter) {
            fetchQuestions(selectedSubject.id, selectedChapter.id);
        }
    }, [selectedChapter, selectedSubject, fetchQuestions]);

    // Handle chapter creation
    const handleCreateChapter = async () => {
        if (!newChapterName.trim() || !selectedSubject) return;
        setCreatingChapter(true);
        const result = await createChapter(selectedSubject.id, newChapterName.trim(), user.uid);
        if (result.success) {
            toast.success(`Chapter "${newChapterName}" created!`);
            fetchChapters(selectedSubject.id);
            setShowCreateChapter(false);
            setNewChapterName('');
        } else {
            toast.error('Failed to create chapter');
        }
        setCreatingChapter(false);
    };

    // Handle chapter selection
    const handleSelectChapter = (chapter) => {
        setSelectedChapter(chapter);
    };

    // Handle practice toggle
    const handleTogglePractice = async (chapter) => {
        const newState = !chapter.practiceEnabled;
        const success = await toggleChapterPractice(selectedSubject.id, chapter.id, newState);
        if (success) {
            toast.success(`Practice ${newState ? 'enabled' : 'disabled'} for ${chapter.name}`);
            fetchChapters(selectedSubject.id);
        }
    };

    // Handle chapter deletion
    const handleDeleteChapter = async (chapter) => {
        if (!confirm(`Delete chapter "${chapter.name}"?\n\nThis will also delete all ${chapter.questionCount || 0} questions in this chapter. This cannot be undone.`)) {
            return;
        }
        const success = await deleteChapter(selectedSubject.id, chapter.id, true);
        if (success) {
            toast.success(`Chapter "${chapter.name}" deleted`);
            if (selectedChapter?.id === chapter.id) {
                setSelectedChapter(null);
                setQuestions([]);
            }
            fetchChapters(selectedSubject.id);
        } else {
            toast.error('Failed to delete chapter');
        }
    };

    // Start editing a question
    const handleStartEdit = (question) => {
        setEditingQuestionId(question.id);
        setEditForm({
            question: question.question || '',
            options: [...(question.options || ['', '', '', ''])],
            correctAnswer: question.correctAnswer || 'A',
            explanation: question.explanation || '',
            imageUrl: question.imageUrl || null
        });
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingQuestionId(null);
        setEditForm({});
    };

    // Save edited question
    const handleSaveEdit = async (questionId) => {
        if (!selectedSubject) return;
        setSavingEdit(true);
        try {
            const success = await updateNeetQuestion(selectedSubject.id, questionId, editForm);
            if (success) {
                toast.success('Question updated successfully');
                setEditingQuestionId(null);
                setEditForm({});
                fetchQuestions(selectedSubject.id);
            } else {
                toast.error('Failed to update question');
            }
        } catch (error) {
            console.error('Error updating question:', error);
            toast.error('Failed to update question');
        } finally {
            setSavingEdit(false);
        }
    };

    // Handle image upload for editing
    const handleEditImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            setEditForm(prev => ({ ...prev, imageUrl: e.target.result }));
        };
        reader.readAsDataURL(file);
    };

    // Handle image delete for editing
    const handleEditImageDelete = () => {
        setEditForm(prev => ({ ...prev, imageUrl: null }));
    };

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
        if (!selectedChapter) {
            toast.warning("Please select a chapter first");
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
        if (!selectedChapter) {
            toast.error("Please select a chapter first");
            return;
        }
        try {
            // Save to chapter
            const result = await saveQuestionsToChapter(
                selectedSubject.id,
                selectedChapter.id,
                editedQuestions,
                user.uid,
                'ai_document'
            );
            if (result.success) {
                // Update chapter question count
                await updateChapterQuestionCount(selectedSubject.id, selectedChapter.id, result.count);
                toast.success(`Successfully saved ${editedQuestions.length} questions to "${selectedChapter.name}"!`);
                setPreviewQuestions(null);
                fetchChapters(selectedSubject.id);
                fetchQuestions(selectedSubject.id, selectedChapter.id);
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

                        {/* Chapter Selection - NEW */}
                        {selectedSubject && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <FolderOpen size={16} />
                                        Chapters
                                    </h3>
                                    <button
                                        onClick={() => setShowCreateChapter(true)}
                                        className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                                        title="Create new chapter"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                {/* Create Chapter Modal */}
                                {showCreateChapter && (
                                    <div className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                                        <input
                                            type="text"
                                            value={newChapterName}
                                            onChange={(e) => setNewChapterName(e.target.value)}
                                            placeholder="Enter chapter name..."
                                            className="w-full p-3 border border-indigo-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            onKeyPress={(e) => e.key === 'Enter' && handleCreateChapter()}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleCreateChapter}
                                                disabled={creatingChapter || !newChapterName.trim()}
                                                className="flex-1 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {creatingChapter ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                                Create
                                            </button>
                                            <button
                                                onClick={() => { setShowCreateChapter(false); setNewChapterName(''); }}
                                                className="px-4 py-2 bg-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-300"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Chapter List */}
                                {loadingChapters ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 size={20} className="animate-spin text-indigo-600" />
                                    </div>
                                ) : chapters.length === 0 ? (
                                    <div className="text-center py-6 text-slate-400 text-sm">
                                        <FolderOpen size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>No chapters yet</p>
                                        <p className="text-xs mt-1">Create your first chapter to start uploading questions</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {chapters.map((chapter) => (
                                            <div
                                                key={chapter.id}
                                                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedChapter?.id === chapter.id
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                                                    }`}
                                                onClick={() => handleSelectChapter(chapter)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-bold text-sm truncate ${selectedChapter?.id === chapter.id ? 'text-indigo-700' : 'text-slate-700'
                                                            }`}>
                                                            {chapter.name}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {chapter.questionCount || 0} questions
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleTogglePractice(chapter);
                                                            }}
                                                            className={`p-1.5 rounded-lg transition-colors ${chapter.practiceEnabled
                                                                ? 'bg-emerald-100 text-emerald-600'
                                                                : 'bg-slate-100 text-slate-400'
                                                                }`}
                                                            title={chapter.practiceEnabled ? 'Practice enabled' : 'Practice disabled'}
                                                        >
                                                            {chapter.practiceEnabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteChapter(chapter);
                                                            }}
                                                            className="p-1.5 rounded-lg transition-colors bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                                                            title="Delete chapter"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

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
                                            <div className="text-xs text-slate-500">Word (.docx) with auto-extraction</div>
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

                        {/* AI Upload Instructions - Enhanced */}
                        {selectedSubject && uploadMode === 'ai' && (
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 max-h-[600px] overflow-y-auto">
                                <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-4 flex items-center gap-2 sticky top-0 bg-white py-2">
                                    <FileText size={16} />
                                    How to Format Your Document
                                </h3>

                                <div className="space-y-5 text-xs">
                                    {/* File Type */}
                                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                                        <p className="font-bold text-purple-700 text-sm">📄 Save as Word (.docx) only</p>
                                        <p className="text-purple-600 mt-1">PDF and older .doc formats are not supported</p>
                                    </div>

                                    {/* Example 1: Basic Question */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="bg-emerald-500 text-white px-3 py-2 font-bold text-xs">
                                            ✅ Example 1: Basic MCQ
                                        </div>
                                        <div className="p-3 bg-slate-50 font-mono text-[11px] space-y-1 text-slate-700">
                                            <p><strong>1.</strong> What is the atomic number of Carbon?</p>
                                            <p className="text-slate-500 pl-4">(A) 4</p>
                                            <p className="text-emerald-600 pl-4 font-bold">(B) 6 ← Correct</p>
                                            <p className="text-slate-500 pl-4">(C) 8</p>
                                            <p className="text-slate-500 pl-4">(D) 12</p>
                                        </div>
                                    </div>

                                    {/* Example 2: With Image */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="bg-blue-500 text-white px-3 py-2 font-bold text-xs">
                                            🖼️ Example 2: Question with Image
                                        </div>
                                        <div className="p-3 bg-slate-50 font-mono text-[11px] space-y-1 text-slate-700">
                                            <p><strong>2.</strong> Identify the structure shown below:</p>
                                            <div className="my-2 p-2 bg-white border border-dashed border-slate-300 rounded text-center text-slate-400">
                                                [Your Image Here]
                                            </div>
                                            <p className="text-slate-500 pl-4">(A) Benzene</p>
                                            <p className="text-slate-500 pl-4">(B) Toluene</p>
                                            <p className="text-emerald-600 pl-4 font-bold">(C) Phenol ← Correct</p>
                                            <p className="text-slate-500 pl-4">(D) Aniline</p>
                                        </div>
                                    </div>

                                    {/* Example 3: With Formula */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="bg-orange-500 text-white px-3 py-2 font-bold text-xs">
                                            🔬 Example 3: Chemical/Math Formula
                                        </div>
                                        <div className="p-3 bg-slate-50 font-mono text-[11px] space-y-1 text-slate-700">
                                            <p><strong>3.</strong> What is the product of CH₃COOH + NaOH?</p>
                                            <p className="text-slate-500 pl-4">(A) CH₃COONa + H₂</p>
                                            <p className="text-emerald-600 pl-4 font-bold">(B) CH₃COONa + H₂O ← Correct</p>
                                            <p className="text-slate-500 pl-4">(C) CH₄ + Na₂CO₃</p>
                                            <p className="text-slate-500 pl-4">(D) CO₂ + NaCl</p>
                                        </div>
                                    </div>

                                    {/* Step-by-step Guide */}
                                    <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200">
                                        <p className="font-bold text-indigo-700 mb-2">📝 Step-by-Step Writing:</p>
                                        <ol className="space-y-2 text-indigo-700">
                                            <li className="flex gap-2">
                                                <span className="bg-indigo-200 rounded-full w-5 h-5 flex items-center justify-center shrink-0 font-bold">1</span>
                                                <span>Start with question number (1, 2, 3...)</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="bg-indigo-200 rounded-full w-5 h-5 flex items-center justify-center shrink-0 font-bold">2</span>
                                                <span>Write your question text</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="bg-indigo-200 rounded-full w-5 h-5 flex items-center justify-center shrink-0 font-bold">3</span>
                                                <span>Add image below question (if needed)</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="bg-indigo-200 rounded-full w-5 h-5 flex items-center justify-center shrink-0 font-bold">4</span>
                                                <span>List 4 options as (A), (B), (C), (D)</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="bg-indigo-200 rounded-full w-5 h-5 flex items-center justify-center shrink-0 font-bold">5</span>
                                                <span>Mark correct answer clearly</span>
                                            </li>
                                        </ol>
                                    </div>

                                    {/* Common Mistakes */}
                                    <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                                        <p className="font-bold text-rose-700 mb-2">❌ Common Mistakes:</p>
                                        <ul className="space-y-1 text-rose-600">
                                            <li>• Saving as PDF instead of .docx</li>
                                            <li>• Missing question numbers</li>
                                            <li>• Placing image before question text</li>
                                            <li>• Using (1), (2) instead of (A), (B)</li>
                                            <li>• Not marking correct answer</li>
                                        </ul>
                                    </div>

                                    {/* Max Size */}
                                    <div className="p-3 bg-slate-100 rounded-xl text-center">
                                        <p className="text-slate-600">Max file size: <span className="font-bold text-slate-800">10MB</span></p>
                                        <p className="text-slate-500 mt-1">Tip: Compress images if file is too large</p>
                                    </div>

                                    {/* Download Sample */}
                                    <button
                                        onClick={() => {
                                            const sampleContent = `NEET Question Template - Sample Format
============================================

1. What is the atomic number of Carbon?
(A) 4
(B) 6 ← Correct Answer
(C) 8
(D) 12

Explanation: Carbon has 6 protons in its nucleus.

---

2. Identify the compound shown in the figure below:

[INSERT YOUR IMAGE HERE - paste an image of benzene structure]

(A) Methane
(B) Ethane
(C) Benzene ← Correct Answer
(D) Propane

Explanation: Benzene has a hexagonal ring structure with alternating double bonds.

---

3. What is the product of the following reaction?
CH₃COOH + NaOH → ?

(A) CH₃COONa + H₂
(B) CH₃COONa + H₂O ← Correct Answer
(C) CH₄ + Na₂CO₃
(D) CO₂ + NaCl

Explanation: This is a neutralization reaction between acetic acid and sodium hydroxide.

---

4. The kinetic energy of a particle is given by:
E = ½mv²

If the velocity is doubled, the kinetic energy becomes:
(A) Same
(B) Double
(C) Four times ← Correct Answer
(D) Eight times

Explanation: KE is proportional to v². If v → 2v, then KE → 4KE.

---

5. Match the following:
Column I          Column II
(a) Proton    → (p) 1.67 × 10⁻²⁷ kg
(b) Electron  → (q) 9.1 × 10⁻³¹ kg
(c) Neutron   → (r) 1.67 × 10⁻²⁷ kg

[INSERT TABLE IMAGE IF NEEDED]

(A) a-p, b-q, c-r ← Correct Answer
(B) a-q, b-p, c-r
(C) a-r, b-q, c-p
(D) a-p, b-r, c-q

---

IMPORTANT NOTES:
• Save this file as .docx (Word format)
• Number each question sequentially (1, 2, 3...)
• Use (A), (B), (C), (D) for options
• Mark correct answer clearly with "← Correct Answer" or highlight
• Insert images directly into Word after the question text
• Keep one question per section, separated by ---
• Write subscripts as: H₂O, CO₂, CH₄
• Write superscripts as: x², 10⁻³¹, V²⁺

============================================
End of Template`;
                                            const blob = new Blob([sampleContent], { type: 'text/plain' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = 'NEET_Question_Template.txt';
                                            a.click();
                                            URL.revokeObjectURL(url);
                                        }}
                                        className="w-full py-3 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <FileText size={16} />
                                        Download Sample Template
                                    </button>
                                </div>
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
                                            {selectedChapter ? (
                                                <p className="opacity-90 font-medium flex items-center gap-2">
                                                    <FolderOpen size={16} />
                                                    {selectedChapter.name}
                                                    {selectedChapter.practiceEnabled && (
                                                        <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">Practice</span>
                                                    )}
                                                </p>
                                            ) : (
                                                <p className="opacity-70 font-medium">← Select a chapter to upload</p>
                                            )}
                                        </div>
                                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30 text-center">
                                            <span className="block text-2xl font-black leading-none">{questions.length}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Questions</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="relative z-10 mt-6 flex justify-end gap-3">
                                        {chapters.some(c => c.questionCount > 0) && (
                                            <button
                                                onClick={() => setShowQuizBuilder(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-indigo-700 border border-white/30 rounded-xl text-xs font-bold transition-all shadow-sm"
                                            >
                                                <Sparkles size={14} />
                                                Create Quiz
                                            </button>
                                        )}
                                        {questions.length > 0 && (
                                            <button
                                                onClick={handleClearAll}
                                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-xs font-bold transition-all text-white backdrop-blur-md"
                                            >
                                                <Trash2 size={14} />
                                                Clear All
                                            </button>
                                        )}
                                    </div>
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
                                        accept={uploadMode === 'excel' ? '.xlsx, .xls, .csv' : '.docx'}
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
                                                {uploadMode === 'ai' ? 'Upload Word Document (.docx)' : 'Upload Excel File'}
                                            </h3>
                                            <p className="text-slate-500 text-sm max-w-sm">
                                                {uploadMode === 'ai'
                                                    ? 'AI will automatically extract questions, formulas, and images'
                                                    : 'Drag and drop your Excel/CSV file here or '}
                                                <span className="text-indigo-600 font-bold underline">browse files</span>
                                            </p>
                                            {uploadMode === 'ai' && (
                                                <div className="mt-4 text-xs text-slate-400">
                                                    Supports: Word (.docx) only • Max 10MB
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Questions List */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            {selectedChapter ? (
                                                <>
                                                    <FolderOpen size={18} className="text-indigo-500" />
                                                    {selectedChapter.name}
                                                    <span className="text-sm font-normal text-slate-400">
                                                        ({questions.length} questions)
                                                    </span>
                                                </>
                                            ) : (
                                                'Recently Uploaded'
                                            )}
                                            {loadingQuestions && <Loader2 size={16} className="animate-spin text-slate-400" />}
                                        </h2>
                                    </div>

                                    {!selectedChapter ? (
                                        <div className="bg-amber-50 rounded-2xl p-8 border border-amber-200 text-center">
                                            <FolderOpen size={48} className="mx-auto text-amber-400 mb-3" />
                                            <p className="text-amber-700 font-bold">Select a chapter first</p>
                                            <p className="text-amber-600 text-sm mt-1">Choose a chapter from the left sidebar to view or upload questions</p>
                                        </div>
                                    ) : questions.length === 0 && !loadingQuestions ? (
                                        <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400">
                                            <FileText size={48} className="mx-auto text-slate-200 mb-3" />
                                            <p className="font-bold text-slate-600">No questions in this chapter yet</p>
                                            <p className="text-sm mt-1">Upload a Word document above to add questions</p>
                                        </div>
                                    ) : (
                                        <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                            {questions.map((q, idx) => (
                                                <div key={q.id || idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-4 hover:border-indigo-200 transition-colors group">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600 font-bold shrink-0 border border-indigo-100">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            {editingQuestionId === q.id ? (
                                                                /* EDIT MODE */
                                                                <div className="space-y-4">
                                                                    {/* Question Text */}
                                                                    <div>
                                                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Question</label>
                                                                        <textarea
                                                                            value={editForm.question}
                                                                            onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                                                                            className="w-full p-3 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                            rows={3}
                                                                        />
                                                                    </div>

                                                                    {/* Options */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                        {['A', 'B', 'C', 'D'].map((letter, i) => (
                                                                            <div key={letter} className="flex items-center gap-2">
                                                                                <span className="font-bold text-slate-600">{letter}.</span>
                                                                                <input
                                                                                    type="text"
                                                                                    value={editForm.options?.[i] || ''}
                                                                                    onChange={(e) => {
                                                                                        const newOptions = [...(editForm.options || ['', '', '', ''])];
                                                                                        newOptions[i] = e.target.value;
                                                                                        setEditForm(prev => ({ ...prev, options: newOptions }));
                                                                                    }}
                                                                                    className="flex-1 p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                                    placeholder={`Option ${letter}`}
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    {/* Correct Answer */}
                                                                    <div className="flex items-center gap-4">
                                                                        <label className="text-xs font-bold text-slate-500">Correct Answer:</label>
                                                                        <select
                                                                            value={editForm.correctAnswer}
                                                                            onChange={(e) => setEditForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                                                                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                                                                        >
                                                                            <option value="A">A</option>
                                                                            <option value="B">B</option>
                                                                            <option value="C">C</option>
                                                                            <option value="D">D</option>
                                                                        </select>
                                                                    </div>

                                                                    {/* Explanation */}
                                                                    <div>
                                                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Explanation (optional)</label>
                                                                        <textarea
                                                                            value={editForm.explanation}
                                                                            onChange={(e) => setEditForm(prev => ({ ...prev, explanation: e.target.value }))}
                                                                            className="w-full p-3 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                            rows={2}
                                                                            placeholder="Enter explanation..."
                                                                        />
                                                                    </div>

                                                                    {/* Image Section - Edit Mode */}
                                                                    <div>
                                                                        <label className="text-xs font-bold text-slate-500 mb-2 block">Image</label>
                                                                        {editForm.imageUrl ? (
                                                                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <ImageIcon size={16} className="text-slate-500" />
                                                                                        <span className="text-xs font-medium text-slate-600">Attached Image</span>
                                                                                    </div>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={handleEditImageDelete}
                                                                                        className="flex items-center gap-1 px-2 py-1 text-xs text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                                                                    >
                                                                                        <XCircle size={14} />
                                                                                        <span>Remove</span>
                                                                                    </button>
                                                                                </div>
                                                                                <img src={editForm.imageUrl} alt="Question" className="max-w-xs rounded-lg border border-slate-200" />
                                                                            </div>
                                                                        ) : (
                                                                            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-colors">
                                                                                <Upload size={18} className="text-slate-400" />
                                                                                <span className="text-sm text-slate-500">Click to upload an image</span>
                                                                                <input
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    onChange={handleEditImageUpload}
                                                                                    className="hidden"
                                                                                />
                                                                            </label>
                                                                        )}
                                                                    </div>

                                                                    {/* Action Buttons */}
                                                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                                                        <button
                                                                            onClick={() => handleSaveEdit(q.id)}
                                                                            disabled={savingEdit}
                                                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                                                        >
                                                                            {savingEdit ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                                            <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={handleCancelEdit}
                                                                            disabled={savingEdit}
                                                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                                                                        >
                                                                            <X size={16} />
                                                                            <span>Cancel</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                /* VIEW MODE */
                                                                <>
                                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                                        <div className="flex-1">
                                                                            <KaTeXRenderer text={q.question} className="text-slate-800 font-bold" />
                                                                            {q.uploadMethod === 'ai_document' && (
                                                                                <span className="ml-2 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                                                                    AI
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={() => handleStartEdit(q)}
                                                                                className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-200 bg-indigo-50 shadow-sm"
                                                                                title="Edit Question"
                                                                            >
                                                                                <Edit2 size={18} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteQuestion(q.id)}
                                                                                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-xl transition-all border border-rose-200 bg-rose-50 shadow-sm"
                                                                                title="Delete Question"
                                                                            >
                                                                                <Trash2 size={18} />
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Image Display - View Mode */}
                                                                    {q.imageUrl && (
                                                                        <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <ImageIcon size={16} className="text-slate-500" />
                                                                                <span className="text-xs font-medium text-slate-600">Attached Image</span>
                                                                            </div>
                                                                            <img
                                                                                src={q.imageUrl}
                                                                                alt="Question diagram"
                                                                                className="max-w-sm rounded-lg border border-slate-200"
                                                                            />
                                                                        </div>
                                                                    )}

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
                                                                </>
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

            {/* Quiz Builder Modal */}
            <QuizBuilderModal
                isOpen={showQuizBuilder}
                onClose={() => setShowQuizBuilder(false)}
                subject={selectedSubject}
                chapters={chapters}
                teacherUid={user?.uid}
            />
        </div>
    );
};

export default NeetUploadPage;
