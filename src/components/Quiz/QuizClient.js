"use client";
import TypeMCQ from "@/components/QuestionTypes/TypeMCQ/TypeMCQ.component";
import Styles from "../../app/quiz/Quiz.module.css";
import TypeUserInput from "@/components/QuestionTypes/TypeUserInput/TypeUserInput.component";
import TypeTableInput from "@/components/QuestionTypes/TypeTableInput/TypeTableInput.component";
import TypeTrueAndFalse from "@/components/QuestionTypes/TypeTrueAndFalse/TypeTrueAndFalse.component";
import { useContext, useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { QuizSessionContext } from "../../app/context/QuizSessionContext";
import { toast } from "react-toastify";
import getRandomInt from "../../app/workload/GetRandomInt";
import GetGrade1Question from "@/questionBook/Grade1/GetGrade1Question";
import GetGrade2Question from "@/questionBook/Grade2/GetGrade2Question";
import GetGrade3Question from "@/questionBook/Grade3/GetGrade3Question";
import GetGrade4Question from "@/questionBook/Grade4/GetGrade4Question";
import GetGrade5Question from "@/questionBook/Grade5/GetGrade5Question";
import GetGrade6Question from "@/questionBook/Grade6/GetGrade6Question";
import GetGrade10Question from "@/questionBook/Grade10/GetGrade10Question";
import GetGrade7Question from "@/questionBook/Grade7/GetGrade7Question";
import GetGrade8Question from "@/questionBook/Grade8/GetGrade8Question";
import GetGrade9Question from "@/questionBook/Grade9/GetGrade9Question";
import Timer from "@/components/Timer/Timer.component";
import QuestionPalette from "@/components/QuestionPalette/QuestionPalette.component";

const QuizClient = () => {
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [questionPaper, setQuestionPaper] = useState([])
    const [remainingTime, setRemainingTime] = useState(1800);
    const [hydrationDone, setHydrationDone] = useState(false);
    const [hasStoredSession, setHasStoredSession] = useState(false);

    const timeTakeRef = useRef(null);
    const router = useRouter();

    if (!QuizSessionContext) {
        router.replace("/");
        return
    }

    const [quizContext, setQuizContext] = useContext(QuizSessionContext);

    // Hydrate quiz state from localStorage on first mount (if available)
    useEffect(() => {
        try {
            const stored = typeof window !== "undefined" ? window.localStorage.getItem("quizSession") : null;
            if (!stored) return;
            const parsed = JSON.parse(stored);
            // Require at least userDetails; questionPaper may be empty and will
            // be handled by the safety-net effect below.
            if (!parsed || !parsed.userDetails) return;

            setHasStoredSession(true);
            setQuizContext(parsed);
            if (Array.isArray(parsed.questionPaper)) {
                setQuestionPaper(parsed.questionPaper);
            }
            if (typeof parsed.activeQuestionIndex === "number") {
                setActiveQuestionIndex(parsed.activeQuestionIndex);
            }
            if (typeof parsed.remainingTime === "number") {
                setRemainingTime(parsed.remainingTime);
            }
        } catch (e) {
            // ignore malformed storage
        } finally {
            setHydrationDone(true);
        }
    }, [setQuizContext]);

    useEffect(() => {
        let gradeQuestionPaper = null;

        if (!quizContext.userDetails) {
            return
        }

        // If we already have a questionPaper in context (e.g. after refresh), reuse it
        if (quizContext.questionPaper && Array.isArray(quizContext.questionPaper) && quizContext.questionPaper.length > 0) {
            setQuestionPaper(quizContext.questionPaper);
            return;
        }

        switch (quizContext.userDetails.grade) {
            case "Grade 1": {
                gradeQuestionPaper = { ...GetGrade1Question };
                break;
            }
            case "Grade 2": {
                gradeQuestionPaper = { ...GetGrade2Question };
                break;
            }
            case "Grade 3": {
                gradeQuestionPaper = { ...GetGrade3Question };
                break;
            }
            case "Grade 4": {
                gradeQuestionPaper = { ...GetGrade4Question };
                break;
            }
            case "Grade 5": {
                gradeQuestionPaper = { ...GetGrade5Question };
                break;
            }
            case "Grade 6": {
                gradeQuestionPaper = { ...GetGrade6Question };
                break;
            }
            case "Grade 7": {
                gradeQuestionPaper = { ...GetGrade7Question };
                break;
            }
            case "Grade 8": {
                gradeQuestionPaper = { ...GetGrade8Question };
                break;
            }
            case "Grade 9": {
                gradeQuestionPaper = { ...GetGrade9Question };
                break;
            }
            case "Grade 10": {
                gradeQuestionPaper = { ...GetGrade10Question };
                break;
            }
            default: {
                gradeQuestionPaper = { ...GetGrade1Question };
                break;
            }
        }

        const generatedPaper = [];
        // Dynamically generate questions based on available keys in gradeQuestionPaper
        // We assume keys are q1, q2, q3, etc.
        let qIndex = 1;
        while (gradeQuestionPaper[`q${qIndex}`]) {
            const questions = gradeQuestionPaper[`q${qIndex}`];
            if (questions && questions.length > 0) {
                const randomInt = getRandomInt(0, questions.length - 1);
                generatedPaper.push(questions[randomInt]);
            }
            qIndex++;
        }
        setQuestionPaper(generatedPaper);
        setQuizContext(state => ({ ...state, questionPaper: generatedPaper }));

        try {
            if (typeof window !== "undefined" && quizContext.userDetails && questionPaper && questionPaper.length > 0) {
                window.localStorage.setItem("quizSession", JSON.stringify({
                    userDetails: quizContext.userDetails,
                    questionPaper: generatedPaper,
                    activeQuestionIndex: 0,
                    remainingTime: 1800
                }));
            }
        } catch (e) {
            // ignore
        }
    }, [quizContext, setQuizContext])

    useEffect(() => {
        if (!hydrationDone) return;
        // If we already found a stored session, do not redirect.
        if (hasStoredSession) return;

        // Simple guard: if ANY quizSession exists in localStorage,
        // treat it as an in-progress quiz and do not redirect.
        try {
            if (typeof window !== "undefined") {
                const stored = window.localStorage.getItem("quizSession");
                if (stored) return;
            }
        } catch (e) {
            // ignore storage errors and fall back to context check
        }

        if (!quizContext.userDetails) {
            router.replace("/");
            toast.warning("Please start the assessment from home page");
        }
    }, [hydrationDone, hasStoredSession, quizContext.userDetails])

    // Safety net: if hydration finished but questionPaper is still empty,
    // try once more to restore it from localStorage. This covers any case
    // where the first hydration effect did not run as expected.
    useEffect(() => {
        if (!hydrationDone) return;
        if (questionPaper && questionPaper.length > 0) return;

        try {
            if (typeof window === "undefined") return;
            const stored = window.localStorage.getItem("quizSession");
            if (!stored) return;
            const parsed = JSON.parse(stored);
            if (!parsed || !Array.isArray(parsed.questionPaper) || parsed.questionPaper.length === 0) return;

            setQuestionPaper(parsed.questionPaper);
            if (typeof parsed.activeQuestionIndex === "number") {
                setActiveQuestionIndex(parsed.activeQuestionIndex);
            }
            if (typeof parsed.remainingTime === "number") {
                setRemainingTime(parsed.remainingTime);
            }
        } catch (e) {
            // ignore
        }
    }, [hydrationDone, questionPaper])

    const getTimeTaken = (time) => {
        timeTakeRef.current = time;
        setRemainingTime(time);

        try {
            if (typeof window !== "undefined" && quizContext.userDetails && questionPaper && questionPaper.length > 0) {
                window.localStorage.setItem("quizSession", JSON.stringify({
                    ...quizContext,
                    questionPaper,
                    activeQuestionIndex,
                    remainingTime: time
                }));
            }
        } catch (e) {
            // ignore storage errors
        }
    }

    const handleTimerFinished = (time) => {
        // Auto-submit when timer finishes
        const currentQuestion = { ...questionPaper[activeQuestionIndex] }
        currentQuestion.timeTaken = time;

        const newQuestionPaper = [...questionPaper];
        newQuestionPaper[activeQuestionIndex] = currentQuestion;

        setQuizContext(state => ({ ...state, questionPaper: newQuestionPaper }));

        try {
            if (typeof window !== "undefined" && quizContext.userDetails && questionPaper && questionPaper.length > 0) {
                window.localStorage.setItem("quizSession", JSON.stringify({
                    ...quizContext,
                    questionPaper: newQuestionPaper,
                    activeQuestionIndex,
                    remainingTime: 0
                }));
            }
        } catch (e) {
            // ignore storage errors
        }
        router.replace("quiz/quiz-result");
    }

    const handleNext = (answer, time) => {
        const currentQuestion = { ...questionPaper[activeQuestionIndex] }
        currentQuestion.userAnswer = answer;
        currentQuestion.timeTaken = time;

        const newQuestionPaper = [...questionPaper];
        newQuestionPaper[activeQuestionIndex] = currentQuestion;

        setQuestionPaper(newQuestionPaper);
        setQuizContext(state => ({ ...state, questionPaper: newQuestionPaper }));

        try {
            if (typeof window !== "undefined" && quizContext.userDetails && questionPaper && questionPaper.length > 0) {
                window.localStorage.setItem("quizSession", JSON.stringify({
                    ...quizContext,
                    questionPaper: newQuestionPaper,
                    activeQuestionIndex: (activeQuestionIndex + 1) >= questionPaper.length ? activeQuestionIndex : activeQuestionIndex + 1,
                    remainingTime
                }));
            }
        } catch (e) {
            // ignore storage errors
        }

        if ((activeQuestionIndex + 1) >= questionPaper.length) {
            router.replace("quiz/quiz-result");
            return;
        }
        setActiveQuestionIndex(activeQuestionIndex + 1)
    }

    const handlePrevious = () => {
        if (activeQuestionIndex > 0) {
            const newIndex = activeQuestionIndex - 1;
            setActiveQuestionIndex(newIndex);

            try {
                if (typeof window !== "undefined" && quizContext.userDetails && questionPaper && questionPaper.length > 0) {
                    window.localStorage.setItem("quizSession", JSON.stringify({
                        ...quizContext,
                        questionPaper,
                        activeQuestionIndex: newIndex,
                        remainingTime
                    }));
                }
            } catch (e) {
                // ignore storage errors
            }
        }
    }

    const handleJumpToQuestion = (index) => {
        if (index >= 0 && index < questionPaper.length) {
            setActiveQuestionIndex(index);

            try {
                if (typeof window !== "undefined" && quizContext.userDetails && questionPaper && questionPaper.length > 0) {
                    window.localStorage.setItem("quizSession", JSON.stringify({
                        ...quizContext,
                        questionPaper,
                        activeQuestionIndex: index,
                        remainingTime
                    }));
                }
            } catch (e) {
                // ignore storage errors
            }
        }
    }

    const handleAnswerChange = (answer) => {
        if (!questionPaper[activeQuestionIndex]) return;
        const currentQuestion = { ...questionPaper[activeQuestionIndex] };
        currentQuestion.userAnswer = answer;

        const newQuestionPaper = [...questionPaper];
        newQuestionPaper[activeQuestionIndex] = currentQuestion;

        setQuestionPaper(newQuestionPaper);
        setQuizContext(state => ({ ...state, questionPaper: newQuestionPaper }));

        try {
            if (typeof window !== "undefined") {
                window.localStorage.setItem("quizSession", JSON.stringify({
                    ...quizContext,
                    questionPaper: newQuestionPaper,
                    activeQuestionIndex,
                    remainingTime
                }));
            }
        } catch (e) {
            // ignore storage errors
        }
    }

    const handleMarkForReview = (answer) => {
        const currentQuestion = { ...questionPaper[activeQuestionIndex] }

        // Save the answer if provided
        if (answer !== undefined && answer !== null && answer !== "") {
            currentQuestion.userAnswer = answer;
        }

        // Toggle mark for review
        // currentQuestion.markedForReview = !currentQuestion.markedForReview;

        const newQuestionPaper = [...questionPaper];
        newQuestionPaper[activeQuestionIndex] = currentQuestion;

        setQuestionPaper(newQuestionPaper);
    }

    // Create QuestionPalette using useMemo
    const paletteComponent = useMemo(() => (
        <QuestionPalette
            questions={questionPaper}
            activeQuestionIndex={activeQuestionIndex}
            onSelect={handleJumpToQuestion}
        />
    ), [questionPaper, activeQuestionIndex]);

    return (
        <div className={Styles.quizPageWrapper}>
            {/* Main Question Section */}
            <div className={Styles.questionSection}>
                {
                    questionPaper[activeQuestionIndex]?.type === "mcq" ?
                        <TypeMCQ
                            onClick={handleNext}
                            onPrevious={handlePrevious}
                            onMarkForReview={handleMarkForReview}
                            onAnswerChange={handleAnswerChange}
                            questionPaper={questionPaper}
                            activeQuestionIndex={activeQuestionIndex}
                            question={questionPaper[activeQuestionIndex].question}
                            topic={questionPaper[activeQuestionIndex].topic}
                            options={questionPaper[activeQuestionIndex].options}
                            grade={quizContext.userDetails?.grade}
                            timeTakeRef={timeTakeRef}
                            image={questionPaper[activeQuestionIndex].image}
                        /> : null
                }
                {
                    questionPaper[activeQuestionIndex]?.type === "userInput" ?
                        <TypeUserInput
                            onClick={handleNext}
                            onPrevious={handlePrevious}
                            onMarkForReview={handleMarkForReview}
                            onAnswerChange={handleAnswerChange}
                            questionPaper={questionPaper}
                            activeQuestionIndex={activeQuestionIndex}
                            question={questionPaper[activeQuestionIndex].question}
                            topic={questionPaper[activeQuestionIndex].topic}
                            grade={quizContext.userDetails?.grade}
                            timeTakeRef={timeTakeRef}
                        /> : null
                }
                {
                    questionPaper[activeQuestionIndex]?.type === "tableInput" ?
                        <TypeTableInput
                            onClick={handleNext}
                            onPrevious={handlePrevious}
                            onAnswerChange={handleAnswerChange}
                            questionPaper={questionPaper}
                            activeQuestionIndex={activeQuestionIndex}
                            topic={questionPaper[activeQuestionIndex].topic}
                            grade={quizContext.userDetails?.grade}
                            timeTakeRef={timeTakeRef}
                        /> : null
                }
                {
                    questionPaper[activeQuestionIndex]?.type === "trueAndFalse" ?
                        <TypeTrueAndFalse
                            onClick={handleNext}
                            onPrevious={handlePrevious}
                            onMarkForReview={handleMarkForReview}
                            onAnswerChange={handleAnswerChange}
                            questionPaper={questionPaper}
                            activeQuestionIndex={activeQuestionIndex}
                            question={questionPaper[activeQuestionIndex].question}
                            topic={questionPaper[activeQuestionIndex].topic}
                            grade={quizContext.userDetails?.grade}
                            timeTakeRef={timeTakeRef}
                        /> : null
                }
            </div>

            {/* Sidebar with Timer and Palette */}
            <div className={Styles.sidebarSection}>
                <div className={Styles.timerSection}>
                    <Timer timerFinished={handleTimerFinished} getTimeTaken={getTimeTaken} initialTime={remainingTime} />
                </div>
                <div className={Styles.paletteSection}>
                    {paletteComponent}
                </div>
            </div>
        </div>
    )
}

export default QuizClient;
