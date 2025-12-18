"use client";
import { useState, useEffect } from "react";
import Styles from "./SATSession.module.css";
import SATMCQ from "./SATMCQ.component";
import SATUserInput from "./SATUserInput.component";
import SATTableInput from "./SATTableInput.component";
import QuestionPalette from "../QuestionPalette/QuestionPalette.component";
import { ArrowLeft, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import SATReport from "./SATReport.component";

const EXAM_DURATION = 30 * 60; // 30 minutes in seconds

const SATSession = ({ initialQuestions, gradeTitle }) => {
    const router = useRouter();
    const [questions, setQuestions] = useState(initialQuestions || []);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

    // Exam State
    const [userAnswers, setUserAnswers] = useState({}); // { questionIndex: answer }
    const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
    const [isExamOver, setIsExamOver] = useState(false);
    const [timeTaken, setTimeTaken] = useState(0);

    // Timer Logic
    useEffect(() => {
        if (isExamOver) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    finishExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isExamOver]);

    const finishExam = () => {
        setIsExamOver(true);
        setTimeTaken(EXAM_DURATION - timeLeft);
    };

    const handleAnswer = (answer) => {
        setUserAnswers(prev => ({
            ...prev,
            [activeQuestionIndex]: answer
        }));
    };

    const handleNext = () => {
        if (activeQuestionIndex < questions.length - 1) {
            setActiveQuestionIndex(prev => prev + 1);
        } else {
            finishExam();
        }
    };

    const formatTimer = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (isExamOver) {
        return (
            <SATReport
                questions={questions}
                userAnswers={userAnswers}
                timeTaken={EXAM_DURATION - timeLeft}
            />
        );
    }

    const currentQuestion = questions[activeQuestionIndex];

    if (!currentQuestion) return <div className={Styles.loading}>Loading Exam...</div>;

    // Prepare questions for palette
    const questionsForPalette = questions.map((q, idx) => ({
        userAnswer: userAnswers[idx],
        markedForReview: false
    }));

    return (
        <div className={Styles.sessionContainer}>
            {/* Header with Timer */}
            <div className={Styles.header}>
                <button onClick={() => router.push('/')} className={Styles.backButton}>
                    <ArrowLeft size={20} /> Exit Exam
                </button>
                <div className={Styles.timer} style={{ color: timeLeft < 300 ? '#ef4444' : '#1e293b' }}>
                    <Clock size={20} />
                    <span>{formatTimer(timeLeft)}</span>
                </div>
            </div>

            <div className={Styles.mainLayout}>
                {/* Sidebar Palette */}
                <div className={Styles.paletteColumn}>
                    <QuestionPalette
                        questions={questionsForPalette}
                        activeQuestionIndex={activeQuestionIndex}
                        onSelect={(idx) => setActiveQuestionIndex(idx)}
                        onPrevious={() => activeQuestionIndex > 0 && setActiveQuestionIndex(prev => prev - 1)}
                        onNext={handleNext}
                        isLastQuestion={activeQuestionIndex === questions.length - 1}
                    />
                </div>

                {/* Question Area */}
                <div className={Styles.contentArea}>
                    {/* Standardize type check to handle case differences */}
                    {(currentQuestion.type === "MCQ" || currentQuestion.type === "mcq") && (
                        <SATMCQ
                            key={activeQuestionIndex}
                            onNext={handleNext}
                            question={currentQuestion.question}
                            topic={currentQuestion.topic}
                            options={currentQuestion.options}
                            answer={currentQuestion.answer}
                            image={currentQuestion.image}
                            activeQuestionIndex={activeQuestionIndex}
                            onAnswer={handleAnswer}
                            savedAnswer={userAnswers[activeQuestionIndex]}
                        />
                    )}

                    {/* Check for text/user_input types */}
                    {(currentQuestion.type === "USER_INPUT" || currentQuestion.type === "text" || currentQuestion.type === "user_input") && (
                        <SATUserInput
                            key={activeQuestionIndex}
                            onNext={handleNext}
                            question={currentQuestion.question}
                            topic={currentQuestion.topic}
                            answer={currentQuestion.answer}
                            image={currentQuestion.image}
                            activeQuestionIndex={activeQuestionIndex}
                            grade={currentQuestion.grade}
                            keypadMode={currentQuestion.keypadMode}
                            onAnswer={handleAnswer}
                            savedAnswer={userAnswers[activeQuestionIndex]}
                        />
                    )}

                    {(currentQuestion.type === "TABLE_INPUT" || currentQuestion.type === "table_input") && (
                        <SATTableInput
                            key={activeQuestionIndex}
                            onNext={handleNext}
                            question={currentQuestion.question}
                            topic={currentQuestion.topic}
                            rows={currentQuestion.rows}
                            variant={currentQuestion.variant}
                            answer={currentQuestion.answer}
                            activeQuestionIndex={activeQuestionIndex}
                            onAnswer={handleAnswer}
                            savedAnswer={userAnswers[activeQuestionIndex]}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SATSession;
