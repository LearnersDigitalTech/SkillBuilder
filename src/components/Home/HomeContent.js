"use client";
import Navigation from "@/components/Navigation/Navigation.component";
import Styles from "../../app/page.module.css";
import { Button, CircularProgress } from "@mui/material";
import { Award, Clock, Contact, ArrowRight, Target, Coins, Ticket, School, Medal } from "lucide-react";
import dynamic from "next/dynamic";
// const LandingIllustration = dynamic(() => import("@/components/LottieAnimations/Landing/Landing.component"), { ssr: false });
import SampleDashboard from "@/components/SampleDashboard/SampleDashboard.component";
import Footer from "@/components/Footer/Footer.component";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { QuizSessionContext } from "../../app/context/QuizSessionContext";
import { toast } from "react-toastify";
import SuccessStories from "@/components/SuccessStories/SuccessStories.component";
import MathClub from "@/components/Home/MathClub.component";
import AuthModal from "@/components/Auth/AuthModal.component";
import { useAuth } from "@/context/AuthContext";
import CustomModal from "@/components/CustomModal/CustomModal.component";
import { get, ref } from "firebase/database";
import { firebaseDatabase, getUserDatabaseKey } from "@/backend/firebaseHandler";

const HomeContent = () => {
    const router = useRouter();
    const [quizContext, setQuizContext] = useContext(QuizSessionContext);
    const { user, userData } = useAuth();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [alreadyAttemptedModalOpen, setAlreadyAttemptedModalOpen] = useState(false);

    const handleStartAssessment = async () => {
        // Check for local session first
        if (!user && typeof window !== "undefined") {
            try {
                const quizSession = window.localStorage.getItem("quizSession");
                if (quizSession) {
                    const parsed = JSON.parse(quizSession);
                    if (parsed?.userDetails) {
                        router.push("/quiz");
                        return;
                    }
                }
            } catch (e) { }
        }

        if (user) {
            // Get user key (works for phone, Google, and email auth)
            // Robust user key retrieval
            let userKey = null;
            if (user) {
                userKey = getUserDatabaseKey(user);
            }
            if (!userKey && userData) {
                userKey = userData.userKey || userData.phoneNumber || userData.parentPhone || userData.parentEmail;
            }

            if (!userKey) {
                console.warn("HomeContent: No userKey found.");
                return;
            }

            const children = userData?.children || null;
            const childKeys = children ? Object.keys(children) : [];
            let activeChildId = childKeys[0] || null;

            // If there are multiple children, prefer the one selected on the dashboard
            if (typeof window !== "undefined") {
                const storedChildId = window.localStorage.getItem(`activeChild_${userKey}`);
                const lastActiveChild = window.localStorage.getItem('lastActiveChild'); // Fallback

                if (storedChildId && childKeys.includes(storedChildId)) {
                    activeChildId = storedChildId;
                } else if (lastActiveChild && childKeys.includes(lastActiveChild)) {
                    activeChildId = lastActiveChild;
                }
            }

            if (!children || !activeChildId) {
                setAuthModalOpen(true);
                return;
            }

            const activeChild = children[activeChildId];

            // New session for this child: clear any previous quiz session so old grade/questions don't leak.
            try {
                if (typeof window !== "undefined") {
                    window.localStorage.removeItem("quizSession");
                }

                const reportRef = ref(firebaseDatabase, `NMD_2025/Reports/${userKey}/${activeChildId}`);
                const snapshot = await get(reportRef);
                if (snapshot.exists()) {
                    setAlreadyAttemptedModalOpen(true);
                    return;
                }
            } catch (error) {
                console.error("Error checking report:", error);
            }

            const userDetails = {
                ...activeChild,
                phoneNumber: userKey, // Use userKey for backward compatibility
                childId: activeChildId,
            };

            setQuizContext({ userDetails, questionPaper: null });
            router.push("/quiz");
        } else {
            // Not logged in (or waiting for auth), but check if we have a mismatched local session
            // that needs clearing?
            // Actually, if !user, we probably shouldn't be here unless "Take Assessment" clicked.

            // If !user, we open auth modal.
            // But if we are in a state where user is technically logged in but fell through? 
            // Logic above says "if (user) { ... } else { openModal }".
            // So this block handles the not-logged-in case perfectly.

            // Not logged in, open auth modal
            setAuthModalOpen(true);
        }
    };

    const handleAuthSuccess = (data) => {
        const children = data?.children || null;
        const childKeys = children ? Object.keys(children) : [];

        // Use the activeChildId from the data if provided, otherwise fall back to first child
        const activeChildId = data?.activeChildId || childKeys[0] || null;

        if (!children || !activeChildId) {
            return;
        }

        const activeChild = children[activeChildId];
        const phoneNumber = data.parentPhone || "";

        const userDetails = {
            ...activeChild,
            phoneNumber,
            childId: activeChildId,
        };

        setQuizContext({ userDetails, questionPaper: null });
        router.push("/quiz");
    };

    return (
        <div className={Styles.page}>
            <Navigation />
            <div className={Styles.heroContainer}>
                <div className={Styles.contentContainer}>
                    <div className={Styles.titleSection}>
                        {/* <p className={Styles.nationalMathDay}></p> */}
                        <p className={Styles.tagline}>National Mathematics Day 2025</p>
                    </div>
                    <h1>Math Skills Proficiency Test</h1>
                    <p className={Styles.subtitle}>Discover Your Math Mastery Level</p>
                    {/* <div className={Styles.badgesContainer}>
                        <div className={Styles.badge}>
                            <Target className={Styles.badgeIcon} />
                            <span>Assess</span>
                        </div>
                        <div className={Styles.badge}>
                            <Award className={Styles.badgeIcon} />
                            <span>Master</span>
                        </div>
                        <div className={Styles.badge}>
                            <Clock className={Styles.badgeIcon} />
                            <span>Celebrate Math Skills</span>
                        </div>
                    </div> */}

                    <div style={{ marginTop: '32px' }}>
                        <Button
                            variant="contained"
                            endIcon={<ArrowRight />}
                            onClick={handleStartAssessment}
                            sx={{
                                backgroundColor: '#3c91f3',
                                color: 'white',
                                padding: '12px 32px',
                                fontSize: '1.1rem',
                                textTransform: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: '#1a73e8'
                                }
                            }}
                        >
                            Start Assessment
                        </Button>
                    </div>

                    {/* <div className={Styles.featuresContainer}>
                        <div className={Styles.featureItem}>
                            <Clock />
                            <p>30 Minutes</p>
                        </div>

                        <div className={Styles.featureItem}>
                            <Contact />
                            <p>Ages 6 - 16</p>
                        </div>

                        <div className={Styles.featureItem}>
                            <Award />
                            <p>Instant Result</p>
                        </div>
                    </div> */}
                </div>
                <div className={Styles.illustrationContainer}>
                    {/* <LandingIllustration /> */}
                    <img
                        src="/HeroIllustration.gif"
                        alt="Landing Illustration"
                        style={{ width: '95%', height: 'auto', mixBlendMode: 'multiply', filter: 'brightness(1.05)' }}
                    />
                </div>
            </div>

            <SuccessStories />
            <MathClub onStart={handleStartAssessment} />
            {/* <div className={Styles.whyChooseUsContainer}>
                <div>
                    <Award size={40} />
                    <div>
                        <h4>Official Certification 🏆</h4>
                        <p>Earn a verifiable certificate of mastery to acknowledge your mathematical achievement.</p>
                    </div>
                </div>
                <div>
                    <Target size={40} />
                    <div>
                        <h4>State-Level Ranking 📊</h4>
                        <p>Compete with peers across the state and see exactly where you stand on the leaderboard.</p>
                    </div>
                </div>
                <div>
                    <Clock size={40} />
                    <div>
                        <h4>Adaptive 30-Min Test 🎯</h4>
                        <p>A smart, stress-free assessment that adapts to your level. No preparation required.</p>
                    </div>
                </div>
                <div>
                    <Contact size={40} />
                    <div>
                        <h4>In-Depth Skill Report 📋</h4>
                        <p>Get a significant topic-wise breakdown of your logic, arithmetic, and geometry skills instantly.</p>
                    </div>
                </div>
                <div>
                    <Coins size={40} />
                    <div>
                        <h4>Cash Rewards 💰</h4>
                        <p>Top rankers in each grade win exciting cash scholarships to support their academic journey.</p>
                    </div>
                </div>
                <div>
                    <Ticket size={40} />
                    <div>
                        <h4>Grand Finale Invite 🎟️</h4>
                        <p>Qualify for the exclusive award ceremony at Learners Global School with industry leaders.</p>
                    </div>
                </div>
                <div>
                    <School size={40} />
                    <div>
                        <h4>School Championship 🏫</h4>
                        <p>Win points for your school's championship tally. Be the pride of your institution.</p>
                    </div>
                </div>
                <div>
                    <Medal size={40} />
                    <div>
                        <h4>Merit Medals 🥇</h4>
                        <p>Gold, Silver, and Bronze medals for district toppers ensuring your hard work is honored.</p>
                    </div>
                </div>
            </div> */}

            {/* <div className={Styles.empoweringParentsContainer}>
                <SampleDashboard />
                <div className={Styles.empoweringParentsContent}>
                    <h2 className={Styles.empoweringParentsTitle}>Empowering Parents with Actionable Insights</h2>
                    <p className={Styles.empoweringParentsDescription}>Get more than just a score. Receive detailed recommendations and resources tailored to your child's unique math learning profile.</p>
                    <ul className={Styles.empoweringParentsList}>
                        <li className={Styles.empoweringParentsListItem}>
                            <p>Discover math strengths and improvement areas</p>
                        </li>
                        <li className={Styles.empoweringParentsListItem}>
                            <p>Receive personalized study guides and resources</p>
                        </li>
                        <li className={Styles.empoweringParentsListItem}>
                            <p>Track math progress over time with detailed analytics</p>
                        </li>
                        <li className={Styles.empoweringParentsListItem}>
                            <p>Gain insights backed by educational experts</p>
                        </li>
                        <li className={Styles.empoweringParentsListItem}>
                            <p>Access math activities tailored to your child's needs</p>
                        </li>
                    </ul>
                </div>

            </div> */}

            <div className={Styles.poweredByContainer}>
                <div>
                    <h2>Powered by Learners!</h2>
                    <p>Learners, Mysore, an institution known for its strong academic culture and student-focused learning. By combining Learners' educational expertise with AI-driven analysis, we provide students with clear insights into their mathematical strengths and gaps. This collaboration ensures a more personalized, effective learning experience helping every learner grow with confidence and precision.</p>
                </div>
                <div>
                    <img className={Styles.poweredByContainerImage} src="/LearnersLogoTransparent.png" alt="Learners Logo" />
                </div>
            </div>

            <div className={Styles.placesContainer} >
                <a href="https://learnersglobalschool.com/" target="blank" className={Styles.placeContainer} >
                    <img className={Styles.placeImage} src="/places/school_college.png" alt="Learners Global School and PU College" />
                    <h2 className={Styles.placeTitle}>Learners Global School and PU College</h2>
                    <p className={Styles.placeDescription}>Fostering young minds with a holistic CBSE school curriculum from Pre-KG to 12th, focused on foundational excellence and character development</p>
                    <p className={Styles.placeVisitNow}>Visit Now!</p>
                </a>

                <a href="https://learners.co.in/" target="blank" className={Styles.placeContainer} >
                    <img className={Styles.placeImage} src="/places/college.png" alt="Learners Global School and PU College" />
                    <h2 className={Styles.placeTitle}>Learners PU College</h2>
                    <p className={Styles.placeDescription}>Preparing students for higher education through rigorous academic programs and career-focused guidance, strengthened by integrated NEET, JEE, CET, and IIT coaching</p>
                    <p className={Styles.placeVisitNow}>Visit Now!</p>
                </a>

                <a href="https://learnersdigital.com/" target="blank" className={Styles.placeContainer} >
                    <img className={Styles.placeImage} src="/places/nesaratechpark.jpg" alt="Learners Global School and PU College" />
                    <h2 className={Styles.placeTitle}>Learners Digital</h2>
                    <p className={Styles.placeDescription}>Connecting talent with global opportunities and fostering corporate partnerships for mutual growth.</p>
                    <p className={Styles.placeVisitNow}>Visit Now!</p>
                </a>
            </div>

            <Footer />

            <AuthModal
                open={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onSuccess={handleAuthSuccess}
            />

            <CustomModal
                open={alreadyAttemptedModalOpen}
                onClose={() => setAlreadyAttemptedModalOpen(false)}
                content={
                    <div className={Styles.modalRegistrationContent}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px' }}>
                            <Award size={64} color="#3c91f3" />
                            <h2 style={{ textAlign: 'center', margin: 0 }}>Assessment Completed!</h2>
                            <p style={{ textAlign: 'center', color: '#666', margin: 0 }}>
                                You have already taken the National Math Skills Proficiency Test.
                            </p>
                            <Button
                                variant="contained"
                                onClick={() => router.push("/dashboard")}
                                sx={{
                                    backgroundColor: '#3c91f3',
                                    textTransform: 'none',
                                    marginTop: '16px'
                                }}
                            >
                                View Your Report
                            </Button>
                        </div>
                    </div>
                }
            >
            </CustomModal>
        </div>
    );
}

export default HomeContent;
