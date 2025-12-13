"use client";
import React, { useEffect, useState } from "react";
import Styles from "./PracticeUserInput.module.css";
import { Button, Input } from "@mui/material";
import { ArrowRight, Check, RefreshCcw } from "lucide-react";
import MathRenderer from "@/components/MathRenderer/MathRenderer.component";
import { getHint } from "./hintHelper";

const PracticeUserInput = ({ onNext, question, topic, answer, activeQuestionIndex, grade, image, keypadMode, onCorrect, onRepeat, onWrong }) => {
    const [inputValue, setInputValue] = useState("");
    const [isCorrect, setIsCorrect] = useState(null); // true, false, or null
    const [showHint, setShowHint] = useState(false);
    const [hintText, setHintText] = useState("");
    const [waitingForHint, setWaitingForHint] = useState(false);
    const [attempts, setAttempts] = useState(0); // Track attempts: 0, 1, 2
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        setInputValue("");
        setIsCorrect(null);
        setShowHint(false);
        setWaitingForHint(false);
        setHintText("");
        setAttempts(0);
        setShowAnswer(false);
    }, [question, activeQuestionIndex]);

    const handleDialClick = (val) => {
        if (isCorrect === true || showAnswer) return; // Disable if correct or exhausted attempts

        const newValue = inputValue + val;
        validateInput(newValue);
    };

    const handleBackspace = () => {
        if (isCorrect === true || showAnswer) return;
        setInputValue(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        if (isCorrect === true || showAnswer) return;
        setInputValue("");
    };

    const validateInput = (val) => {
        if (!val) {
            setInputValue("");
            return;
        }

        const correctValue = String(answer).trim();
        const checkValue = String(val).trim();

        // 1. Exact Match -> Correct
        if (checkValue === correctValue) {
            setInputValue(val);
            setIsCorrect(true);
            setShowHint(false);
            if (onCorrect) onCorrect();
            return;
        }

        // 2. Partial Match (Prefix) -> Allow typing
        if (correctValue.startsWith(checkValue)) {
            setInputValue(val);
            return;
        }

        // 3. Incorrect (Not a prefix) -> Error Flow
        setInputValue(val);
        setIsCorrect(false);

        // New Logic: Attempts
        // If this is the FIRST incorrect char typed? 
        // Or do we count "Incorrect attempts" as pressing enter? 
        // But we have auto-validation. Every wrong keystroke is an attempt?
        // That seems harsh. "2nd attempt" usually implies "Try again".
        // With auto-validation: 
        // User types '4'. '4' is not start of '5'. So error.
        // Is this Attempt 1? Yes.
        // User clears (auto) and types '3'. Error. Attempt 2.
        // Logic seems sound.

        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts); // 1 or 2

        if (onWrong) onWrong();

        setWaitingForHint(true);
        setTimeout(() => {
            // After 1.5s
            if (nextAttempts === 1) {
                // Attempt 1 Failure
                setHintText(getHint(topic, question));
                setShowHint(true);
                setInputValue(""); // Clear answer for retry
                setWaitingForHint(false);
                setIsCorrect(null); // Reset red state
            } else if (nextAttempts >= 2) {
                // Attempt 2 Failure
                // Show Answer
                setShowAnswer(true);
                setInputValue(val); // Keep wrong value? Or clear? User said "Clear the answer" previously, but now "If 2nd attempt entered incorrectly, answer pops up... disable option to key in".
                // Might look better to show the wrong val in red, then reveal answer below.
                setWaitingForHint(false);
                // Input remains disabled via `showAnswer` check in handlers
            }
        }, 1500);
    };

    return (
        <div className={Styles.quizContainer}>
            <div className={Styles.questionColumn}>
                <div className={Styles.questionHeader}>
                    <div className={Styles.questionNumber}>Question {activeQuestionIndex + 1}</div>
                    <div className={Styles.questionMeta}>
                        <span>Practice Mode</span>
                        <span className={Styles.separator}>•</span>
                        <span>{topic || "General"}</span>
                    </div>
                </div>

                <h3 className={Styles.question}>
                    <MathRenderer content={question} />
                </h3>

                {image && (
                    <img src={image} alt="Question" className={Styles.questionImage} />
                )}

                {showHint && (
                    <div className={Styles.hintBox}>
                        <strong>Hint:</strong> {hintText}
                    </div>
                )}

                {showAnswer && (
                    <div className={Styles.hintBox} style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.5)' }}>
                        <div className={Styles.answerReveal}>
                            <strong>Correct Answer:</strong> <MathRenderer content={String(answer)} />
                        </div>

                        <Button
                            onClick={onRepeat}
                            size="large"
                            startIcon={<RefreshCcw size={20} />}
                            sx={{
                                marginTop: '1rem',
                                backgroundColor: '#f97316',
                                color: 'white',
                                '&:hover': { backgroundColor: '#ea580c' },
                                textTransform: 'none',
                                fontWeight: 700,
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)',
                                fontSize: '1.1rem'
                            }}
                        >
                            Repeat Question
                        </Button>
                    </div>
                )}
            </div>

            <div className={Styles.optionsColumn}>
                <div className={Styles.optionContainer}>
                    <Input
                        disableUnderline
                        value={inputValue}
                        onChange={(e) => {
                            if (!showAnswer && !waitingForHint) validateInput(e.target.value);
                        }}
                        placeholder="Enter answer"
                        className={`${Styles.answerInput} ${isCorrect === true ? Styles.correctInput : ''} ${isCorrect === false ? Styles.incorrectInput : ''}`}
                        autoFocus
                        readOnly={isCorrect === true || waitingForHint || showAnswer}
                    />

                    {/* Compact Dial Pad */}
                    <div className={Styles.dialPadThreeCol}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <Button
                                key={num}
                                onClick={() => handleDialClick(String(num))}
                                className={Styles.dialButton}
                                disabled={showAnswer || isCorrect === true}
                            >
                                {num}
                            </Button>
                        ))}
                        <Button onClick={() => handleDialClick('.')} className={Styles.dialButton} disabled={showAnswer || isCorrect === true}>.</Button>
                        <Button onClick={() => handleDialClick('0')} className={Styles.dialButton} disabled={showAnswer || isCorrect === true}>0</Button>

                        {(keypadMode === 'multiplication') ? (
                            <Button onClick={() => handleDialClick('x')} className={Styles.operatorButton} disabled={showAnswer || isCorrect === true}>×</Button>
                        ) : (
                            <Button onClick={() => handleDialClick('-')} className={Styles.operatorButton} disabled={showAnswer || isCorrect === true}>−</Button>
                        )}

                        <Button onClick={handleBackspace} className={Styles.backspaceButton} disabled={showAnswer || isCorrect === true}>⌫</Button>
                        <Button onClick={handleClear} className={Styles.resetButtonThreeCol} disabled={showAnswer || isCorrect === true}>Clear</Button>
                    </div>
                </div>

                <div className={Styles.navigationContainer}>
                    {isCorrect === true && (
                        <Button
                            onClick={onNext}
                            size="large"
                            endIcon={<ArrowRight />}
                            className={Styles.nextButton}
                        >
                            Next Question
                        </Button>
                    )}

                    {/* Hide Repeat button here if we moved it to the hint box area. 
                        User said: "Underneath the place where you display the answer, i want the reapeat button to show up prominently"
                        So I moved it inside {showAnswer && ...}.
                        Do we still show it here? Probably not needed if shown prominently there.
                        Or maybe keep it for consistency?
                        Let's hide it from here if showAnswer is true, to avoid duplication.
                    */}
                </div>
            </div>
        </div>
    );
};

export default PracticeUserInput;
