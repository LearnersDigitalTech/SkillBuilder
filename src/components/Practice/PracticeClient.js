"use client";
import React, { useState, useEffect } from "react";
import Styles from "./PracticeClient.module.css";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import PracticeMCQ from "./PracticeMCQ.component";
import PracticeUserInput from "./PracticeUserInput.component";
import GetGrade1Question from "@/questionBook/Grade1/GetGrade1Question";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen.component";
import getRandomInt from "../../app/workload/GetRandomInt";
import QuestionPalette from "../QuestionPalette/QuestionPalette.component";
import { regenerateQuestion } from "./PracticeGeneratorHelper";
import motivationData from "../Quiz/Assets/motivation.json";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PracticeClient = () => {
    const router = useRouter();
    const [questions, setQuestions] = useState([]); // Array of question objects
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    // Track user answers for palette status: { [index]: "correct" | "incorrect" | null }
    // Actually Palette expects 'userAnswer' in the question object usually? 
    // The Palette component checks `q.userAnswer` to see if completed.
    // We need to update the `questions` array with the answer status? 
    // Or simpler: just track `completedQuestionIndices`? 
    // Looking at Palette code: `const isCompleted = q.userAnswer !== null ...`
    // So we should update `questions` state.

    useEffect(() => {
        // Generate Grade 1 questions
        const gradeQuestionPaper = { ...GetGrade1Question };
        const generatedPaper = [];
        let qIndex = 1;
        while (gradeQuestionPaper[`q${qIndex}`]) {
            const qs = gradeQuestionPaper[`q${qIndex}`];
            if (qs && qs.length > 0) {
                const randomInt = getRandomInt(0, qs.length - 1);
                generatedPaper.push({ ...qs[randomInt], userAnswer: null }); // Add userAnswer field
            }
            qIndex++;
        }
        setQuestions(generatedPaper);
        setLoading(false);
    }, []);

    const handleNext = () => {
        if (activeQuestionIndex < questions.length - 1) {
            setActiveQuestionIndex(prev => prev + 1);
        } else {
            router.push('/practice/complete');
        }
    };

    const handleJumpToQuestion = (index) => {
        setActiveQuestionIndex(index);
    };

    const handleCorrectAnswer = (index) => {
        // Mark as answered
        const updatedQuestions = [...questions];
        updatedQuestions[index].userAnswer = "correct"; // Just a flag for Palette
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
        const newQ = regenerateQuestion(currentQ);

        if (newQ) {
            const updatedQuestions = [...questions];
            updatedQuestions[index] = { ...newQ, userAnswer: null }; // Reset answer
            setQuestions(updatedQuestions);
            // Toast or subtle indicator?
            // Maybe reset logic in Child component will handle visual reset.
        } else {
            // Fallback if no generator found
            toast.error("Could not regenerate this question.");
        }
    };

    const handleExit = () => {
        router.push('/');
    };

    if (loading) {
        return <LoadingScreen title="Loading Practice Mode" />;
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
                    <QuestionPalette
                        questions={questions}
                        activeQuestionIndex={activeQuestionIndex}
                        onSelect={handleJumpToQuestion}
                        onPrevious={() => activeQuestionIndex > 0 && setActiveQuestionIndex(activeQuestionIndex - 1)}
                        onNext={() => activeQuestionIndex < questions.length - 1 && setActiveQuestionIndex(activeQuestionIndex + 1)}
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

                    {/* Mobile Header for Exit? Or rely on Sidebar drawer? */}
                    {/* Let's keep a simple header for Mobile or just the Back button */}
                    <div className={Styles.mobileHeader}>
                        <button onClick={handleExit} className={Styles.backButton}>
                            <ArrowLeft size={24} />
                            <span>Exit</span>
                        </button>
                        <span className={Styles.progressText}>Q{activeQuestionIndex + 1}/{questions.length}</span>
                    </div>

                    {currentQuestion.type === "mcq" && (
                        <PracticeMCQ
                            key={`${activeQuestionIndex}-${currentQuestion.question}`} // Key change resets component state
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
                            grade="Grade 1"
                            keypadMode={currentQuestion.keypadMode}
                            onNext={handleNext}
                            onCorrect={() => handleCorrectAnswer(activeQuestionIndex)}
                            onWrong={handleWrongAnswer}
                            onRepeat={() => handleRepeat(activeQuestionIndex)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PracticeClient;
