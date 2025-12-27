"use client";
import React from "react";
import Styles from "./SATReport.module.css";
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import MathRenderer from "@/components/MathRenderer/MathRenderer.component";
import Header from "@/app/homepage/Header";

const SATReport = ({ questions, userAnswers, timeTaken }) => {
    const router = useRouter();

    const calculateScore = () => {
        let correct = 0;
        let attempted = 0;
        questions.forEach((q, index) => {
            const userAns = userAnswers[index];
            if (userAns !== undefined && userAns !== null && userAns !== "") {
                attempted++;
                if (String(userAns).trim() === String(q.answer).trim()) {
                    correct++;
                }
            }
        });
        return { correct, attempted, total: questions.length };
    };

    const { correct, attempted, total } = calculateScore();
    const percentage = Math.round((correct / total) * 100);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    // SVG Circular Progress
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className={Styles.reportPage}>
            <Header />
            <div className={Styles.reportContainer}>
                {/* Header */}
                <div className={Styles.header}>
                    <h1 className={Styles.title}>Exam Results</h1>
                </div>

                {/* Dashboard Grid */}
                <div className={Styles.statsOverview}>
                    {/* Left: Score Card */}
                    <div className={Styles.scoreCard}>
                        <div className={Styles.circularProgress}>
                            <svg width="200" height="200" viewBox="0 0 200 200">
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                                <circle
                                    cx="100" cy="100" r={radius}
                                    fill="none" stroke="#e2e8f0" strokeWidth="16"
                                />
                                <circle
                                    cx="100" cy="100" r={radius}
                                    fill="none" stroke="url(#scoreGradient)" strokeWidth="16"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                    transform="rotate(-90 100 100)"
                                />
                            </svg>
                            <div className={Styles.percentageText}>
                                <span className={Styles.percentageValue}>{percentage}%</span>
                                <span className={Styles.percentageLabel}>Score</span>
                            </div>
                        </div>
                        <div className={Styles.scoreSummary}>
                            <div className={Styles.scoreDetail}>{correct} Correct</div>
                            <div className={Styles.scoreSub}>out of {total} questions</div>
                        </div>
                    </div>

                    {/* Right: Detailed Metrics */}
                    <div className={Styles.metricsGrid}>
                        <div className={Styles.metricCard}>
                            <div className={`${Styles.metricIconWrapper} ${Styles.timeIcon}`}>
                                <Clock size={20} />
                            </div>
                            <div className={Styles.metricValue}>{formatTime(timeTaken)}</div>
                            <div className={Styles.metricLabel}>Time Taken</div>
                        </div>
                        <div className={Styles.metricCard}>
                            <div className={`${Styles.metricIconWrapper} ${Styles.correctIcon}`}>
                                <CheckCircle size={20} />
                            </div>
                            <div className={Styles.metricValue}>{correct}</div>
                            <div className={Styles.metricLabel}>Correct Answers</div>
                        </div>
                        <div className={Styles.metricCard}>
                            <div className={`${Styles.metricIconWrapper} ${Styles.wrongIcon}`}>
                                <XCircle size={20} />
                            </div>
                            <div className={Styles.metricValue}>{attempted - correct}</div>
                            <div className={Styles.metricLabel}>Incorrect Answers</div>
                        </div>
                        <div className={Styles.metricCard}>
                            <div className={`${Styles.metricIconWrapper} ${Styles.skippedIcon}`}>
                                <AlertCircle size={20} />
                            </div>
                            <div className={Styles.metricValue}>{total - attempted}</div>
                            <div className={Styles.metricLabel}>Skipped</div>
                        </div>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className={Styles.tableSection}>
                    <div className={Styles.sectionHeader}>
                        <h2 className={Styles.sectionTitle}>Question Analysis</h2>
                    </div>
                    <div className={Styles.tableContainer}>
                        <table className={Styles.table}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Topic</th>
                                    <th>Your Answer</th>
                                    <th>Correct Answer</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map((q, index) => {
                                    const userAns = userAnswers[index];
                                    const isSkipped = userAns === undefined || userAns === null || userAns === "";
                                    const isCorrect = !isSkipped && String(userAns).trim() === String(q.answer).trim();

                                    return (
                                        <tr key={index}>
                                            <td style={{ fontWeight: '600', color: '#64748b' }}>{index + 1}</td>
                                            <td>
                                                <span className={Styles.topicBadge}>{q.topic || "General"}</span>
                                            </td>
                                            <td className={Styles.mathContent}>
                                                {isSkipped ? (
                                                    <span style={{ color: '#94a3b8' }}>-</span>
                                                ) : (
                                                    <MathRenderer content={String(userAns)} />
                                                )}
                                            </td>
                                            <td className={Styles.mathContent}><MathRenderer content={String(q.answer)} /></td>
                                            <td>
                                                {isSkipped ? (
                                                    <span className={`${Styles.statusBadge} ${Styles.statusSkipped}`}>
                                                        <AlertCircle size={14} /> Skipped
                                                    </span>
                                                ) : isCorrect ? (
                                                    <span className={`${Styles.statusBadge} ${Styles.statusCorrect}`}>
                                                        <CheckCircle size={14} /> Correct
                                                    </span>
                                                ) : (
                                                    <span className={`${Styles.statusBadge} ${Styles.statusWrong}`}>
                                                        <XCircle size={14} /> Wrong
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SATReport;
