"use client";
import React, { useEffect, useState } from "react";
import Styles from "./TypeUserInput.module.css";
import { Button, Input } from "@mui/material";
import { ArrowLeft, ArrowRight, Check, Flag } from "lucide-react";
import MathRenderer from "@/components/MathRenderer/MathRenderer.component";

const TypeUserInput = ({ onClick, onPrevious, onMarkForReview, onAnswerChange, questionPaper, activeQuestionIndex, topic, question, grade, timeTakeRef }) => {

    const [inputValue, setInputValue] = useState("");
    const isLastQuestion = questionPaper && activeQuestionIndex === questionPaper.length - 1;
    const isMarkedForReview = questionPaper && questionPaper[activeQuestionIndex]?.markedForReview || false;

    // Logic to hide operators for Grades 1-6
    const gradesWithoutOperators = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 9"];
    const showOperators = !(grade && gradesWithoutOperators.includes(grade.toString()));

    const handleChange = (character) => {
        const next = `${inputValue}${character}`;
        setInputValue(next);
        if (onAnswerChange) {
            onAnswerChange(next);
        }
    }

    const handleReset = () => {
        setInputValue("");
        if (onAnswerChange) {
            onAnswerChange("");
        }
    }

    const handleBackspace = () => {
        const next = inputValue.slice(0, -1);
        setInputValue(next);
        if (onAnswerChange) {
            onAnswerChange(next);
        }
    }

    useEffect(() => {
        if (questionPaper && questionPaper[activeQuestionIndex]) {
            setInputValue(questionPaper[activeQuestionIndex]?.userAnswer || "")
        }
    }, [question, activeQuestionIndex, questionPaper])

    const handleMarkForReview = () => {
        if (onMarkForReview) {
            onMarkForReview(inputValue);
        }
    }


    const handleInputChange = (e) => {
        const val = e.target.value;
        // Validation logic
        // Always allow empty, numbers, decimal, and minus (for negative numbers or subtraction)
        // Only allow +, *, / if showOperators is true

        let allowedPattern;
        if (showOperators) {
            // Allow digits, dot, and all four operators
            allowedPattern = /^[0-9+\-*/.]*$/;
        } else {
            // Allow digits, dot, and minus only
            // If keypadMode is multiplication, allow 'x' or '*'
            if (questionPaper && questionPaper[activeQuestionIndex]?.keypadMode === 'multiplication') {
                allowedPattern = /^[0-9xX*.]*$/;
            } else {
                allowedPattern = /^[0-9\-.]*$/;
            }
        }

        if (allowedPattern.test(val)) {
            setInputValue(val);
            if (onAnswerChange) {
                onAnswerChange(val);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onClick(inputValue, timeTakeRef.current);
        }
    };

    return (
        <div className={Styles.quizContainer}>
            {/* Column 1: Question */}
            <div className={Styles.questionColumn}>
                <div className={Styles.questionHeader}>
                    <div className={Styles.questionNumber}>Question {activeQuestionIndex + 1}</div>
                    <div className={Styles.questionMeta}>
                        <span>{grade}</span>
                        {grade && topic && <span className={Styles.separator}>•</span>}
                        <span>{topic}</span>
                    </div>
                </div>
                <h3 className={Styles.question}>
                    <MathRenderer content={question} />
                </h3>
                {questionPaper[activeQuestionIndex]?.image && (
                    <img
                        src={questionPaper[activeQuestionIndex].image}
                        alt="Question Image"
                        className={Styles.questionImage}
                    />
                )}
            </div>

            {/* Column 2: Input & Compact Dial Pad */}
            <div className={Styles.optionsColumn}>
                <div className={Styles.optionContainer}>
                    <Input
                        disableUnderline
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter answer"
                        className={Styles.answerInput}
                        autoFocus
                    />

                    {/* Compact Dial Pad with Math Operators */}
                    <div className={showOperators ? Styles.dialPad : Styles.dialPadThreeCol}>
                        {/* Row 1: Numbers 1-3 + Addition */}
                        <Button onClick={_ => handleChange('1')} className={Styles.dialButton}>1</Button>
                        <Button onClick={_ => handleChange('2')} className={Styles.dialButton}>2</Button>
                        <Button onClick={_ => handleChange('3')} className={Styles.dialButton}>3</Button>
                        {showOperators && <Button onClick={_ => handleChange('+')} className={Styles.operatorButton}>+</Button>}

                        {/* Row 2: Numbers 4-6 + Subtraction */}
                        <Button onClick={_ => handleChange('4')} className={Styles.dialButton}>4</Button>
                        <Button onClick={_ => handleChange('5')} className={Styles.dialButton}>5</Button>
                        <Button onClick={_ => handleChange('6')} className={Styles.dialButton}>6</Button>
                        {showOperators && <Button onClick={_ => handleChange('-')} className={Styles.operatorButton}>−</Button>}

                        {/* Row 3: Numbers 7-9 + Multiplication */}
                        <Button onClick={_ => handleChange('7')} className={Styles.dialButton}>7</Button>
                        <Button onClick={_ => handleChange('8')} className={Styles.dialButton}>8</Button>
                        <Button onClick={_ => handleChange('9')} className={Styles.dialButton}>9</Button>
                        {showOperators && <Button onClick={_ => handleChange('*')} className={Styles.operatorButton}>×</Button>}

                        {/* Row 4: Decimal, 0, Backspace, Division */}
                        <Button onClick={_ => handleChange('.')} className={Styles.dialButton}>.</Button>
                        <Button onClick={_ => handleChange('0')} className={Styles.dialButton}>0</Button>
                        {showOperators ? (
                            <Button onClick={handleBackspace} className={Styles.backspaceButton}>⌫</Button>
                        ) : (
                            questionPaper && questionPaper[activeQuestionIndex]?.keypadMode === 'multiplication' ? (
                                <Button onClick={_ => handleChange('x')} className={Styles.operatorButton}>×</Button>
                            ) : (
                                <Button onClick={_ => handleChange('-')} className={Styles.operatorButton}>−</Button>
                            )
                        )}
                        {showOperators && <Button onClick={_ => handleChange('/')} className={Styles.operatorButton}>÷</Button>}

                        {/* Row 5: Reset button */}
                        <Button onClick={handleReset} className={showOperators ? Styles.resetButton : Styles.resetButtonThreeCol}>Clear</Button>
                    </div>
                </div>


                <div className={Styles.navigationContainer}>
                    <div className={Styles.leftButtons}>
                        {activeQuestionIndex > 0 && (
                            <Button
                                onClick={onPrevious}
                                size="large"
                                startIcon={<ArrowLeft />}
                                className={Styles.prevButton}
                            >
                                Previous
                            </Button>
                        )}
                    </div>
                    <Button
                        onClick={_ => onClick(inputValue, timeTakeRef.current)}
                        size="large"
                        endIcon={isLastQuestion ? <Check /> : <ArrowRight />}
                        className={isLastQuestion ? Styles.submitButton : Styles.nextButton}
                    >
                        {isLastQuestion ? 'Submit' : 'Next'}
                    </Button>
                </div>
            </div>
        </div>
    )
};

export default TypeUserInput;
