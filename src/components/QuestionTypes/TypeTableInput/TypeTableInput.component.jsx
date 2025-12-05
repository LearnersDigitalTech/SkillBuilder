"use client";
import React, { useEffect, useState } from "react";
import Styles from "./TypeTableInput.module.css";
import { Button } from "@mui/material";
import { ArrowRight, Check, ArrowLeft } from "lucide-react";
import MathRenderer from "@/components/MathRenderer/MathRenderer.component";

const TypeTableInput = ({ onClick, onPrevious, onAnswerChange, questionPaper, activeQuestionIndex, topic, grade, timeTakeRef }) => {
    const [answers, setAnswers] = useState({});
    const currentQuestion = questionPaper[activeQuestionIndex];
    const rows = currentQuestion?.rows || [];
    const variant = currentQuestion?.variant || 'default'; // 'default' | 'fraction'
    const isLastQuestion = questionPaper && activeQuestionIndex === questionPaper.length - 1;

    // Initialize answers if revisiting
    useEffect(() => {
        if (currentQuestion?.userAnswer) {
            try {
                const stored = typeof currentQuestion.userAnswer === 'string'
                    ? JSON.parse(currentQuestion.userAnswer)
                    : currentQuestion.userAnswer;
                setAnswers(stored || {});
            } catch (e) {
                setAnswers({});
            }
        } else {
            setAnswers({});
        }
    }, [activeQuestionIndex, currentQuestion]);

    // Trigger MathJax rendering when question changes
    useEffect(() => {
        if (typeof window !== 'undefined' && window.MathJax) {
            window.MathJax.typesetPromise && window.MathJax.typesetPromise();
        }
    }, [currentQuestion]);

    const handleInputChange = (idx, field, value) => {
        const currentAnswer = answers[idx] || {};

        let newRowAnswer;
        if (variant === 'fraction' || variant === 'coordinate') {
            newRowAnswer = { ...currentAnswer, [field]: value };
        } else {
            newRowAnswer = value;
        }

        const newAnswers = { ...answers, [idx]: newRowAnswer };
        setAnswers(newAnswers);

        if (onAnswerChange) {
            onAnswerChange(JSON.stringify(newAnswers));
        }
    };

    const handleSubmit = () => {
        if (onClick) {
            onClick(JSON.stringify(answers), timeTakeRef.current);
        }
    };

    const renderCellContent = (content) => {
        if (typeof content === 'object' && content.n !== undefined && content.d !== undefined) {
            return (
                <div className={Styles.fractionWrapper}>
                    <span>{content.n}</span>
                    <div className={Styles.fractionLine}></div>
                    <span>{content.d}</span>
                </div>
            );
        }
        return content;
    };

    const renderInputCell = (idx) => {
        const rowData = currentQuestion.rows[idx];

        if (rowData.inputType === 'radio') {
            return (
                <div className={Styles.radioCell}>
                    {rowData.options.map((opt) => (
                        <div key={opt} className={Styles.optionColumn}>
                            <label className={Styles.radioLabel}>
                                <input
                                    type="radio"
                                    name={`question-${activeQuestionIndex}-row-${idx}`}
                                    value={opt}
                                    checked={answers[idx] === opt}
                                    onChange={(e) => handleInputChange(idx, 'value', e.target.value)}
                                    className={Styles.radioInput}
                                />
                            </label>
                        </div>
                    ))}
                </div>
            );
        }

        if (rowData.inputType === 'select') {
            return (
                <div className={Styles.inputCell}>
                    <select
                        className={Styles.selectField}
                        value={answers[idx] || ""}
                        onChange={(e) => handleInputChange(idx, 'value', e.target.value)}
                    >
                        <option value="" disabled>Choose...</option>
                        {rowData.options.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        if (variant === 'coordinate') {
            const rowAns = answers[idx] || {};
            return (
                <div className={Styles.inputCell} style={{ gap: '4px' }}>
                    <span style={{ fontSize: '1.5rem' }}>(</span>
                    <input
                        type="text"
                        className={Styles.fractionInput}
                        style={{ width: '50px' }}
                        value={rowAns.x || ""}
                        onChange={(e) => handleInputChange(idx, 'x', e.target.value)}
                    />
                    <span style={{ fontSize: '1.5rem' }}>,</span>
                    <input
                        type="text"
                        className={Styles.fractionInput}
                        style={{ width: '50px' }}
                        value={rowAns.y || ""}
                        onChange={(e) => handleInputChange(idx, 'y', e.target.value)}
                    />
                    <span style={{ fontSize: '1.5rem' }}>)</span>
                </div>
            );
        }

        if (variant === 'fraction') {
            const rowAns = answers[idx] || {};
            return (
                <div className={Styles.fractionInputCell}>
                    <input
                        type="text"
                        className={Styles.fractionInput}
                        value={rowAns.num || ""}
                        onChange={(e) => handleInputChange(idx, 'num', e.target.value)}
                    />
                    <div className={Styles.fractionLine} style={{ width: '60px' }}></div>
                    <input
                        type="text"
                        className={Styles.fractionInput}
                        value={rowAns.den || ""}
                        onChange={(e) => handleInputChange(idx, 'den', e.target.value)}
                    />
                </div>
            );
        } else {
            return (
                <div className={Styles.inputCell}>
                    <input
                        type="text"
                        className={Styles.inputField}
                        value={answers[idx] || ""}
                        onChange={(e) => handleInputChange(idx, 'value', e.target.value)}
                    />
                    {currentQuestion.rows[idx].unit && (
                        <span className={Styles.unitLabel}>{currentQuestion.rows[idx].unit}</span>
                    )}
                </div>
            );
        }
    };

    return (
        <div className={Styles.quizContainer}>
            <div className={Styles.header}>
                <div className={Styles.questionNumber}>{activeQuestionIndex + 1}</div>
                <div className={Styles.topicTitle}>{topic}</div>
            </div>

            <div className={Styles.tableContainer}>
                {currentQuestion?.question && (
                    <div className={Styles.questionText}>
                        <MathRenderer content={currentQuestion.question} />
                    </div>
                )}

                {/* Header Row for True/False Table */}
                {variant === 'true-false' && (
                    <div className={Styles.trueFalseRow} style={{ height: '40px', marginBottom: '-10px', background: 'transparent', border: 'none' }}>
                        {/* Empty Left Cell */}
                        <div style={{ background: 'transparent' }}></div>
                        {/* Right Cell matching radioCell alignment */}
                        <div className={Styles.headerRadioCell}>
                            <div className={Styles.optionColumn}>True</div>
                            <div className={Styles.optionColumn}>False</div>
                        </div>
                    </div>
                )}

                {rows.map((row, idx) => {
                    if (row.text) {
                        let rowClass = Styles.textRow;
                        if (variant === 'fraction') rowClass = Styles.fractionTextRow;
                        if (variant === 'true-false') rowClass = Styles.trueFalseRow;

                        return (
                            <div key={idx} className={rowClass}>
                                <div className={Styles.textCell}><MathRenderer content={row.text} /></div>
                                {renderInputCell(idx)}
                            </div>
                        );
                    }
                    return (
                        <div key={idx} className={variant === 'fraction' ? Styles.fractionRow : Styles.row}>
                            <div className={variant === 'fraction' ? Styles.fractionCell : Styles.cell}>
                                {renderCellContent(row.left)}
                            </div>
                            <div className={variant === 'fraction' ? Styles.fractionCell : Styles.cell}>{row.op}</div>
                            <div className={variant === 'fraction' ? Styles.fractionCell : Styles.cell}>
                                {renderCellContent(row.right)}
                            </div>
                            <div className={variant === 'fraction' ? Styles.fractionCell : Styles.cell}>=</div>
                            {renderInputCell(idx)}
                        </div>
                    );
                })}
            </div>

            <div className={Styles.navigationContainer}>
                {activeQuestionIndex > 0 && (
                    <Button
                        onClick={onPrevious}
                        size="large"
                        startIcon={<ArrowLeft />}
                        className={Styles.previousButton}
                        style={{ marginRight: 'auto' }}
                    >
                        Previous
                    </Button>
                )}
                {activeQuestionIndex === 0 && <div />}

                <Button
                    onClick={handleSubmit}
                    size="large"
                    endIcon={isLastQuestion ? <Check /> : <ArrowRight />}
                    className={isLastQuestion ? Styles.submitButton : Styles.nextButton}
                >
                    {isLastQuestion ? 'Submit' : 'Next'}
                </Button>
            </div>
        </div>
    );
};

export default TypeTableInput;
