"use client";
import React, { useEffect, useState, useContext } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation/Navigation.component";
import Footer from "@/components/Footer/Footer.component";
import PhoneNumberDialog from "@/components/Auth/PhoneNumberDialog";
import { CircularProgress, Button, FormControl, InputLabel, Select, MenuItem, TextField, Dialog, DialogTitle, DialogContent, Card, CardContent, Tabs, Tab } from "@mui/material";
import { User, LogOut, BookOpen, Clock, Award, ChevronRight, Edit2, GraduationCap, Zap } from "lucide-react";
import { ref, get, set } from "firebase/database";
import { firebaseDatabase, getUserDatabaseKey } from "@/backend/firebaseHandler";
import Styles from "../../app/dashboard/Dashboard.module.css";
import { QuizSessionContext } from "../../app/context/QuizSessionContext";

const DashboardClient = () => {
    const { user, userData, setUserData, logout, loading, refreshUserData } = useAuth();
    const router = useRouter();
    const [quizContext, setQuizContext] = useContext(QuizSessionContext);
    const [activeChildId, setActiveChildId] = useState(null);
    const [reports, setReports] = useState(null);
    const [fetchingReports, setFetchingReports] = useState(false);
    const [reportsCache, setReportsCache] = useState({});

    // Phone number dialog state
    const [showPhoneDialog, setShowPhoneDialog] = useState(false);

    const [addChildOpen, setAddChildOpen] = useState(false);
    const [editChildOpen, setEditChildOpen] = useState(false);
    const [editingChildId, setEditingChildId] = useState(null);
    const [childForm, setChildForm] = useState({
        name: "",
        grade: ""
    });

    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Check for local quiz session before redirecting
    useEffect(() => {
        if (!loading && !user) {
            // Check for local quiz session before redirecting
            if (typeof window !== "undefined") {
                const quizSession = window.localStorage.getItem("quizSession");
                if (quizSession) {
                    try {
                        const parsed = JSON.parse(quizSession);
                        if (parsed?.userDetails) {
                            // Valid local session, do not redirect
                            return;
                        }
                    } catch (e) { }
                }
            }
            router.replace("/");
        }
    }, [user, loading, router]);

    // Check if Google/Email user needs to provide phone number
    useEffect(() => {
        if (!loading && user) {
            // For phone auth users, never show dialog (they already have phone)
            if (user.phoneNumber) {
                setShowPhoneDialog(false);
                return;
            }

            // IMPORTANT: Wait for userData to load before making any decision
            if (!userData) {
                console.log("⏳ Waiting for userData to load...");
                setShowPhoneDialog(false);
                return;
            }

            // Check localStorage flag - if user EVER provided phone, never ask again
            const userKey = getUserDatabaseKey(user);
            const phoneProvided = typeof window !== "undefined"
                ? window.localStorage.getItem(`phoneProvided_${userKey}`)
                : null;

            if (phoneProvided === "true") {
                console.log("✅ Phone already provided (localStorage flag)");
                setShowPhoneDialog(false);
                return;
            }

            // Check if phone exists in database
            const hasPhoneInDB = userData.phoneNumber || userData.parentPhone;

            console.log("🔍 Checking phone in database:", {
                hasPhoneInDB,
                phoneNumber: userData.phoneNumber,
                parentPhone: userData.parentPhone,
                userDataKeys: Object.keys(userData)
            });

            if (hasPhoneInDB) {
                // Phone exists in database - don't show dialog
                console.log("✅ Phone found in database:", hasPhoneInDB);
                setShowPhoneDialog(false);
            } else {
                // Brand new user with no phone - show dialog
                console.log("📱 Brand new user - showing phone dialog");
                setShowPhoneDialog(true);
            }
        }
    }, [user, userData, loading]);

    // Handle phone number completion
    const handlePhoneComplete = async (phoneNumber) => {
        setShowPhoneDialog(false);

        // SIMPLE FIX: Mark phone as provided in localStorage
        if (user && typeof window !== "undefined") {
            const userKey = getUserDatabaseKey(user);
            window.localStorage.setItem(`phoneProvided_${userKey}`, "true");
            console.log("✅ Phone number saved, localStorage flag set");
        }

        // Use the refreshUserData function from AuthContext to reload data
        if (refreshUserData) {
            try {
                await refreshUserData();
            } catch (error) {
                console.error("Error refreshing user data:", error);
                // Fallback: update local state manually
                setUserData({
                    ...userData,
                    phoneNumber: phoneNumber,
                    parentPhone: phoneNumber
                });
            }
        }
    };

    // Initialize active child based on userData and persisted preference
    useEffect(() => {
        const currentUserData = userData || (typeof window !== "undefined" ? JSON.parse(window.localStorage.getItem("quizSession"))?.userDetails : null);

        if ((!user && !currentUserData) || (!userData && !currentUserData) || !currentUserData.children) return;

        // Robust user key retrieval
        let userKey = null;
        if (user) {
            userKey = getUserDatabaseKey(user);
        }
        if (!userKey && currentUserData) {
            userKey = currentUserData.userKey || currentUserData.phoneNumber || currentUserData.parentPhone || currentUserData.parentEmail;
        }

        if (!userKey) return;

        let storedChildId = typeof window !== "undefined"
            ? window.localStorage.getItem(`activeChild_${userKey}`)
            : null;

        // Fallback to generic key if specific key fails
        if (!storedChildId && typeof window !== "undefined") {
            storedChildId = window.localStorage.getItem('lastActiveChild');
        }

        const childKeys = Object.keys(currentUserData.children || {});
        if (storedChildId && childKeys.includes(storedChildId)) {
            setActiveChildId(storedChildId);
        } else if (childKeys.length > 0) {
            // Default to first child if no preference stored
            setActiveChildId(childKeys[0]);
        }
    }, [user, userData]);

    // Fetch reports for the selected child, with simple per-child caching
    useEffect(() => {
        const fetchReports = async () => {
            if (activeChildId) {
                setFetchingReports(true);
                try {
                    // Get user key
                    let userKey = user ? getUserDatabaseKey(user) : null;
                    if (!userKey && typeof window !== "undefined") {
                        const quizSession = JSON.parse(window.localStorage.getItem("quizSession") || "{}");
                        userKey = quizSession?.userDetails?.userKey || quizSession?.userDetails?.phoneNumber || quizSession?.userDetails?.parentPhone || quizSession?.userDetails?.parentEmail;
                    }

                    if (!userKey) return;

                    const finalUserKey = userKey.replace('.', '_'); // Consistent sanitization with Saver
                    const reportsRef = ref(firebaseDatabase, `NMD_2025/Reports/${finalUserKey}/${activeChildId}`);
                    const snapshot = await get(reportsRef);
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        setReports(data);
                        setReportsCache((prev) => ({
                            ...prev,
                            [activeChildId]: data,
                        }));
                    } else {
                        setReports(null);
                        setReportsCache((prev) => ({
                            ...prev,
                            [activeChildId]: null,
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching reports:", error);
                } finally {
                    setFetchingReports(false);
                }
            }
        };
        if (activeChildId) {
            // Always fetch fresh data to ensure we show the latest reports
            fetchReports();
        }
    }, [user, activeChildId]);

    const effectiveUserData = userData || (typeof window !== "undefined" ? JSON.parse(window.localStorage.getItem("quizSession") || "{}")?.userDetails : null);
    const children = effectiveUserData?.children || null;

    // Robust active child resolution
    let activeChild = null;
    if (children) {
        if (activeChildId && children[activeChildId]) {
            activeChild = children[activeChildId];
        } else if (children['default']) {
            // Fallback to 'default' child if it exists (legacy users)
            activeChild = children['default'];
            // Update activeChildId to reflect this if it was null
            if (!activeChildId) setActiveChildId('default');
        } else {
            // Last resort: take the first child found
            const firstKey = Object.keys(children)[0];
            if (firstKey) {
                activeChild = children[firstKey];
                if (!activeChildId) setActiveChildId(firstKey);
            }
        }
    }

    if (loading) {
        return (
            <div className={Styles.loadingContainer}>
                <CircularProgress />
            </div>
        );
    }

    const handleLogout = async () => {
        // Clear local storage explicitly
        if (typeof window !== "undefined") {
            window.localStorage.removeItem("quizSession");
        }
        await logout();
        router.replace("/");
    };

    const handleChildChange = (event) => {
        const newChildId = event.target.value;
        setActiveChildId(newChildId);

        // Persist preference
        if (user || userData) {
            let userKey = null;
            if (user) {
                userKey = getUserDatabaseKey(user);
            }
            if (!userKey && userData) {
                userKey = userData.userKey || userData.phoneNumber || userData.parentPhone || userData.parentEmail; // Robust fallback
            }

            if (userKey && typeof window !== "undefined") {
                window.localStorage.setItem(`activeChild_${userKey}`, newChildId);
                window.localStorage.setItem('lastActiveChild', newChildId); // Generic fallback
            }
        }
    };

    const handleOpenAddChild = () => {
        setChildForm({
            name: "",
            grade: ""
        });
        setAddChildOpen(true);
    };

    const handleSaveChild = async () => {
        if (!user || !userData) return;

        const { name, grade } = childForm;
        if (!name || !grade) {
            return;
        }

        // Get user database key (works for phone, Google, and email auth)
        const userKey = getUserDatabaseKey(user);
        const childId = `child_${Date.now()}`;
        const childProfile = {
            ...childForm,
            createdAt: new Date().toISOString()
        };

        try {
            const childRef = ref(firebaseDatabase, `NMD_2025/Registrations/${userKey}/children/${childId}`);
            await set(childRef, childProfile);

            // Refresh user data from Firebase to get latest data including phone number
            if (refreshUserData) {
                await refreshUserData();
            } else {
                // Fallback: manual update if refreshUserData not available
                setUserData((prev) => {
                    const prevChildren = prev?.children || {};
                    return {
                        ...(prev || {}),
                        children: {
                            ...prevChildren,
                            [childId]: childProfile
                        }
                    };
                });
            }

            setActiveChildId(childId);
            // Use userKey for localStorage as well
            if (typeof window !== "undefined") {
                window.localStorage.setItem(`activeChild_${userKey}`, childId);
            }
            setAddChildOpen(false);
        } catch (error) {
            console.error("Error saving child profile:", error);
        }
    };

    const handleEditChild = () => {
        if (!activeChild || !activeChildId) return;

        setChildForm({
            name: activeChild.name,
            grade: activeChild.grade
        });
        setEditingChildId(activeChildId);
        setEditChildOpen(true);
    };

    const handleUpdateChild = async () => {
        if (!user || !userData || !editingChildId) return;

        const { name, grade } = childForm;
        if (!name || !grade) {
            return;
        }

        // Get user database key (works for phone, Google, and email auth)
        const userKey = getUserDatabaseKey(user);

        const updatedProfile = {
            ...childForm,
            createdAt: activeChild.createdAt // Preserve original creation date
        };

        try {
            const childRef = ref(firebaseDatabase, `NMD_2025/Registrations/${userKey}/children/${editingChildId}`);
            await set(childRef, updatedProfile);

            // Refresh user data from Firebase to get latest data
            if (refreshUserData) {
                await refreshUserData();
            } else {
                // Fallback: manual update if refreshUserData not available
                setUserData((prev) => ({
                    ...(prev || {}),
                    children: {
                        ...prev.children,
                        [editingChildId]: updatedProfile
                    }
                }));
            }

            setEditChildOpen(false);
            setEditingChildId(null);
        } catch (error) {
            console.error("Error updating child profile:", error);
        }
    };

    const handleStartAssessment = (type = 'ASSESSMENT', reportsCount = 0) => {
        // Check if we have user data (either from auth or local storage)
        if (!effectiveUserData || !activeChild) {
            router.push("/");
            return;
        }

        // Get user key - works for both authenticated and phone-only users
        let userKey = null;
        if (user) {
            userKey = getUserDatabaseKey(user);
        }
        if (!userKey && effectiveUserData) {
            userKey = effectiveUserData.userKey || effectiveUserData.phoneNumber || effectiveUserData.parentPhone || effectiveUserData.parentEmail;
        }

        if (!userKey) {
            router.push("/");
            return;
        }

        try {
            if (typeof window !== "undefined") {
                window.localStorage.removeItem("quizSession");
            }
        } catch (e) {
            // ignore storage errors
        }

        const userDetails = {
            ...activeChild,
            phoneNumber: userKey, // Use userKey for backward compatibility
            childId: activeChildId,
            activeChildId: activeChildId,
            attemptCount: reportsCount + 1, // Pass attempt number
            testType: type
        };
        setQuizContext({ userDetails, questionPaper: null });
        router.push(type === 'RAPID_MATH' ? "/rapid-math" : "/quiz");
    };

    return (
        <div className={Styles.pageWrapper}>
            <Navigation />

            {/* Phone Number Collection Dialog for Google/Email Users */}
            <PhoneNumberDialog
                open={showPhoneDialog}
                user={user}
                onComplete={handlePhoneComplete}
            />

            <div className={Styles.dashboardContainer}>
                {/* Profile Section */}
                {/* Profile Section */}
                <section className={Styles.profileSection}>
                    <div className={Styles.profileCardHeader}>
                        <div className={Styles.profileCover}></div>
                        <div className={Styles.avatarWrapper}>
                            <div className={Styles.avatar}>
                                <User size={48} color="white" />
                            </div>
                        </div>
                        <div className={Styles.profileInfo}>
                            <h1>{activeChild?.name || "Student"}</h1>
                            <div className={Styles.gradeTag}>
                                <GraduationCap size={14} />
                                <span>{activeChild?.grade || "Grade N/A"}</span>
                            </div>
                        </div>
                    </div>

                    <div className={Styles.profileBody}>
                        {children && (
                            <div className={Styles.controlPanel}>
                                <FormControl size="small" fullWidth className={Styles.childSelector}>
                                    <InputLabel>Switch Profile</InputLabel>
                                    <Select
                                        value={activeChildId || ""}
                                        label="Switch Profile"
                                        onChange={handleChildChange}
                                    >
                                        {Object.entries(children).map(([id, child]) => (
                                            <MenuItem key={id} value={id}>
                                                {child.name} ({child.grade})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <div className={Styles.actionButtonsRow}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleEditChild}
                                        disabled={!activeChildId}
                                        startIcon={<Edit2 size={16} />}
                                        fullWidth
                                        className={Styles.secondaryActionBtn}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleOpenAddChild}
                                        fullWidth
                                        className={Styles.primaryActionBtn}
                                    >
                                        Add Child
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className={Styles.statsGrid}>
                            <div className={Styles.statCard}>
                                <div className={`${Styles.statIconBox} ${Styles.blueIcon}`}>
                                    <BookOpen size={20} />
                                </div>
                                <div className={Styles.statInfo}>
                                    <p className={Styles.statLabel}>Status</p>
                                    <h3 className={Styles.statValue}>{reports ? "Active" : "New"}</h3>
                                </div>
                            </div>
                            <div className={Styles.statCard}>
                                <div className={`${Styles.statIconBox} ${Styles.orangeIcon}`}>
                                    <Clock size={20} />
                                </div>
                                <div className={Styles.statInfo}>
                                    <p className={Styles.statLabel}>Last Active</p>
                                    <h3 className={Styles.statValue}>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</h3>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="text"
                            color="error"
                            startIcon={<LogOut size={16} />}
                            onClick={handleLogout}
                            className={Styles.logoutButtonText}
                        >
                            Sign Out
                        </Button>
                    </div>
                </section>

                {/* Reports Section */}
                <section className={Styles.reportsSection}>
                    <h2>Assessment History</h2>

                    {fetchingReports && !reports ? (
                        <div className={Styles.loader}>
                            <CircularProgress size={24} />
                            <div className={Styles.loaderText}>Loading report...</div>
                        </div>
                    ) : reports ? (
                        <div className="flex flex-col gap-8">
                            {(() => {
                                let rapidMathReports = [];
                                let assessmentReports = [];

                                // 1. Collect all reports and split by type
                                let allReports = [];

                                if (reports.summary) {
                                    allReports.push({ id: 'root', ...reports });
                                }

                                Object.entries(reports).forEach(([key, val]) => {
                                    if (key !== 'summary' && val && typeof val === 'object' && val.summary) {
                                        allReports.push({ id: key, ...val });
                                    }
                                });

                                // console.log(allReports);
                                // 2. Sort all reports first
                                allReports.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

                                // 3. Deduplicate using IDs and filter invalid reports
                                const seenIds = new Set();
                                const uniqueReports = [];
                                allReports.forEach(report => {
                                    // Skip reports with invalid/missing data
                                    if (!report.summary || !report.summary.totalQuestions) return;

                                    // Use ID for deduplication, fallback to timestamp
                                    const identifier = report.id || new Date(report.timestamp).getTime();
                                    if (!seenIds.has(identifier)) {
                                        seenIds.add(identifier);
                                        uniqueReports.push(report);
                                    }
                                });

                                // 4. Separate
                                uniqueReports.forEach(report => {
                                    if (report.type === 'RAPID_MATH') {
                                        rapidMathReports.push(report);
                                    } else {
                                        assessmentReports.push(report);
                                    }
                                });

                                return (
                                    <>
                                        <div className={Styles.tabsContainer}>
                                            <Tabs
                                                value={activeTab}
                                                onChange={handleTabChange}
                                                aria-label="report tabs"
                                                className={Styles.customTabs}
                                                TabIndicatorProps={{ style: { backgroundColor: '#2563eb', height: 3, borderRadius: '3px 3px 0 0' } }}
                                            >
                                                <Tab label="Skill Assessments" className={Styles.customTab} />
                                                <Tab label="Rapid Math" className={Styles.customTab} />
                                            </Tabs>
                                        </div>

                                        <div role="tabpanel" hidden={activeTab !== 0}>
                                            {activeTab === 0 && (
                                                <>
                                                    {assessmentReports.length > 0 ? (
                                                        <div className={Styles.reportsList}>
                                                            {assessmentReports.map((report, index) => (
                                                                <Card key={report.id || index} className={Styles.reportCard}>
                                                                    <CardContent className={Styles.reportContent}>
                                                                        <div className={Styles.reportInfo}>
                                                                            <div className={Styles.reportIcon}>
                                                                                <Award size={24} />
                                                                            </div>
                                                                            <div>
                                                                                <h3>Math Skill Proficiency Test {assessmentReports.length - index}</h3>
                                                                                <p className={Styles.reportDate}>
                                                                                    {new Date(report.timestamp).toLocaleDateString()} • {new Date(report.timestamp).toLocaleTimeString()}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={Styles.reportScore}>
                                                                            <div className={Styles.scoreBadge}>
                                                                                {report.summary.totalQuestions > 0
                                                                                    ? Math.round(report.summary.accuracyPercent)
                                                                                    : 0}%
                                                                            </div>
                                                                            <Button
                                                                                endIcon={<ChevronRight />}
                                                                                onClick={() => router.push(`/quiz/quiz-result?reportId=${report.id}`)}
                                                                            >
                                                                                View Report
                                                                            </Button>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className={Styles.emptyState}>
                                                            <img src="/empty-state.svg" alt="No assessments" className={Styles.emptyImage} />
                                                            <p>You haven't taken any assessments yet.</p>
                                                            <Button
                                                                variant="contained"
                                                                className={Styles.startBtn}
                                                                onClick={() => router.push("/quiz")}
                                                            >
                                                                Start Assessment
                                                            </Button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <div role="tabpanel" hidden={activeTab !== 1}>
                                            {activeTab === 1 && (
                                                <>
                                                    {rapidMathReports.length > 0 ? (
                                                        <div className={Styles.reportsList}>
                                                            {rapidMathReports.map((report, index) => (
                                                                <Card key={report.id || index} className={Styles.reportCard}>
                                                                    <CardContent className={Styles.reportContent}>
                                                                        <div className={Styles.reportInfo}>
                                                                            <div className={`${Styles.reportIcon} ${Styles.rapidIcon}`}>
                                                                                <Zap size={24} />
                                                                            </div>
                                                                            <div>
                                                                                <h3>Rapid Math Challenge</h3>
                                                                                <p className={Styles.reportDate}>
                                                                                    {new Date(report.timestamp).toLocaleDateString()} • {new Date(report.timestamp).toLocaleTimeString()}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={Styles.reportScore}>
                                                                            <div className={`${Styles.scoreBadge} ${Styles.rapidBadge}`}>
                                                                                {report.summary.accuracyPercent}% Score
                                                                            </div>
                                                                            <Button
                                                                                endIcon={<ChevronRight />}
                                                                                onClick={() => router.push(`/rapid-math/test/summary?reportId=${report.id}`)}
                                                                            >
                                                                                View Report
                                                                            </Button>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className={Styles.emptyState}>
                                                            <img src="/empty-state.svg" alt="No rapid math" className={Styles.emptyImage} />
                                                            <p>No Rapid Math challenges yet.</p>
                                                            <Button
                                                                variant="contained"
                                                                className={Styles.startBtn}
                                                                onClick={() => router.push("/rapid-math")}
                                                            >
                                                                Start Challenge
                                                            </Button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    ) : (
                        <div className={Styles.emptyState}>
                            <img src="/empty-state.svg" alt="No assessments" className={Styles.emptyImage} />
                            {/* Fallback if image missing, just text */}
                            <p>You haven't taken the assessment yet.</p>
                            <Button
                                variant="contained"
                                className={Styles.startBtn}
                                onClick={() => handleStartAssessment('ASSESSMENT', 0)}
                            >
                                Start Assessment
                            </Button>
                        </div>
                    )}
                </section>
            </div >

            <Footer />

            <Dialog
                open={addChildOpen}
                onClose={() => setAddChildOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Add Child Profile</DialogTitle>
                <DialogContent>
                    <div className={Styles.addChildForm}>
                        <div className={Styles.inputGroup}>
                            <User className={Styles.inputIcon} size={20} />
                            <TextField
                                fullWidth
                                placeholder="Enter full name"
                                variant="outlined"
                                margin="none"
                                value={childForm.name}
                                onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
                                className={Styles.textField}
                            />
                        </div>

                        <div className={Styles.gradeSection}>
                            <label className={Styles.gradeLabel}>Which grade is the student in?</label>
                            <FormControl fullWidth className={Styles.gradeSelect}>
                                <Select
                                    value={childForm.grade}
                                    displayEmpty
                                    onChange={(e) => setChildForm({ ...childForm, grade: e.target.value })}
                                    renderValue={(selected) => {
                                        if (!selected) {
                                            return <span style={{ color: '#9ca3af' }}>Select Grade</span>;
                                        }
                                        return selected;
                                    }}
                                >
                                    <MenuItem disabled value="">
                                        <em>Select Grade</em>
                                    </MenuItem>
                                    {[...Array(10)].map((_, i) => (
                                        <MenuItem key={i + 1} value={`Grade ${i + 1}`}>
                                            Grade {i + 1}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        <Button
                            variant="contained"
                            onClick={handleSaveChild}
                            disabled={!childForm.name || !childForm.grade}
                            className={Styles.actionButton}
                        >
                            Save Child
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Child Dialog */}
            <Dialog
                open={editChildOpen}
                onClose={() => setEditChildOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edit Child Profile</DialogTitle>
                <DialogContent>
                    <div className={Styles.addChildForm}>
                        <div className={Styles.inputGroup}>
                            <User className={Styles.inputIcon} size={20} />
                            <TextField
                                fullWidth
                                placeholder="Enter full name"
                                variant="outlined"
                                margin="none"
                                value={childForm.name}
                                onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
                                className={Styles.textField}
                            />
                        </div>

                        <div className={Styles.gradeSection}>
                            <label className={Styles.gradeLabel}>Which grade is the student in?</label>
                            <FormControl fullWidth className={Styles.gradeSelect}>
                                <Select
                                    value={childForm.grade}
                                    displayEmpty
                                    onChange={(e) => setChildForm({ ...childForm, grade: e.target.value })}
                                    renderValue={(selected) => {
                                        if (!selected) {
                                            return <span style={{ color: '#9ca3af' }}>Select Grade</span>;
                                        }
                                        return selected;
                                    }}
                                >
                                    <MenuItem disabled value="">
                                        <em>Select Grade</em>
                                    </MenuItem>
                                    {[...Array(10)].map((_, i) => (
                                        <MenuItem key={i + 1} value={`Grade ${i + 1}`}>
                                            Grade {i + 1}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        <Button
                            variant="contained"
                            onClick={handleUpdateChild}
                            disabled={!childForm.name || !childForm.grade}
                            className={Styles.actionButton}
                        >
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default DashboardClient;
