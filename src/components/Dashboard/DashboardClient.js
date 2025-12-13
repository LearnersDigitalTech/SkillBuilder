"use client";
import React, { useEffect, useState, useContext } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation/Navigation.component";
import Footer from "@/components/Footer/Footer.component";
import PhoneNumberDialog from "@/components/Auth/PhoneNumberDialog";
import { CircularProgress, Button, FormControl, InputLabel, Select, MenuItem, TextField, Dialog, DialogTitle, DialogContent, Card, CardContent, Tabs, Tab } from "@mui/material";
import { User, LogOut, BookOpen, Clock, Award, ChevronRight, Edit2, GraduationCap, Zap, Plus as PlusIcon, Users, X, Flame, Target, TrendingUp, Globe, Lightbulb } from "lucide-react";
import { ref, get, set } from "firebase/database";
import { firebaseDatabase, getUserDatabaseKey } from "@/backend/firebaseHandler";
import Styles from "../../app/dashboard/Dashboard.module.css";
import { QuizSessionContext } from "../../app/context/QuizSessionContext";
import ProgressChart from "./ProgressChart";

const DashboardClient = () => {
    const { user, userData, setUserData, logout, loading, refreshUserData } = useAuth();
    const router = useRouter();
    const [quizContext, setQuizContext] = useContext(QuizSessionContext);
    const [activeChildId, setActiveChildId] = useState(null);
    const [showProfileList, setShowProfileList] = useState(false); // Toggle for Profile/Stats view
    const profileCardRef = React.useRef(null); // Ref for click outside logic

    // Close profile list when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileCardRef.current && !profileCardRef.current.contains(event.target)) {
                setShowProfileList(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
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
    const [showAllAssessments, setShowAllAssessments] = useState(false);
    const [showAllRapidMath, setShowAllRapidMath] = useState(false);

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
                {/* Profile Section - Sticky & Reorganized */}
                <section ref={profileCardRef} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6 relative overflow-hidden flex flex-col transition-all duration-300 z-10">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10 pointer-events-none" />

                    <div className="relative z-10 flex-1 flex flex-col h-full">
                        {/* --- ACTIVE PROFILE HEADER (Always Visible) --- */}
                        {children && activeChildId && children[activeChildId] && (
                            <div className="flex gap-4 mb-2 px-2">
                                {/* Avatar */}
                                <div className="relative group cursor-pointer shrink-0" onClick={handleEditChild}>
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900 ring-4 ring-white dark:ring-slate-800 overflow-hidden transform transition-transform group-hover:scale-105">
                                        {children[activeChildId].imageUrl ? (
                                            <img src={children[activeChildId].imageUrl} alt={children[activeChildId].name} className="w-full h-full object-cover" />
                                        ) : (
                                            children[activeChildId].name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 right-0 bg-white dark:bg-slate-700 p-1 rounded-full shadow-md border border-slate-100 dark:border-slate-600">
                                        <div className="bg-emerald-500 w-3 h-3 rounded-full animate-pulse ring-2 ring-white dark:ring-slate-700" />
                                    </div>
                                </div>

                                {/* Info & Controls */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight mb-1 tracking-tight">
                                        {children[activeChildId].name.split(' ')[0]}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-100 dark:border-blue-800">
                                            {children[activeChildId].grade}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- DYNAMIC CONTENT (Stats OR List) --- */}
                        <div className="relative pt-6 min-h-[180px] flex-1">
                            {!showProfileList ? (
                                /* SCENARIO 1: MAGIC BADGES (Enlarged) */
                                <div className="animate-in fade-in zoom-in-95 duration-300 h-full flex flex-col">




                                    {/* TAKE TEST BUTTON */}
                                    <button
                                        onClick={() => handleStartAssessment('ASSESSMENT', 0)}
                                        className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 group shrink-0"
                                    >
                                        <div className="bg-white/20 p-1 rounded-full group-hover:scale-110 transition-transform">
                                            <PlusIcon size={16} className="text-white" />
                                        </div>
                                        Take New Test
                                    </button>

                                    {/* CHILD MANAGEMENT BUTTONS */}
                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                        <button
                                            onClick={() => setShowProfileList(!showProfileList)}
                                            className="py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-all flex items-center justify-center gap-2 text-sm font-semibold group"
                                        >
                                            <Users size={16} className="group-hover:scale-110 transition-transform" />
                                            Switch Child
                                        </button>
                                        <button
                                            onClick={handleOpenAddChild}
                                            className="py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-all flex items-center justify-center gap-2 text-sm font-semibold group"
                                        >
                                            <PlusIcon size={16} className="group-hover:scale-110 transition-transform" />
                                            Add Child
                                        </button>
                                    </div>

                                    {/* QUICK STATS - Fill empty space above Sign Out */}
                                    {reports && (
                                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800/30">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Award size={14} className="text-blue-600 dark:text-blue-400" />
                                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Tests</span>
                                                    </div>
                                                    <div className="text-xl font-bold text-slate-800 dark:text-white">
                                                        {(() => {
                                                            let count = 0;
                                                            if (reports.summary) count++;
                                                            Object.entries(reports).forEach(([key, val]) => {
                                                                if (key !== 'summary' && val && typeof val === 'object' && val.summary) count++;
                                                            });
                                                            return count;
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800/30">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
                                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Avg</span>
                                                    </div>
                                                    <div className="text-xl font-bold text-slate-800 dark:text-white">
                                                        {(() => {
                                                            let allReports = [];
                                                            if (reports.summary) allReports.push(reports);
                                                            Object.entries(reports).forEach(([key, val]) => {
                                                                if (key !== 'summary' && val && typeof val === 'object' && val.summary) {
                                                                    allReports.push(val);
                                                                }
                                                            });
                                                            if (allReports.length === 0) return '0%';
                                                            const avg = allReports.reduce((sum, r) => sum + (r.summary?.accuracyPercent || 0), 0) / allReports.length;
                                                            return Math.round(avg) + '%';
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* SCENARIO 2: PROFILE LIST (Optimized) */
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Learner</p>
                                    </div>

                                    <div className="max-h-[350px] overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-2 flex-1">
                                        <style jsx global>{`
                                            .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                                            .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
                                        `}</style>

                                        {/* 1. Add New Learner */}
                                        <button
                                            onClick={handleOpenAddChild}
                                            className="w-full p-3 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 hover:bg-blue-50 hover:border-blue-400 flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm group mb-1 shrink-0"
                                        >
                                            <div className="bg-blue-100 dark:bg-blue-900 p-0.5 rounded-full group-hover:scale-110 transition-transform">
                                                <PlusIcon size={14} />
                                            </div>
                                            <span className="text-sm">Add New Learner</span>
                                        </button>

                                        {/* 2. Existing Profiles */}
                                        {children && Object.entries(children)
                                            .sort(([, a], [, b]) => a.name.localeCompare(b.name))
                                            .filter(([id]) => id !== activeChildId)
                                            .map(([id, child]) => (
                                                <div
                                                    key={id}
                                                    onClick={() => {
                                                        handleChildChange({ target: { value: id } });
                                                        setShowProfileList(false);
                                                    }}
                                                    className="w-full p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 hover:shadow-md hover:translate-x-1 cursor-pointer flex items-center gap-3 transition-all duration-200 group shrink-0"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-sm group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shrink-0">
                                                        {child.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-none mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{child.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">{child.grade}</p>
                                                    </div>
                                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sign Out - Footer (Grey to Red) */}
                        <button
                            onClick={handleLogout}
                            className="w-full mt-6 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-all duration-200 text-xs font-bold flex items-center justify-center gap-2 group"
                        >
                            <LogOut size={14} className="group-hover:stroke-red-500 transition-colors" />
                            Sign Out
                        </button>
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

                                const handleAssessmentClick = (data) => {
                                    if (data && data.id) {
                                        router.push(`/quiz/quiz-result?reportId=${data.id}`);
                                    }
                                };

                                const handleRapidMathClick = (data) => {
                                    if (data && data.id) {
                                        router.push(`/rapid-math/test/summary?reportId=${data.id}`);
                                    }
                                };

                                return (
                                    <div className="animate-fade-in">
                                        {/* Report Tabs - Modern Style */}
                                        <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                                            <Tabs
                                                value={activeTab}
                                                onChange={handleTabChange}
                                                aria-label="report tabs"
                                                sx={{
                                                    '& .MuiTab-root': {
                                                        textTransform: 'none',
                                                        fontSize: '1rem',
                                                        fontWeight: 600,
                                                        color: '#64748b',
                                                        minHeight: '48px',
                                                        '&.Mui-selected': { color: '#2563eb' }
                                                    },
                                                    '& .MuiTabs-indicator': { backgroundColor: '#2563eb', height: 3, borderRadius: '3px 3px 0 0' }
                                                }}
                                            >
                                                <Tab label="Skill Assessments" />
                                                <Tab label="Rapid Math" />
                                            </Tabs>
                                        </div>

                                        {/* CONTENT AREA - SIDE BY SIDE LAYOUT */}
                                        {/* Grid: 2 Cols for Chart (66%), 1 Col for History (33%) */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                                            {/* LEFT COLUMN: CHART */}
                                            <div className="lg:col-span-2">
                                                {activeTab === 0 && assessmentReports.length > 0 && (
                                                    <ProgressChart
                                                        data={assessmentReports}
                                                        type="ASSESSMENT"
                                                        onPointClick={handleAssessmentClick}
                                                    />
                                                )}
                                                {activeTab === 1 && rapidMathReports.length > 0 && (
                                                    <ProgressChart
                                                        data={rapidMathReports}
                                                        type="RAPID_MATH"
                                                        onPointClick={handleRapidMathClick}
                                                    />
                                                )}

                                                {/* Empty States for Chart Area */}
                                                {activeTab === 0 && assessmentReports.length === 0 && (
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
                                                {activeTab === 1 && rapidMathReports.length === 0 && (
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
                                            </div>

                                            {/* RIGHT COLUMN: HISTORY LIST */}
                                            {/* Scrollable Container to match Chart Height approx 440px */}
                                            <div className="lg:col-span-1">
                                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[440px]">

                                                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Recent History</h3>
                                                        {/* View All Toggle */}
                                                        {(activeTab === 0 ? assessmentReports : rapidMathReports).length > 5 && (
                                                            <button
                                                                onClick={() => activeTab === 0 ? setShowAllAssessments(!showAllAssessments) : setShowAllRapidMath(!showAllRapidMath)}
                                                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                                            >
                                                                {(activeTab === 0 ? showAllAssessments : showAllRapidMath) ? "Collapse" : "View All"}
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                                                        {(activeTab === 0 ? assessmentReports : rapidMathReports).length > 0 ? (
                                                            (activeTab === 0 ? assessmentReports : rapidMathReports)
                                                                .slice(0, (activeTab === 0 ? showAllAssessments : showAllRapidMath) ? undefined : 20) // Show more by default in scroll view
                                                                .map((report, index) => (
                                                                    <div
                                                                        key={report.id || index}
                                                                        className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                                                                        onClick={() => activeTab === 0 ? router.push(`/quiz/quiz-result?reportId=${report.id}`) : router.push(`/rapid-math/test/summary?reportId=${report.id}`)}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeTab === 0 ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'} group-hover:scale-105 transition-transform`}>
                                                                                {activeTab === 0 ? <Award size={20} /> : <Zap size={20} />}
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                                                                                    {activeTab === 0 ? `Proficiency Test ${assessmentReports.length - index}` : "Rapid Math"}
                                                                                </h4>
                                                                                <p className="text-[11px] font-medium text-slate-500">
                                                                                    {new Date(report.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(report.timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="text-right">
                                                                            <div className={`text-sm font-bold ${activeTab === 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                                                                                {Math.round(report.summary.accuracyPercent)}%
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center opacity-60">
                                                                <div className="mb-2"><Clock size={32} /></div>
                                                                <span className="text-sm">No recent activity</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div >
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
