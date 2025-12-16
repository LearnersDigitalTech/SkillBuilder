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
    onRepeat,
    isLastQuestion
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

        if (variant === 'coordinate') {
            // Validate coordinate pair (x, y) for linear equations
            // The answer object contains: { x: "value", y: "value", _equation: { a, b, c } }
            // We need to check if a*x + b*y = c
            if (userVal && correctVal && correctVal._equation) {
                const { a, b, c } = correctVal._equation;
                const userX = parseFloat(userVal.x);
                const userY = parseFloat(userVal.y);

                // Check if inputs are valid numbers
                if (!isNaN(userX) && !isNaN(userY)) {
                    // Check if the equation is satisfied: ax + by = c
                    const result = a * userX + b * userY;
                    // Allow small floating point error
                    isRowCorrect = Math.abs(result - c) < 0.0001;
                }
            }
        } else if (variant === 'fraction') {
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
        const row = rows[rowIndex];
        const correctVal = parsedAnswer[rowIndex]; // Get correct answer for this row

        // Handle select/dropdown input
        if (row.inputType === 'select') {
            return (
                <div className={Styles.inputWrapper}>
                    <select
                        className={`${Styles.selectField} ${isCorrect ? Styles.correct : ''} ${isWrong ? Styles.wrong : ''}`}
                        value={userAnswers[rowIndex] || ""}
                        onChange={(e) => handleInputChange(rowIndex, e.target.value)}
                        disabled={isCorrect || showAnswer}
                    >
                        <option value="" disabled>Choose...</option>
                        {row.options && row.options.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
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

        // Handle coordinate input (x, y) pairs
        if (variant === 'coordinate') {
            const userAns = userAnswers[rowIndex] || {};
            return (
                <div className={Styles.coordinateInputWrapper}>
                    <div className={Styles.coordinateInputContainer}>
                        <span style={{ fontSize: '1.5rem' }}>(</span>
                        <input
                            className={`${Styles.inputNum} ${isCorrect ? Styles.correct : ''} ${isWrong ? Styles.wrong : ''}`}
                            placeholder="x"
                            style={{ width: '60px' }}
                            value={userAns.x || ""}
                            onChange={(e) => handleInputChange(rowIndex, e.target.value, 'x')}
                            disabled={isCorrect || showAnswer}
                        />
                        <span style={{ fontSize: '1.5rem' }}>,</span>
                        <input
                            className={`${Styles.inputDen} ${isCorrect ? Styles.correct : ''} ${isWrong ? Styles.wrong : ''}`}
                            placeholder="y"
                            style={{ width: '60px' }}
                            value={userAns.y || ""}
                            onChange={(e) => handleInputChange(rowIndex, e.target.value, 'y')}
                            disabled={isCorrect || showAnswer}
                        />
                        <span style={{ fontSize: '1.5rem' }}>)</span>
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
                    {showAnswer && correctVal && (
                        <div className={Styles.answerReveal}>
                            Answer: ({correctVal.x || 0}, {correctVal.y || 0})
                        </div>
                    )}
                </div>
            );
        }

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

            {/* Render question text if present */}
            {question?.question && (
                <div className={Styles.questionText}>
                    <MathRenderer content={question.question} />
                </div>
            )}

            <div className={Styles.tableContainer}>
                {/* Header Row for Double Input (Perimeter and Area) */}
                {variant === 'double-input' && (
                    <div className={Styles.headerRow}>
                        <div className={Styles.headerCell}>{(question?.headers && question.headers[0]) || 'Shape'}</div>
                        <div className={Styles.headerCell}>{(question?.headers && question.headers[1]) || 'Field 1'}</div>
                        <div className={Styles.headerCell}>{(question?.headers && question.headers[2]) || 'Field 2'}</div>
                    </div>
                )}

                {/* Header Row for Triple Input (Solid Shapes) */}
                {variant === 'triple-input' && (
                    <div className={Styles.headerRow} style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr' }}>
                        <div className={Styles.headerCell}>Shape</div>
                        <div className={Styles.headerCell}>Faces</div>
                        <div className={Styles.headerCell}>Vertices</div>
                        <div className={Styles.headerCell}>Edges</div>
                    </div>
                )}

                {rows.map((row, idx) => {
                    // Special rendering for double and triple input variants
                    if (variant === 'double-input') {
                        return (
                            <div key={idx} className={Styles.doubleInputRow}>
                                <div className={Styles.shapeCell}>
                                    {row.text && <MathRenderer content={row.text} inline />}
                                    {row.image && (
                                        typeof row.image === 'string' && row.image.trim().startsWith('<svg') ?
                                            <div style={{ marginTop: '8px' }} dangerouslySetInnerHTML={{ __html: row.image }} /> :
                                            <img src={row.image} alt="shape" style={{ marginTop: '8px', maxWidth: '100%', maxHeight: '100px', display: 'block' }} />
                                    )}
                                </div>
                                <input
                                    className={`${Styles.inputDefault} ${rowStatus[idx] === 'correct' ? Styles.correct : ''} ${rowStatus[idx] === 'wrong' ? Styles.wrong : ''}`}
                                    placeholder="Perimeter"
                                    value={(userAnswers[idx] || {}).perimeter || ""}
                                    onChange={(e) => handleInputChange(idx, e.target.value, 'perimeter')}
                                    disabled={rowStatus[idx] === 'correct' || showAnswer}
                                />
                                <input
                                    className={`${Styles.inputDefault} ${rowStatus[idx] === 'correct' ? Styles.correct : ''} ${rowStatus[idx] === 'wrong' ? Styles.wrong : ''}`}
                                    placeholder="Area"
                                    value={(userAnswers[idx] || {}).area || ""}
                                    onChange={(e) => handleInputChange(idx, e.target.value, 'area')}
                                    disabled={rowStatus[idx] === 'correct' || showAnswer}
                                />
                                <Button
                                    onClick={() => checkRow(idx)}
                                    disabled={rowStatus[idx] === 'correct' || showAnswer}
                                    variant="contained"
                                    size="small"
                                    className={Styles.checkBtn}
                                >
                                    Check
                                </Button>
                                {showAnswer && (
                                    <div className={Styles.answerReveal}>
                                        P: {parsedAnswer[idx].perimeter}, A: {parsedAnswer[idx].area}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    if (variant === 'triple-input') {
                        return (
                            <div key={idx} className={Styles.tripleInputRow}>
                                <div className={Styles.shapeCell}>
                                    {row.text && <MathRenderer content={row.text} inline />}
                                    {row.image && (
                                        typeof row.image === 'string' && row.image.trim().startsWith('<svg') ?
                                            <div style={{ marginTop: '8px' }} dangerouslySetInnerHTML={{ __html: row.image }} /> :
                                            <img src={row.image} alt="shape" style={{ marginTop: '8px', maxWidth: '100%', maxHeight: '100px', display: 'block' }} />
                                    )}
                                </div>
                                <input
                                    className={`${Styles.inputDefault} ${rowStatus[idx] === 'correct' ? Styles.correct : ''} ${rowStatus[idx] === 'wrong' ? Styles.wrong : ''}`}
                                    placeholder={question?.placeholders?.[0] || question?.inputKeys?.[0] || 'Field 1'}
                                    value={(userAnswers[idx] || {})[(question?.inputKeys?.[0] || 'k1')] || ""}
                                    onChange={(e) => handleInputChange(idx, e.target.value, question?.inputKeys?.[0] || 'k1')}
                                    disabled={rowStatus[idx] === 'correct' || showAnswer}
                                />
                                <input
                                    className={`${Styles.inputDefault} ${rowStatus[idx] === 'correct' ? Styles.correct : ''} ${rowStatus[idx] === 'wrong' ? Styles.wrong : ''}`}
                                    placeholder={question?.placeholders?.[1] || question?.inputKeys?.[1] || 'Field 2'}
                                    value={(userAnswers[idx] || {})[(question?.inputKeys?.[1] || 'k2')] || ""}
                                    onChange={(e) => handleInputChange(idx, e.target.value, question?.inputKeys?.[1] || 'k2')}
                                    disabled={rowStatus[idx] === 'correct' || showAnswer}
                                />
                                <input
                                    className={`${Styles.inputDefault} ${rowStatus[idx] === 'correct' ? Styles.correct : ''} ${rowStatus[idx] === 'wrong' ? Styles.wrong : ''}`}
                                    placeholder={question?.placeholders?.[2] || question?.inputKeys?.[2] || 'Field 3'}
                                    value={(userAnswers[idx] || {})[(question?.inputKeys?.[2] || 'k3')] || ""}
                                    onChange={(e) => handleInputChange(idx, e.target.value, question?.inputKeys?.[2] || 'k3')}
                                    disabled={rowStatus[idx] === 'correct' || showAnswer}
                                />
                                <Button
                                    onClick={() => checkRow(idx)}
                                    disabled={rowStatus[idx] === 'correct' || showAnswer}
                                    variant="contained"
                                    size="small"
                                    className={Styles.checkBtn}
                                >
                                    Check
                                </Button>
                                {showAnswer && (
                                    <div className={Styles.answerReveal}>
                                        {question?.inputKeys?.[0] || 'F'}: {parsedAnswer[idx][(question?.inputKeys?.[0] || 'k1')]},
                                        {question?.inputKeys?.[1] || 'V'}: {parsedAnswer[idx][(question?.inputKeys?.[1] || 'k2')]},
                                        {question?.inputKeys?.[2] || 'E'}: {parsedAnswer[idx][(question?.inputKeys?.[2] || 'k3')]}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    // Standard row rendering for other variants
                    return (
                        <div key={idx} className={Styles.row}>
                            <div className={Styles.problemCol}>
                                {/* Render Left Op Right nicely */}
                                {variant === 'fraction' && row.left ? (
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
                                ) : (variant === 'double-input' || variant === 'triple-input') ? (
                                    <div className={Styles.shapeCell}>
                                        {row.text && <MathRenderer content={row.text} inline />}
                                        {row.image && (
                                            typeof row.image === 'string' && row.image.trim().startsWith('<svg') ?
                                                <div style={{ marginTop: '8px' }} dangerouslySetInnerHTML={{ __html: row.image }} /> :
                                                <img src={row.image} alt="shape" style={{ marginTop: '8px', maxWidth: '100%', maxHeight: '100px', display: 'block' }} />
                                        )}
                                    </div>
                                ) : row.text ? (
                                    <div className={Styles.problemText}>
                                        <MathRenderer content={row.text} inline />
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
                                {variant === 'triple-input' ? (
                                    <>
                                        <div className={Styles.tripleInputWrapper}>
                                            <input
                                                className={`${Styles.inputDefault} ${rowStatus[idx] === 'correct' ? Styles.correct : ''} ${rowStatus[idx] === 'wrong' ? Styles.wrong : ''}`}
                                                placeholder={question?.placeholders?.[0] || question?.inputKeys?.[0] || 'Field 1'}
                                                value={(userAnswers[idx] || {})[(question?.inputKeys?.[0] || 'k1')] || ""}
                                                onChange={(e) => handleInputChange(idx, e.target.value, question?.inputKeys?.[0] || 'k1')}
                                                disabled={rowStatus[idx] === 'correct' || showAnswer}
                                            />
                                            <input
                                                className={`${Styles.inputDefault} ${rowStatus[idx] === 'correct' ? Styles.correct : ''} ${rowStatus[idx] === 'wrong' ? Styles.wrong : ''}`}
                                                placeholder={question?.placeholders?.[1] || question?.inputKeys?.[1] || 'Field 2'}
                                                value={(userAnswers[idx] || {})[(question?.inputKeys?.[1] || 'k2')] || ""}
                                                onChange={(e) => handleInputChange(idx, e.target.value, question?.inputKeys?.[1] || 'k2')}
                                                disabled={rowStatus[idx] === 'correct' || showAnswer}
                                            />
                                            <input
                                                className={`${Styles.inputDefault} ${rowStatus[idx] === 'correct' ? Styles.correct : ''} ${rowStatus[idx] === 'wrong' ? Styles.wrong : ''}`}
                                                placeholder={question?.placeholders?.[2] || question?.inputKeys?.[2] || 'Field 3'}
                                                value={(userAnswers[idx] || {})[(question?.inputKeys?.[2] || 'k3')] || ""}
                                                onChange={(e) => handleInputChange(idx, e.target.value, question?.inputKeys?.[2] || 'k3')}
                                                disabled={rowStatus[idx] === 'correct' || showAnswer}
                                            />
                                            <Button
                                                onClick={() => checkRow(idx)}
                                                disabled={rowStatus[idx] === 'correct' || showAnswer}
                                                variant="contained"
                                                size="small"
                                                className={Styles.checkBtn}
                                            >
                                                Check
                                            </Button>
                                        </div>
                                    </>
                                ) : variant === 'double-input' ? (
                                    <>
                                        <div className={Styles.doubleInputWrapper}>
                                            <input
                                                className={`${Styles.inputDefault} ${rowStatus[idx] === 'correct' ? Styles.correct : ''} ${rowStatus[idx] === 'wrong' ? Styles.wrong : ''}`}
                                                placeholder="Perimeter"
                                                value={(userAnswers[idx] || {}).perimeter || ""}
                                                onChange={(e) => handleInputChange(idx, e.target.value, 'perimeter')}
                                                disabled={rowStatus[idx] === 'correct' || showAnswer}
                                            />
                                            <input
                                                className={`${Styles.inputDefault} ${rowStatus[idx] === 'correct' ? Styles.correct : ''} ${rowStatus[idx] === 'wrong' ? Styles.wrong : ''}`}
                                                placeholder="Area"
                                                value={(userAnswers[idx] || {}).area || ""}
                                                onChange={(e) => handleInputChange(idx, e.target.value, 'area')}
                                                disabled={rowStatus[idx] === 'correct' || showAnswer}
                                            />
                                            <Button
                                                onClick={() => checkRow(idx)}
                                                disabled={rowStatus[idx] === 'correct' || showAnswer}
                                                variant="contained"
                                                size="small"
                                                className={Styles.checkBtn}
                                            >
                                                Check
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    renderInput(idx)
                                )}
                            </div>
                            {showAnswer && variant !== 'coordinate' && (
                                <div className={Styles.answerReveal}>
                                    Ans: {variant === 'fraction'
                                        ? `${parsedAnswer[idx].num}/${parsedAnswer[idx].den}`
                                        : variant === 'double-input'
                                            ? `P: ${parsedAnswer[idx].perimeter}, A: ${parsedAnswer[idx].area}`
                                            : parsedAnswer[idx]}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className={Styles.actions}>
                {isComplete && (
                    <Button
                        onClick={onNext}
                        variant="contained"
                        color="success"
                        endIcon={<ArrowRight />}
                    >
                        {isLastQuestion ? "Finish" : "Next Question"}
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
