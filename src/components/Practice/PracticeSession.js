"use client";
import React, { useState, useEffect } from "react";
// import Styles from "./Grade1PracticeClient.module.css"; // We need to handle styles. Can re-use existing or genericize.
// Let's assume we rename Grade1PracticeClient.module.css to PracticeSession.module.css or similar? 
// For now, I'll copy the styles too or point to the old one if I don't delete it yet?
// Planner said delete Grade1 dir. So I should move the CSS too.
import { useContext } from "react";
import Styles from "./PracticeSession.module.css";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import PracticeMCQ from "./PracticeMCQ.component";
import PracticeUserInput from "./PracticeUserInput.component";
import PracticeTableInput from "./PracticeTableInput.component";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen.component";
// import getRandomInt from "../../app/workload/GetRandomInt"; // relative from src/components/Practice
import getRandomInt from "@/app/workload/GetRandomInt"; // Use alias for safety
import QuestionPalette from "../QuestionPalette/QuestionPalette.component";
import { regenerateQuestion } from "./PracticeGeneratorHelper";
import motivationData from "../Quiz/Assets/motivation.json";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "@/context/AuthContext";
import { QuizSessionContext } from "@/app/context/QuizSessionContext";
import { getUserDatabaseKey } from "@/backend/firebaseHandler";

