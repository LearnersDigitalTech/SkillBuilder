import React, { useState, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { TrendingUp, Award, AlertCircle, Clock, CheckCircle2, Timer, ChevronRight, CalendarDays } from 'lucide-react';

const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Emerald 500
    if (score >= 50) return '#f59e0b'; // Amber 500
    return '#ef4444'; // Red 500
};

const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 50) return 'Good';
    return 'Needs Practice';
};

const formatTimeTaken = (seconds) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
};

// Helper: Smart Tick Formatter
const getSmartAxisLabel = (timestamp, mode) => {
    const date = new Date(timestamp);
    if (mode === 'TIME') {
        return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    }
    if (mode === 'DATETIME') {
        return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const score = data.score;
        const color = getScoreColor(score);
        const statusLabel = getScoreLabel(score);

        return (
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-xl min-w-[240px] max-w-[280px]">
                {/* Header: Date and Time */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-blue-500" />
                        <span>{data.fullDate}</span>
                    </div>
                </div>

                {/* Score Section */}
                <div className="flex items-center gap-4 mb-4">
                    <div
                        className="flex items-center justify-center w-12 h-12 rounded-xl shadow-sm"
                        style={{ backgroundColor: `${color}15`, color: color, boxShadow: `0 4px 6px -1px ${color}10` }}
                    >
                        {score >= 80 ? <Award size={26} /> :
                            score >= 50 ? <TrendingUp size={26} /> :
                                <AlertCircle size={26} />}
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-slate-900 leading-none tracking-tight">
                            {score}%
                        </div>
                        <div className="text-sm font-semibold mt-1" style={{ color: color }}>
                            {statusLabel}
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl mb-3 border border-slate-100">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <Timer size={12} /> Time
                        </div>
                        <div className="text-sm font-bold text-slate-700">
                            {data.timeTaken}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <CheckCircle2 size={12} /> Attempted
                        </div>
                        <div className="text-sm font-bold text-slate-700">
                            {data.attempted}/{data.totalQuestions}
                        </div>
                    </div>
                </div>

                {/* Click Hint */}
                <div className="flex items-center justify-center gap-1 pt-1 text-xs font-semibold text-blue-500 cursor-pointer hover:text-blue-600 transition-colors">
                    <span>Tap to view report</span>
                    <ChevronRight size={14} />
                </div>
            </div>
        );
    }
    return null;
};

// Interactive Dot with Hover Effect
const CustomizedDot = (props) => {
    const { cx, cy, value, payload, onClick } = props;
    const color = getScoreColor(value);

    return (
        <g onClick={(e) => onClick && onClick(payload)} style={{ cursor: 'pointer' }}>
            {/* Extended Touch Area */}
            <circle cx={cx} cy={cy} r={24} fill="transparent" />
            {/* Core Dot */}
            <circle cx={cx} cy={cy} r={5} fill={color} stroke="none" />
            {/* Ring */}
            <circle cx={cx} cy={cy} r={8} fill="none" stroke={color} strokeWidth="2" opacity="0.4" />
        </g>
    );
};

const FilterButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`
            px-4 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-medium rounded-full transition-all duration-200 ease-out whitespace-nowrap
            ${active
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-1 ring-offset-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }
        `}
    >
        {children}
    </button>
);

