"use client";
import React, { useEffect, useState, useContext } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation/Navigation.component";
import Footer from "@/components/Footer/Footer.component";
import PhoneNumberDialog from "@/components/Auth/PhoneNumberDialog";
import { CircularProgress, Button, FormControl, InputLabel, Select, MenuItem, TextField, Dialog, DialogTitle, DialogContent, Card, CardContent } from "@mui/material";
import { User, LogOut, BookOpen, Clock, Award, ChevronRight, Edit2 } from "lucide-react";
import { ref, get, set } from "firebase/database";
import { firebaseDatabase } from "@/backend/firebaseHandler";
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
        email: "",
        schoolName: "",
        city: "",
        grade: ""
    });

    useEffect(() => {
        if (!loading && !user) {
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
        // Update userData to include the phone number
        if (userData) {
            setUserData({
                ...userData,
                phoneNumber: phoneNumber
            });
        }
    };

    // Initialize active child based on userData and persisted preference
    useEffect(() => {
        if (!user || !userData || !userData.children) return;

        // Get user key (works for phone, Google, and email auth)
        const userKey = user.phoneNumber ? user.phoneNumber.slice(-10) : (userData?.phoneNumber || user.uid);
        const storedChildId = typeof window !== "undefined"
            ? window.localStorage.getItem(`activeChild_${userKey}`)
            : null;

        const childKeys = Object.keys(userData.children || {});
        if (storedChildId && childKeys.includes(storedChildId)) {
            setActiveChildId(storedChildId);
        } else if (childKeys.length > 0) {
            setActiveChildId(childKeys[0]);
        }
    }, [user, userData]);

    // Fetch reports for the selected child, with simple per-child caching
    useEffect(() => {
        const fetchReports = async () => {
            if (user && activeChildId) {
                setFetchingReports(true);
                try {
                    // Get user key (works for phone, Google, and email auth)
                    const userKey = user.phoneNumber ? user.phoneNumber.slice(-10) : (userData?.phoneNumber || user.uid);
                    const reportsRef = ref(firebaseDatabase, `NMD_2025/Reports/${userKey}/${activeChildId}`);
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
        if (user && activeChildId) {
            // If we have a cached value for this child, use it immediately for snappy UI
            if (reportsCache.hasOwnProperty(activeChildId)) {
                setReports(reportsCache[activeChildId]);
                setFetchingReports(false);
            } else {
                fetchReports();
            }
        }
    }, [user, activeChildId, reportsCache]);

    const children = userData?.children || null;
    const activeChild = children && activeChildId ? children[activeChildId] : null;

    if (loading || !user) {
        return (
            <div className={Styles.loadingContainer}>
                <CircularProgress />
            </div>
        );
    }

    const handleLogout = async () => {
        await logout();
        router.replace("/");
    };

    const handleChildChange = (event) => {
        const newChildId = event.target.value;
        setActiveChildId(newChildId);
        if (user) {
            // Get user key (works for phone, Google, and email auth)
            const userKey = user.phoneNumber ? user.phoneNumber.slice(-10) : (userData?.phoneNumber || user.uid);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(`activeChild_${userKey}`, newChildId);
            }
        }
    };

    const handleOpenAddChild = () => {
        setChildForm({
            name: "",
            email: "",
            schoolName: "",
            city: "",
            grade: ""
        });
        setAddChildOpen(true);
    };

    const handleSaveChild = async () => {
        if (!user || !userData) return;

        const { name, schoolName, city, grade } = childForm;
        if (!name || !schoolName || !city || !grade) {
            return;
        }

        // Get user database key (works for phone, Google, and email auth)
        const userKey = user.phoneNumber ? user.phoneNumber.slice(-10) : (userData?.phoneNumber || user.uid);
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
            email: activeChild.email || '',
            schoolName: activeChild.schoolName,
            city: activeChild.city,
            grade: activeChild.grade
        });
        setEditingChildId(activeChildId);
        setEditChildOpen(true);
    };

    const handleUpdateChild = async () => {
        if (!user || !userData || !editingChildId) return;

        const { name, schoolName, city, grade } = childForm;
        if (!name || !schoolName || !city || !grade) {
            return;
        }

        // Get user database key (works for phone, Google, and email auth)
        const userKey = user.phoneNumber ? user.phoneNumber.slice(-10) : (userData?.phoneNumber || user.uid);

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
                                    const userKey = user.phoneNumber ? user.phoneNumber.slice(-10) : (userData?.phoneNumber || user.uid);

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
                        <TextField
                            fullWidth
                            label="Full Name"
                            margin="normal"
                            value={childForm.name}
                            onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Email (optional)"
                            type="email"
                            margin="normal"
                            value={childForm.email}
                            onChange={(e) => setChildForm({ ...childForm, email: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="School Name"
                            margin="normal"
                            value={childForm.schoolName}
                            onChange={(e) => setChildForm({ ...childForm, schoolName: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="City"
                            margin="normal"
                            value={childForm.city}
                            onChange={(e) => setChildForm({ ...childForm, city: e.target.value })}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Grade</InputLabel>
                            <Select
                                value={childForm.grade}
                                label="Grade"
                                onChange={(e) => setChildForm({ ...childForm, grade: e.target.value })}
                            >
                                {[...Array(10)].map((_, i) => (
                                    <MenuItem key={i + 1} value={`Grade ${i + 1}`}>
                                        Grade {i + 1}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            onClick={handleSaveChild}
                            disabled={!childForm.name || !childForm.schoolName || !childForm.city || !childForm.grade}
                            sx={{ mt: 2 }}
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
                        <TextField
                            fullWidth
                            label="Full Name"
                            margin="normal"
                            value={childForm.name}
                            onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Email (optional)"
                            type="email"
                            margin="normal"
                            value={childForm.email}
                            onChange={(e) => setChildForm({ ...childForm, email: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="School Name"
                            margin="normal"
                            value={childForm.schoolName}
                            onChange={(e) => setChildForm({ ...childForm, schoolName: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="City"
                            margin="normal"
                            value={childForm.city}
                            onChange={(e) => setChildForm({ ...childForm, city: e.target.value })}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Grade</InputLabel>
                            <Select
                                value={childForm.grade}
                                label="Grade"
                                onChange={(e) => setChildForm({ ...childForm, grade: e.target.value })}
                            >
                                {[...Array(10)].map((_, i) => (
                                    <MenuItem key={i + 1} value={`Grade ${i + 1}`}>
                                        Grade {i + 1}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            onClick={handleUpdateChild}
                            disabled={!childForm.name || !childForm.schoolName || !childForm.city || !childForm.grade}
                            sx={{ mt: 2 }}
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
