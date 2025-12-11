"use client";
import React, { useEffect } from "react";
import Styles from "./TypeMCQ.module.css";
import { Button, FormControlLabel, Radio, RadioGroup, Checkbox, FormGroup } from "@mui/material";
import { ArrowLeft, ArrowRight, Check, Flag } from "lucide-react";
import MathRenderer from "@/components/MathRenderer/MathRenderer.component";

const TypeMCQ = ({ onClick, onPrevious, onMarkForReview, onAnswerChange, questionPaper, activeQuestionIndex, options, topic, question, grade, timeTakeRef }) => {

    const [selectedOption, setSelectedOption] = React.useState(null);
    const isLastQuestion = questionPaper && activeQuestionIndex === questionPaper.length - 1;
    const isMarkedForReview = questionPaper && questionPaper[activeQuestionIndex]?.markedForReview || false;

    useEffect(() => {
        if (questionPaper && questionPaper[activeQuestionIndex]) {
            let userAns = questionPaper[activeQuestionIndex]?.userAnswer || null;
            if (questionPaper[activeQuestionIndex]?.allowMultiple) {
                if (typeof userAns === 'string') {
                    try {
                        userAns = JSON.parse(userAns);
                    } catch (e) {
                        // If not json, maybe empty string or single value
                        userAns = userAns ? [userAns] : [];
                    }
                }
                if (!Array.isArray(userAns)) userAns = [];
            }
            setSelectedOption(userAns);
        }
    }, [question, activeQuestionIndex, questionPaper])

    const handleMarkForReview = () => {
        if (onMarkForReview) {
            onMarkForReview(selectedOption);
        }
    }

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

            {/* Column 2: Options */}
            <div className={Styles.optionsColumn}>
                {questionPaper[activeQuestionIndex]?.allowMultiple ? (
                    <FormGroup className={Styles.optionContainer}>
                        {options.map((option, index) => {
                            const isSelected = Array.isArray(selectedOption) && selectedOption.includes(option.value);
                            return (
                                <FormControlLabel
                                    key={`${option.value}-${index}`}
                                    control={
                                        <Checkbox
                                            checked={isSelected || false}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                const val = option.value;
                                                const current = Array.isArray(selectedOption) ? selectedOption : [];
                                                let next;
                                                if (checked) {
                                                    next = [...current, val];
                                                } else {
                                                    next = current.filter(v => v !== val);
                                                }
                                                // Sort to ensure consistent answer comparison
                                                next.sort();
                                                setSelectedOption(next);
                                                if (onAnswerChange) onAnswerChange(JSON.stringify(next));
                                            }}
                                        />
                                    }
                                    label={
                                        option.image ? (
                                            <div className={Styles.optionWithImage}>
                                                <img src={option.image} alt={option.label} className={Styles.optionImage} />
                                                <span className={Styles.optionLabel}><MathRenderer content={option.label} /></span>
                                            </div>
                                        ) : (
                                            <MathRenderer content={option.label} />
                                        )
                                    }
                                />
                            );
                        })}
                    </FormGroup>
                ) : (
                    <RadioGroup className={Styles.optionContainer} onChange={(e) => {
                        const value = e.target.value;
                        setSelectedOption(value);
                        if (onAnswerChange) {
                            onAnswerChange(value);
                        }
                    }} value={selectedOption || ""}>
                        {options.map((option, index) => (
                            <FormControlLabel
                                key={`${option.value}-${index}`}
                                value={option.value}
                                label={
                                    option.image ? (
                                        <div className={Styles.optionWithImage}>
                                            <img
                                                src={option.image}
                                                alt={option.label}
                                                className={Styles.optionImage}
                                            />
                                            <span className={Styles.optionLabel}>
                                                <MathRenderer content={option.label} />
                                            </span>
                                        </div>
                                    ) : (
                                        <MathRenderer content={option.label} />
                                    )
                                }
                                control={<Radio />}
                            />
                        ))}
                    </RadioGroup>
                )}



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
                        onClick={() => onClick(selectedOption, timeTakeRef.current)}
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

export default TypeMCQ;