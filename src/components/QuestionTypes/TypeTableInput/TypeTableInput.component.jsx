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
        if (variant === 'fraction' || variant === 'coordinate' || variant === 'double-input' || variant === 'triple-input') {
            newRowAnswer = { ...currentAnswer, [field]: value };
        } else {
            newRowAnswer = value;
        }

        const newAnswers = { ...answers, [idx]: newRowAnswer };
        setAnswers(newAnswers);

        // Check if there is any actual content
        const hasContent = Object.values(newAnswers).some(val => {
            if (typeof val === 'object') {
                return Object.values(val).some(v => v && v.trim() !== '');
            }
            return val && val.trim() !== '';
        });

        if (onAnswerChange) {
            onAnswerChange(hasContent ? JSON.stringify(newAnswers) : null);
        }
    };

    const handleSubmit = () => {
        if (onClick) {
            // Check if there is any actual content before submitting
            const hasContent = Object.values(answers).some(val => {
                if (typeof val === 'object') {
                    return Object.values(val).some(v => v && v.trim() !== '');
                }
                return val && val.trim() !== '';
            });

            onClick(hasContent ? JSON.stringify(answers) : null, timeTakeRef.current);
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
                                <span style={{ marginLeft: '8px' }}>{opt}</span>
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
                {grade && (
                    <>
                        <div className={Styles.gradeTitle}>{grade}</div>
                        <div className={Styles.separator}>|</div>
                    </>
                )}
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

                {/* Header Row for Double/Triple Input Table */}
                {(variant === 'double-input' || variant === 'triple-input') && (
                    <div className={Styles.headerDoubleRow} style={{ gridTemplateColumns: variant === 'triple-input' ? '1.5fr 1fr 1fr 1fr' : '2fr 1fr 1fr' }}>
                        <div className={Styles.headerCell}>{(currentQuestion.headers && currentQuestion.headers[0]) || 'Shape'}</div>
                        <div className={Styles.headerCell}>{(currentQuestion.headers && currentQuestion.headers[1]) || 'Field 1'}</div>
                        <div className={Styles.headerCell}>{(currentQuestion.headers && currentQuestion.headers[2]) || 'Field 2'}</div>
                        {variant === 'triple-input' && (
                            <div className={Styles.headerCell}>{(currentQuestion.headers && currentQuestion.headers[3]) || 'Field 3'}</div>
                        )}
                    </div>
                )}

                {rows.map((row, idx) => {
                    if (row.text !== undefined || row.image) {
                        let rowClass = Styles.textRow;
                        if (variant === 'fraction') rowClass = Styles.fractionTextRow;
                        if (variant === 'true-false') rowClass = Styles.trueFalseRow;
                        if (variant === 'double-input' || variant === 'triple-input') rowClass = Styles.doubleInputRow;

                        // Keys and Placeholders
                        const key1 = (currentQuestion.inputKeys && currentQuestion.inputKeys[0]) || 'k1';
                        const key2 = (currentQuestion.inputKeys && currentQuestion.inputKeys[1]) || 'k2';
                        const key3 = (currentQuestion.inputKeys && currentQuestion.inputKeys[2]) || 'k3';
                        const ph1 = (currentQuestion.placeholders && currentQuestion.placeholders[0]) || '';
                        const ph2 = (currentQuestion.placeholders && currentQuestion.placeholders[1]) || '';
                        const ph3 = (currentQuestion.placeholders && currentQuestion.placeholders[2]) || '';

                        return (
                            <div key={idx} className={rowClass} style={{ gridTemplateColumns: variant === 'triple-input' ? '1.5fr 1fr 1fr 1fr' : (variant === 'double-input' ? '2fr 1fr 1fr' : undefined) }}>
                                <div className={Styles.textCell}>
                                    <MathRenderer content={row.text} />
                                    {row.image && (
                                        typeof row.image === 'string' && row.image.trim().startsWith('<svg') ?
                                            <div style={{ marginTop: '8px' }} dangerouslySetInnerHTML={{ __html: row.image }} /> :
                                            <img src={row.image} alt="visual" style={{ marginTop: '8px', maxWidth: '100%', maxHeight: '100px', display: 'block' }} />
                                    )}
                                </div>
                                {(variant === 'double-input' || variant === 'triple-input') ? (
                                    <>
                                        <div className={Styles.inputCell} data-label={(currentQuestion.headers && currentQuestion.headers[1]) || 'Field 1'}>
                                            <input
                                                type="text"
                                                className={Styles.inputField}
                                                value={(answers[idx] || {})[key1] || ""}
                                                onChange={(e) => handleInputChange(idx, key1, e.target.value)}
                                                placeholder={ph1}
                                            />
                                        </div>
                                        <div className={Styles.inputCell} data-label={(currentQuestion.headers && currentQuestion.headers[2]) || 'Field 2'}>
                                            <input
                                                type="text"
                                                className={Styles.inputField}
                                                value={(answers[idx] || {})[key2] || ""}
                                                onChange={(e) => handleInputChange(idx, key2, e.target.value)}
                                                placeholder={ph2}
                                            />
                                        </div>
                                        {variant === 'triple-input' && (
                                            <div className={Styles.inputCell} data-label={(currentQuestion.headers && currentQuestion.headers[3]) || 'Field 3'}>
                                                <input
                                                    type="text"
                                                    className={Styles.inputField}
                                                    value={(answers[idx] || {})[key3] || ""}
                                                    onChange={(e) => handleInputChange(idx, key3, e.target.value)}
                                                    placeholder={ph3}
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    renderInputCell(idx)
                                )}
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
        </div >
    );
};

export default TypeTableInput;
