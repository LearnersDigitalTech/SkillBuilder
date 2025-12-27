"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const Navigation = ({ forceWhite = false }) => {
    const [scrolled, setScrolled] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [hasSession, setHasSession] = useState(false);
    const [isSATLoading, setIsSATLoading] = useState(false);
    const { user, userData, isTeacher } = useAuth();
    const router = useRouter();
    const [quizContext, setQuizContext] = useContext(QuizSessionContext) || [null, () => { }];

    useEffect(() => {
        const checkSession = () => {
            if (typeof window !== "undefined") {
                const quizSession = window.localStorage.getItem("quizSession");
                if (quizSession) {
                    try {
                        const parsed = JSON.parse(quizSession);
                        if (parsed?.userDetails) {
                            setHasSession(true);
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
        const handleScroll = () => {
            // Trigger change when scrolled past roughly the hero section (viewport height)
            setIsScrolled(window.scrollY > window.innerHeight - 100);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <div className={`${Styles.navigationContainer} ${scrolled || forceWhite ? Styles.scrolled : ''} ${forceWhite ? Styles.white : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div className={Styles.logoContainer} onClick={() => router.push("/")}>
                        <div className={Styles.brainWrap} aria-hidden>
                            <img src="/LearnersLogoTransparent.png" className={Styles.brainIcon} />
                        </div>
                        <div>
                            <h3 className={Styles.logoTitle}>Math Skill Conquest</h3>
                        </div>
                    </div>
                    <div className={Styles.navActionContainer}>
                        {/* Hide Take Test and Rapid Math for teachers */}
                        {!isTeacher && (
                            <>
                                <Tooltip title="Take Test" arrow>
                                    <button
                                        onClick={async () => {
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
                                                    }
                                                } catch (e) {
                                                    console.error("Navigation start test error:", e);
                                                }
                                                router.push("/quiz");
                                            } else if (hasSession) {
                                                router.push("/quiz");
                                            } else {
                                                setAuthModalOpen(true);
                                            }
                                        }}
                                        style={{ backgroundColor: "#3c91f3ff", color: "white" }}
                                        className={Styles.navButton}
                                    >
                                        <Play size={16} />
                                        <span className={Styles.buttonText}>Take Test</span>
                                    </button>
                                </Tooltip>

                                <Tooltip title="Rapid Math" arrow>
                                    <button onClick={() => router.push("/rapid-math")} className={`${Styles.navButton} ${Styles.outlined}`}>
                                        <Zap size={16} />
                                        <span className={Styles.buttonText}>Rapid Math</span>
                                    </button>
                                </Tooltip>
                            </>
                        )}

                        {/* Hide SAT for teachers */}
                        {!isTeacher && (
                            <Tooltip title="SAT Practice" arrow>
                                <button
                                    onClick={() => {
                                        if (user) {
                                            setIsSATLoading(true);
                                            router.push("/practice?grade=SAT");
                                        } else {
                                            setAuthModalOpen(true);
                                        }
                                    }}
                                    className={`${Styles.navButton} ${Styles.outlined}`}
                                >
                                    <GraduationCap size={16} />
                                    <span className={Styles.buttonText}>SAT</span>
                                </button>
                            </Tooltip>
                        )}

                        {user || hasSession ? (
                            <Tooltip title={isTeacher ? "Teacher Dashboard" : "View Dashboard"} arrow>
                                <button
                                    onClick={() => router.push(isTeacher ? "/teacher-dashboard" : "/dashboard")}
                                    className={`${Styles.navButton} ${Styles.outlined}`}
                                >
                                    <User size={16} />
                                    <span className={Styles.buttonText}>{isTeacher ? "Dashboard" : "Profile"}</span>
                                </button>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Sign In" arrow>
                                <button onClick={() => setAuthModalOpen(true)} className={`${Styles.navButton} ${Styles.outlined}`}>
                                    <User size={16} />
                                    <span className={Styles.buttonText}>Sign In</span>
                                </button>
                            </Tooltip>
                        )}

                        <Tooltip title="Reach out to us" arrow>
                            <button onClick={() => window.location.href = "tel:+919916933202"} className={`${Styles.navButton} ${Styles.outlined}`}>
                                <Phone size={16} />
                                <span className={Styles.buttonText}>Reach Us</span>
                            </button>
                        </Tooltip>
                    </div>
                </div>

                <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8">

                    <a href="#benefits" className="text-sm font-semibold text-[#0B2545]/80 hover:text-[#0096FF] transition-colors">
                        Practice
                    </a>
                    <a href="#faq" className="text-sm font-semibold text-[#0B2545]/80 hover:text-[#0096FF] transition-colors">
                        Rapid Math
                    </a>
                    <a href="#faq" className="text-sm font-semibold text-[#0B2545]/80 hover:text-[#0096FF] transition-colors">
                        SAT
                    </a>
                </nav>

                <AnimatePresence mode="wait">
                    {isScrolled ? (
                        <motion.div
                            key="journey"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link href="/quiz">
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
                            key="login"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link href="/login">
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="shadow-md bg-[#007AFF] hover:bg-[#0060C9] text-white rounded-xl px-6"
                                    style={{ fontFamily: 'var(--font-nunito)' }}
                                >
                                    Log in
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
};

export default Navigation;