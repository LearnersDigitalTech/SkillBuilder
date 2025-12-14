"use client";
import React, { useState, useEffect } from "react";
import Styles from "./PracticeTableInput.module.css";
import { Button } from "@mui/material";
import { ArrowRight, RefreshCcw, Check } from "lucide-react";
import MathRenderer from "@/components/MathRenderer/MathRenderer.component";
import { getHint } from "./hintHelper";
import { validateFractionValue } from "./fractionValidator";

const PracticeTableInput = ({
    question,
    topic,
    rows,
    variant, // 'default', 'fraction'
    answer, // JSON string of { rowIndex: cleanAnswer }
    activeQuestionIndex,
    onNext,
    onCorrect,
    onWrong,
    onRepeat
}) => {
    const [userAnswers, setUserAnswers] = useState({}); // { rowIndex: val }
    const [rowStatus, setRowStatus] = useState({}); // { rowIndex: 'correct' | 'wrong' | null }
    const [isComplete, setIsComplete] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [attempts, setAttempts] = useState(0);

    const parsedAnswer = typeof answer === 'string' ? JSON.parse(answer) : answer;

    useEffect(() => {
        // Reset state on new question or retry (question/answer content change)
        setUserAnswers({});
        setRowStatus({});
        setIsComplete(false);
        setShowAnswer(false);
        setAttempts(0);
    }, [activeQuestionIndex, question, answer]);

    const handleInputChange = (rowIndex, val, field = null) => {
        if (showAnswer || rowStatus[rowIndex] === 'correct') return;

        setUserAnswers(prev => {
            if (field) {
                // For combined fields like fractions { num, den }
                const current = prev[rowIndex] || {};
                return { ...prev, [rowIndex]: { ...current, [field]: val } };
            }
            return { ...prev, [rowIndex]: val };
        });

        // Reset status on edit
        setRowStatus(prev => ({ ...prev, [rowIndex]: null }));
    };

    const checkRow = (rowIndex) => {
        const userVal = userAnswers[rowIndex];
        const correctVal = parsedAnswer[rowIndex];

        let isRowCorrect = false;

        if (variant === 'fraction') {
            isRowCorrect = validateFractionValue(userVal, correctVal);
        } else {
            // Standard validation (also try numeric validation if possible?)
            // User said "all fractions in practice section".
            // In 'default' table usage, it might be integers.
            // But if the answer is "1/2" as text?
            // Let's stick to using it for explicit fraction variant first.
            // But also, if the answer looks like a number, maybe use it?
            // "Round both... to 2 decimal points". This implies numeric.
            // Let's safe check: if it validates numerically, good. If not, check string.

            if (validateFractionValue(userVal, correctVal)) {
                isRowCorrect = true;
            } else {
                // Fallback to strict string match (for non-numeric answers like "Yes", "Triangle")
                const uVal = String(userVal || "").trim();
                const cVal = String(correctVal || "").trim();
                isRowCorrect = (uVal.toLowerCase() === cVal.toLowerCase());
            }
        }

        if (isRowCorrect) {
            setRowStatus(prev => ({ ...prev, [rowIndex]: 'correct' }));

            // Check if all correct
            const allCorrect = rows.every((_, idx) => {
                if (idx === rowIndex) return true;
                return rowStatus[idx] === 'correct';
            });

            if (allCorrect) {
                setIsComplete(true);
                if (onCorrect) onCorrect();
            }
        } else {
            setRowStatus(prev => ({ ...prev, [rowIndex]: 'wrong' }));
            // Increment attempts? Global or per row? 
            // Global failure callback
            if (onWrong) onWrong();
        }
    };

    const revealAnswers = () => {
        setShowAnswer(true);
    };

    // Helper to render input based on variant
    const renderInput = (rowIndex) => {
        const status = rowStatus[rowIndex];
        const isCorrect = status === 'correct';
        const isWrong = status === 'wrong';

        if (variant === 'fraction') {
            return (
                <div className={Styles.fractionInputWrapper}>
                    <div className={Styles.fractionInputContainer}>
                        <input
                            className={`${Styles.inputNum} ${isCorrect ? Styles.correct : ''} ${isWrong ? Styles.wrong : ''}`}
                            placeholder="Num"
                            value={userAnswers[rowIndex]?.num || ""}
                            onChange={(e) => handleInputChange(rowIndex, e.target.value, 'num')}
                            disabled={isCorrect || showAnswer}
                        />
                        <div className={Styles.fractionBar}></div>
                        <input
                            className={`${Styles.inputDen} ${isCorrect ? Styles.correct : ''} ${isWrong ? Styles.wrong : ''}`}
                            placeholder="Den"
                            value={userAnswers[rowIndex]?.den || ""}
                            onChange={(e) => handleInputChange(rowIndex, e.target.value, 'den')}
                            disabled={isCorrect || showAnswer}
                        />
                    </div>
                    <Button
                        onClick={() => checkRow(rowIndex)}
                        disabled={isCorrect || showAnswer}
                        variant="contained"
                        size="small"
                        className={Styles.checkBtn}
                    >
                        Check
                    </Button>
                </div>
            );
        }

        // Default input
        return (
            <div className={Styles.inputWrapper}>
                <input
                    className={`${Styles.inputDefault} ${isCorrect ? Styles.correct : ''} ${isWrong ? Styles.wrong : ''}`}
                    placeholder=""
                    value={userAnswers[rowIndex] || ""}
                    onChange={(e) => handleInputChange(rowIndex, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') checkRow(rowIndex); }}
                    disabled={isCorrect || showAnswer}
                />
                <Button
                    onClick={() => checkRow(rowIndex)}
                    disabled={isCorrect || showAnswer}
                    variant="contained"
                    size="small"
                    className={Styles.checkBtn}
                >
                    Check
                </Button>
            </div>
        );
    };

    return (
        <div className={Styles.container}>
            <div className={Styles.header}>
                <span>Topic: {topic}</span>
            </div>

            <div className={Styles.tableContainer}>
                {rows.map((row, idx) => (
                    <div key={idx} className={Styles.row}>
                        <div className={Styles.problemCol}>
                            {/* Render Left Op Right nicely */}
                            {variant === 'fraction' ? (
                                <div className={Styles.fractionProblem}>
                                    <div className={Styles.fractionStacked}>
                                        <span>{row.left.n}</span>
                                        <span className={Styles.bar}></span>
                                        <span>{row.left.d}</span>
                                    </div>
                                    <span className={Styles.op}>{row.op}</span>
                                    <div className={Styles.fractionStacked}>
                                        <span>{row.right.n}</span>
                                        <span className={Styles.bar}></span>
                                        <span>{row.right.d}</span>
                                    </div>
                                    <span className={Styles.eq}>=</span>
                                </div>
                            ) : (
                                <div className={Styles.problemText}>
                                    <MathRenderer content={String(row.left)} inline />
                                    <span className={Styles.opMath}>{row.op}</span>
                                    <MathRenderer content={String(row.right)} inline />
                                    <span className={Styles.eq}>=</span>
                                </div>
                            )}
                        </div>
                        <div className={Styles.inputCol}>
                            {renderInput(idx)}
                        </div>
                        {showAnswer && (
                            <div className={Styles.answerReveal}>
                                Ans: {variant === 'fraction'
                                    ? `${parsedAnswer[idx].num}/${parsedAnswer[idx].den}`
                                    : parsedAnswer[idx]}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className={Styles.actions}>
                {isComplete && (
                    <Button
                        onClick={onNext}
                        variant="contained"
                        color="success"
                        endIcon={<ArrowRight />}
                    >
                        Next Question
                    </Button>
                )}
                {!isComplete && !showAnswer && (
                    <Button onClick={revealAnswers} color="warning">
                        Show All Answers
                    </Button>
                )}
                {showAnswer && (
                    <Button onClick={onRepeat} startIcon={<RefreshCcw />}>
                        Retry Question
                    </Button>
                )}
            </div>
        </div>
    );
};

export default PracticeTableInput;
