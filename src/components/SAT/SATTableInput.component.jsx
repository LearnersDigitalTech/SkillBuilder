"use client";
import { useEffect, useState } from "react";
import Styles from "./SATTableInput.module.css";
import { Button } from "@mui/material";
import { ArrowRight } from "lucide-react";
import MathRenderer from "@/components/MathRenderer/MathRenderer.component";

const SATTableInput = ({ onNext, question, topic, rows, variant, activeQuestionIndex, onAnswer, savedAnswer }) => {
    // savedAnswer is expected to be an array of strings corresponding to cells
    const [inputs, setInputs] = useState(savedAnswer || Array(rows).fill(""));

    useEffect(() => {
        setInputs(savedAnswer || Array(rows).fill(""));
    }, [question, activeQuestionIndex, savedAnswer, rows]);

    const handleInputChange = (index, val) => {
        const newInputs = [...inputs];
        newInputs[index] = val;
        setInputs(newInputs);
        if (onAnswer) onAnswer(newInputs);
    };

    const handleNext = () => {
        if (onAnswer) {
            onAnswer(inputs);
        }
        onNext();
    };

    return (
        <div className={Styles.quizContainer}>
            <div className={Styles.questionColumn}>
                <div className={Styles.questionHeader}>
                    <div className={Styles.questionNumber}>Question {activeQuestionIndex + 1}</div>
                    <div className={Styles.questionMeta}>
                        <span>SAT Exam Mode</span>
                        <span className={Styles.separator}>•</span>
                        <span>{topic || "General"}</span>
                    </div>
                </div>

                <div className={Styles.question}>
                    <MathRenderer content={question} />
                </div>

                <div className={Styles.tableInputContainer}>
                    <div className={Styles.inputGrid}>
                        {inputs.map((val, idx) => (
                            <div key={idx} className={Styles.inputRow}>
                                <span className={Styles.rowLabel}>Row {idx + 1}</span>
                                <input
                                    type="text"
                                    className={Styles.cellInput}
                                    value={val}
                                    onChange={(e) => handleInputChange(idx, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={Styles.interactionColumn}>
                <div className={Styles.navigationContainer}>
                    <Button
                        onClick={handleNext}
                        size="large"
                        endIcon={<ArrowRight />}
                        className={Styles.nextButton}
                    >
                        Next Question
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SATTableInput;
