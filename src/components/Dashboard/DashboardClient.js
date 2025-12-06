"use client";
import React, { useEffect, useState, useContext } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation/Navigation.component";
import Footer from "@/components/Footer/Footer.component";
import PhoneNumberDialog from "@/components/Auth/PhoneNumberDialog";
import { CircularProgress, Button, FormControl, InputLabel, Select, MenuItem, TextField, Dialog, DialogTitle, DialogContent, Card, CardContent } from "@mui/material";
import { User, LogOut, BookOpen, Clock, Award, ChevronRight, Edit2, GraduationCap } from "lucide-react";
import { ref, get, set } from "firebase/database";
import { firebaseDatabase, getUserDatabaseKey } from "@/backend/firebaseHandler";
import Styles from "../../app/dashboard/Dashboard.module.css";
import { QuizSessionContext } from "../../app/context/QuizSessionContext";

const DashboardClient = () => {
    const { user, userData, setUserData, logout, loading } = useAuth();
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
        if (!loading && user && userData) {
            // If user signed in with Google/Email (no phoneNumber) and hasn't provided one yet
            if (!user.phoneNumber && !userData.phoneNumber) {
                setShowPhoneDialog(true);
            }
        }
    }, [user, userData, loading]);

    // Handle phone number completion
    const handlePhoneComplete = async (phoneNumber) => {
        setShowPhoneDialog(false);

        // Refresh userData from database to get the updated phone number
        if (user && userData) {
            try {
                const userKey = getUserDatabaseKey(user);
                const userRef = ref(firebaseDatabase, `NMD_2025/Registrations/${userKey}`);
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    const updatedData = snapshot.val();
                    setUserData(updatedData);
                }
            } catch (error) {
                console.error("Error refreshing user data:", error);
                // Fallback: update local state
                setUserData({
                    ...userData,
                    phoneNumber: phoneNumber
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
            // If we have a cached value for this child, use it immediately for snappy UI
            if (reportsCache.hasOwnProperty(activeChildId)) {
                setReports(reportsCache[activeChildId]);
                setFetchingReports(false);
            } else {
                fetchReports();
            }
        }
    }, [user, activeChildId]);

    const effectiveUserData = userData || (typeof window !== "undefined" ? JSON.parse(window.localStorage.getItem("quizSession") || "{}")?.userDetails : null);
    const children = effectiveUserData?.children || null;
    const activeChild = children && activeChildId ? children[activeChildId] : null;

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

            setUserData((prev) => ({
                ...(prev || {}),
                children: {
                    ...prev.children,
                    [editingChildId]: updatedProfile
                }
            }));

            setEditChildOpen(false);
            setEditingChildId(null);
        } catch (error) {
            console.error("Error updating child profile:", error);
        }
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
                <section className={Styles.profileSection}>
                    <div className={Styles.profileHeader}>
                        <div className={Styles.avatarSection}>
                            <div className={Styles.avatar}>
                                <User size={40} color="white" />
                            </div>
                            <div className={Styles.profileInfo}>
                                <h1>{activeChild?.name || "Student"}</h1>
                                <p>{activeChild?.grade} • {activeChild?.schoolName}</p>
                            </div>
                        </div>

                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<LogOut size={18} />}
                            onClick={handleLogout}
                            className={Styles.logoutButton}
                        >
                            Sign Out
                        </Button>
                    </div>

                    {children && (
                        <div className={Styles.childSelectorRow}>
                            <FormControl size="small" className={Styles.childSelector}>
                                <InputLabel>Child Profile</InputLabel>
                                <Select
                                    value={activeChildId || ""}
                                    label="Child Profile"
                                    onChange={handleChildChange}
                                >
                                    {Object.entries(children).map(([id, child]) => (
                                        <MenuItem key={id} value={id}>
                                            {child.name} ({child.grade})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button
                                variant="outlined"
                                onClick={handleEditChild}
                                disabled={!activeChildId}
                                startIcon={<Edit2 size={18} />}
                                className={Styles.editChildButton}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleOpenAddChild}
                                className={Styles.addChildButton}
                            >
                                Add Child
                            </Button>
                        </div>
                    )}

                    <div className={Styles.statsGrid}>
                        <div className={Styles.statCard}>
                            <BookOpen className={Styles.statIcon} />
                            <div>
                                <h3>Assessment Status</h3>
                                <p>{reports ? "Completed" : "Not Started"}</p>
                            </div>
                        </div>
                        <div className={Styles.statCard}>
                            <Clock className={Styles.statIcon} />
                            <div>
                                <h3>Last Active</h3>
                                <p>{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
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
                        <Card className={`${Styles.reportCard} ${fetchingReports ? Styles.reportCardLoading : ""}`}>
                            <CardContent className={Styles.reportContent}>
                                <div className={Styles.reportInfo}>
                                    <div className={Styles.reportIcon}>
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <h3>Math Skill Proficiency Test</h3>
                                        <p className={Styles.reportDate}>
                                            {new Date(reports.timestamp).toLocaleDateString()} • {new Date(reports.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                                <div className={Styles.reportScore}>
                                    <div className={Styles.scoreBadge}>
                                        {reports.summary.accuracyPercent}% Score
                                    </div>
                                    <Button
                                        endIcon={<ChevronRight />}
                                        onClick={() => router.push("/quiz/quiz-result")}
                                    >
                                        View Full Report
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className={Styles.emptyState}>
                            <img src="/empty-state.svg" alt="No assessments" className={Styles.emptyImage} />
                            {/* Fallback if image missing, just text */}
                            <p>You haven't taken the assessment yet.</p>
                            <Button
                                variant="contained"
                                className={Styles.startBtn}
                                onClick={() => {
                                    if (!user || !activeChild) {
                                        router.push("/");
                                        return;
                                    }

                                    // Get user key (works for phone, Google, and email auth)
                                    const userKey = getUserDatabaseKey(user);

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
                                    };
                                    setQuizContext({ userDetails, questionPaper: null });
                                    router.push("/quiz");
                                }}
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
