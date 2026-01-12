"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/app/homepage/Header';
import Footer from '@/components/Footer/Footer.component';
import RichText from '@/components/RichText/RichText';
import {
    ArrowLeft, Plus, Upload, Users, FileText, Trash2, Download,
    CheckCircle2, AlertCircle, Loader2, Settings, Eye, EyeOff,
    Clock, Hash, Copy, RefreshCw, Search, Edit3, X, Save, ChevronDown,
    Code2, FileCode, FileImage
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import * as XLSX from 'xlsx-js-style';
import { toast } from 'react-toastify';
import {
    createTest, getTests, updateTest, deleteTest,
    saveQuestions, getQuestions, deleteQuestion, clearQuestions,
    generateStudentUIDs, getStudents, deleteStudent, getTestSessions,
    updateSessionGrades, updateQuestion
} from '@/services/abacusTestService';


const TABS = [
    { id: 'tests', name: 'Tests', icon: FileText },
    { id: 'questions', name: 'Questions', icon: Upload },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'results', name: 'Results', icon: CheckCircle2 }
];

export default function AbacusAdminPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('tests');

    // Tests state
    const [tests, setTests] = useState([]);
    const [loadingTests, setLoadingTests] = useState(false);
    const [showCreateTest, setShowCreateTest] = useState(false);
    const [newTestName, setNewTestName] = useState('');
    const [newTestDuration, setNewTestDuration] = useState(60);
    const [newTestShuffle, setNewTestShuffle] = useState(true);
    const [newTestCamera, setNewTestCamera] = useState(true);
    const [newTestPracticalCount, setNewTestPracticalCount] = useState(''); // Empty means all
    const [creatingTest, setCreatingTest] = useState(false);
    const [editingTest, setEditingTest] = useState(null);

    // Questions state
    const [selectedTest, setSelectedTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Question Preview/Edit Modal state
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewQuestions, setPreviewQuestions] = useState([]);
    const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
    const [savingQuestions, setSavingQuestions] = useState(false);

    // Students state
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [generatingUIDs, setGeneratingUIDs] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [studentUploadDragActive, setStudentUploadDragActive] = useState(false);
    const [previewStudents, setPreviewStudents] = useState([]); // Students parsed from Excel
    const [showStudentPreview, setShowStudentPreview] = useState(false);
    const [showManualPracticalModal, setShowManualPracticalModal] = useState(false);
    const [manualPracticalData, setManualPracticalData] = useState({
        type: 'coding',
        question: '',
        explanation: '',
        isHtml: false,
        imageUrl: ''
    });
    const [savingManual, setSavingManual] = useState(false);
    const [selectedPapersForAssignment, setSelectedPapersForAssignment] = useState([]); // Papers selected for random assignment
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [showManualMCQModal, setShowManualMCQModal] = useState(false);
    const [manualMCQData, setManualMCQData] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 'A',
        explanation: '',
        imageUrl: ''
    });

    // Results state
    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [selectedResultSession, setSelectedResultSession] = useState(null); // For modal view
    const [testQuestionsMap, setTestQuestionsMap] = useState({}); // { testId: questionsArray }

    // Image upload ref
    const imageInputRef = useRef(null);
    const [uploadingImageFor, setUploadingImageFor] = useState(null);

    // Check authorization
    useEffect(() => {
        if (!loading) {
            if (!userData?.abacusAdmin) {
                router.replace('/');
                toast.error("You don't have permission to access AbacusInsights Admin.");
            }
        }
    }, [loading, userData, router]);

    // Fetch tests
    const fetchTests = useCallback(async () => {
        setLoadingTests(true);
        const data = await getTests();
        setTests(data);
        setLoadingTests(false);
    }, []);

    useEffect(() => {
        if (userData?.abacusAdmin) {
            fetchTests();
        }
    }, [userData, fetchTests]);

    // Fetch questions when test selected
    const fetchQuestions = useCallback(async (testId) => {
        setLoadingQuestions(true);
        const data = await getQuestions(testId);
        setQuestions(data);
        setLoadingQuestions(false);
    }, []);

    useEffect(() => {
        if (selectedTest) {
            fetchQuestions(selectedTest.id);
            fetchStudents(selectedTest.id);
            fetchSessions(selectedTest.id);
        }
    }, [selectedTest, fetchQuestions]);

    // Fetch students
    const fetchStudents = async (testId) => {
        setLoadingStudents(true);
        const data = await getStudents(testId);
        setStudents(data);
        setLoadingStudents(false);
    };

    // Fetch sessions
    const fetchSessions = async (testId) => {
        setLoadingSessions(true);
        const data = await getTestSessions(testId);
        setSessions(data);

        // Enhance: Fetch all questions for all unique assigned papers in sessions
        const uniquePaperIds = [...new Set(data.map(s => s.assignedPaper || testId))];
        const qMap = { ...testQuestionsMap };

        await Promise.all(uniquePaperIds.map(async (pId) => {
            if (!qMap[pId]) {
                const qs = await getQuestions(pId);
                qMap[pId] = qs;
            }
        }));

        setTestQuestionsMap(qMap);
        setLoadingSessions(false);
    };

    // Create test handler
    const handleCreateTest = async () => {
        if (!newTestName.trim()) {
            toast.warning('Please enter a test name');
            return;
        }
        setCreatingTest(true);

        if (editingTest) {
            const success = await updateTest(editingTest.id, {
                name: newTestName,
                duration: parseInt(newTestDuration),
                shuffleQuestions: newTestShuffle,
                cameraEnabled: newTestCamera,
                practicalRandomCount: newTestPracticalCount ? parseInt(newTestPracticalCount) : null
            });

            if (success) {
                toast.success('Test updated successfully!');
                setShowCreateTest(false);
                setEditingTest(null);
                setNewTestName('');
                setNewTestDuration(60);
                setNewTestPracticalCount('');
                fetchTests();
            } else {
                toast.error('Failed to update test');
            }
        } else {
            const testId = await createTest({
                name: newTestName,
                duration: parseInt(newTestDuration),
                shuffleQuestions: newTestShuffle,
                cameraEnabled: newTestCamera,
                practicalRandomCount: newTestPracticalCount ? parseInt(newTestPracticalCount) : null
            }, user.uid);

            if (testId) {
                toast.success('Test created successfully!');
                setShowCreateTest(false);
                setNewTestName('');
                setNewTestDuration(60);
                setNewTestPracticalCount('');
                fetchTests();
            } else {
                toast.error('Failed to create test');
            }
        }
        setCreatingTest(false);
    };

    // Handle Edit Test
    const handleEditTest = (test) => {
        setEditingTest(test);
        setNewTestName(test.name);
        setNewTestDuration(test.duration);
        setNewTestShuffle(test.shuffleQuestions);
        setNewTestCamera(test.cameraEnabled);
        setNewTestPracticalCount(test.practicalRandomCount || '');
        setShowCreateTest(true);
    };

    // Toggle test active status
    const handleToggleTest = async (test) => {
        const success = await updateTest(test.id, { isActive: !test.isActive });
        if (success) {
            toast.success(`Test ${test.isActive ? 'deactivated' : 'activated'}`);
            fetchTests();
        }
    };

    // Delete test handler
    const handleDeleteTest = async (test) => {
        if (confirm(`Delete "${test.name}"? This will also delete all questions and student data.`)) {
            const success = await deleteTest(test.id);
            if (success) {
                toast.success('Test deleted');
                if (selectedTest?.id === test.id) {
                    setSelectedTest(null);
                    setQuestions([]);
                    setStudents([]);
                }
                fetchTests();
            } else {
                toast.error('Failed to delete test');
            }
        }
    };

    // Handle file upload - Now shows preview instead of direct save
    const handleFile = async (file, defaultType = 'mcq') => {
        if (!selectedTest) {
            toast.warning('Please select a test first');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                setUploading(true);
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {
                    type: 'array',
                    cellImages: false, // Disable image processing to avoid Image constructor errors
                    cellStyles: false  // Also disable styles for better performance
                });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    toast.error('The file is empty or invalid.');
                    setUploading(false);
                    return;
                }

                // Parse and validate questions
                const formattedQuestions = jsonData.map((row, index) => {
                    const getVal = (keys) => {
                        const foundKey = Object.keys(row).find(k =>
                            keys.map(key => key.toLowerCase().replace(/\s/g, ''))
                                .includes(k.toLowerCase().replace(/\s/g, ''))
                        );
                        return foundKey ? row[foundKey] : null;
                    };

                    const questionText = getVal(['Question', 'Text', 'Q']) || '';
                    const isHtml = questionText.trim().startsWith('<') && questionText.trim().endsWith('>');

                    return {
                        no: getVal(['No', 'Question No', 'Number', 'S.No', 'SNo']) || index + 1,
                        question: questionText,
                        isHtml: isHtml,
                        options: [
                            getVal(['A', 'Option A', 'Choice A']) || '',
                            getVal(['B', 'Option B', 'Choice B']) || '',
                            getVal(['C', 'Option C', 'Choice C']) || '',
                            getVal(['D', 'Option D', 'Choice D']) || ''
                        ],
                        correctAnswer: (getVal(['Answer', 'Correct Answer', 'Correct', 'Ans']) || '').toString().toUpperCase(),
                        type: (getVal(['Type', 'Question Type', 'Category']) || defaultType).toString().toLowerCase(),
                        explanation: getVal(['Explanation', 'Exp', 'Solution']) || '',
                        imageUrl: '' // New field for images
                    };
                }).filter(q => q.question && (q.correctAnswer || q.type === 'coding' || q.type === 'sql'));

                if (formattedQuestions.length === 0) {
                    toast.error('No valid questions found. Check the template.');
                    setUploading(false);
                    return;
                }

                // Show preview modal instead of saving directly
                setPreviewQuestions(formattedQuestions);
                setShowPreviewModal(true);
                setUploading(false);

            } catch (error) {
                console.error('Error parsing file:', error);
                toast.error('Error parsing file. Ensure it\'s a valid Excel/CSV file.');
                setUploading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // Save previewed questions
    const handleSavePreviewedQuestions = async () => {
        if (previewQuestions.length === 0) return;

        setSavingQuestions(true);
        const success = await saveQuestions(selectedTest.id, previewQuestions, user.uid);
        if (success) {
            toast.success(`Uploaded ${previewQuestions.length} questions!`);
            setShowPreviewModal(false);
            setPreviewQuestions([]);
            fetchQuestions(selectedTest.id);
            fetchTests();
        } else {
            toast.error('Failed to save questions');
        }
        setSavingQuestions(false);
    };

    // Update a previewed question
    const updatePreviewQuestion = (index, field, value) => {
        setPreviewQuestions(prev => prev.map((q, i) => {
            if (i === index) {
                if (field.startsWith('option_')) {
                    const optionIndex = parseInt(field.split('_')[1]);
                    const newOptions = [...q.options];
                    newOptions[optionIndex] = value;
                    return { ...q, options: newOptions };
                }
                return { ...q, [field]: value };
            }
            return q;
        }));
    };

    // Delete a previewed question
    const deletePreviewQuestion = (index) => {
        setPreviewQuestions(prev => prev.filter((_, i) => i !== index));
    };

    // Handle image upload for question
    const handleImageUpload = async (file, questionIndex) => {
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setUploadingImageFor(questionIndex);

        try {
            // Convert to base64 for storage
            const reader = new FileReader();
            reader.onload = (e) => {
                updatePreviewQuestion(questionIndex, 'imageUrl', e.target.result);
                setUploadingImageFor(null);
                toast.success('Image added!');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
            setUploadingImageFor(null);
        }
    };

    // Download template with rich text formatting examples
    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            {
                'S.No': 'NOTE',
                Question: 'Images should be uploaded MANUALLY after importing questions (not via Excel)',
                'Option A': 'Delete this row before upload',
                'Option B': '',
                'Option C': '',
                'Option D': '',
                Answer: '',
                Type: '',
                Explanation: ''
            },
            {
                'S.No': 1,
                Question: 'What is 5 + 3?',
                'Option A': '8',
                'Option B': '7',
                'Option C': '6',
                'Option D': '9',
                Answer: 'A',
                Type: 'mcq',
                Explanation: 'Basic addition'
            },
            {
                'S.No': 2,
                Question: 'Write a program to find the factorial of a number.',
                'Option A': '',
                'Option B': '',
                'Option C': '',
                'Option D': '',
                Answer: '',
                Type: 'coding',
                Explanation: 'Example coding problem'
            },
            {
                'S.No': 3,
                Question: 'SELECT * FROM users WHERE age > 18',
                'Option A': '',
                'Option B': '',
                'Option C': '',
                'Option D': '',
                Answer: '',
                Type: 'sql',
                Explanation: 'Example SQL problem'
            },
            {
                'S.No': 4,
                Question: 'Solve: $x^2 + 2x + 1 = 0$',
                'Option A': 'x = -1',
                'Option B': 'x = 1',
                'Option C': 'x = 0',
                'Option D': 'x = 2',
                Answer: 'A',
                Explanation: 'This is $(x+1)^2 = 0$'
            },
            {
                'S.No': 3,
                Question: 'Water formula is H[sub]2[/sub]O.\nCarbon dioxide is CO[sub]2[/sub]',
                'Option A': 'Both are compounds',
                'Option B': 'Both are elements',
                'Option C': 'H[sub]2[/sub]O is compound only',
                'Option D': 'None',
                Answer: 'A',
                Explanation: 'Chemical formulas use subscripts'
            },
            {
                'S.No': 4,
                Question: '**Important:** Which code prints "Hello"?',
                'Option A': '`print("Hello")`',
                'Option B': '`echo Hello`',
                'Option C': '`console.log("Hello")`',
                'Option D': 'All of above',
                Answer: 'D',
                Explanation: 'Different languages use different syntax'
            },
            {
                'S.No': 5,
                Question: 'The *velocity* is given by:\n$$v = \\frac{dx}{dt}$$\nWhat does this represent?',
                'Option A': 'Rate of change of position',
                'Option B': 'Rate of change of time',
                'Option C': 'Distance',
                'Option D': 'Acceleration',
                Answer: 'A',
                Explanation: 'Velocity is derivative of position'
            },
            {
                'S.No': '---',
                Question: '=== FORMATTING GUIDE ===',
                'Option A': '',
                'Option B': '',
                'Option C': '',
                'Option D': '',
                Answer: '',
                Explanation: ''
            },
            {
                'S.No': '',
                Question: '**bold text** - Makes text bold',
                'Option A': '*italic* - Italic text',
                'Option B': '`code` - Code format',
                'Option C': '[sub]x[/sub] - Subscript',
                'Option D': '[sup]2[/sup] - Superscript',
                Answer: '',
                Explanation: ''
            },
            {
                'S.No': '',
                Question: '$x^2$ - Inline math formula',
                'Option A': '$$formula$$ - Block math',
                'Option B': '\\n - New line',
                'Option C': '[u]text[/u] - Underline',
                'Option D': '',
                Answer: '',
                Explanation: 'Delete these guide rows before upload'
            }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Questions');
        XLSX.writeFile(wb, `AbacusTest_Template_WithFormatting.xlsx`);
    };

    // Download student template
    const downloadStudentTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { 'S.No': 1, 'Student Name': 'John Smith' },
            { 'S.No': 2, 'Student Name': 'Jane Doe' },
            { 'S.No': 3, 'Student Name': 'Michael Johnson' }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Students');
        XLSX.writeFile(wb, `AbacusTest_StudentTemplate.xlsx`);
    };

    // Handle student Excel upload
    const handleStudentFile = async (file) => {
        if (!selectedTest) {
            toast.warning('Please select a test first');
            return;
        }

        if (tests.length < 1) {
            toast.warning('Please create at least one paper/test first');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    toast.error('The file is empty or invalid.');
                    return;
                }

                // Parse student names
                const parsedStudents = jsonData.map((row, index) => {
                    const getVal = (keys) => {
                        const foundKey = Object.keys(row).find(k =>
                            keys.map(key => key.toLowerCase().replace(/\s/g, ''))
                                .includes(k.toLowerCase().replace(/\s/g, ''))
                        );
                        return foundKey ? row[foundKey] : null;
                    };

                    return {
                        serialNo: getVal(['S.No', 'SNo', 'No', 'Number', 'Sr', 'Sr.No']) || index + 1,
                        name: getVal(['Student Name', 'Name', 'StudentName', 'Student']) || `Student ${index + 1}`
                    };
                }).filter(s => s.name && s.name.toString().trim());

                if (parsedStudents.length === 0) {
                    toast.error('No valid student names found. Check the template.');
                    return;
                }

                // Show preview
                setPreviewStudents(parsedStudents);
                setShowStudentPreview(true);
                toast.success(`Found ${parsedStudents.length} students. Review and confirm.`);

            } catch (error) {
                console.error('Error parsing student file:', error);
                toast.error('Error parsing file. Ensure it\'s a valid Excel/CSV file.');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // Generate UIDs with RANDOM paper assignment (from preview)
    const handleGenerateFromPreview = async () => {
        if (previewStudents.length === 0) return;

        // Use manually selected papers instead of auto-detecting
        if (selectedPapersForAssignment.length === 0) {
            toast.error('Please select at least one paper for random assignment');
            return;
        }

        setGeneratingUIDs(true);

        // Get the selected papers for assignment
        const availablePapers = tests.filter(t => selectedPapersForAssignment.includes(t.id));
        if (availablePapers.length === 0) {
            toast.error('No papers selected for assignment');
            setGeneratingUIDs(false);
            return;
        }

        // Create students with RANDOM paper assignment (sequential order from Excel)
        const studentsToGenerate = previewStudents.map((student, index) => {
            // Randomly assign a paper from SELECTED papers
            const randomPaper = availablePapers[Math.floor(Math.random() * availablePapers.length)];
            return {
                name: student.name.toString().trim(),
                assignedPaper: randomPaper.id,
                orderIndex: index + 1 // Preserve order for sequential UID display
            };
        });

        try {
            const generated = await generateStudentUIDs(selectedTest.id, studentsToGenerate, user.uid);
            if (generated) {
                toast.success(`Generated ${generated.length} student UIDs with random paper assignment!`);
                setShowStudentPreview(false);
                setPreviewStudents([]);
                setSelectedPapersForAssignment([]);
                fetchStudents(selectedTest.id);
            } else {
                toast.error('Failed to generate UIDs');
            }
        } catch (error) {
            console.error('Error generating UIDs:', error);
            toast.error('Failed to generate UIDs');
        }

        setGeneratingUIDs(false);
    };

    // Remove student from preview
    const removeStudentFromPreview = (index) => {
        setPreviewStudents(prev => prev.filter((_, i) => i !== index));
    };

    // Handle Manual Practical Save (Create or Update)
    const handleManualPracticalSave = async () => {
        if (!selectedTest) return;
        if (!manualPracticalData.question && !manualPracticalData.imageUrl) {
            toast.warning('Please provide at least a description or an image');
            return;
        }

        setSavingManual(true);

        if (editingQuestion) {
            // Update existing
            const success = await updateQuestion(selectedTest.id, editingQuestion.id, {
                type: manualPracticalData.type,
                question: manualPracticalData.question,
                explanation: manualPracticalData.explanation,
                isHtml: manualPracticalData.isHtml,
                imageUrl: manualPracticalData.imageUrl
            });
            if (success) {
                toast.success('Question updated!');
                setShowManualPracticalModal(false);
                setEditingQuestion(null);
                fetchQuestions(selectedTest.id);
            } else {
                toast.error('Failed to update question');
            }
        } else {
            // Create new
            const newQuestion = {
                ...manualPracticalData,
                no: questions.length + 1,
                options: ['', '', '', ''],
                correctAnswer: ''
            };

            const success = await saveQuestions(selectedTest.id, [newQuestion], user.uid);
            if (success) {
                toast.success('Practical task added!');
                setShowManualPracticalModal(false);
                setManualPracticalData({ type: 'coding', question: '', explanation: '', isHtml: false, imageUrl: '' });
                fetchQuestions(selectedTest.id);
                fetchTests();
            } else {
                toast.error('Failed to add task');
            }
        }
        setSavingManual(false);
    };

    // Handle Manual MCQ Save (Create or Update)
    const handleManualMCQSave = async () => {
        if (!selectedTest) return;
        if (!manualMCQData.question) {
            toast.warning('Please provide a question');
            return;
        }

        setSavingManual(true);

        if (editingQuestion) {
            // Update existing
            const success = await updateQuestion(selectedTest.id, editingQuestion.id, {
                type: 'mcq',
                question: manualMCQData.question,
                options: manualMCQData.options,
                correctAnswer: manualMCQData.correctAnswer,
                explanation: manualMCQData.explanation,
                imageUrl: manualMCQData.imageUrl
            });
            if (success) {
                toast.success('Question updated!');
                setShowManualMCQModal(false);
                setEditingQuestion(null);
                fetchQuestions(selectedTest.id);
            } else {
                toast.error('Failed to update question');
            }
        } else {
            // Create new
            const newQuestion = {
                ...manualMCQData,
                type: 'mcq',
                no: questions.length + 1
            };

            const success = await saveQuestions(selectedTest.id, [newQuestion], user.uid);
            if (success) {
                toast.success('MCQ added!');
                setShowManualMCQModal(false);
                setManualMCQData({ question: '', options: ['', '', '', ''], correctAnswer: 'A', explanation: '', imageUrl: '' });
                fetchQuestions(selectedTest.id);
                fetchTests();
            } else {
                toast.error('Failed to add MCQ');
            }
        }
        setSavingManual(false);
    };

    // Handle Edit Question Trigger
    const handleEditQuestion = (q) => {
        setEditingQuestion(q);
        if (q.type === 'coding' || q.type === 'sql') {
            setManualPracticalData({
                type: q.type,
                question: q.question,
                explanation: q.explanation || '',
                isHtml: q.isHtml || false,
                imageUrl: q.imageUrl || ''
            });
            setShowManualPracticalModal(true);
        } else {
            setManualMCQData({
                question: q.question,
                options: q.options || ['', '', '', ''],
                correctAnswer: q.correctAnswer || 'A',
                explanation: q.explanation || '',
                imageUrl: q.imageUrl || ''
            });
            setShowManualMCQModal(true);
        }
    };

    // Export students as CSV with full details
    const exportStudents = () => {
        if (students.length === 0) {
            toast.warning('No students to export');
            return;
        }
        const ws = XLSX.utils.json_to_sheet(students.map((s, idx) => ({
            'S.No': idx + 1,
            Name: s.name,
            UID: s.uid,
            'Assigned Paper': tests.find(t => t.id === s.assignedPaper)?.name || s.assignedPaper || 'Not Assigned',
            'Attempted': s.hasAttempted ? 'Yes' : 'No',
            'Created At': new Date(s.createdAt).toLocaleString()
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Students');
        XLSX.writeFile(wb, `${selectedTest?.name || 'Test'}_Students_Full.xlsx`);
    };

    // Download simple Excel (Name + UID only) for sharing with students
    const downloadStudentsForSharing = () => {
        if (students.length === 0) {
            toast.warning('No students to download');
            return;
        }
        const ws = XLSX.utils.json_to_sheet(students.map((s, idx) => ({
            'S.No': s.orderIndex || idx + 1,
            'Student Name': s.name,
            'UID': s.uid
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Student UIDs');
        XLSX.writeFile(wb, `${selectedTest?.name || 'Test'}_Student_UIDs.xlsx`);
        toast.success('Downloaded! Share this with your students.');
    };

    // Copy UID to clipboard
    const copyUID = (uid) => {
        navigator.clipboard.writeText(uid);
        toast.success('UID copied!');
    };

    // Format duration from seconds to HH:MM:SS
    const formatDuration = (seconds) => {
        if (!seconds || seconds < 0) return '00:00:00';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate marks for a session
    const calculateMarks = (session, assignedPaperId = null) => {
        const paperId = assignedPaperId || session.assignedPaper || selectedTest?.id;
        const currentPaperQuestions = testQuestionsMap[paperId] || questions || [];

        if (!currentPaperQuestions.length) {
            return { mcqCorrect: 0, mcqTotal: 0, practicalMarks: 0, practicalTotal: 0, totalMarks: 0, percentage: 0 };
        }

        let mcqCorrect = 0;
        let mcqTotal = 0;
        let practicalMarks = 0;
        let practicalTotal = 0;

        currentPaperQuestions.forEach(question => {
            const isPractical = question.type === 'coding' || question.type === 'sql';
            if (isPractical) {
                // If the session has assignedQuestions, only count this practical if it was assigned
                const wasAssigned = !session.assignedQuestions || session.assignedQuestions.includes(question.id);
                if (wasAssigned) {
                    practicalTotal++;
                    if (session.grades && session.grades[question.id]) {
                        practicalMarks += parseFloat(session.grades[question.id].marks || 0);
                    }
                }
            } else {
                mcqTotal++;
                const studentAnswer = session.answers?.[question.id];
                if (studentAnswer === question.correctAnswer) {
                    mcqCorrect++;
                }
            }
        });

        const totalPossible = mcqTotal + practicalTotal;
        const totalScored = mcqCorrect + practicalMarks;

        const percentage = totalPossible > 0 ? Math.round((totalScored / totalPossible) * 100) : 0;

        return {
            mcqCorrect,
            mcqTotal,
            practicalMarks,
            practicalTotal,
            totalMarks: totalScored,
            totalPossible,
            percentage,
            display: `${totalScored}/${totalPossible}`
        };
    };

    // Export results to Excel
    const exportResults = () => {
        if (sessions.length === 0) {
            toast.warning('No results to export');
            return;
        }

        // Deduplicate sessions for export
        const uniqueSessions = Object.values(sessions.reduce((acc, session) => {
            const existing = acc[session.studentUid];
            const statusPriority = { 'completed': 3, 'auto-submitted': 2, 'in-progress': 1 };
            if (!existing || (statusPriority[session.status] || 0) > (statusPriority[existing.status] || 0)) {
                acc[session.studentUid] = session;
            }
            return acc;
        }, {}));

        const exportData = uniqueSessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).map((session, idx) => {
            const startTime = session.startTime ? new Date(session.startTime) : null;
            const endTime = session.endTime ? new Date(session.endTime) : null;
            const timeTakenSeconds = startTime && endTime ? Math.floor((endTime - startTime) / 1000) : 0;

            // Resolve paper for correct scoring in export
            const studentRecord = students.find(s => s.uid === session.studentUid);
            const paperId = session.assignedPaper || studentRecord?.assignedPaper || session.testId;
            const paperName = tests.find(t => t.id === paperId)?.name || session.assignedPaper || selectedTest?.name || 'N/A';

            const marks = calculateMarks(session, paperId);

            return {
                'S.No': idx + 1,
                'UID': session.studentUid || '',
                'Name': session.studentName || '',
                'Assigned Paper': paperName,
                'Test Started': startTime ? startTime.toLocaleString() : 'N/A',
                'Test Ended': endTime ? endTime.toLocaleString() : 'In Progress',
                'Time Taken': formatDuration(timeTakenSeconds),
                'MCQ Marks': `${marks.mcqCorrect}/${marks.mcqTotal}`,
                'Practical Marks': marks.practicalMarks,
                'Total Marks': marks.display,
                'Percentage': `${marks.percentage}%`,
                'Status': session.status || 'unknown',
                'Violations': session.violations ? Object.keys(session.violations).length : 0
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        ws['!cols'] = [
            { wch: 6 },   // S.No
            { wch: 10 },  // UID
            { wch: 20 },  // Name
            { wch: 15 },  // Assigned Paper
            { wch: 22 },  // Test Started
            { wch: 22 },  // Test Ended
            { wch: 12 },  // Time Taken
            { wch: 10 },  // Marks
            { wch: 12 },  // Percentage
            { wch: 15 },  // Status
            { wch: 12 }   // Violations
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Exam Results');
        XLSX.writeFile(wb, `${selectedTest?.name || 'Test'}_Results_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success(`Exported ${sessions.length} results to Excel!`);
    };

    // Filter students by search
    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.uid.includes(searchTerm) ||
        (s.assignedPaper || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0) || new Date(a.createdAt) - new Date(b.createdAt));

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    if (!userData?.abacusAdmin) return null;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-indigo-50/30">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-white rounded-xl transition-colors"
                        >
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800">AbacusInsights Admin</h1>
                            <p className="text-slate-500 text-sm">Manage tests, questions, and students</p>
                        </div>
                    </div>
                </div>

                {/* Layout */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar - Tests List */}
                    <div className="w-full lg:w-72 space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-slate-800">Tests</h2>
                                <button
                                    onClick={() => setShowCreateTest(true)}
                                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            {loadingTests ? (
                                <div className="py-8 text-center">
                                    <Loader2 className="animate-spin mx-auto text-slate-400" />
                                </div>
                            ) : tests.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4">No tests created yet</p>
                            ) : (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {tests.map(test => (
                                        <div
                                            key={test.id}
                                            onClick={() => setSelectedTest(test)}
                                            className={`group w-full p-3 rounded-xl text-left transition-all cursor-pointer ${selectedTest?.id === test.id
                                                ? 'bg-indigo-50 border-2 border-indigo-500'
                                                : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-700 text-sm">{test.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${test.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteTest(test);
                                                        }}
                                                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition opacity-0 group-hover:opacity-100"
                                                        title="Delete test"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Hash size={10} /> {test.questionCount || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={10} /> {test.duration}m
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Create/Edit Test Modal */}
                        {showCreateTest && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">{editingTest ? 'Edit Test Settings' : 'Create New Test'}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Test Name</label>
                                            <input
                                                type="text"
                                                value={newTestName}
                                                onChange={(e) => setNewTestName(e.target.value)}
                                                placeholder="e.g., Paper-1"
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Duration (minutes)</label>
                                            <input
                                                type="number"
                                                value={newTestDuration}
                                                onChange={(e) => setNewTestDuration(parseInt(e.target.value) || 60)}
                                                min={1}
                                                max={300}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Practical Questions to Display</label>
                                            <input
                                                type="number"
                                                value={newTestPracticalCount}
                                                onChange={(e) => setNewTestPracticalCount(e.target.value)}
                                                placeholder="All (Leave empty for all)"
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1 italic">Pick N random practical questions per student from the pool</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="shuffle"
                                                checked={newTestShuffle}
                                                onChange={(e) => setNewTestShuffle(e.target.checked)}
                                                className="w-4 h-4 text-indigo-600"
                                            />
                                            <label htmlFor="shuffle" className="text-sm text-slate-600">Shuffle questions for each student</label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="camera"
                                                checked={newTestCamera}
                                                onChange={(e) => setNewTestCamera(e.target.checked)}
                                                className="w-4 h-4 text-indigo-600"
                                            />
                                            <label htmlFor="camera" className="text-sm text-slate-600">Enable Camera Proctoring</label>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={() => {
                                                setShowCreateTest(false);
                                                setEditingTest(null);
                                                setNewTestName('');
                                                setNewTestDuration(60);
                                                setNewTestPracticalCount('');
                                            }}
                                            className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateTest}
                                            disabled={creatingTest}
                                            className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {creatingTest && <Loader2 size={16} className="animate-spin" />}
                                            {editingTest ? 'Save Changes' : 'Create'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {!selectedTest ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                                <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                                <h2 className="text-xl font-bold text-slate-700 mb-2">Select a Test</h2>
                                <p className="text-slate-400">Choose a test from the sidebar or create a new one</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Selected Test Header */}
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-black">{selectedTest.name}</h2>
                                            <p className="text-white/80 text-sm mt-1">
                                                {selectedTest.questionCount || 0} Questions • {selectedTest.duration} Minutes
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleTest(selectedTest)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${selectedTest.isActive
                                                    ? 'bg-white/20 hover:bg-white/30'
                                                    : 'bg-white text-indigo-600 hover:bg-white/90'
                                                    }`}
                                            >
                                                {selectedTest.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                                {selectedTest.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const success = await updateTest(selectedTest.id, { cameraEnabled: !selectedTest.cameraEnabled });
                                                    if (success) {
                                                        toast.success(`Camera ${selectedTest.cameraEnabled ? 'disabled' : 'enabled'}`);
                                                        setSelectedTest({ ...selectedTest, cameraEnabled: !selectedTest.cameraEnabled });
                                                        fetchTests();
                                                    }
                                                }}
                                                className={`p-2 rounded-lg transition border flex items-center gap-2 text-xs font-bold ${selectedTest.cameraEnabled
                                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                                                    : 'bg-red-500/20 border-red-500/50 text-red-200'
                                                    }`}
                                            >
                                                {selectedTest.cameraEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
                                                Camera {selectedTest.cameraEnabled ? 'ON' : 'OFF'}
                                            </button>
                                            <button
                                                onClick={() => handleEditTest(selectedTest)}
                                                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                                                title="Edit test settings"
                                            >
                                                <Settings size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTest(selectedTest)}
                                                className="p-2 bg-white/20 hover:bg-red-500 rounded-lg transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                </div>

                                {/* Tabs */}
                                <div className="bg-white rounded-xl p-1 shadow-sm border border-slate-200 flex gap-1">
                                    {TABS.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === tab.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            <tab.icon size={16} />
                                            {tab.name}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    {/* Questions Tab */}
                                    {activeTab === 'questions' && (
                                        <div className="space-y-8">
                                            {/* Part 1: Objectives (MCQ) */}
                                            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                            <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                                                            Part 1: Objective Questions (MCQ)
                                                        </h3>
                                                        <p className="text-xs text-slate-500 mt-1">Upload standard single-choice questions</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setManualMCQData({ question: '', options: ['', '', '', ''], correctAnswer: 'A', explanation: '', imageUrl: '' });
                                                                setEditingQuestion(null);
                                                                setShowManualMCQModal(true);
                                                            }}
                                                            className="px-3 py-1.5 text-xs border border-indigo-200 rounded-lg hover:bg-white transition flex items-center gap-2 bg-indigo-600 text-white font-medium shadow-sm"
                                                        >
                                                            <Plus size={12} />
                                                            Manual Create
                                                        </button>
                                                        <button
                                                            onClick={downloadTemplate}
                                                            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-white transition flex items-center gap-2 bg-white/50"
                                                        >
                                                            <Download size={12} />
                                                            MCQ Template
                                                        </button>
                                                    </div>
                                                </div>

                                                <div
                                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                                    onDragLeave={() => setDragActive(false)}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        setDragActive(false);
                                                        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0], 'mcq');
                                                    }}
                                                    className={`relative p-8 rounded-xl border-2 border-dashed transition-all text-center ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 bg-white'
                                                        }`}
                                                >
                                                    <input
                                                        type="file"
                                                        accept=".xlsx,.xls,.csv"
                                                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'mcq')}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        disabled={uploading}
                                                    />
                                                    {uploading ? (
                                                        <Loader2 size={32} className="mx-auto text-indigo-600 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Upload size={32} className="mx-auto text-indigo-300 mb-2" />
                                                            <p className="text-slate-600 font-medium text-sm">Drop MCQ Excel or click to upload</p>
                                                            <p className="text-slate-400 text-xs mt-1">Questions will be previewed before saving</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Part 2: Practical (Coding/SQL) */}
                                            <div className="bg-purple-50/30 p-6 rounded-2xl border border-purple-100">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-purple-900 flex items-center gap-2">
                                                            <div className="w-2 h-6 bg-purple-600 rounded-full" />
                                                            Part 2: Practical Questions (Coding/SQL)
                                                        </h3>
                                                        <p className="text-xs text-purple-600/70 mt-1">Upload programming or database challenges</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setManualPracticalData({ type: 'coding', question: '', explanation: '', isHtml: false, imageUrl: '' });
                                                                setEditingQuestion(null);
                                                                setShowManualPracticalModal(true);
                                                            }}
                                                            className="px-3 py-1.5 text-xs border border-purple-200 rounded-lg hover:bg-white transition flex items-center gap-2 bg-purple-600 text-white font-medium shadow-sm"
                                                        >
                                                            <Plus size={12} />
                                                            Manual Create
                                                        </button>
                                                        <button
                                                            onClick={downloadTemplate}
                                                            className="px-3 py-1.5 text-xs border border-purple-200 rounded-lg hover:bg-white transition flex items-center gap-2 bg-white/50 text-purple-700"
                                                        >
                                                            <Download size={12} />
                                                            Practical Template
                                                        </button>
                                                    </div>
                                                </div>

                                                <div
                                                    className="relative p-8 rounded-xl border-2 border-dashed transition-all text-center border-purple-200 hover:border-purple-400 bg-white"
                                                >
                                                    <input
                                                        type="file"
                                                        accept=".xlsx,.xls,.csv"
                                                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'coding')}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        disabled={uploading}
                                                    />
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                                            <FileCode size={24} className="text-purple-600" />
                                                        </div>
                                                        <p className="text-purple-700 font-medium text-sm">Upload Coding/SQL Excel</p>
                                                        <p className="text-purple-400 text-xs mt-1">Best for bulk MCQ + Practical mixture</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Clear All Header */}
                                            {questions.length > 0 && (
                                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                                    <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Question Repository ({questions.length})</h3>
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm('Delete all questions?')) {
                                                                await clearQuestions(selectedTest.id);
                                                                toast.success('All questions cleared');
                                                                fetchQuestions(selectedTest.id);
                                                                fetchTests();
                                                            }
                                                        }}
                                                        className="px-3 py-1 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 rounded transition flex items-center gap-2"
                                                    >
                                                        <Trash2 size={12} />
                                                        Wipe All Data
                                                    </button>
                                                </div>
                                            )}

                                            {/* Questions List */}
                                            {loadingQuestions ? (
                                                <div className="py-12 text-center text-slate-400">
                                                    <Loader2 className="animate-spin mx-auto mb-2" />
                                                    <p className="text-xs font-medium">Fetching question bank...</p>
                                                </div>
                                            ) : questions.length > 0 && (
                                                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                                                    {questions.map((q, idx) => (
                                                        <div key={q.id} className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                                            <div className={`absolute top-0 left-0 w-1 h-full ${q.type === 'coding' || q.type === 'sql' ? 'bg-purple-500' : 'bg-indigo-500'}`} />
                                                            <div className="p-5 flex items-start gap-4">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-3">
                                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${q.type === 'coding' || q.type === 'sql' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                                            {q.type?.toUpperCase() || 'MCQ'}
                                                                        </span>
                                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Index {idx + 1}</span>
                                                                    </div>
                                                                    <div className="font-medium text-slate-800 leading-relaxed mb-4">
                                                                        <RichText text={q.question} />
                                                                        {q.imageUrl && (
                                                                            <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white inline-block">
                                                                                <img
                                                                                    src={q.imageUrl}
                                                                                    alt="Question Reference"
                                                                                    className="max-w-full h-auto object-contain max-h-[200px]"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Options for MCQ */}
                                                                    {(!q.type || q.type === 'mcq') && q.options && (
                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            {q.options.map((opt, i) => (
                                                                                <div
                                                                                    key={i}
                                                                                    className={`text-xs px-3 py-2 rounded-lg border flex items-center gap-2 transition ${String.fromCharCode(65 + i) === q.correctAnswer
                                                                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                                                                        : 'bg-slate-50 border-slate-100 text-slate-500'
                                                                                        }`}
                                                                                >
                                                                                    <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${String.fromCharCode(65 + i) === q.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                                                        {String.fromCharCode(65 + i)}
                                                                                    </span>
                                                                                    <RichText text={opt} />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {/* Practical Note */}
                                                                    {(q.type === 'coding' || q.type === 'sql') && q.explanation && (
                                                                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                                                            <p className="text-[10px] font-black text-purple-400 uppercase mb-1 tracking-widest">Requirements</p>
                                                                            <div className="text-xs text-purple-900 italic">
                                                                                {q.explanation}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col gap-2">
                                                                    <button
                                                                        onClick={() => handleEditQuestion(q)}
                                                                        className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                                                        title="Edit question"
                                                                    >
                                                                        <Edit3 size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (confirm('Delete this question?')) {
                                                                                await deleteQuestion(selectedTest.id, q.id);
                                                                                toast.success('Question removed');
                                                                                fetchQuestions(selectedTest.id);
                                                                                fetchTests();
                                                                            }
                                                                        }}
                                                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                                                        title="Delete question"
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

                                    {/* Students Tab */}
                                    {activeTab === 'students' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-slate-800">Students ({students.length})</h3>
                                                {students.length > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={downloadStudentsForSharing}
                                                            className="px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
                                                        >
                                                            <Download size={14} />
                                                            Download UIDs
                                                        </button>
                                                        <button
                                                            onClick={exportStudents}
                                                            className="px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-2"
                                                        >
                                                            <Download size={14} />
                                                            Export Full
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Upload Students Excel - New Design */}
                                            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-indigo-800">Upload Student List</h4>
                                                        <p className="text-xs text-indigo-600 mt-1">
                                                            Upload Excel with student names → Papers assigned randomly → Questions shuffled per student
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={downloadStudentTemplate}
                                                        className="px-3 py-2 text-sm border border-indigo-200 rounded-lg hover:bg-white transition flex items-center gap-2"
                                                    >
                                                        <Download size={14} />
                                                        Template
                                                    </button>
                                                </div>

                                                {/* Upload Area */}
                                                <div
                                                    onDragOver={(e) => { e.preventDefault(); setStudentUploadDragActive(true); }}
                                                    onDragLeave={() => setStudentUploadDragActive(false)}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        setStudentUploadDragActive(false);
                                                        if (e.dataTransfer.files?.[0]) handleStudentFile(e.dataTransfer.files[0]);
                                                    }}
                                                    className={`relative p-6 rounded-xl border-2 border-dashed transition-all text-center ${studentUploadDragActive ? 'border-indigo-500 bg-indigo-100' : 'border-indigo-200 hover:border-indigo-400 bg-white/50'
                                                        }`}
                                                >
                                                    <input
                                                        type="file"
                                                        accept=".xlsx,.xls,.csv"
                                                        onChange={(e) => e.target.files?.[0] && handleStudentFile(e.target.files[0])}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                    <Users size={28} className="mx-auto text-indigo-300 mb-2" />
                                                    <p className="text-indigo-700 font-medium text-sm">Drop Excel/CSV or click to upload student names</p>
                                                    <p className="text-indigo-400 text-xs mt-1">Columns: S.No, Student Name</p>
                                                </div>

                                                {/* Info about random assignment */}
                                                <div className="mt-3 p-3 bg-white/60 rounded-lg border border-indigo-100">
                                                    <p className="text-xs text-indigo-600 font-medium">🎲 How it works:</p>
                                                    <ul className="text-xs text-indigo-500 mt-1 space-y-0.5">
                                                        <li>• Each student gets a unique 6-digit UID</li>
                                                        <li>• Paper is randomly assigned from: <span className="font-medium">{tests.filter(t => (t.questionCount || 0) > 0).map(t => t.name).join(', ') || 'No papers with questions yet'}</span></li>
                                                        <li>• Questions and options are shuffled per student</li>
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Search */}
                                            {students.length > 0 && (
                                                <div className="relative">
                                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        placeholder="Search by name, UID, or paper..."
                                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm"
                                                    />
                                                </div>
                                            )}

                                            {/* Students List */}
                                            {loadingStudents ? (
                                                <div className="py-8 text-center">
                                                    <Loader2 className="animate-spin mx-auto text-slate-400" />
                                                </div>
                                            ) : filteredStudents.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                                                    {filteredStudents.map(student => (
                                                        <div
                                                            key={student.uid}
                                                            className={`p-3 rounded-xl border ${student.hasAttempted ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="font-medium text-slate-700 text-sm">{student.name}</p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <code className="text-lg font-mono font-bold text-indigo-600">{student.uid}</code>
                                                                        <button
                                                                            onClick={() => copyUID(student.uid)}
                                                                            className="p-1 hover:bg-slate-100 rounded transition"
                                                                        >
                                                                            <Copy size={12} className="text-slate-400" />
                                                                        </button>
                                                                    </div>
                                                                    {student.assignedPaper && (
                                                                        <p className="text-xs text-purple-600 mt-1">
                                                                            📄 {tests.find(t => t.id === student.assignedPaper)?.name || student.assignedPaper}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {student.hasAttempted && (
                                                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : students.length === 0 ? (
                                                <p className="text-center text-slate-400 py-8">No students generated yet</p>
                                            ) : (
                                                <p className="text-center text-slate-400 py-8">No students match your search</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Tests Tab - Test Settings */}
                                    {activeTab === 'tests' && (
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-slate-800">Test Settings</h3>
                                            <div className="grid gap-4">
                                                <div className="p-4 bg-slate-50 rounded-xl">
                                                    <p className="text-sm text-slate-500">Test URL for students:</p>
                                                    <code className="text-indigo-600 font-mono text-sm break-all">
                                                        {typeof window !== 'undefined' ? window.location.origin : ''}/abacusinsights/test
                                                    </code>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-xl">
                                                    <p className="text-sm text-slate-500 mb-2">Status</p>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTest.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                                                        }`}>
                                                        {selectedTest.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-xl">
                                                    <p className="text-sm text-slate-500 mb-2">Question Shuffling</p>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTest.shuffleQuestions ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                                                        }`}>
                                                        {selectedTest.shuffleQuestions ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Results Tab */}
                                    {activeTab === 'results' && (
                                        <div className="space-y-6">
                                            {/* Header */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-lg">Exam Results</h3>
                                                    <p className="text-sm text-slate-500">Click on any student to view detailed analysis</p>
                                                </div>
                                                {sessions.length > 0 && (
                                                    <button
                                                        onClick={exportResults}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 text-sm font-medium shadow-sm"
                                                    >
                                                        <Download size={16} />
                                                        Export Excel
                                                    </button>
                                                )}
                                            </div>

                                            {/* Analytics Dashboard */}
                                            {sessions.length > 0 && (() => {
                                                // Deduplicate sessions for accurate analytics
                                                const uniqueSessions = Object.values(sessions.reduce((acc, session) => {
                                                    const existing = acc[session.studentUid];
                                                    const statusPriority = { 'completed': 3, 'auto-submitted': 2, 'in-progress': 1 };
                                                    if (!existing || (statusPriority[session.status] || 0) > (statusPriority[existing.status] || 0)) {
                                                        acc[session.studentUid] = session;
                                                    }
                                                    return acc;
                                                }, {}));

                                                const completedSessions = uniqueSessions.filter(s => s.status === 'completed' || s.status === 'auto-submitted');
                                                const totalMarks = completedSessions.reduce((acc, s) => {
                                                    const paperId = s.assignedPaper || s.testId;
                                                    const m = calculateMarks(s, paperId);
                                                    return acc + m.percentage;
                                                }, 0);
                                                const avgScore = completedSessions.length > 0 ? Math.round(totalMarks / completedSessions.length) : 0;
                                                const passCount = completedSessions.filter(s => {
                                                    const paperId = s.assignedPaper || s.testId;
                                                    return calculateMarks(s, paperId).percentage >= 40;
                                                }).length;
                                                const totalViolations = uniqueSessions.reduce((acc, s) => acc + (s.violations ? Object.keys(s.violations).length : 0), 0);
                                                const inProgressCount = uniqueSessions.filter(s => s.status === 'in-progress').length;

                                                return (
                                                    <div className="grid grid-cols-5 gap-3">
                                                        <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
                                                            <p className="text-indigo-100 text-sm">Total Sessions</p>
                                                            <p className="text-3xl font-black">{uniqueSessions.length}</p>
                                                        </div>
                                                        <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                                                            <p className="text-emerald-600 text-sm font-medium">Average Score</p>
                                                            <p className="text-3xl font-black text-emerald-700">{avgScore}%</p>
                                                        </div>
                                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                                            <p className="text-blue-600 text-sm font-medium">Pass Rate</p>
                                                            <p className="text-3xl font-black text-blue-700">
                                                                {completedSessions.length > 0 ? Math.round((passCount / completedSessions.length) * 100) : 0}%
                                                            </p>
                                                        </div>
                                                        <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                                                            <p className="text-amber-600 text-sm font-medium">In Progress</p>
                                                            <p className="text-3xl font-black text-amber-700">
                                                                {inProgressCount}
                                                            </p>
                                                        </div>
                                                        <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                                                            <p className="text-red-600 text-sm font-medium">Violations</p>
                                                            <p className="text-3xl font-black text-red-700">{totalViolations}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* Session Table */}
                                            {loadingSessions ? (
                                                <div className="py-12 text-center">
                                                    <Loader2 className="animate-spin mx-auto text-indigo-500" size={32} />
                                                    <p className="text-slate-500 mt-2">Loading results...</p>
                                                </div>
                                            ) : sessions.length > 0 ? (
                                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                                    {/* Table Header */}
                                                    <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                                                        <div className="col-span-3">Student</div>
                                                        <div className="col-span-2">Paper</div>
                                                        <div className="col-span-2 text-center">Score</div>
                                                        <div className="col-span-2 text-center">Time Taken</div>
                                                        <div className="col-span-2 text-center">Status</div>
                                                        <div className="col-span-1 text-center">⚠️</div>
                                                    </div>

                                                    {/* Table Body */}
                                                    <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                                                        {(() => {
                                                            // Deduplicate sessions: Keep only the most relevant session for each student
                                                            // Priority: 'completed' > 'auto-submitted' > 'in-progress'
                                                            const uniqueSessions = Object.values(sessions.reduce((acc, session) => {
                                                                const existing = acc[session.studentUid];
                                                                const statusPriority = { 'completed': 3, 'auto-submitted': 2, 'in-progress': 1 };

                                                                if (!existing || (statusPriority[session.status] || 0) > (statusPriority[existing.status] || 0)) {
                                                                    acc[session.studentUid] = session;
                                                                }
                                                                return acc;
                                                            }, {}));

                                                            return uniqueSessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).map(session => {
                                                                const startTime = session.startTime ? new Date(session.startTime) : null;
                                                                const endTime = session.endTime ? new Date(session.endTime) : null;
                                                                const timeTakenSeconds = startTime && endTime ? Math.floor((endTime - startTime) / 1000) : 0;

                                                                // Better paper resolution: Session data -> Student data -> Fallback
                                                                const studentRecord = students.find(s => s.uid === session.studentUid);
                                                                const paperId = session.assignedPaper || studentRecord?.assignedPaper || session.testId;
                                                                const paperName = tests.find(t => t.id === paperId)?.name || 'N/A';

                                                                const marks = calculateMarks(session, paperId);
                                                                const violationCount = session.violations ? Object.keys(session.violations).length : 0;

                                                                return (
                                                                    <div
                                                                        key={session.id}
                                                                        onClick={() => setSelectedResultSession(session)}
                                                                        className="grid grid-cols-12 gap-4 p-4 hover:bg-indigo-50 cursor-pointer transition group"
                                                                    >
                                                                        {/* Student */}
                                                                        <div className="col-span-3 flex items-center gap-3">
                                                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md transition">
                                                                                {session.studentName?.charAt(0)?.toUpperCase() || 'S'}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-bold text-slate-800 text-sm">{session.studentName}</p>
                                                                                <p className="text-xs text-slate-400 font-mono">{session.studentUid}</p>
                                                                            </div>
                                                                        </div>

                                                                        {/* Paper */}
                                                                        <div className="col-span-2 flex items-center">
                                                                            <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">
                                                                                {paperName}
                                                                            </span>
                                                                        </div>

                                                                        {/* Score */}
                                                                        <div className="col-span-2 flex items-center justify-center">
                                                                            <div className="text-center">
                                                                                <p className="font-black text-indigo-600">
                                                                                    {marks.totalMarks ?? 0}/{marks.totalPossible ?? 0}
                                                                                </p>
                                                                                <p className="text-xs text-slate-400">{marks.percentage}%</p>
                                                                            </div>
                                                                        </div>

                                                                        {/* Time */}
                                                                        <div className="col-span-2 flex items-center justify-center">
                                                                            <span className="font-mono text-sm text-slate-600">{formatDuration(timeTakenSeconds)}</span>
                                                                        </div>

                                                                        {/* Status */}
                                                                        <div className="col-span-2 flex items-center justify-center">
                                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                                                session.status === 'auto-submitted' ? 'bg-amber-100 text-amber-700' :
                                                                                    'bg-blue-100 text-blue-700'
                                                                                }`}>
                                                                                {session.status === 'in-progress' ? '● Live' : session.status}
                                                                            </span>
                                                                        </div>

                                                                        {/* Violations */}
                                                                        <div className="col-span-1 flex items-center justify-center">
                                                                            {violationCount > 0 ? (
                                                                                <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                                                    {violationCount}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-emerald-500">✓</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })
                                                        })()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <FileText size={32} className="text-slate-400" />
                                                    </div>
                                                    <p className="text-slate-600 font-medium text-lg">No exam sessions yet</p>
                                                    <p className="text-sm text-slate-400 mt-1">Results will appear here when students complete their exams</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
            {/* Result Detail Modal */}
            {selectedResultSession && (
                <ResultDetailModal
                    session={selectedResultSession}
                    questions={testQuestionsMap[selectedResultSession.assignedPaper || selectedResultSession.testId] || questions || []}
                    testName={tests.find(t => t.id === (selectedResultSession.assignedPaper || selectedResultSession.testId))?.name || selectedResultSession.assignedPaper || selectedTest?.name}
                    onClose={() => setSelectedResultSession(null)}
                />
            )}

            {/* Question Preview/Edit Modal */}
            {
                showPreviewModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Review Questions</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {previewQuestions.length} questions parsed. Edit, delete, or add images before saving.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            setShowPreviewModal(false);
                                            setPreviewQuestions([]);
                                        }}
                                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSavePreviewedQuestions}
                                        disabled={savingQuestions || previewQuestions.length === 0}
                                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {savingQuestions ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        Save {previewQuestions.length} Questions
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {previewQuestions.map((q, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-xl border-2 transition-all ${editingQuestionIndex === index ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Question Number */}
                                            <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold">
                                                {index + 1}
                                            </div>

                                            {/* Question Content */}
                                            <div className="flex-1 space-y-3">
                                                {/* Question Text */}
                                                <div className="flex gap-3">
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-medium text-slate-500 mb-1">Question</label>
                                                        <textarea
                                                            value={q.question}
                                                            onChange={(e) => updatePreviewQuestion(index, 'question', e.target.value)}
                                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                                                            rows={2}
                                                        />
                                                    </div>
                                                    <div className="w-32">
                                                        <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                                                        <select
                                                            value={q.type || 'mcq'}
                                                            onChange={(e) => updatePreviewQuestion(index, 'type', e.target.value)}
                                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                                        >
                                                            <option value="mcq">MCQ</option>
                                                            <option value="coding">Coding</option>
                                                            <option value="sql">SQL</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Options Grid - Hidden for Coding/SQL */}
                                                {(q.type === 'mcq' || !q.type) && (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {q.options.map((opt, optIdx) => (
                                                                <div key={optIdx}>
                                                                    <label className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                                                                        <span className={`w-5 h-5 rounded text-center text-white text-xs flex items-center justify-center ${String.fromCharCode(65 + optIdx) === q.correctAnswer ? 'bg-emerald-500' : 'bg-slate-400'
                                                                            }`}>
                                                                            {String.fromCharCode(65 + optIdx)}
                                                                        </span>
                                                                        {String.fromCharCode(65 + optIdx) === q.correctAnswer && <span className="text-emerald-600">(Correct)</span>}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={opt}
                                                                        onChange={(e) => updatePreviewQuestion(index, `option_${optIdx}`, e.target.value)}
                                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Correct Answer & Explanation */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-500 mb-1">Correct Answer</label>
                                                                <select
                                                                    value={q.correctAnswer}
                                                                    onChange={(e) => updatePreviewQuestion(index, 'correctAnswer', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                                                >
                                                                    <option value="A">A</option>
                                                                    <option value="B">B</option>
                                                                    <option value="C">C</option>
                                                                    <option value="D">D</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-500 mb-1">Explanation (optional)</label>
                                                                <input
                                                                    type="text"
                                                                    value={q.explanation || ''}
                                                                    onChange={(e) => updatePreviewQuestion(index, 'explanation', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                                    placeholder="Add explanation..."
                                                                />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {/* Explanation only for Coding/SQL */}
                                                {(q.type === 'coding' || q.type === 'sql') && (
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-500 mb-1">Detailed Requirements / Explanation</label>
                                                        <textarea
                                                            value={q.explanation || ''}
                                                            onChange={(e) => updatePreviewQuestion(index, 'explanation', e.target.value)}
                                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                                                            rows={3}
                                                            placeholder="Add specific requirements or solution steps..."
                                                        />
                                                    </div>
                                                )}

                                                {/* Image Section */}
                                                <div className="flex items-center gap-3">
                                                    {q.imageUrl ? (
                                                        <div className="relative">
                                                            <img src={q.imageUrl} alt="Question" className="w-24 h-24 object-cover rounded-lg border" />
                                                            <button
                                                                onClick={() => updatePreviewQuestion(index, 'imageUrl', '')}
                                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    if (e.target.files?.[0]) {
                                                                        handleImageUpload(e.target.files[0], index);
                                                                    }
                                                                }}
                                                            />
                                                            {uploadingImageFor === index ? (
                                                                <Loader2 size={16} className="animate-spin text-indigo-600" />
                                                            ) : (
                                                                <>
                                                                    <Image size={16} className="text-slate-400" />
                                                                    <span className="text-sm text-slate-500">Add Image</span>
                                                                </>
                                                            )}
                                                        </label>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => deletePreviewQuestion(index)}
                                                className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                title="Delete question"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {previewQuestions.length === 0 && (
                                    <div className="text-center py-12">
                                        <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
                                        <p className="text-slate-500">All questions have been deleted</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Manual Practical Question Modal */}
            {showManualPracticalModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col scale-in">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black flex items-center gap-3">
                                    <Code2 size={28} />
                                    {editingQuestion ? 'Edit Practical Task' : 'Leads to LeetCode Style Task'}
                                </h3>
                                <p className="text-purple-100 text-sm mt-1">{editingQuestion ? `Editing Question Index ${questions.findIndex(q => q.id === editingQuestion.id) + 1}` : 'Design a premium practical challenge with rich details'}</p>
                            </div>
                            <button onClick={() => { setShowManualPracticalModal(false); setEditingQuestion(null); }} className="p-2 hover:bg-white/20 rounded-xl transition">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
                            <div className="grid grid-cols-2 gap-8">
                                {/* Left Side: Configuration */}
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Settings size={14} /> Basic Config
                                        </h4>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Challenge Type</label>
                                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                                <button
                                                    onClick={() => setManualPracticalData(prev => ({ ...prev, type: 'coding' }))}
                                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${manualPracticalData.type === 'coding' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Coding Task
                                                </button>
                                                <button
                                                    onClick={() => setManualPracticalData(prev => ({ ...prev, type: 'sql' }))}
                                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${manualPracticalData.type === 'sql' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    SQL Query
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-xs font-bold text-slate-500 uppercase">Problem Description</label>
                                                <button
                                                    onClick={() => setManualPracticalData(prev => ({ ...prev, isHtml: !prev.isHtml }))}
                                                    className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase transition-all ${manualPracticalData.isHtml ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}
                                                >
                                                    {manualPracticalData.isHtml ? 'HTML Mode ON' : 'Markdown Mode'}
                                                </button>
                                            </div>
                                            <textarea
                                                value={manualPracticalData.question}
                                                onChange={(e) => setManualPracticalData(prev => ({ ...prev, question: e.target.value }))}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm min-h-[150px] font-mono"
                                                placeholder={manualPracticalData.isHtml ? "Paste <div> elements... " : "Enter problem description..."}
                                            />
                                            <p className="text-[10px] text-slate-400 mt-2 italic">TIP: Use HTML mode for complex LeetCode tables and lists.</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                            <FileText size={14} /> Constraints / Examples
                                        </h4>
                                        <textarea
                                            value={manualPracticalData.explanation}
                                            onChange={(e) => setManualPracticalData(prev => ({ ...prev, explanation: e.target.value }))}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm min-h-[100px]"
                                            placeholder="Add input/output examples or time/space constraints..."
                                        />
                                    </div>
                                </div>

                                {/* Right Side: Visuals & Preview */}
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                            <FileImage size={14} /> Vertical Image (Optional)
                                        </h4>
                                        <div className="space-y-4">
                                            {manualPracticalData.imageUrl ? (
                                                <div className="relative rounded-2xl overflow-hidden border-2 border-purple-100 group">
                                                    <img src={manualPracticalData.imageUrl} alt="Preview" className="w-full h-auto max-h-[300px] object-contain" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                        <button
                                                            onClick={() => setManualPracticalData(prev => ({ ...prev, imageUrl: '' }))}
                                                            className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition"
                                                        >
                                                            <X size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all group">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onload = (re) => setManualPracticalData(prev => ({ ...prev, imageUrl: re.target.result }));
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                                        <Download size={20} className="text-slate-400" />
                                                    </div>
                                                    <span className="text-sm text-slate-500 font-bold">Upload Vertical Detail</span>
                                                    <span className="text-[10px] text-slate-400 mt-1 uppercase">Best for LeetCode screenshots</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    {/* Preview Result */}
                                    <div className="bg-slate-900 rounded-2xl p-6 text-slate-300">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Student View Preview</h4>
                                        <div className="space-y-3">
                                            <div className="h-4 w-3/4 bg-slate-800 rounded-full" />
                                            <div className="h-4 w-1/2 bg-slate-800 rounded-full opacity-50" />
                                            <div className="h-24 w-full bg-slate-800 rounded-xl mt-4 flex items-center justify-center border border-slate-700 dashed">
                                                <span className="text-[10px] text-slate-600 font-black uppercase tracking-tight">Image / Content Area</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                            <p className="text-xs text-slate-500 font-medium">
                                This will automatically be added to **Part 2: Practical** section.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowManualPracticalModal(false)}
                                    className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    onClick={handleManualPracticalSave}
                                    disabled={savingManual}
                                    className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-black rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {savingManual ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {editingQuestion ? 'UPDATE CHALLENGE' : 'PUBLISH TO EXAM'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual MCQ Modal */}
            {showManualMCQModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col scale-in">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black flex items-center gap-3">
                                    <FileText size={28} />
                                    {editingQuestion ? 'Edit MCQ Question' : 'Create Objective Question'}
                                </h3>
                                <p className="text-indigo-100 text-sm mt-1">{editingQuestion ? `Editing Question Index ${questions.findIndex(q => q.id === editingQuestion.id) + 1}` : 'Add a single-choice question with options'}</p>
                            </div>
                            <button onClick={() => { setShowManualMCQModal(false); setEditingQuestion(null); }} className="p-2 hover:bg-white/20 rounded-xl transition">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
                            {/* Question Text */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Plus size={14} /> Question Details
                                </h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Question Text</label>
                                    <textarea
                                        value={manualMCQData.question}
                                        onChange={(e) => setManualMCQData(prev => ({ ...prev, question: e.target.value }))}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm min-h-[100px]"
                                        placeholder="Enter your question here..."
                                    />
                                    <p className="text-[10px] text-slate-400 mt-2 italic">TIP: You can use markdown like **bold**, *italic*, or $x^2$.</p>
                                </div>
                            </div>

                            {/* Options Grid */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Hash size={14} /> Answer & Options
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {manualMCQData.options.map((opt, idx) => (
                                        <div key={idx} className="relative">
                                            <div className="flex items-center gap-2 mb-1 justify-between">
                                                <label className="text-[10px] font-black text-slate-400 uppercase">Option {String.fromCharCode(65 + idx)}</label>
                                                <button
                                                    onClick={() => setManualMCQData(prev => ({ ...prev, correctAnswer: String.fromCharCode(65 + idx) }))}
                                                    className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full transition ${manualMCQData.correctAnswer === String.fromCharCode(65 + idx) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                >
                                                    {manualMCQData.correctAnswer === String.fromCharCode(65 + idx) ? '✓ Correct' : 'Set Correct'}
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => {
                                                    const newOpts = [...manualMCQData.options];
                                                    newOpts[idx] = e.target.value;
                                                    setManualMCQData(prev => ({ ...prev, options: newOpts }));
                                                }}
                                                className={`w-full px-4 py-2 border rounded-xl text-sm transition ${manualMCQData.correctAnswer === String.fromCharCode(65 + idx) ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}
                                                placeholder={`Option ${String.fromCharCode(65 + idx)}...`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Info: Image & Explanation */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileImage size={14} /> Illustration (Optional)
                                    </h4>
                                    {manualMCQData.imageUrl ? (
                                        <div className="relative rounded-xl overflow-hidden border group">
                                            <img src={manualMCQData.imageUrl} alt="Preview" className="w-full h-auto max-h-[150px] object-contain" />
                                            <button
                                                onClick={() => setManualMCQData(prev => ({ ...prev, imageUrl: '' }))}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (re) => setManualMCQData(prev => ({ ...prev, imageUrl: re.target.result }));
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <FileImage size={20} className="text-slate-300 mb-1" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Upload Diagram</span>
                                        </label>
                                    )}
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileText size={14} /> Explanation
                                    </h4>
                                    <textarea
                                        value={manualMCQData.explanation}
                                        onChange={(e) => setManualMCQData(prev => ({ ...prev, explanation: e.target.value }))}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm min-h-[80px]"
                                        placeholder="Why is it correct?..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-4">
                            <button
                                onClick={() => { setShowManualMCQModal(false); setEditingQuestion(null); }}
                                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleManualMCQSave}
                                disabled={savingManual}
                                className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-black rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {savingManual ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {editingQuestion ? 'UPDATE QUESTION' : 'ADD TO PAPER'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Preview Modal */}
            {
                showStudentPreview && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Review Students ({previewStudents.length})</h3>
                                    <p className="text-indigo-200 text-sm">Papers will be assigned randomly. Confirm to generate UIDs.</p>
                                </div>
                                <button
                                    onClick={() => { setShowStudentPreview(false); setPreviewStudents([]); }}
                                    className="p-2 hover:bg-white/20 rounded-lg transition"
                                >
                                    <X size={20} className="text-white" />
                                </button>
                            </div>

                            {/* Paper Selection - SELECT which papers to include in random assignment */}
                            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-indigo-100">
                                <p className="text-sm font-bold text-indigo-800 mb-2">🎲 Select Papers for Random Assignment:</p>
                                <div className="flex flex-wrap gap-2">
                                    {tests.map(test => (
                                        <label
                                            key={test.id}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition border-2 ${selectedPapersForAssignment.includes(test.id)
                                                ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedPapersForAssignment.includes(test.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedPapersForAssignment(prev => [...prev, test.id]);
                                                    } else {
                                                        setSelectedPapersForAssignment(prev => prev.filter(id => id !== test.id));
                                                    }
                                                }}
                                                className="rounded text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm font-medium">{test.name}</span>
                                            <span className="text-xs text-slate-400">({test.questionCount || 0}Q)</span>
                                        </label>
                                    ))}
                                </div>
                                {selectedPapersForAssignment.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-2">⚠️ Select at least one paper for random assignment</p>
                                )}
                                {selectedPapersForAssignment.length > 0 && (
                                    <p className="text-xs text-emerald-600 mt-2">
                                        ✓ Students will be randomly assigned to: {tests.filter(t => selectedPapersForAssignment.includes(t.id)).map(t => t.name).join(', ')}
                                    </p>
                                )}
                            </div>

                            {/* Student List */}
                            <div className="p-6 overflow-y-auto max-h-[50vh]">
                                <div className="space-y-2">
                                    {previewStudents.map((student, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">
                                                    {student.serialNo || index + 1}
                                                </span>
                                                <span className="font-medium text-slate-700">{student.name}</span>
                                            </div>
                                            <button
                                                onClick={() => removeStudentFromPreview(index)}
                                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                                <p className="text-sm text-slate-500">
                                    {previewStudents.length} student{previewStudents.length !== 1 ? 's' : ''} will get UIDs
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setShowStudentPreview(false); setPreviewStudents([]); }}
                                        className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-white transition text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleGenerateFromPreview}
                                        disabled={generatingUIDs || previewStudents.length === 0}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {generatingUIDs ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                        Generate {previewStudents.length} UIDs
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

/* Result Detail Modal Component */
const ResultDetailModal = ({ session, questions, testName, onClose }) => {
    const [showViolations, setShowViolations] = useState(false);
    const [localGrades, setLocalGrades] = useState(session.grades || {});
    const [isSavingGrades, setIsSavingGrades] = useState(false);

    // Helper to calculate marks (Updated for MCQ + Practical)
    const calculateMarks = (session, questions) => {
        if (!questions.length) return { mcqCorrect: 0, mcqTotal: 0, practicalMarks: 0, practicalTotal: 0, totalMarks: 0, percentage: 0 };

        let mcqCorrect = 0;
        let mcqTotal = 0;
        let practicalMarks = 0;
        let practicalTotal = 0;

        questions.forEach(q => {
            const isPractical = q.type === 'coding' || q.type === 'sql';
            if (isPractical) {
                // If the session has assignedQuestions, only count this practical if it was assigned
                const wasAssigned = !session.assignedQuestions || session.assignedQuestions.includes(q.id);
                if (wasAssigned) {
                    practicalTotal++;
                    // Use localGrades if they exist, otherwise session grades
                    const grade = localGrades[q.id] || (session.grades && session.grades[q.id]);
                    if (grade) {
                        practicalMarks += parseFloat(grade.marks || 0);
                    }
                }
            } else {
                mcqTotal++;
                if (session.answers?.[q.id] === q.correctAnswer) {
                    mcqCorrect++;
                }
            }
        });

        const totalPossible = mcqTotal + practicalTotal;
        const totalMarks = mcqCorrect + practicalMarks;
        const percentage = totalPossible > 0 ? Math.round((totalMarks / totalPossible) * 100) : 0;

        return {
            mcqCorrect,
            mcqTotal,
            practicalMarks,
            practicalTotal,
            totalMarks,
            totalPossible,
            percentage,
            display: `${totalMarks}/${totalPossible}`
        };
    };

    const handleSaveGrades = async () => {
        setIsSavingGrades(true);
        try {
            const success = await updateSessionGrades(session.id, localGrades);
            if (success) {
                toast.success('Grades updated successfully!');
            } else {
                toast.error('Failed to update grades');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error saving grades');
        }
        setIsSavingGrades(false);
    };

    // Helper to format time
    const formatDuration = (seconds) => {
        if (!seconds || seconds < 0) return '00:00:00';
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const marks = calculateMarks(session, questions);
    const startTime = session.startTime ? new Date(session.startTime) : null;
    const endTime = session.endTime ? new Date(session.endTime) : null;
    const duration = startTime && endTime ? Math.floor((endTime - startTime) / 1000) : 0;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-200">
                            {session.studentName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{session.studentName}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span className="font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-600">{session.studentUid}</span>
                                <span>•</span>
                                <span className="text-indigo-600 font-medium">{testName}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-sm text-slate-500 mb-0.5">Overall Score</p>
                            <div className="flex items-baseline gap-1 justify-end">
                                <span className={`text-2xl font-black ${marks.percentage >= 40 ? 'text-emerald-600' : 'text-red-600'}`}>{marks.percentage}%</span>
                                <span className="text-sm text-slate-400">({marks.totalMarks}/{marks.totalPossible})</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Time Taken</p>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-indigo-500" />
                                <span className="font-mono font-bold text-slate-700">{formatDuration(duration)}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                session.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                {session.status}
                            </span>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Started</p>
                            <p className="text-sm font-medium text-slate-700">{startTime?.toLocaleString()}</p>
                        </div>
                        <div
                            className={`p-4 bg-white rounded-xl border transition cursor-pointer shadow-sm ${showViolations ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-100 hover:border-red-200'}`}
                            onClick={() => setShowViolations(!showViolations)}
                        >
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Violations</p>
                            {session.violations && Object.keys(session.violations).length > 0 ? (
                                <span className="text-red-600 font-bold flex items-center gap-1">
                                    <AlertCircle size={16} /> {Object.keys(session.violations).length}
                                    <ChevronDown size={14} className={`ml-auto transition ${showViolations ? 'rotate-180' : ''}`} />
                                </span>
                            ) : (
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                    <CheckCircle2 size={16} /> None
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Violations Details Table */}
                    {showViolations && session.violations && Object.keys(session.violations).length > 0 && (
                        <div className="mb-8 p-5 bg-red-50/50 border border-red-100 rounded-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                            <h4 className="text-sm font-bold text-red-900 mb-4 flex items-center gap-2">
                                <AlertCircle size={18} />
                                Security Violation Details
                            </h4>
                            <div className="space-y-4">
                                {Object.entries(session.violations).map(([vId, v]) => (
                                    <div key={vId} className="flex gap-4 p-4 bg-white rounded-lg border border-red-100 shadow-sm">
                                        <div className="bg-red-100 p-2 rounded-lg h-fit">
                                            <AlertCircle size={20} className="text-red-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-red-700 uppercase text-xs tracking-wider">{v.type}</span>
                                                <span className="text-xs text-slate-500 font-mono">{new Date(v.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed italic">"{v.details}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Question Analysis */}
                    <div className="space-y-8">
                        {/* Part 1: Objectives */}
                        <div>
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 sticky top-0 bg-slate-50 py-2 z-10 border-b border-slate-200">
                                <FileText size={18} className="text-indigo-600" />
                                Part 1: Objectives
                            </h4>
                            <div className="space-y-4">
                                {questions.filter(q => q.type !== 'coding' && q.type !== 'sql').map((q) => {
                                    const idx = questions.indexOf(q);
                                    const studentAns = session.answers?.[q.id];
                                    const isCorrect = studentAns === q.correctAnswer;
                                    const isSkipped = !studentAns;

                                    return (
                                        <div key={q.id} className={`bg-white rounded-xl border-l-4 shadow-sm overflow-hidden ${isCorrect ? 'border-l-emerald-500' : isSkipped ? 'border-l-slate-300' : 'border-l-red-500'
                                            }`}>
                                            <div className="p-5">
                                                <div className="flex items-start justify-between mb-3">
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-black uppercase">Question {idx + 1}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${isCorrect ? 'bg-emerald-100 text-emerald-700' :
                                                        isSkipped ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {isCorrect ? '✓ Correct' : isSkipped ? '○ Skipped' : '✗ Incorrect'}
                                                    </span>
                                                </div>

                                                <div className="mb-4 text-slate-800 text-sm">
                                                    <RichText text={q.question} />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Student Choice</p>
                                                        {studentAns ? (
                                                            <div className={`p-3 rounded-lg border flex items-center gap-3 ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
                                                                }`}>
                                                                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                                                                    }`}>
                                                                    {studentAns}
                                                                </span>
                                                                <span className="text-sm font-medium">
                                                                    {q.options && q.options[studentAns.charCodeAt(0) - 65] && (
                                                                        <RichText text={typeof q.options[studentAns.charCodeAt(0) - 65] === 'object' ? q.options[studentAns.charCodeAt(0) - 65].text : q.options[studentAns.charCodeAt(0) - 65]} />
                                                                    )}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 text-slate-400 text-sm italic">
                                                                Not Attempted
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Correct Solution</p>
                                                        <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 flex items-center gap-3">
                                                            <span className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                                                                {q.correctAnswer}
                                                            </span>
                                                            <span className="text-sm font-medium">
                                                                {q.options && q.options[q.correctAnswer.charCodeAt(0) - 65] && (
                                                                    <RichText text={typeof q.options[q.correctAnswer.charCodeAt(0) - 65] === 'object' ? q.options[q.correctAnswer.charCodeAt(0) - 65].text : q.options[q.correctAnswer.charCodeAt(0) - 65]} />
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Part 2: Practical */}
                        {questions.some(q => q.type === 'coding' || q.type === 'sql') && (
                            <div className="mt-12">
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 sticky top-0 bg-slate-50 py-2 z-10 border-b border-slate-200">
                                    <Plus size={18} className="text-purple-600" />
                                    Part 2: Practical Solutions
                                </h4>
                                <div className="space-y-6">
                                    {questions.filter(q => (q.type === 'coding' || q.type === 'sql') && (!session.assignedQuestions || session.assignedQuestions.includes(q.id))).map((q) => {
                                        const idx = questions.indexOf(q);
                                        const studentAns = session.answers?.[q.id];
                                        const isSkipped = !studentAns;

                                        return (
                                            <div key={q.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Question {idx + 1}</span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.type === 'sql' ? 'SQL Database' : 'Programming'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {isSkipped && (
                                                            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-[10px] font-black uppercase">No Submission</span>
                                                        )}
                                                        <div className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-lg border border-purple-200">
                                                            <span className="text-[10px] font-black text-purple-700 uppercase tracking-tight">Grade:</span>
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                min="0"
                                                                max="1"
                                                                value={localGrades[q.id]?.marks ?? ''}
                                                                onChange={(e) => setLocalGrades(prev => ({
                                                                    ...prev,
                                                                    [q.id]: { ...prev[q.id], marks: e.target.value }
                                                                }))}
                                                                placeholder="Marks (0-1)"
                                                                className="w-16 px-2 py-0.5 text-xs rounded border-slate-200 outline-none focus:ring-1 focus:ring-purple-500 font-bold text-purple-900"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    <div className="mb-6 text-slate-800 border-b border-slate-100 pb-4">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Requirement</p>
                                                        <RichText text={q.question} />
                                                        {q.imageUrl && (
                                                            <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white inline-block">
                                                                <img
                                                                    src={q.imageUrl}
                                                                    alt="Question Reference"
                                                                    className="max-w-full h-auto object-contain max-h-[300px]"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Student Response</p>
                                                            {studentAns ? (
                                                                <div className="relative group">
                                                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button
                                                                            onClick={() => {
                                                                                navigator.clipboard.writeText(studentAns);
                                                                                toast.success('Code copied!');
                                                                            }}
                                                                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded border border-white/20 text-white/50 hover:text-white transition"
                                                                            title="Copy to clipboard"
                                                                        >
                                                                            <Copy size={12} />
                                                                        </button>
                                                                    </div>
                                                                    <div className="p-6 bg-[#0d1117] rounded-xl border border-slate-800 text-[#e6edf3] font-mono text-sm overflow-x-auto whitespace-pre leading-relaxed shadow-inner max-h-[400px]">
                                                                        {studentAns}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-center text-sm italic">
                                                                    Student did not provide a solution for this task.
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Feedback (Optional)</p>
                                                            <textarea
                                                                value={localGrades[q.id]?.feedback || ''}
                                                                onChange={(e) => setLocalGrades(prev => ({
                                                                    ...prev,
                                                                    [q.id]: { ...prev[q.id], feedback: e.target.value }
                                                                }))}
                                                                placeholder="Add specific feedback for this solution..."
                                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm min-h-[150px] resize-none focus:ring-2 focus:ring-purple-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer with Save Action */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-between">
                    <div className="text-xs text-slate-500 max-w-md">
                        <p className="font-bold text-slate-700">Grading Note:</p>
                        <p>Manual grades for practical tasks will be added to the student's MCQ score for the final result. Percentage is recalculated automatically.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-white transition"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleSaveGrades}
                            disabled={isSavingGrades}
                            className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSavingGrades ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Grading
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
