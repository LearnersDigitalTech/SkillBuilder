"use client";
import React, { useState } from 'react';
import CodingEnvironment from './CodingEnvironment';
import SQLEnvironment from './SQLEnvironment';
import RichText from '@/components/RichText/RichText';
import { CheckCircle2, Maximize2, X, ZoomIn, Image as ImageIcon } from 'lucide-react';

const QuestionRenderer = ({ question, answer, onChange, hideInput = false }) => {
    const [isZoomed, setIsZoomed] = useState(false);

    // Determine question type (default to MCQ if no type is specified)
    const type = question.type || 'mcq';

    if (type === 'coding' && !hideInput) {
        return (
            <CodingEnvironment
                question={question}
                initialValue={answer}
                onChange={(val) => onChange(question.id, val)}
            />
        );
    }

    if (type === 'sql' && !hideInput) {
        return (
            <SQLEnvironment
                question={question}
                initialValue={answer}
                onChange={(val) => onChange(question.id, val)}
            />
        );
    }

    const QuestionContent = () => (
        <div className="space-y-6">
            {question.imageUrl && (
                <div className="relative group cursor-zoom-in inline-block max-w-full">
                    <div
                        onClick={() => setIsZoomed(true)}
                        className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:border-indigo-300 bg-white group"
                    >
                        <img
                            src={question.imageUrl}
                            alt="Question Detail"
                            className="w-full h-auto object-contain max-h-[500px] transition-transform duration-500 group-hover:scale-[1.02]"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-2xl scale-50 group-hover:scale-100 transition-all duration-300 flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                                <Maximize2 size={16} />
                                Click to Expand
                            </div>
                        </div>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <ZoomIn size={10} />
                        Interactive Diagram
                    </p>
                </div>
            )}

            <div
                className="text-xl text-slate-800 leading-relaxed font-normal selection:bg-indigo-100"
                style={{ userSelect: 'text' }}
            >
                {question.isHtml ? (
                    <div
                        className="prose prose-slate max-w-none prose-base sm:prose-lg prose-pre:bg-slate-900 prose-pre:text-slate-100"
                        dangerouslySetInnerHTML={{ __html: question.question }}
                    />
                ) : (
                    <RichText text={question.question} />
                )}
            </div>

            {/* Requirements/Explanation Section for Practical Tasks */}
            {(type === 'coding' || type === 'sql') && question.explanation && (
                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        Constraints & Examples
                    </h4>
                    <div className="text-sm text-slate-700 font-medium whitespace-pre-line leading-relaxed">
                        {question.explanation}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className={`mx-auto ${hideInput ? 'w-full' : 'max-w-5xl'}`}>
            {/* Zoom Modal (Lightbox) */}
            {isZoomed && (
                <div
                    className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl flex flex-col p-4 md:p-8 animate-in fade-in duration-300"
                    onClick={() => setIsZoomed(false)}
                >
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <ImageIcon size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-sm uppercase tracking-widest">Detail View</h3>
                                <p className="text-slate-400 text-xs font-bold">Zooming high-resolution asset</p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
                            className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-2xl transition-all hover:rotate-90 active:scale-95 border border-white/10"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center overflow-hidden">
                        <img
                            src={question.imageUrl}
                            alt="Zoomed Detail"
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div className="mt-6 text-center">
                        <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
                            Click outside or press X to close
                        </span>
                    </div>
                </div>
            )}

            <div className="flex flex-col text-left">
                <QuestionContent />

                {/* Options (Only for MCQ) */}
                {!hideInput && type === 'mcq' && (
                    <div className="mt-12 space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            Select the correct choice
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                            {(question.shuffledOptions || question.options || []).map((option, idx) => {
                                const optionLetter = String.fromCharCode(65 + idx);
                                const optText = typeof option === 'object' ? option.text : option;

                                // Selection check: Compare with originalIndex if shuffling is active, otherwise compare with optionLetter
                                const isSelected = (option.originalIndex !== undefined)
                                    ? answer === String.fromCharCode(65 + option.originalIndex)
                                    : answer === optionLetter;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => onChange(question.id, optionLetter)}
                                        className={`group relative flex items-center p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden ${isSelected
                                                ? 'bg-indigo-50 border-indigo-600 shadow-lg shadow-indigo-100 translate-x-1'
                                                : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50 hover:translate-x-1'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-black text-lg transition-all duration-300 ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'bg-slate-100 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50'
                                            }`}>
                                            {optionLetter}
                                        </div>
                                        <div className={`ml-6 flex-1 text-base font-semibold leading-relaxed transition-colors duration-300 ${isSelected ? 'text-indigo-900' : 'text-slate-700'
                                            }`}>
                                            <RichText text={optText} />
                                        </div>
                                        {isSelected && (
                                            <div className="absolute right-6 animate-in zoom-in duration-300">
                                                <CheckCircle2 className="text-indigo-600" size={28} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionRenderer;
