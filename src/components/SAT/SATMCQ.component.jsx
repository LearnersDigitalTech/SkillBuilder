import Styles from "./SATMCQ.module.css";
import { Button } from "@mui/material";
import { ArrowRight } from "lucide-react";
import MathRenderer from "@/components/MathRenderer/MathRenderer.component";
import { useEffect, useState } from "react";

const SATMCQ = ({ onNext, question, topic, options, image, activeQuestionIndex, onAnswer, savedAnswer }) => {
    const [selectedOption, setSelectedOption] = useState(savedAnswer || null);

    useEffect(() => {
        setSelectedOption(savedAnswer || null);
    }, [question, activeQuestionIndex, savedAnswer]);

    const handleOptionSelect = (value) => {
        setSelectedOption(value);
        if (onAnswer) {
            onAnswer(value);
        }
    };

    const handleNext = () => {
        if (onAnswer) {
            onAnswer(selectedOption);
        }
        onNext();
    };

    const getOptionStyle = (value) => {
        if (selectedOption !== value) return {};
        // Blue selection style from design
        return { backgroundColor: "#eff6ff", borderColor: "#3b82f6" };
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

                <h3 className={Styles.question}>
                    <MathRenderer content={question} />
                </h3>

                {image && (
                    <img src={image} alt="Question" className={Styles.questionImage} />
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
                    <Button
                        onClick={handleNext}
                        size="large"
                        endIcon={<ArrowRight />}
                        className={Styles.nextButton}
                        disabled={selectedOption === null} // Optional based on if skip is allowed via a separate button? Or allow next without selection (skip)?
                    // User said "complete the test", usually allows skipping. But let's keep disabled to force answer OR just allow it.
                    // Let's allow skipping by just clicking Next? 
                    // Actually, standard UI is Next enabled always if skip allowed.
                    // But let's stick to "Must answer" or "Skip" button. 
                    // For simplicity, let's enable Next always? 
                    // Let's keep it enabled.
                    // Wait, if I enable it without selection, selectedOption is null.
                    >
                        {selectedOption ? "Next Question" : "Skip Question"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SATMCQ;
