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
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen.component";
import motivationData from "./Assets/motivation.json";
import { Dialog, DialogTitle, DialogContent, TextField, Button } from "@mui/material";
import { ref, update } from "firebase/database";
import { firebaseDatabase, getUserDatabaseKey } from "@/backend/firebaseHandler";
import { useAuth } from "@/context/AuthContext";


const QuizClient = () => {
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [questionPaper, setQuestionPaper] = useState([])
    const [remainingTime, setRemainingTime] = useState(1800);
    const [hydrationDone, setHydrationDone] = useState(false);
    const [hasStoredSession, setHasStoredSession] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true); // Ensures loading screen shows on first load

    // Name prompt dialog state
    const [nameDialogOpen, setNameDialogOpen] = useState(false);
    const [childNameInput, setChildNameInput] = useState("");
    const [pendingSubmit, setPendingSubmit] = useState(null); // Stores { answer, time } for pending submit
    const [savingName, setSavingName] = useState(false);

    const timeTakeRef = useRef(1800);
    const lastTimeRef = useRef(1800); // Track when we started the current question
    const viewedQuestionsRef = useRef(new Set([0])); // Track which questions have been viewed (index 0 is viewed on initial load)
    const router = useRouter();
    const { user, userData, setUserData } = useAuth();

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
                timeTakeRef.current = parsed.remainingTime;
                lastTimeRef.current = parsed.remainingTime;
            }
        } catch (e) {
            // ignore malformed storage
        } finally {
            setHydrationDone(true);
        }
    }, [setQuizContext]);

    // Ensure loading screen shows for at least 1.5 seconds on first load
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitializing(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let gradeQuestionPaper = null;

        if (!quizContext.userDetails) {
            return
        }

        // If we already have a questionPaper in context (e.g. after refresh), reuse it
        if (quizContext.questionPaper && Array.isArray(quizContext.questionPaper) && quizContext.questionPaper.length > 0) {
            const clean = quizContext.questionPaper.filter(q => q);
            setQuestionPaper(clean);
            return;
        }

        const userGrade = quizContext.userDetails.activeChild?.grade || quizContext.userDetails.grade;

        switch (userGrade) {
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
        // Filter out any undefined questions to avoid crashes
        const cleanPaper = generatedPaper.filter(q => q);
        setQuestionPaper(cleanPaper);
        setQuizContext(state => ({ ...state, questionPaper: cleanPaper }));

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

    // Helper to calculate time spent and save progress
    const saveCurrentProgress = (answer) => {
        if (!questionPaper[activeQuestionIndex]) return;

        const currentTime = timeTakeRef.current ?? remainingTime;
        // Calculate duration spent on this question since last check
        const duration = Math.max(0, lastTimeRef.current - currentTime);

        // Update lastTimeRef for the next question/step
        lastTimeRef.current = currentTime;

        const currentQuestion = { ...questionPaper[activeQuestionIndex] };

        // Accumulate timeTaken (init to 0 if null/undefined)
        const prevTime = currentQuestion.timeTaken || 0;
        currentQuestion.timeTaken = prevTime + duration;

        if (answer !== undefined) {
            currentQuestion.userAnswer = answer;
        }

        const newQuestionPaper = [...questionPaper];
        newQuestionPaper[activeQuestionIndex] = currentQuestion;

        setQuestionPaper(newQuestionPaper);
        setQuizContext(state => ({ ...state, questionPaper: newQuestionPaper }));

        try {
            if (typeof window !== "undefined" && quizContext.userDetails && newQuestionPaper.length > 0) {
                window.localStorage.setItem("quizSession", JSON.stringify({
                    ...quizContext,
                    questionPaper: newQuestionPaper,
                    activeQuestionIndex,
                    remainingTime: currentTime
                }));
            }
        } catch (e) {
            // ignore
        }
        return newQuestionPaper;
    };

    // Helper function to get the current child's name
    const getChildName = () => {
        // 1. Strict check for active child in context
        if (quizContext?.userDetails?.activeChild) {
            // Return name (even if empty) to avoid falling back to parent/sibling
            return quizContext.userDetails.activeChild.name || "";
        }

        // 2. Legacy/Single user check
        if (quizContext?.userDetails?.name) {
            return quizContext.userDetails.name;
        }

        // 3. Fallback to AuthContext matching active child
        if (userData?.children) {
            const childId = quizContext?.userDetails?.childId || quizContext?.userDetails?.activeChildId;
            if (childId && userData.children[childId]) {
                return userData.children[childId].name || "";
            }
        }

        return "";
    };

    const handleTimerFinished = (time) => {
        // Auto-submit when timer finishes
        // Update time one last time
        timeTakeRef.current = 0;
        const newQuestionPaper = saveCurrentProgress();

        // Force save with 0 time
        try {
            if (typeof window !== "undefined" && quizContext.userDetails && newQuestionPaper && newQuestionPaper.length > 0) {
                window.localStorage.setItem("quizSession", JSON.stringify({
                    ...quizContext,
                    questionPaper: newQuestionPaper,
                    activeQuestionIndex,
                    remainingTime: 0
                }));
            }
        } catch (e) { }

        // Check if name exists before proceeding
        const childName = getChildName();
        if (!childName) {
            // No name set, show dialog to prompt for name
            setPendingSubmit({ answer: null, time: 0 });
            setNameDialogOpen(true);
            return;
        }

        router.replace("quiz/quiz-result");
    }

    // Function to proceed with quiz submission (after name is confirmed)
    const proceedToResults = () => {
        router.replace("quiz/quiz-result");
    };

    // Function to save child name and then proceed
    const handleSaveNameAndSubmit = async () => {
        if (!childNameInput.trim()) {
            toast.error("Please enter your name");
            return;
        }

        setSavingName(true);
        try {
            // Get user key
            let userKey = quizContext?.userDetails?.userKey || quizContext?.userDetails?.phoneNumber || quizContext?.userDetails?.parentPhone;
            if (!userKey && user) {
                userKey = getUserDatabaseKey(user);
            }

            const childId = quizContext?.userDetails?.childId || quizContext?.userDetails?.activeChildId || "default";
            const trimmedName = childNameInput.trim();

            if (userKey) {
                // Update name in Firebase
                const updatePath = `NMD_2025/Registrations/${userKey}/children/${childId}/name`;
                await update(ref(firebaseDatabase), {
                    [updatePath]: trimmedName
                });
            }

            // Update local state - quizContext
            setQuizContext(prev => ({
                ...prev,
                userDetails: {
                    ...prev.userDetails,
                    name: trimmedName,
                    activeChild: {
                        ...(prev.userDetails?.activeChild || {}),
                        name: trimmedName
                    }
                }
            }));

            // Update localStorage
            try {
                if (typeof window !== "undefined") {
                    const stored = window.localStorage.getItem("quizSession");
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (parsed.userDetails) {
                            parsed.userDetails.name = trimmedName;
                            if (parsed.userDetails.activeChild) {
                                parsed.userDetails.activeChild.name = trimmedName;
                            }
                        }
                        window.localStorage.setItem("quizSession", JSON.stringify(parsed));
                    }
                }
            } catch (e) { }

            // Update AuthContext userData if available
            if (setUserData && userData) {
                setUserData(prev => {
                    if (!prev?.children) return prev;
                    return {
                        ...prev,
                        children: {
                            ...prev.children,
                            [childId]: {
                                ...(prev.children[childId] || {}),
                                name: trimmedName
                            }
                        }
                    };
                });
            }

            setNameDialogOpen(false);
            toast.success(`Welcome, ${trimmedName}!`);

            // Now proceed to results
            proceedToResults();
        } catch (error) {
            console.error("Error saving name:", error);
            toast.error("Failed to save name. Please try again.");
        } finally {
            setSavingName(false);
        }
    };

    const handleNext = (answer, time) => {
        // time argument might be stale or redundant if we use refs, but let's trust refs
        saveCurrentProgress(answer);

        if ((activeQuestionIndex + 1) >= questionPaper.length) {
            // This is the submit action - check if name exists
            // This is the submit action - always confirm name
            const childName = getChildName();

            // Pre-fill the input with existing name
            setChildNameInput(childName || "");

            setPendingSubmit({ answer, time });
            setNameDialogOpen(true);
            return;
        }

        const nextIndex = activeQuestionIndex + 1;

        // Show motivation toast if this question is being viewed for the first time AND user has answered
        if (answer && !viewedQuestionsRef.current.has(nextIndex)) {
            viewedQuestionsRef.current.add(nextIndex);
            const phrases = motivationData.quiz;
            const randomPhrase = phrases[getRandomInt(0, phrases.length - 1)];
            toast.success(randomPhrase.motivation, {
                toastId: "motivation-toast",
                position: "bottom-left",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
        }


        setActiveQuestionIndex(nextIndex);

        // Update storage for index change
        try {
            if (typeof window !== "undefined") {
                // We need to fetch the LATEST paper state because saveCurrentProgress updated it in state/storage
                // But react state update might be async.
                // However, saveCurrentProgress wrote to localStorage.
                // We can just update the index in the stored object if we want, or rely on the effect.
                // Actually safer to re-read or just update index.
                const stored = window.localStorage.getItem("quizSession");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    parsed.activeQuestionIndex = nextIndex;
                    window.localStorage.setItem("quizSession", JSON.stringify(parsed));
                }
            }
        } catch (e) { }
    }

    const handlePrevious = () => {
        if (activeQuestionIndex > 0) {
            saveCurrentProgress(); // Save time for current Q before leaving

            const newIndex = activeQuestionIndex - 1;
            setActiveQuestionIndex(newIndex);
            try {
                if (typeof window !== "undefined") {
                    const stored = window.localStorage.getItem("quizSession");
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        parsed.activeQuestionIndex = newIndex;
                        window.localStorage.setItem("quizSession", JSON.stringify(parsed));
                    }
                }
            } catch (e) { }
        }
    }

    const handleJumpToQuestion = (index) => {
        if (index >= 0 && index < questionPaper.length) {
            saveCurrentProgress(); // Save time for current Q before leaving

            setActiveQuestionIndex(index);
            try {
                if (typeof window !== "undefined") {
                    const stored = window.localStorage.getItem("quizSession");
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        parsed.activeQuestionIndex = index;
                        window.localStorage.setItem("quizSession", JSON.stringify(parsed));
                    }
                }
            } catch (e) { }
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
    const isLastQuestion = questionPaper && activeQuestionIndex === questionPaper.length - 1;

    // Wrapper for handleNext that gets current answer from question paper
    const handlePaletteNext = () => {
        const currentAnswer = questionPaper[activeQuestionIndex]?.userAnswer;
        handleNext(currentAnswer, timeTakeRef.current);
    };

    const paletteComponent = useMemo(() => (
        <QuestionPalette
            questions={questionPaper}
            activeQuestionIndex={activeQuestionIndex}
            onSelect={handleJumpToQuestion}
            onPrevious={handlePrevious}
            onNext={handlePaletteNext}
            isLastQuestion={isLastQuestion}
        />
    ), [questionPaper, activeQuestionIndex, isLastQuestion]);

    // Show loading screen while quiz is being prepared or during initial load
    const isLoading = isInitializing || !hydrationDone || !questionPaper || questionPaper.length === 0 || !quizContext.userDetails;

    if (isLoading) {
        return (
            <LoadingScreen
                title="Loading Your Assessment"
                subtitle="Preparing your personalized math questions..."
            />
        );
    }

    return (
        <div className={Styles.quizPageWrapper}>
            {/* Main Question Section */}
            <div className={Styles.questionSection}>
                {
                    questionPaper && questionPaper[activeQuestionIndex] && questionPaper[activeQuestionIndex].type === "mcq" ?
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
                            grade={quizContext.userDetails.activeChild?.grade || quizContext.userDetails.grade}
                            timeTakeRef={timeTakeRef}
                            image={questionPaper[activeQuestionIndex].image}
                        /> : null
                }
                {
                    questionPaper && questionPaper[activeQuestionIndex] && questionPaper[activeQuestionIndex].type === "userInput" ?
                        <TypeUserInput
                            onClick={handleNext}
                            onPrevious={handlePrevious}
                            onMarkForReview={handleMarkForReview}
                            onAnswerChange={handleAnswerChange}
                            questionPaper={questionPaper}
                            activeQuestionIndex={activeQuestionIndex}
                            question={questionPaper[activeQuestionIndex].question}
                            topic={questionPaper[activeQuestionIndex].topic}
                            grade={quizContext.userDetails.activeChild?.grade || quizContext.userDetails.grade}
                            timeTakeRef={timeTakeRef}
                        /> : null
                }
                {
                    questionPaper && questionPaper[activeQuestionIndex] && questionPaper[activeQuestionIndex].type === "tableInput" ?
                        <TypeTableInput
                            onClick={handleNext}
                            onPrevious={handlePrevious}
                            onAnswerChange={handleAnswerChange}
                            questionPaper={questionPaper}
                            activeQuestionIndex={activeQuestionIndex}
                            topic={questionPaper[activeQuestionIndex].topic}
                            grade={quizContext.userDetails.activeChild?.grade || quizContext.userDetails.grade}
                            timeTakeRef={timeTakeRef}
                        /> : null
                }
                {
                    questionPaper && questionPaper[activeQuestionIndex] && questionPaper[activeQuestionIndex].type === "trueAndFalse" ?
                        <TypeTrueAndFalse
                            onClick={handleNext}
                            onPrevious={handlePrevious}
                            onMarkForReview={handleMarkForReview}
                            onAnswerChange={handleAnswerChange}
                            questionPaper={questionPaper}
                            activeQuestionIndex={activeQuestionIndex}
                            question={questionPaper[activeQuestionIndex].question}
                            topic={questionPaper[activeQuestionIndex].topic}
                            grade={quizContext.userDetails.activeChild?.grade || quizContext.userDetails.grade}
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

            {/* Name Prompt Dialog */}
            <Dialog
                open={nameDialogOpen}
                onClose={() => !savingName && setNameDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    style: {
                        borderRadius: '16px',
                        padding: '8px'
                    }
                }}
            >
                <DialogTitle style={{ textAlign: 'center', fontWeight: 600, fontSize: '1.25rem' }}>
                    What's your name?
                </DialogTitle>
                <DialogContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
                        <p style={{ textAlign: 'center', color: '#666', margin: 0 }}>
                            Please enter the name of the student taking this assessment
                        </p>
                        <TextField
                            autoFocus
                            fullWidth
                            label="Student's Name"
                            variant="outlined"
                            value={childNameInput}
                            onChange={(e) => setChildNameInput(e.target.value)}
                            disabled={savingName}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && childNameInput.trim()) {
                                    handleSaveNameAndSubmit();
                                }
                            }}
                            placeholder="Enter your full name"
                        />
                        <Button
                            variant="contained"
                            onClick={handleSaveNameAndSubmit}
                            disabled={savingName || !childNameInput.trim()}
                            style={{
                                backgroundColor: '#3c91f3',
                                textTransform: 'none',
                                fontSize: '1rem',
                                padding: '12px 24px',
                                borderRadius: '8px'
                            }}
                        >
                            {savingName ? 'Saving...' : 'Submit Quiz'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default QuizClient;
