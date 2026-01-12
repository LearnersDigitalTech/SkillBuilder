"use client";
import React, { useState, useEffect } from 'react';
import RichText from '@/components/RichText/RichText';
import { Code2, FileText, Maximize2, Minimize2 } from 'lucide-react';

const CodingEnvironment = ({ question, initialValue, onChange }) => {
    const [code, setCode] = useState(initialValue || "");
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        setCode(initialValue || "");
    }, [initialValue]);

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newValue = code.substring(0, start) + "    " + code.substring(end);
            setCode(newValue);
            onChange(newValue);

            // Set cursor position after tab
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }, 0);
        }
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        setCode(newValue);
        onChange(newValue);
    };

    return (
        <div className={`flex flex-col lg:flex-row gap-4 h-full min-h-[500px] ${isExpanded ? 'fixed inset-0 z-[60] bg-slate-900 p-4' : ''}`}>
            {/* Left: Question Description */}
            <div className={`flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${isExpanded ? 'lg:max-w-md' : ''}`}>
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                    <FileText size={18} className="text-indigo-600" />
                    <h3 className="font-bold text-slate-700">Problem Description</h3>
                </div>
                <div className="flex-1 p-6 overflow-y-auto prose prose-slate max-w-none">
                    <RichText text={question.question} />
                    {question.imageUrl && (
                        <div className="mt-4">
                            <img src={question.imageUrl} alt="Reference" className="max-w-full rounded-lg shadow-sm" />
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Coding Area */}
            <div className="flex-[1.5] flex flex-col bg-[#1e1e1e] rounded-2xl shadow-xl border border-slate-700 overflow-hidden relative">
                <div className="bg-[#2d2d2d] px-6 py-3 border-b border-[#3d3d3d] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                        </div>
                        <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-[#3d3d3d] rounded text-xs text-slate-300 font-mono">
                            <Code2 size={14} className="text-indigo-400" />
                            <span>solution.py</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 hover:bg-[#3d3d3d] rounded text-slate-400 transition"
                    >
                        {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                </div>

                <div className="flex-1 relative font-mono text-sm">
                    {/* Line Numbers Fake View */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#252525] border-r border-[#333] flex flex-col items-center pt-4 text-[#858585] select-none">
                        {code.split('\n').map((_, i) => (
                            <div key={i} className="leading-6 h-6">{i + 1}</div>
                        ))}
                    </div>
                    <textarea
                        value={code}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        spellCheck={false}
                        placeholder="# Write your code here..."
                        className="w-full h-full bg-transparent text-[#d4d4d4] pl-16 pr-6 py-4 focus:outline-none resize-none leading-6 placeholder:text-slate-600"
                    />
                </div>

                <div className="bg-[#2d2d2d] px-4 py-2 border-t border-[#3d3d3d] flex items-center justify-between text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                    <span>UTF-8</span>
                    <span>Spaces: 4</span>
                </div>
            </div>
        </div>
    );
};

export default CodingEnvironment;