const ProgressChart = ({ data, type = 'ASSESSMENT', onPointClick }) => {
    const [filterMode, setFilterMode] = useState('RECENT'); // 'RECENT', 'WEEK', 'MONTH'

    const color = type === 'ASSESSMENT' ? '#667eea' : '#f59e0b';
    const gradientId = `colorGradient${type}`;

    const { chartData, labelMode } = useMemo(() => {
        if (!data || data.length === 0) return { chartData: [], labelMode: 'DATE' };

        // Sort: Oldest -> Newest
        const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        let filtered = [];
        const now = new Date();

        if (filterMode === 'RECENT') {
            filtered = sortedData.slice(-7);
        } else if (filterMode === 'WEEK') {
            const cutoff = new Date();
            cutoff.setDate(now.getDate() - 7);
            filtered = sortedData.filter(d => new Date(d.timestamp) >= cutoff);
        } else if (filterMode === 'MONTH') {
            const cutoff = new Date();
            cutoff.setDate(now.getDate() - 30);
            filtered = sortedData.filter(d => new Date(d.timestamp) >= cutoff);
        }

        if (filtered.length === 0) return { chartData: [], labelMode: 'DATE' };

        // Smart Label Logic: Simplify to "Time" OR "Date". Prevents long "Date + Time" labels.
        const uniqueDays = new Set(filtered.map(item => new Date(item.timestamp).toDateString()));
        let mode = 'DATE';

        if (uniqueDays.size === 1) {
            mode = 'TIME';
        }
        // Force simple DATE mode for multi-day views to keep UI clean. 
        // Users can hover/click for exact timestamp details.

        const formatted = filtered.map(report => ({
            id: report.id,
            timestamp: report.timestamp,
            axisLabel: getSmartAxisLabel(report.timestamp, mode),
            dateLabel: new Date(report.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            fullDate: new Date(report.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
            timeLabel: new Date(report.timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
            score: Math.round(report.summary?.accuracyPercent || 0),
            // Fix: Rapid Math saves 'timeTaken' directly, and 'totalQuestions' implies attempts
            timeTaken: formatTimeTaken(report.summary?.totalTime || report.summary?.timeTaken || 0),
            attempted: report.summary?.attempted || report.summary?.totalQuestions || 0,
            totalQuestions: report.summary?.totalQuestions || 0
        }));

        return { chartData: formatted, labelMode: mode };
    }, [data, filterMode]);

    if (!data || data.length === 0) return null;

    return (
        <div className="w-full h-[360px] md:h-[440px] bg-white rounded-3xl p-4 md:p-6 mb-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 gap-4">
                <div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                        <div
                            className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${color}15`, color: color }}
                        >
                            <TrendingUp size={20} className="md:w-6 md:h-6" />
                        </div>
                        Performance Trend
                    </h3>
                    <p className="mt-1.5 text-xs md:text-sm text-slate-500 font-medium ml-1">
                        {filterMode === 'RECENT' ? 'Last 7 attempts' :
                            filterMode === 'WEEK' ? 'Last 7 days' : 'Last 30 days'}
                    </p>
                </div>

                <div className="flex gap-2 bg-slate-50 p-1.5 rounded-full w-full md:w-auto overflow-x-auto no-scrollbar border border-slate-100">
                    <FilterButton active={filterMode === 'RECENT'} onClick={() => setFilterMode('RECENT')}>Recent</FilterButton>
                    <FilterButton active={filterMode === 'WEEK'} onClick={() => setFilterMode('WEEK')}>Week</FilterButton>
                    <FilterButton active={filterMode === 'MONTH'} onClick={() => setFilterMode('MONTH')}>Month</FilterButton>
                </div>
            </div>

            {/* Goal Line Label */}
            <div className="absolute top-24 right-6 md:right-8 flex items-center gap-1.5 opacity-80 pointer-events-none z-10 hidden md:flex">
                <span className="text-[10px] text-emerald-500 font-bold tracking-wider">EXCELLENCE GOAL</span>
                <div className="w-6 h-px border-t-2 border-dashed border-emerald-500"></div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full min-h-0">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: -20, bottom: 20 }}
                        >
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="axisLabel"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                dy={10}
                                interval="preserveStartEnd"
                                minTickGap={15}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                domain={[0, 100]}
                                dx={-5}
                            />

                            <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5} strokeOpacity={0.5} />

                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '4 4' }} />

                            <Area
                                type="natural"
                                dataKey="score"
                                stroke={color}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill={`url(#${gradientId})`}
                                animationDuration={1000}
                                dot={<CustomizedDot onClick={onPointClick} />}
                                activeDot={{
                                    r: 6,
                                    strokeWidth: 4,
                                    stroke: 'white',
                                    fill: color,
                                    cursor: 'pointer',
                                    onClick: (e, payload) => onPointClick && onPointClick(payload.payload)
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                        <Clock size={48} className="opacity-20" />
                        <p className="text-sm font-medium">No activity in this period</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressChart;
