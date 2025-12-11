"use client";
import React, { useEffect } from "react";
import Styles from "./TypeTrueAndFalse.module.css";
import { Button, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { ArrowLeft, ArrowRight, Check, Flag } from "lucide-react";

const TypeTrueAndFalse = ({ onClick, onPrevious, onMarkForReview, onAnswerChange, questionPaper, activeQuestionIndex, topic, question, grade, timeTakeRef }) => {
    const [selectedOption, setSelectedOption] = React.useState(null);
    const isLastQuestion = questionPaper && activeQuestionIndex === questionPaper.length - 1;
    const isMarkedForReview = questionPaper && questionPaper[activeQuestionIndex]?.markedForReview || false;

    useEffect(() => {
        if (questionPaper && questionPaper[activeQuestionIndex]) {
            setSelectedOption(questionPaper[activeQuestionIndex]?.userAnswer || null)
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
            </div>

            {/* Column 2: Options */}
            <div className={Styles.optionsColumn}>
                <RadioGroup className={Styles.optionContainer} onChange={(e) => {
                    const value = e.target.value;
                    setSelectedOption(value);
                    if (onAnswerChange) {
                        onAnswerChange(value);
                    }
                }} value={selectedOption}>
                    <FormControlLabel value="true" label="True" control={<Radio />} />
                    <FormControlLabel value="false" label="False" control={<Radio />} />
                </RadioGroup>


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
}


export default TypeTrueAndFalse;