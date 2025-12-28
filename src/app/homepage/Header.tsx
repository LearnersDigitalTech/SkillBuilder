"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useContext } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { QuizSessionContext } from "@/app/context/QuizSessionContext";
import { getUserDatabaseKey } from "@/backend/firebaseHandler";
import AuthModal from "@/components/Auth/AuthModal.component";
import Tooltip from "@mui/material/Tooltip";

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [redirectPath, setRedirectPath] = useState<string | null>(null);
    const [hasSession, setHasSession] = useState(false);
    const [fallbackData, setFallbackData] = useState(null);
    const { user, userData, isTeacher, activeChildId } = useAuth();
    const router = useRouter();
    // Context might be null if not wrapped, but usually is
    const quizContextVal = useContext(QuizSessionContext);
    const setQuizContext = quizContextVal ? quizContextVal[1] : null;

    useEffect(() => {
        const checkSession = () => {
            if (typeof window !== "undefined") {
                const quizSession = window.localStorage.getItem("quizSession");
                if (quizSession) {
                    try {
                        const parsed = JSON.parse(quizSession);
                        if (parsed?.userDetails) {
                            setHasSession(true);
                            setFallbackData(parsed.userDetails);
                            return;
                        }
                    } catch (e) { }
                }
            }
            setHasSession(false);
        };
        checkSession();
    }, [user]);

    useEffect(() => {
        // AuthContext now handles activeChildId initialization
        // This effect is kept for any dashboard-specific logic if needed
    }, [user, userData, activeChildId]);

    const effectiveUserData = userData || fallbackData;
    const children = effectiveUserData?.children || null;

    useEffect(() => {
        const handleScroll = () => {
            // Trigger change when scrolled past roughly the hero section (viewport height)
            setIsScrolled(window.scrollY > window.innerHeight - 100);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleTakeTest = async () => {
        if (user) {
            try {
                let userKey = null;
                if (user) {
                    userKey = getUserDatabaseKey(user);
                }
                if (!userKey && userData) {
                    userKey = userData.userKey || userData.phoneNumber || userData.parentPhone || userData.parentEmail;
                }

                if (!userKey) {
                    console.warn("Navigation: No userKey found, cannot start test correctly.");
                }

                const children = userData?.children || null;
                const childKeys = children ? Object.keys(children) : [];
                let activeChildId = childKeys[0] || null;

                if (typeof window !== "undefined") {
                    const storedChildId = window.localStorage.getItem(`activeChild_${userKey}`);
                    const lastActiveChild = window.localStorage.getItem('lastActiveChild');

                    if (storedChildId && childKeys.includes(storedChildId)) {
                        activeChildId = storedChildId;
                    } else if (lastActiveChild && childKeys.includes(lastActiveChild)) {
                        activeChildId = lastActiveChild;
                    }
                }

                if (children && activeChildId) {
                    const activeChild = children[activeChildId];
                    const userDetails = {
                        ...activeChild,
                        phoneNumber: userKey,
                        childId: activeChildId,
                        activeChildId: activeChildId,
                    };

                    if (setQuizContext) {
                        setQuizContext({ userDetails, questionPaper: null });
                    }
                    if (typeof window !== "undefined") {
                        window.localStorage.removeItem("quizSession");
                    }
                } else {
                    if (typeof window !== "undefined" && activeChildId) {
                        try {
                            const storedSession = window.localStorage.getItem("quizSession");
                            if (storedSession) {
                                const parsed = JSON.parse(storedSession);
                                if (parsed?.userDetails?.childId && parsed.userDetails.childId !== activeChildId) {
                                    window.localStorage.removeItem("quizSession");
                                }
                            }
                        } catch (e) {
                            window.localStorage.removeItem("quizSession");
                        }
                    }
                    if (children && activeChildId) {
                        const activeChild = children[activeChildId];
                        // Direct redirect if logged in
                        if (activeChild.grade) {
                            const gradeDigit = activeChild.grade.replace(/\D/g, '');
                            router.push(`/practice?grade=${gradeDigit}`);
                            return;
                        }
                    }
                }
            } catch (e) {
                console.error("Navigation start test error:", e);
            }
            router.push("/practice"); // Fallback if no specific child/grade found but user is user
        } else if (hasSession) {
            // Try to recover grade from session if possible, otherwise just push to practice
            try {
                if (typeof window !== "undefined") {
                    const quizSession = window.localStorage.getItem("quizSession");
                    if (quizSession) {
                        const parsed = JSON.parse(quizSession);
                        if (parsed?.userDetails?.grade) {
                            const gradeDigit = parsed.userDetails.grade.replace(/\D/g, '');
                            router.push(`/practice?grade=${gradeDigit}`);
                            return;
                        }
                    }
                }
            } catch (e) { }
            router.push("/practice");
        } else {
            setRedirectPath("/practice");
            setAuthModalOpen(true);
        }
    };

    const handleSatPractice = () => {
        if (user) {
            router.push("/practice?grade=SAT");
        } else {
            setAuthModalOpen(true);
        }
    };

    return (
        <>
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md"
            >
                <div className="container mx-auto px-4 py-2 flex items-center justify-between relative">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
                        <Image
                            src="/LearnersLogoTransparent.png"
                            alt="Learners Logo"
                            width={120}
                            height={40}
                            className="w-auto h-10 md:h-12"
                            priority
                        />
                        <span
                            className="text-xl font-bold text-[#0d3773]"
                            style={{ fontFamily: 'var(--font-nunito)' }}
                        >
                            Skill Builder
                        </span>
                    </div>

                    <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8">
                        {!isTeacher && (
                            <button
                                onClick={handleTakeTest}
                                className="text-sm font-semibold text-[#0B2545]/80 hover:text-[#0096FF] transition-colors bg-transparent border-none cursor-pointer"
                            >
                                Practice
                            </button>
                        )}

                        {!isTeacher && (
                            <Link href="/rapid-math" className="text-sm font-semibold text-[#0B2545]/80 hover:text-[#0096FF] transition-colors">
                                Rapid Math
                            </Link>
                        )}

                        {!isTeacher && (
                            <button
                                onClick={handleSatPractice}
                                className="text-sm font-semibold text-[#0B2545]/80 hover:text-[#0096FF] transition-colors bg-transparent border-none cursor-pointer"
                            >
                                SAT
                            </button>
                        )}
                    </nav>

                    <div className="flex items-center gap-4">
                        <AnimatePresence mode="wait">
                            {isScrolled ? (
                                <motion.div
                                    key="journey"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Link href="/lottery">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="shadow-md bg-[#0096FF] hover:bg-[#007AFF] text-white rounded-xl px-6"
                                            style={{ fontFamily: 'var(--font-nunito)' }}
                                        >
                                            Begin your Journey
                                            <motion.div
                                                className="inline-block ml-2"
                                                animate={{ x: [0, 4, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </motion.div>
                                        </Button>
                                    </Link>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="auth"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {user || hasSession ? (
                                        <Button
                                            onClick={() => router.push(isTeacher ? "/teacher-dashboard" : "/dashboard")}
                                            variant="default"
                                            size="sm"
                                            className="shadow-md bg-[#007AFF] hover:bg-[#0060C9] text-white rounded-xl px-6"
                                            style={{ fontFamily: 'var(--font-nunito)' }}
                                        >
                                            <User className="mr-2 h-4 w-4" />
                                            {isTeacher ? "Dashboard" : "Profile"}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => setAuthModalOpen(true)}
                                            variant="default"
                                            size="sm"
                                            className="shadow-md bg-[#007AFF] hover:bg-[#0060C9] text-white rounded-xl px-6"
                                            style={{ fontFamily: 'var(--font-nunito)' }}
                                        >
                                            Log in
                                        </Button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.header>

            <AuthModal
                open={authModalOpen}
                redirectPath={redirectPath}
                onClose={() => {
                    setAuthModalOpen(false);
                    setRedirectPath(null);
                }}
                onSuccess={() => {
                    setAuthModalOpen(false);
                    setRedirectPath(null);
                    window.location.reload(); // Reload to update session state
                }}
            />
            {/* Spacer to prevent content overlap with fixed header */}
            <div className="h-14 md:h-12" />
        </>
    );
};

export default Header;