"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, X, Menu } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, IconButton, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useContext, useRef } from "react";
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
    const [showGradeSelector, setShowGradeSelector] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState("");
    const [hasSession, setHasSession] = useState(false);
    const [fallbackData, setFallbackData] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const hamburgerRef = useRef<HTMLButtonElement>(null);
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

    useEffect(() => {
        const checkMobile = () => {
            const isMob = window.innerWidth < 768; // md breakpoint
            setIsMobile(isMob);
            if (!isMob) {
                setMenuOpen(false); // Close menu if switching to desktop
            }
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);

    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuOpen &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                hamburgerRef.current &&
                !hamburgerRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    const handleTakeTest = async () => {
        // ALWAYS Show Grade Selector, but check auth first
        if (user || hasSession) {
            setShowGradeSelector(true);
        } else {
            // Not logged in -> Login First, then show Grade Selector
            setRedirectPath("NONE"); // Special flag to prevent auto-redirect
            setAuthModalOpen(true);
        }
    };

    const handleSatPractice = () => {
        if (user) {
            router.push("/practice?grade=SAT");
        } else {
            setRedirectPath("/practice?grade=SAT");
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
                            className="text-xl font-bold text-[#0096FF]"
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
                            {isScrolled && !isMobile ? (
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

                    {/* Hamburger Menu Toggle */}
                    <button
                        ref={hamburgerRef}
                        className="md:hidden ml-2 text-[#0B2545] p-1"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 overflow-hidden shadow-lg absolute left-0 right-0 top-full"
                        >
                            <nav className="flex flex-col p-4 gap-4 items-center">
                                {!isTeacher && (
                                    <button
                                        onClick={() => {
                                            handleTakeTest();
                                            setMenuOpen(false);
                                        }}
                                        className="text-lg font-semibold text-[#0B2545] hover:text-[#0096FF] transition-colors bg-transparent border-none cursor-pointer w-full text-center py-2"
                                    >
                                        Practice
                                    </button>
                                )}

                                {!isTeacher && (
                                    <Link
                                        href="/rapid-math"
                                        className="text-lg font-semibold text-[#0B2545] hover:text-[#0096FF] transition-colors w-full text-center py-2"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Rapid Math
                                    </Link>
                                )}

                                {!isTeacher && (
                                    <button
                                        onClick={() => {
                                            handleSatPractice();
                                            setMenuOpen(false);
                                        }}
                                        className="text-lg font-semibold text-[#0B2545] hover:text-[#0096FF] transition-colors bg-transparent border-none cursor-pointer w-full text-center py-2"
                                    >
                                        SAT
                                    </button>
                                )}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                    // Check if we need to show grade selector immediately after login
                    if (redirectPath === "NONE") {
                        setShowGradeSelector(true);
                        setRedirectPath(null);
                        // Do NOT reload here, let the user pick a grade
                    } else {
                        // Let AuthModal handle the redirect
                    }
                }}
            />

            {/* Grade Selection Dialog */}
            <Dialog
                open={showGradeSelector}
                onClose={() => setShowGradeSelector(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    style: { borderRadius: 20, padding: 10 }
                }}
            >
                <DialogTitle className="flex justify-between items-center text-[#0B2545] font-bold pb-2 border-b border-gray-100">
                    Select Your Grade
                    <IconButton onClick={() => setShowGradeSelector(false)} size="small">
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent className="pt-6 pb-2">
                    <div className="mt-4">
                        <FormControl fullWidth>
                            <InputLabel id="grade-select-label">Select Grade</InputLabel>
                            <Select
                                labelId="grade-select-label"
                                value={selectedGrade}
                                label="Select Grade"
                                onChange={(e) => setSelectedGrade(e.target.value)}
                            >
                                {[...Array(10)].map((_, i) => (
                                    <MenuItem key={i + 1} value={(i + 1).toString()}>
                                        Grade {i + 1}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <button
                            onClick={() => {
                                if (selectedGrade) {
                                    setShowGradeSelector(false);
                                    router.push(`/practice?grade=${selectedGrade}`);
                                }
                            }}
                            disabled={!selectedGrade}
                            className={`w-full mt-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${selectedGrade
                                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                }`}
                        >
                            Start Practice
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Spacer to prevent content overlap with fixed header */}
            <div className="h-14 md:h-12" />
        </>
    );
};

export default Header;