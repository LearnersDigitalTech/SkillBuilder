"use client";
import React, { useState, useEffect } from 'react';
import RichText from '@/components/RichText/RichText';
import { Database, FileCode, Maximize2, Minimize2, Table } from 'lucide-react';

const SQLEnvironment = ({ question, initialValue, onChange }) => {
    const [query, setQuery] = useState(initialValue || "");
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        setQuery(initialValue || "");
    }, [initialValue]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setQuery(newValue);
        onChange(newValue);
    };

    return (
        <div className={`flex flex-col lg:flex-row gap-4 h-full min-h-[500px] ${isExpanded ? 'fixed inset-0 z-[60] bg-slate-900 p-4' : ''}`}>
            {/* Left: SQL Schema & Context */}
            <div className={`flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${isExpanded ? 'lg:max-w-md' : ''}`}>
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Database size={18} className="text-indigo-600" />
                        <h3 className="font-bold text-slate-700">SQL Schema & Task</h3>
                    </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto prose prose-slate max-w-none text-slate-800">
                    <RichText text={question.question} />
                    {question.imageUrl && (
                        <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
                            <img
                                src={question.imageUrl}
                                alt="Reference Diagram"
                                className="w-full h-auto object-contain max-h-[300px]"
                            />
                        </div>
                    )}

                    {/* Schema Visualization Placeholder/Example if needed */}
                    {question.schema && (
                        <div className="mt-6">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                                <Table size={14} /> Schema Information
                            </h4>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-xs text-indigo-900">
                                <RichText text={question.schema} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: SQL Editor */}
            <div className="flex-[1.5] flex flex-col bg-[#0d1117] rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
                <div className="bg-[#161b22] px-6 py-3 border-b border-[#30363d] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                        </div>
                        <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-[#21262d] rounded text-xs text-slate-300 font-mono">
                            <FileCode size={14} className="text-[#58a6ff]" />
                            <span>query.sql</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 hover:bg-[#21262d] rounded text-slate-400 transition"
                    >
                        {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                </div>

                <div className="flex-1 relative font-mono text-sm group">
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#090c10] border-r border-[#30363d] flex flex-col items-center pt-4 text-[#484f58] select-none">
                        {query.split('\n').map((_, i) => (
                            <div key={i} className="leading-6 h-6">{i + 1}</div>
                        ))}
                    </div>
                    <textarea
                        value={query}
                        onChange={handleChange}
                        spellCheck={false}
                        placeholder="-- Write your SQL query here e.g., SELECT * FROM users;"
                        className="w-full h-full bg-transparent text-[#e6edf3] pl-16 pr-6 py-4 focus:outline-none resize-none leading-6 placeholder:text-slate-600 font-mono"
                    />
                </div>

                <div className="bg-[#161b22] px-4 py-2 border-t border-[#30363d] flex items-center justify-between text-[10px] text-slate-500 font-mono text-right">
                    <span>Pos: {query.length} chars</span>
                </div>
            </div>
        </div>
    );
};

export default SQLEnvironment;
