"use client";
import React, { useState, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, Edit2, Save, Trash2, Image as ImageIcon, Upload, XCircle } from 'lucide-react';
import KaTeXRenderer from './KaTeXRenderer';

/**
 * Modal for previewing and editing AI-extracted questions
 */
export default function QuestionPreviewModal({
    questions,
    onClose,
    onSave,
    subject
}) {
    const [editedQuestions, setEditedQuestions] = useState(questions);
    const [editingIndex, setEditingIndex] = useState(null);
    const [selectedQuestions, setSelectedQuestions] = useState(new Set());

    const handleEdit = (index, field, value) => {
        const updated = [...editedQuestions];
        if (field === 'options') {
            updated[index].options = value;
        } else {
            updated[index][field] = value;
        }
        setEditedQuestions(updated);
    };

    const handleDelete = (index) => {
        if (confirm('Delete this question?')) {
            const updated = editedQuestions.filter((_, i) => i !== index);
            setEditedQuestions(updated);
        }
    };

    const toggleSelect = (index) => {
        const newSelected = new Set(selectedQuestions);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedQuestions(newSelected);
    };

    const selectAll = () => {
        if (selectedQuestions.size === editedQuestions.length) {
            setSelectedQuestions(new Set());
        } else {
            setSelectedQuestions(new Set(editedQuestions.map((_, i) => i)));
        }
    };

    const deleteSelected = () => {
        if (confirm(`Delete ${selectedQuestions.size} selected questions?`)) {
            const updated = editedQuestions.filter((_, i) => !selectedQuestions.has(i));
            setEditedQuestions(updated);
            setSelectedQuestions(new Set());
        }
    };

    const handleSave = () => {
        if (editedQuestions.length === 0) {
            alert('No questions to save!');
            return;
        }
        onSave(editedQuestions);
    };

    // Handle image upload for a question
    const handleImageUpload = (index, event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        // Convert to base64 data URL
        const reader = new FileReader();
        reader.onload = (e) => {
            const updated = [...editedQuestions];
            updated[index].imageUrl = e.target.result;
            updated[index].hasImage = true;
            setEditedQuestions(updated);
        };
        reader.readAsDataURL(file);
    };

    // Handle image deletion for a question
    const handleImageDelete = (index) => {
        if (confirm('Remove this image from the question?')) {
            const updated = [...editedQuestions];
            updated[index].imageUrl = null;
            updated[index].hasImage = false;
            setEditedQuestions(updated);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Review Extracted Questions</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {editedQuestions.length} questions found • Review and edit before saving
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={selectAll}
                            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            {selectedQuestions.size === editedQuestions.length ? 'Deselect All' : 'Select All'}
                        </button>
                        {selectedQuestions.size > 0 && (
                            <button
                                onClick={deleteSelected}
                                className="px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Delete Selected ({selectedQuestions.size})
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Save size={16} />
                            Save {editedQuestions.length} Questions
                        </button>
                    </div>
                </div>

                {/* Questions List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {editedQuestions.map((q, index) => (
                        <div
                            key={index}
                            className={`border-2 rounded-2xl p-5 transition-all ${selectedQuestions.has(index)
                                ? 'border-indigo-500 bg-indigo-50/50'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Checkbox */}
                                <input
                                    type="checkbox"
                                    checked={selectedQuestions.has(index)}
                                    onChange={() => toggleSelect(index)}
                                    className="mt-1 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />

                                {/* Question Number */}
                                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
                                    {q.no}
                                </div>

                                {/* Question Content */}
                                <div className="flex-1">
                                    {editingIndex === index ? (
                                        // Edit Mode
                                        <div className="space-y-3">
                                            <textarea
                                                value={q.question}
                                                onChange={(e) => handleEdit(index, 'question', e.target.value)}
                                                className="w-full p-3 border border-slate-300 rounded-lg font-medium text-slate-800 resize-none"
                                                rows={3}
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {['A', 'B', 'C', 'D'].map((letter, i) => (
                                                    <input
                                                        key={letter}
                                                        value={q.options[i]}
                                                        onChange={(e) => {
                                                            const newOptions = [...q.options];
                                                            newOptions[i] = e.target.value;
                                                            handleEdit(index, 'options', newOptions);
                                                        }}
                                                        className="p-2 border border-slate-300 rounded-lg text-sm"
                                                        placeholder={`Option ${letter}`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <select
                                                    value={q.correctAnswer}
                                                    onChange={(e) => handleEdit(index, 'correctAnswer', e.target.value)}
                                                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium"
                                                >
                                                    <option value="A">A</option>
                                                    <option value="B">B</option>
                                                    <option value="C">C</option>
                                                    <option value="D">D</option>
                                                </select>
                                                <input
                                                    value={q.explanation}
                                                    onChange={(e) => handleEdit(index, 'explanation', e.target.value)}
                                                    className="flex-1 p-2 border border-slate-300 rounded-lg text-sm"
                                                    placeholder="Explanation"
                                                />
                                            </div>
                                            <button
                                                onClick={() => setEditingIndex(null)}
                                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                Done Editing
                                            </button>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <div>
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex-1">
                                                    <KaTeXRenderer
                                                        text={q.question}
                                                        className="text-slate-800 font-bold text-base"
                                                    />
                                                    {q.hasFormula && (
                                                        <span className="ml-2 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                                            {q.formulaType || 'formula'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setEditingIndex(index)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(index)}
                                                        className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>


                                            {/* Image Section - Upload or Preview */}
                                            <div className="mb-3">
                                                {q.imageUrl ? (
                                                    // Image exists - show preview with delete option
                                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <ImageIcon size={16} className="text-slate-500" />
                                                                <span className="text-xs font-medium text-slate-600">Attached Image</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleImageDelete(index)}
                                                                className="flex items-center gap-1 px-2 py-1 text-xs text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                                                title="Remove image"
                                                            >
                                                                <XCircle size={14} />
                                                                <span>Remove</span>
                                                            </button>
                                                        </div>
                                                        <img
                                                            src={q.imageUrl}
                                                            alt="Question diagram"
                                                            className="max-w-sm rounded-lg border border-slate-200"
                                                        />
                                                    </div>
                                                ) : (
                                                    // No image - show upload option
                                                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-colors">
                                                        <Upload size={18} className="text-slate-400" />
                                                        <span className="text-sm text-slate-500">Click to upload an image for this question</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageUpload(index, e)}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                )}
                                            </div>

                                            {/* Options */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                                {q.options?.map((opt, i) => (
                                                    <div
                                                        key={i}
                                                        className={`p-3 rounded-lg text-sm border ${String.fromCharCode(65 + i) === q.correctAnswer
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                                                            : 'bg-slate-50 border-slate-200 text-slate-700'
                                                            }`}
                                                    >
                                                        <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                                                        <KaTeXRenderer text={opt} />
                                                        {String.fromCharCode(65 + i) === q.correctAnswer && (
                                                            <CheckCircle2 size={14} className="inline ml-2" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Explanation */}
                                            {q.explanation && (
                                                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                                    <span className="text-xs font-bold text-indigo-700">Explanation: </span>
                                                    <KaTeXRenderer
                                                        text={q.explanation}
                                                        className="text-xs text-indigo-700"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
