"use client";
import React, { useContext, useEffect, useState } from "react";
import Styles from "../../app/quiz/quiz-result/QuizResult.module.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

// ... existing code ...

const HeroChart = ({ summary, notAttempted }) => {
    const data = [
        {
            name: 'Performance',
            correct: summary.correct,
            wrong: summary.wrong,
            skipped: notAttempted,
        },
    ];

    return (
        <div className={Styles.heroChartContainer}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data} barSize={20}>
                    <XAxis type="number" hide domain={[0, 'dataMax']} />
                    <YAxis type="category" dataKey="name" hide />
                    <RechartsTooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="correct" stackId="a" fill="#16a34a" radius={[4, 0, 0, 4]} />
                    <Bar dataKey="wrong" stackId="a" fill="#dc2626" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="skipped" stackId="a" fill="#d97706" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                <span>{summary.correct} Correct</span>
                <span>{summary.wrong} Wrong</span>
            </div>
        </div>
    );
};

import Navigation from "@/components/Navigation/Navigation.component";
import MathRenderer from "@/components/MathRenderer/MathRenderer.component";
import { CheckCircle, XCircle, HelpCircle, Clock, Target, BookOpen, TrendingUp, BarChart3, FileText, X, AlertCircle } from "lucide-react";
import { QuizSessionContext } from "../../app/context/QuizSessionContext";
import analyzeResponses from "@/app/workload/GenerateReport";
import Footer from "@/components/Footer/Footer.component";
import { ref, set, get } from "firebase/database";
import { firebaseDatabase, getUserDatabaseKey } from "@/backend/firebaseHandler";
import { useRouter } from "next/navigation";
import { Button, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress, TextField, MenuItem, Link as MuiLink } from "@mui/material";
import { useAuth } from "@/context/AuthContext";


const formatAnswer = (answer) => {
    if (!answer) return "";
    try {
        // Only try to parse if it looks like a JSON object
        if (typeof answer === 'string' && answer.trim().startsWith('{')) {
            const parsed = JSON.parse(answer);
            const values = Object.values(parsed);

            // Check if values are complex objects
            if (values.length > 0 && typeof values[0] === 'object') {
                return values.map(v => {
                    if (v.num !== undefined && v.den !== undefined) {
                        return `$\\frac{${v.num}}{${v.den}}$`;
                    }
                    if (v.x !== undefined && v.y !== undefined) {
                        return `(${v.x}, ${v.y})`;
                    }
                    // Handle True/False variant (which might store value directly or in object?)
                    // In TypeTableInput we saw it stores key: val directly?
                    // Actually checking the code: 
                    // TypeTableInput (default): answers[idx] = value (string) -> JSON: {"0":"True"}
                    // So it falls to the 'else' block below (values.join).
                    if (v.value !== undefined) {
                        return v.value;
                    }
                    return JSON.stringify(v);
                }).join(', ');
            }

            return values.join(', ');
        }
    } catch (e) {
        // console.error("Error parsing answer JSON", e);
    }
    return answer;
};