const PracticeSession = ({
    initialQuestions = [],
    generatorMap,
    gradeTitle = "Practice"
}) => {
    const router = useRouter();
    const { user, userData } = useAuth();
    const [quizContext, setQuizContext] = useContext(QuizSessionContext);
    const [questions, setQuestions] = useState([]);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (initialQuestions && initialQuestions.length > 0) {
            setQuestions(initialQuestions);
            setLoading(false);
        }
    }, [initialQuestions]);

    const handleStartAssessment = () => {
        // Based on DashboardClient logic
        const effectiveUserData = userData || (typeof window !== "undefined" ? JSON.parse(window.localStorage.getItem("quizSession") || "{}")?.userDetails : null);

        let userKey = null;
        if (user) {
            userKey = getUserDatabaseKey(user);
        }
        if (!userKey && effectiveUserData) {
            userKey = effectiveUserData.userKey || effectiveUserData.phoneNumber || effectiveUserData.parentPhone || effectiveUserData.parentEmail;
        }

        if (!userKey) {
            // If no user detected, just go to complete page or home? 
            // Defaulting to complete page if auth fails to keep flow, or maybe login?
            // User requested "redirect them to start take assessment flow". 
            // If they are not logged in, they can't take assessment.
            // Let's force /quiz which might handle auth or redirect.
            router.push("/quiz");
            return;
        }

        // Determine active child logic (simplified from Dashboard)
        // We might not know the active child here easily without reading local storage similarly.
        let activeChild = null;
        let activeChildId = null;

        if (effectiveUserData?.children) {
            // Try to get from local storage
            const storedChildId = typeof window !== "undefined"
                ? window.localStorage.getItem(`activeChild_${userKey}`) || window.localStorage.getItem('lastActiveChild')
                : null;

            if (storedChildId && effectiveUserData.children[storedChildId]) {
                activeChild = effectiveUserData.children[storedChildId];
                activeChildId = storedChildId;
            } else {
                // Fallback to first
                const firstKey = Object.keys(effectiveUserData.children)[0];
                if (firstKey) {
                    activeChild = effectiveUserData.children[firstKey];
                    activeChildId = firstKey;
                }
            }
        }

        if (!activeChild) {
            // Fallback if no child profile structure (e.g. old user model or direct user)
            // We'll create a dummy wrapper or just pass userDetails if simpler.
            // But the Quiz flow expects specific structure. 
            // Let's assume standard flow exists. If not, normal /quiz entry point calls logic too.
        }

        // Clean previous session
        try {
            if (typeof window !== "undefined") {
                window.localStorage.removeItem("quizSession");
            }
        } catch (e) { }

        const userDetails = {
            ...(activeChild || effectiveUserData), // Fallback to main data if no child
            phoneNumber: userKey,
            childId: activeChildId,
            activeChildId: activeChildId,
            testType: 'ASSESSMENT'
        };

        setQuizContext({ userDetails, questionPaper: null });
        router.push("/quiz");
    };

    const handleNext = () => {
        if (activeQuestionIndex < questions.length - 1) {
            setActiveQuestionIndex(prev => prev + 1);
        } else {
            // Last question - Go to Home
            router.push('/');
        }
    };

    const handleJumpToQuestion = (index) => {
        setActiveQuestionIndex(index);
    };

    const handleCorrectAnswer = (index) => {
        // Mark as answered
        const updatedQuestions = [...questions];
        updatedQuestions[index].userAnswer = "correct";
        setQuestions(updatedQuestions);

        // Show Motivation
        const motivations = motivationData.quiz;
        const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)].motivation;
        toast.success(randomMotivation, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });

        // Auto-advance after 2 seconds
        setTimeout(() => {
            // Check if we are still on the same question (user didn't manually move)
            if (activeQuestionIndex === index && index < questions.length - 1) {
                setActiveQuestionIndex(prev => prev + 1);
            } else if (index === questions.length - 1) {
                router.push('/practice/complete');
            }
        }, 2500);
    };

    const handleWrongAnswer = () => {
        // No op for palette now
    };

    const handleRepeat = (index) => {
        // Regenerate question at this index
        const currentQ = questions[index];
        // Pass generatorMap to the helper
        const newQ = regenerateQuestion(currentQ, generatorMap);

        if (newQ) {
            const updatedQuestions = [...questions];
            updatedQuestions[index] = { ...newQ, userAnswer: null }; // Reset answer
            setQuestions(updatedQuestions);
        } else {
            console.warn("Could not regenerate question", currentQ);
            toast.error("Could not regenerate this question.");
        }
    };

    const handleExit = () => {
        router.push('/');
    };

    if (loading) {
        return <LoadingScreen title={`Loading ${gradeTitle} Mode`} />;
    }

    if (questions.length === 0) {
        return <div className={Styles.error}>No questions found.</div>;
    }

    const currentQuestion = questions[activeQuestionIndex];

    return (
        <div className={Styles.page}>
            <ToastContainer />
            <div className={Styles.mainLayout}>
                {/* Sidebar Palette */}
                <div className={Styles.paletteColumn}>
                    <div className={Styles.sidebarHeader}>
                        <h2>{gradeTitle}</h2>
                    </div>
                    <QuestionPalette
                        questions={questions}
                        activeQuestionIndex={activeQuestionIndex}
                        onSelect={handleJumpToQuestion}
                        onPrevious={() => activeQuestionIndex > 0 && setActiveQuestionIndex(activeQuestionIndex - 1)}
                        onNext={handleNext}
                        isLastQuestion={activeQuestionIndex === questions.length - 1}
                        nextDisabled={questions[activeQuestionIndex].userAnswer !== "correct"}
                    />

                    <button onClick={handleExit} className={Styles.exitButtonSidebar}>
                        <ArrowLeft size={20} />
                        <span>Exit Practice</span>
                    </button>
                </div>

                {/* Question Area */}
                <div className={Styles.contentArea}>

                    <div className={Styles.mobileHeader}>
                        <button onClick={handleExit} className={Styles.backButton}>
                            <ArrowLeft size={24} />
                            <span>Exit</span>
                        </button>
                        <span className={Styles.progressText}>Q{activeQuestionIndex + 1}/{questions.length}</span>
                    </div>

                    {currentQuestion.type === "mcq" && (
                        <PracticeMCQ
                            key={`${activeQuestionIndex}-${currentQuestion.question}`}
                            activeQuestionIndex={activeQuestionIndex}
                            question={currentQuestion.question}
                            topic={currentQuestion.topic}
                            options={currentQuestion.options}
                            answer={currentQuestion.answer}
                            image={currentQuestion.image}
                            onNext={handleNext}
                            onCorrect={() => handleCorrectAnswer(activeQuestionIndex)}
                            onWrong={handleWrongAnswer}
                            onRepeat={() => handleRepeat(activeQuestionIndex)}
                            isLastQuestion={activeQuestionIndex === questions.length - 1}
                        />
                    )}
                    {currentQuestion.type === "userInput" && (
                        <PracticeUserInput
                            key={`${activeQuestionIndex}-${currentQuestion.question}`}
                            activeQuestionIndex={activeQuestionIndex}
                            question={currentQuestion.question}
                            topic={currentQuestion.topic}
                            answer={currentQuestion.answer}
                            image={currentQuestion.image}
                            grade={gradeTitle} // Pass title or raw grade number? Component might use it for keypad?
                            keypadMode={currentQuestion.keypadMode}
                            onNext={handleNext}
                            onCorrect={() => handleCorrectAnswer(activeQuestionIndex)}
                            onWrong={handleWrongAnswer}
                            onRepeat={() => handleRepeat(activeQuestionIndex)}
                            isLastQuestion={activeQuestionIndex === questions.length - 1}
                        />
                    )}
                    {currentQuestion.type === "tableInput" && (
                        <PracticeTableInput
                            key={`${activeQuestionIndex}-${currentQuestion.topic}`}
                            activeQuestionIndex={activeQuestionIndex}
                            question={currentQuestion}
                            topic={currentQuestion.topic}
                            rows={currentQuestion.rows}
                            variant={currentQuestion.variant}
                            answer={currentQuestion.answer}
                            onNext={handleNext}
                            onCorrect={() => handleCorrectAnswer(activeQuestionIndex)}
                            onWrong={handleWrongAnswer}
                            onRepeat={() => handleRepeat(activeQuestionIndex)}
                            isLastQuestion={activeQuestionIndex === questions.length - 1}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PracticeSession;
