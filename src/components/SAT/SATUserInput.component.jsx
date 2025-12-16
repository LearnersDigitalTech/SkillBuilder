"use client";
import { useEffect, useState } from "react";
import Styles from "./SATUserInput.module.css";
import { Button } from "@mui/material";
import { ArrowRight, Delete } from "lucide-react";
import MathRenderer from "@/components/MathRenderer/MathRenderer.component";

const SATUserInput = ({ onNext, question, topic, image, activeQuestionIndex, onAnswer, savedAnswer }) => {
    const [inputValue, setInputValue] = useState(savedAnswer || "");
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        setInputValue(savedAnswer || "");
    }, [question, activeQuestionIndex, savedAnswer]);

    const handleVirtualKeypadClick = (key) => {
        if (inputValue.length >= 6) return;
        if (key === "/" && inputValue.includes("/")) return;
        if (key === "." && inputValue.includes(".")) return;

        const newValue = inputValue + key;
        setInputValue(newValue);
        if (onAnswer) onAnswer(newValue);
    };

    const handleDelete = () => {
        const newValue = inputValue.slice(0, -1);
        setInputValue(newValue);
        if (onAnswer) onAnswer(newValue);
    };

    const handleNext = () => {
        if (onAnswer) {
            onAnswer(inputValue);
        }
        onNext();
    };

    const renderKeypad = () => {
        const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "/"];
        return (
            <div className={Styles.keypadGrid}>
                {keys.map(k => (
                    <button key={k} className={Styles.keypadButton} onClick={() => handleVirtualKeypadClick(k)}>
                        {k}
                    </button>
                ))}
                <button className={Styles.keypadButton} onClick={() => handleVirtualKeypadClick("-")}>-</button>
                <button className={`${Styles.keypadButton} ${Styles.deleteButton}`} onClick={handleDelete}>
                    <Delete size={20} />
                </button>
            </div>
        );
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
                {image && <img src={image} className={Styles.questionImage} alt="Question" />}

                <div className={Styles.inputDisplay}>
                    <input
                        type="text"
                        className={Styles.mainInput}
                        value={inputValue}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^[\d./-]*$/.test(val) && val.length <= 6) {
                                setInputValue(val);
                                if (onAnswer) onAnswer(val);
                            }
                        }}
                        onFocus={() => setIsFocused(true)}
                        placeholder="Enter answer"
                    />
                </div>
                <div className={Styles.helperText}>
                    Enter your answer in the box. Fractions like 2/3 are allowed.
                </div>
            </div>

            <div className={Styles.interactionColumn}>
                <div className={Styles.keypadContainer}>
                    {renderKeypad()}
                </div>

                <div className={Styles.navigationContainer}>
                    <Button
                        onClick={handleNext}
                        size="large"
                        endIcon={<ArrowRight />}
                        className={Styles.nextButton}
                    >
                        {inputValue ? "Next Question" : "Skip Question"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SATUserInput;
