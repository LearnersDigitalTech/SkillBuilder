"use client";
import React, { useEffect, useState } from "react";
import Styles from "./PracticeMCQ.module.css";
import { Button, FormControlLabel, Radio, RadioGroup, Checkbox, FormGroup } from "@mui/material";
import { ArrowRight, Check, RefreshCcw } from "lucide-react";
import MathRenderer from "@/components/MathRenderer/MathRenderer.component";
import { getHint } from "./hintHelper";

const PracticeMCQ = ({ onNext, question, topic, options, answer, image, activeQuestionIndex, onCorrect, onRepeat, onWrong, isLastQuestion }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null); // true, false, or null
    const [showHint, setShowHint] = useState(false);
    const [hintText, setHintText] = useState("");
    const [waitingForHint, setWaitingForHint] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        // Reset state on new question
        setSelectedOption(null);
        setIsCorrect(null);
        setShowHint(false);
        setWaitingForHint(false);
        setHintText("");
        setAttempts(0);
        setShowAnswer(false);
    }, [question, activeQuestionIndex]);

    const handleOptionSelect = (value) => {
        if (isCorrect === true) return;
        if (waitingForHint || showAnswer) return;

        setSelectedOption(value);

        const checkValue = String(value).trim();
        const correctValue = String(answer).trim();

        if (checkValue === correctValue) {
            setIsCorrect(true);
            setShowHint(false);
            if (onCorrect) onCorrect();
        } else {
            setIsCorrect(false);
            const nextAttempts = attempts + 1;
            setAttempts(nextAttempts);

            if (onWrong) onWrong();

            setWaitingForHint(true);
            setTimeout(() => {
                if (nextAttempts === 1) {
                    setHintText(getHint(topic, question));
                    setShowHint(true);
                    setWaitingForHint(false);
                } else if (nextAttempts >= 2) {
                    setShowAnswer(true);
                    setWaitingForHint(false);
                    // Options disabled via showAnswer check
                }
            }, 1500);
        }
    };

    const getOptionStyle = (value) => {
        if (selectedOption !== value) return {};

        if (selectedOption === value) {
            if (isCorrect === true) {
                return { backgroundColor: "#dcfce7", borderColor: "#22c55e" }; // Green
            }
            if (isCorrect === false) {
                return { backgroundColor: "#fee2e2", borderColor: "#ef4444" }; // Red
            }
        }
        return {};
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
                <div className={Styles.optionList}>
                    {options.map((option, index) => (
                        <div
                            key={`${option.value}-${index}`}
                            className={Styles.optionCard}
                            style={getOptionStyle(option.value)}
                            onClick={() => handleOptionSelect(option.value)}
                        >
                            <div className={Styles.radioCircle}>
                                <div className={selectedOption === option.value ? Styles.radioInner : ""} />
                            </div>
                            <div className={Styles.optionContent}>
                                {option.image ? (
                                    <div className={Styles.optionWithImage}>
                                        <img src={option.image} alt={option.label} className={Styles.optionImage} />
                                        <span><MathRenderer content={option.label} /></span>
                                    </div>
                                ) : (
                                    <MathRenderer content={option.label} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                <div className={Styles.navigationContainer}>
                    {isCorrect === true && (
                        <Button
                            onClick={onNext}
                            size="large"
                            endIcon={<ArrowRight />}
                            className={Styles.nextButton}
                        >
                            {isLastQuestion ? "Finish" : "Next Question"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PracticeMCQ;