const QuizResultClient = () => {

    const [quizSession, setQuizSession] = useContext(QuizSessionContext);
    const { user, userData } = useAuth();
    const router = useRouter();

    const [reportState, setReportState] = useState(null);
    const [loadingReport, setLoadingReport] = useState(true);

    useEffect(() => {
        const loadReport = async () => {
            try {
                const userGrade = quizSession?.userDetails?.activeChild?.grade || quizSession?.userDetails?.grade;
                // Case 1: We have an in-memory quizSession with questionPaper (coming directly from quiz)
                if (quizSession?.questionPaper && userGrade) {
                    const computed = analyzeResponses(quizSession.questionPaper, userGrade);
                    setReportState({
                        summary: computed.summary,
                        topicFeedback: computed.topicFeedback,
                        perQuestionReport: computed.perQuestionReport,
                        learningPlanSummary: computed.learningPlanSummary,
                    });
                    return;
                }

                // Case 2: Revisit results later: fetch stored report for active child from Firebase
                if (!user || !userData?.children) {
                    return;
                }

                // Get user key (works for phone, Google, and email auth)
                const userKey = getUserDatabaseKey(user);
                const children = userData.children;
                const childKeys = Object.keys(children);
                if (childKeys.length === 0) return;

                let activeChildId = childKeys[0];
                if (childKeys.length > 1 && typeof window !== "undefined") {
                    const storedChildId = window.localStorage.getItem(`activeChild_${userKey}`);
                    if (storedChildId && childKeys.includes(storedChildId)) {
                        activeChildId = storedChildId;
                    }
                }

                const reportRef = ref(firebaseDatabase, `NMD_2025/Reports/${userKey}/${activeChildId}`);
                const snapshot = await get(reportRef);
                if (!snapshot.exists()) {
                    return;
                }

                const data = snapshot.val();
                let parsed = {};
                try {
                    parsed = data.generalFeedbackStringified ? JSON.parse(data.generalFeedbackStringified) : {};
                } catch (e) {
                    parsed = {};
                }

                setReportState({
                    summary: data.summary,
                    topicFeedback: parsed.topicFeedback || {},
                    perQuestionReport: parsed.perQuestionReport || [],
                    learningPlanSummary: parsed.learningPlanSummary || "",
                });
            } finally {
                setLoadingReport(false);
            }
        };

        loadReport();
    }, [quizSession, user, userData]);

    const rawSummary = reportState?.summary || {
        totalQuestions: 0,
        attempted: 0,
        correct: 0,
        wrong: 0,
        accuracyPercent: 0,
    };

    // Ensure accuracy is based on totalQuestions (e.g., 30/30 -> 100%)
    const summary = {
        ...rawSummary,
        accuracyPercent:
            rawSummary.totalQuestions > 0
                ? Math.round((rawSummary.correct / rawSummary.totalQuestions) * 100)
                : 0,
    };

    const topicFeedback = reportState?.topicFeedback || {};
    const perQuestionReport = reportState?.perQuestionReport || [];
    const learningPlanSummary = reportState?.learningPlanSummary || "";
    const notAttempted = summary.totalQuestions - summary.attempted;

    // Modal states
    const [topicModalOpen, setTopicModalOpen] = useState(false);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);

    // Tutor booking dialog state
    const [tutorDialogOpen, setTutorDialogOpen] = useState(false);
    const [tutorSubmitting, setTutorSubmitting] = useState(false);
    const [tutorSuccess, setTutorSuccess] = useState("");
    const [tutorError, setTutorError] = useState("");
    const [tutorForm, setTutorForm] = useState({
        phone: "",
    });

    useEffect(() => {
        if (!quizSession?.questionPaper) {
            return;
        }
        // Get user key from quizSession (already set correctly in Start Assessment)
        // For multi-profile, we need the parent key and the child key
        const userKey = quizSession?.userDetails?.userKey || quizSession?.userDetails?.parentPhone || quizSession?.userDetails?.parentEmail || quizSession?.userDetails?.phoneNumber;
        // fallback to phoneNumber if parentPhone is missing (legacy single user) uses phoneNumber as key

        const childId = quizSession?.userDetails?.activeChildId || "default";

        if (!userKey) return;

        // Correct path: NMD_2025/Reports/{parentKey}/{childId}
        // If it's a legacy user (no activeChildId), they might be stored at root or default? 
        // Let's stick to the new structure: Reports/ParentKey/ChildKey
        const finalParentKey = userKey.replace('.', '_'); // sanitize email if needed, though phone is preferred

        const reportRef = ref(firebaseDatabase, `NMD_2025/Reports/${finalParentKey}/${childId}`);
        set(reportRef, {
            summary,
            generalFeedbackStringified: JSON.stringify({
                topicFeedback,
                perQuestionReport,
                learningPlanSummary,
            }),
            timestamp: new Date().toISOString(),
        }).then(() => {
            console.log("Report saved successfully");
        }).catch((error) => {
            console.error("Error saving report:", error);
        });
    }, [quizSession?.questionPaper, summary, topicFeedback, perQuestionReport, learningPlanSummary]);

    const parseLearningPlan = (text) => {
        const parts = text.split("Time Tip:");
        const nextSteps = parts[0] ? parts[0].split("\n- ").filter(item => item.trim().length > 0) : [];
        return {
            intro: nextSteps[0]?.split("\n")[0] || "",
            steps: nextSteps.map(s => s.replace(nextSteps[0]?.split("\n")[0], "").trim()).filter(s => s),
            timeTips: parts[1] ? parts[1].split("\n- ").filter(item => item.trim().length > 0) : []
        };
    };

    const learningPlan = parseLearningPlan(learningPlanSummary);

    // Determine which student's identity to show in the header.
    let displayName = quizSession?.userDetails?.activeChild?.name || quizSession?.userDetails?.name || "";
    let displayGrade = quizSession?.userDetails?.activeChild?.grade || quizSession?.userDetails?.grade || "";
    let displayPhone = quizSession?.userDetails?.phoneNumber || quizSession?.userDetails?.parentPhone || "";

    if ((!displayName || !displayGrade) && user && userData?.children) {
        // Get user key (works for phone, Google, and email auth)
        const userKey = getUserDatabaseKey(user);
        const children = userData.children;
        const childKeys = Object.keys(children);
        if (childKeys.length > 0) {
            let activeChildId = childKeys[0];
            if (childKeys.length > 1 && typeof window !== "undefined") {
                const storedChildId = window.localStorage.getItem(`activeChild_${userKey}`);
                if (storedChildId && childKeys.includes(storedChildId)) {
                    activeChildId = storedChildId;
                }
            }
            const activeChild = children[activeChildId];
            if (activeChild) {
                displayName = activeChild.name || displayName;
                displayGrade = activeChild.grade || displayGrade;
                // For phone display, use actual phone number (not UID)
                if (user.phoneNumber) {
                    displayPhone = user.phoneNumber.slice(-10);
                } else if (userData?.phoneNumber) {
                    displayPhone = userData.phoneNumber;
                } else {
                    displayPhone = ""; // No phone available
                }
            }
        }
    }

    const handleOpenTutorDialog = () => {
        setTutorSuccess("");
        setTutorError("");

        setTutorForm({
            phone: displayPhone || (user?.phoneNumber ? user.phoneNumber.slice(-10) : ""),
        });

        setTutorDialogOpen(true);
    };

    const handleTutorFieldChange = (field) => (event) => {
        const value = event.target.value;
        setTutorForm((prev) => ({ ...prev, [field]: value }));
    };

    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [latestBooking, setLatestBooking] = useState(null);

    const [tutorSuccessDialogOpen, setTutorSuccessDialogOpen] = useState(false);

    const handleSubmitTutorBooking = async (event) => {
        event.preventDefault();
        setTutorSuccess("");
        setTutorError("");

        if (!tutorForm.phone || tutorForm.phone.trim().length < 10) {
            setTutorError("Please enter a valid phone number.");
            return;
        }

        try {
            setTutorSubmitting(true);

            // Get user key (works for phone, Google, and email auth)
            let userKey = "";
            if (quizSession?.userDetails?.phoneNumber) {
                userKey = quizSession.userDetails.phoneNumber;
            } else if (user?.phoneNumber) {
                userKey = user.phoneNumber.slice(-10);
            } else if (user?.uid) {
                userKey = user.uid;
            }

            let childId = quizSession?.userDetails?.childId || "default";
            if (!quizSession?.userDetails?.childId && userData?.children) {
                const children = userData.children;
                const childKeys = Object.keys(children);
                if (childKeys.length > 0) {
                    let activeChildId = childKeys[0];
                    if (childKeys.length > 1 && typeof window !== "undefined") {
                        const storedChildId = window.localStorage.getItem(`activeChild_${userKey}`);
                        if (storedChildId && childKeys.includes(storedChildId)) {
                            activeChildId = storedChildId;
                        }
                    }
                    childId = activeChildId;
                }
            }

            const bookingId = `${childId}_${Date.now()}`;
            const bookingRef = ref(firebaseDatabase, `NMD_2025/TutorBookings/${userKey}/${bookingId}`);

            // Auto-populate all fields from session data
            const bookingPayload = {
                parentName: displayName || "",
                studentName: displayName || "",
                grade: displayGrade || "",
                phone: tutorForm.phone,
                preferredDate: "", // Will be scheduled by counselor
                preferredTimeSlot: "", // Will be scheduled by counselor
                mode: "To be decided", // Will be decided by counselor
                notes: "",
                reportSummary: summary,
                createdAt: new Date().toISOString(),
            };

            await set(bookingRef, bookingPayload);

            // Also send to Google Apps Script webhook (for Sheets + email) in the background.
            // This is fire-and-forget so any network issue does not affect the user flow.
            const webhookUrl = process.env.NEXT_PUBLIC_TUTOR_BOOKING_WEBHOOK;
            if (webhookUrl) {
                fetch(webhookUrl, {
                    method: "POST",
                    headers: {
                        // Use text/plain to avoid CORS preflight; Apps Script will still
                        // receive the raw JSON string in e.postData.contents.
                        "Content-Type": "text/plain;charset=utf-8",
                    },
                    body: JSON.stringify({
                        parentName: bookingPayload.parentName,
                        studentName: bookingPayload.studentName,
                        grade: bookingPayload.grade,
                        phone: bookingPayload.phone,
                        preferredDate: bookingPayload.preferredDate,
                        preferredTimeSlot: bookingPayload.preferredTimeSlot,
                        mode: bookingPayload.mode,
                        notes: bookingPayload.notes,
                    }),
                }).catch((err) => {
                    console.error("Error sending booking to Google Sheets webhook:", err);
                });
            }

            setTutorSuccess("Request submitted. Our academic counselor will contact you shortly.");

            // Close the booking modal first
            setTutorDialogOpen(false);

            // Then show the success celebration after a brief delay
            setTimeout(() => {
                setTutorSuccessDialogOpen(true);
            }, 300);
        } catch (error) {
            console.error("Error saving tutor booking:", error);
            setTutorError("Something went wrong while submitting your request. Please try again.");
        } finally {
            setTutorSubmitting(false);
        }
    };

    const handleOpenStatusDialog = async () => {
        setStatusLoading(true);
        setLatestBooking(null);
        setStatusDialogOpen(true);

        try {
            // Get user key (works for phone, Google, and email auth)
            let userKey = "";
            if (quizSession?.userDetails?.phoneNumber) {
                userKey = quizSession.userDetails.phoneNumber;
            } else if (user?.phoneNumber) {
                userKey = user.phoneNumber.slice(-10);
            } else if (user?.uid) {
                userKey = user.uid;
            }

            if (!userKey) {
                setStatusLoading(false);
                return;
            }

            const bookingsRef = ref(firebaseDatabase, `NMD_2025/TutorBookings/${userKey}`);
            const snapshot = await get(bookingsRef);
            if (!snapshot.exists()) {
                setStatusLoading(false);
                return;
            }

            const data = snapshot.val() || {};
            const entries = Object.entries(data);
            if (entries.length === 0) {
                setStatusLoading(false);
                return;
            }

            const sorted = entries
                .map(([id, value]) => ({ id, ...value }))
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            setLatestBooking(sorted[0]);
        } catch (error) {
            console.error("Error loading tutor booking status:", error);
        } finally {
            setStatusLoading(false);
        }
    };

    if (loadingReport && !reportState) {
        return (
            <div className={Styles.quizResultContainer}>
                <Navigation />
                <div className={Styles.loadingWrapper}>
                    <CircularProgress />
                    <span>Loading report...</span>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={Styles.quizResultContainer}>
            <Navigation />

            <div className={Styles.quizResultContent}>

                {/* Hero Section */}
                <header className={Styles.heroSection}>
                    <div className={Styles.heroContent}>
                        <div className={Styles.userInfo}>
                            <span className={Styles.userName}>{displayName}</span>
                            <span className={Styles.divider}>•</span>
                            <span>{displayGrade}</span>
                        </div>
                        <h1 className={Styles.mainTitle}>Quiz Results</h1>
                        <p className={Styles.subtitle}>Math Skill Report - Powered by Learners</p>
                    </div>

                    <div className={Styles.heroStats}>
                        <div className={Styles.heroStatItem}>
                            <span className={`${Styles.heroStatValue} ${Styles.statColorCorrect}`}>{summary.correct}</span>
                            <span className={Styles.heroStatLabel}>Correct</span>
                        </div>
                        <div className={Styles.heroStatItem}>
                            <span className={`${Styles.heroStatValue} ${Styles.statColorWrong}`}>{summary.wrong}</span>
                            <span className={Styles.heroStatLabel}>Wrong</span>
                        </div>
                        <div className={Styles.heroStatItem}>
                            <span className={`${Styles.heroStatValue} ${Styles.statColorSkipped}`}>{notAttempted}</span>
                            <span className={Styles.heroStatLabel}>Skipped</span>
                        </div>
                        <div className={Styles.heroStatItem}>
                            <span className={Styles.heroStatValue}>{summary.totalQuestions}</span>
                            <span className={Styles.heroStatLabel}>Total</span>
                        </div>
                        <HeroChart summary={summary} notAttempted={notAttempted} />
                    </div>

                    <div className={Styles.scoreCard}>
                        <div className={Styles.scoreCircle}>
                            <svg viewBox="0 0 120 120" className={Styles.progressRing}>
                                <circle cx="60" cy="60" r="54" className={Styles.progressRingBg} />
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    className={Styles.progressRingFill}
                                    style={{
                                        strokeDasharray: `${(summary.accuracyPercent / 100) * 339.292} 339.292`
                                    }}
                                />
                            </svg >
                            <div className={Styles.scoreText}>
                                <div className={Styles.scorePercent}>{summary.accuracyPercent}%</div>
                                <div className={Styles.scoreLabel}>Accuracy</div>
                            </div>
                        </div >

                    </div >
                </header >

                {/* Stats Grid */}
                {/* Stats Section Removed (Moved to Hero) */}

                {/* Action Buttons */}
                <section className={Styles.actionSection}>
                    <Button
                        className={Styles.actionButton}
                        onClick={() => setTopicModalOpen(true)}
                        startIcon={<BarChart3 />}
                    >
                        <div className={Styles.buttonContent}>
                            <span className={Styles.buttonTitle}>Topic Feedback</span>
                            <span className={Styles.buttonDesc}>View performance by topic</span>
                        </div>
                    </Button>
                    <Button
                        className={Styles.actionButton}
                        onClick={() => setQuestionModalOpen(true)}
                        startIcon={<FileText />}
                    >
                        <div className={Styles.buttonContent}>
                            <span className={Styles.buttonTitle}>Question-wise Performance</span>
                            <span className={Styles.buttonDesc}>Detailed question analysis</span>
                        </div>
                    </Button>
                    <Button
                        className={`${Styles.actionButton} ${Styles.tutorActionButton}`}
                        onClick={handleOpenTutorDialog}
                        startIcon={<BookOpen />}
                    >
                        <div className={Styles.buttonContent}>
                            <span className={Styles.buttonTitle}>Learn with Tutor</span>
                            <span className={Styles.buttonDesc}>Book a 1:1 slot with our math tutor</span>
                        </div>
                    </Button>
                </section>

                {/* Learning Plan */}
                <section className={Styles.learningSection}>
                    <div className={Styles.sectionHeader}>
                        <BookOpen className={Styles.sectionIcon} />
                        <h2 className={Styles.sectionTitle}>Your Personalized Learning Plan</h2>
                    </div>
                    <div className={Styles.learningCard}>
                        <p className={Styles.learningIntro}>{learningPlan.intro}</p>

                        {learningPlan.steps.length > 0 && (
                            <div className={Styles.learningBlock}>
                                <h3 className={Styles.learningSubtitle}>Next Steps</h3>
                                <ul className={Styles.learningList}>
                                    {learningPlan.steps.map((step, index) => (
                                        <li key={index}>{step}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {learningPlan.timeTips.length > 0 && (
                            <div className={Styles.learningBlock}>
                                <h3 className={Styles.learningSubtitle}>Time Tips</h3>
                                <ul className={Styles.learningList}>
                                    {learningPlan.timeTips.map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className={Styles.tutorStatusInline}>
                        <span className={Styles.tutorHelper}>Already requested a tutor?</span>
                        <MuiLink
                            component="button"
                            type="button"
                            className={Styles.tutorStatusLink}
                            onClick={handleOpenStatusDialog}
                        >
                            View booking status
                        </MuiLink>
                    </div>
                </section>
            </div>

            {/* Topic Feedback Modal */}
            <Dialog
                open={topicModalOpen}
                onClose={() => setTopicModalOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    className: Styles.modal
                }}
            >
                <DialogTitle className={Styles.modalHeader}>
                    <div className={Styles.modalTitleWrapper}>
                        <BarChart3 className={Styles.modalIcon} />
                        <span>Topic Feedback</span>
                    </div>
                    <IconButton onClick={() => setTopicModalOpen(false)} className={Styles.closeButton}>
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent className={Styles.modalContent}>
                    {Object.entries(topicFeedback).map(([topic, data]) => (
                        <div key={topic} className={Styles.topicCard}>
                            <div className={Styles.topicHeader}>
                                <h3 className={Styles.topicName}>{topic}</h3>
                                <div className={Styles.topicStats}>
                                    <span className={Styles.correctBadge}>✓ {data.correctCount}</span>
                                    <span className={Styles.wrongBadge}>✗ {data.wrongCount}</span>
                                </div>
                            </div>
                            <div className={Styles.progressBar}>
                                <div
                                    className={Styles.progressFill}
                                    style={{ width: `${(data.correctCount / (data.correctCount + data.wrongCount)) * 100}%` }}
                                />
                            </div>
                            <div className={Styles.feedbackGrid}>
                                <div className={Styles.feedbackItem}>
                                    <div className={Styles.feedbackHeader}>
                                        <TrendingUp size={16} />
                                        <span>What you're doing well</span>
                                    </div>
                                    <p>{data.positiveFeedback}</p>
                                </div>
                                <div className={Styles.feedbackItem}>
                                    <div className={Styles.feedbackHeader}>
                                        <Target size={16} />
                                        <span>What you can improve</span>
                                    </div>
                                    <p>{data.improvementFeedback}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </DialogContent>
            </Dialog >

            {/* Cheerful Success Celebration */}
            {tutorSuccessDialogOpen && (
                <div
                    className={Styles.successCelebration}
                    onClick={() => setTutorSuccessDialogOpen(false)}
                >
                    <div className={Styles.successIcon}>
                        <CheckCircle size={60} strokeWidth={3} />
                    </div>
                    <div className={Styles.successMessage}>
                        <h2 className={Styles.successTitle}>🎉 Request Submitted!</h2>
                        <p className={Styles.successText}>
                            Our academic counselor will contact you shortly on WhatsApp/SMS to schedule your personalized learning session.
                        </p>
                    </div>
                    {/* Confetti elements */}
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className={Styles.confetti}
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 20}%`,
                                background: ['#667eea', '#764ba2', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)],
                                animationDelay: `${Math.random() * 0.5}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Tutor Booking Status Modal */}
            < Dialog
                open={statusDialogOpen}
                onClose={() => setStatusDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    className: Styles.modal,
                }}
            >
                <DialogTitle className={Styles.modalHeader}>
                    <div className={Styles.modalTitleWrapper}>
                        <BookOpen className={Styles.modalIcon} />
                        <span>Your Tutor Booking</span>
                    </div>
                    <IconButton onClick={() => setStatusDialogOpen(false)} className={Styles.closeButton}>
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent className={Styles.modalContent}>
                    {statusLoading && (
                        <div className={Styles.loadingWrapper}>
                            <CircularProgress size={20} />
                            <span>Loading your latest booking...</span>
                        </div>
                    )}
                    {!statusLoading && !latestBooking && (
                        <p className={Styles.tutorHelper}>No tutor booking found yet for this number.</p>
                    )}
                    {!statusLoading && latestBooking && (
                        <div className={Styles.tutorStatusCard}>
                            <h3 className={Styles.sectionTitle}>Latest request</h3>
                            <p className={Styles.tutorStatusLine}><strong>Student:</strong> {latestBooking.studentName} (Grade {latestBooking.grade})</p>
                            <p className={Styles.tutorStatusLine}><strong>Preferred date:</strong> {latestBooking.preferredDate}</p>
                            <p className={Styles.tutorStatusLine}><strong>Time slot:</strong> {latestBooking.preferredTimeSlot}</p>
                            <p className={Styles.tutorStatusLine}><strong>Mode:</strong> {latestBooking.mode}</p>
                            <p className={Styles.tutorStatusLine}><strong>Contact:</strong> {latestBooking.phone}</p>
                            <p className={Styles.tutorStatusNote}>Our academic counselor will reach out on this number to confirm your exact slot.</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog >

            {/* Tutor Booking Modal */}
            < Dialog
                open={tutorDialogOpen}
                onClose={() => !tutorSubmitting && setTutorDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    className: Styles.modal,
                }}
            >
                <DialogTitle className={Styles.modalHeader}>
                    <div className={Styles.modalTitleWrapper}>
                        <BookOpen className={Styles.modalIcon} />
                        <span>Book a Learning Session</span>
                    </div>
                    <IconButton
                        onClick={() => !tutorSubmitting && setTutorDialogOpen(false)}
                        className={Styles.closeButton}
                        disabled={tutorSubmitting}
                    >
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent className={Styles.modalContent}>
                    <form className={Styles.tutorForm} onSubmit={handleSubmitTutorBooking}>
                        {/* Display user info as read-only */}
                        <div className={Styles.userInfoDisplay}>
                            <div className={Styles.infoItem}>
                                <span className={Styles.infoLabel}>Student:</span>
                                <span className={Styles.infoValue}>{displayName || "Not available"}</span>
                            </div>
                            <div className={Styles.infoItem}>
                                <span className={Styles.infoLabel}>Grade:</span>
                                <span className={Styles.infoValue}>{displayGrade || "Not available"}</span>
                            </div>
                        </div>

                        {/* Phone verification field */}
                        <div className={Styles.phoneVerification}>
                            <TextField
                                label="Please Enter Your Phone Number"
                                value={tutorForm.phone}
                                onChange={handleTutorFieldChange("phone")}
                                fullWidth
                                size="medium"
                                type="tel"
                                inputProps={{
                                    maxLength: 10,
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*'
                                }}
                                placeholder="Enter your 10-digit phone number"
                                required
                            />
                        </div>

                        {tutorError && (
                            <div className={Styles.tutorError}>{tutorError}</div>
                        )}

                        <div className={Styles.tutorSubmitRow}>
                            <span className={Styles.tutorHelper}>Our academic counselor will contact you on WhatsApp/SMS to schedule your session.</span>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={tutorSubmitting}
                                className={Styles.submitButton}
                                startIcon={tutorSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle size={20} />}
                            >
                                {tutorSubmitting ? "Booking..." : "Book My Tutor!"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog >

            {/* Question-wise Performance Modal */}
            < Dialog
                open={questionModalOpen}
                onClose={() => setQuestionModalOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    className: Styles.modal
                }}
            >
                <DialogTitle className={Styles.modalHeader}>
                    <div className={Styles.modalTitleWrapper}>
                        <FileText className={Styles.modalIcon} />
                        <span>Question-wise Performance</span>
                    </div>
                    <IconButton onClick={() => setQuestionModalOpen(false)} className={Styles.closeButton}>
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent className={Styles.modalContent}>
                    <div className={Styles.questionList}>
                        {perQuestionReport.map((q, index) => (
                            <div key={`${q.questionId || 'q'}-${index}`} className={Styles.questionItem}>
                                <div className={Styles.questionNumber}>Q{index + 1}</div>
                                <div className={Styles.questionDetails}>
                                    <div className={Styles.questionText}>
                                        <MathRenderer content={q.question} />
                                    </div>
                                    <span className={Styles.topicBadge}>{q.topic}</span>
                                    <div className={Styles.answerSection}>
                                        <div className={Styles.answerRow}>
                                            <span className={Styles.answerLabel}>Correct Answer:</span>
                                            <div className={Styles.correctAnswer}>
                                                <MathRenderer content={formatAnswer(q.correctAnswer)} />
                                            </div>
                                        </div>
                                        <div className={Styles.answerRow}>
                                            <span className={Styles.answerLabel}>Your Answer:</span>
                                            <div className={`${Styles.userAnswer} ${q.isCorrect ? Styles.correct : (q.attempted ? Styles.wrong : Styles.skipped)}`}>
                                                {q.userAnswer ? <MathRenderer content={formatAnswer(q.userAnswer)} /> : "Not Attempted"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={Styles.questionStatus}>
                                    {(() => {
                                        // q.score is now available from analyzeResponses
                                        const score = q.score !== undefined ? q.score : (q.isCorrect ? 1 : 0);
                                        const isPartial = score > 0 && score < 1;
                                        const isCorrect = score === 1;
                                        const isWrong = score === 0 && q.attempted;
                                        const isSkipped = !q.attempted;

                                        let statusClass = Styles.statusSkipped;
                                        let Icon = HelpCircle;
                                        let text = "Not Answered";

                                        if (isCorrect) {
                                            statusClass = Styles.statusCorrect;
                                            Icon = CheckCircle;
                                            text = "Correct";
                                        } else if (isPartial) {
                                            statusClass = Styles.statusPartial;
                                            Icon = AlertCircle;
                                            text = "Partially Correct";
                                        } else if (isWrong) {
                                            statusClass = Styles.statusWrong;
                                            Icon = XCircle;
                                            text = "Wrong";
                                        }

                                        return (
                                            <div className={`${Styles.statusBadge} ${statusClass}`}>
                                                <Icon size={16} />
                                                <span>{text}</span>
                                            </div>
                                        );
                                    })()}
                                    <div className={Styles.timeInfo}>
                                        <Clock size={14} />
                                        <span>{q.timeTaken !== null ? `${q.timeTaken}s` : "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog >

            <Footer />
        </div >
    );
};

export default QuizResultClient;
