"use client";
import React, { useEffect, useState, useMemo } from "react";
import Styles from "./TypeFactorTree.module.css";
import { Button } from "@mui/material";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import MathRenderer from "@/components/MathRenderer/MathRenderer.component";

// --- Layout Logic ---
const NODE_WIDTH = 60;
const NODE_HEIGHT = 60;
const X_SPACING = 30; // Horizontal gap between leaf nodes
const Y_SPACING = 100; // Vertical gap between levels

const calculateTreeLayout = (root) => {
    if (!root) return { nodes: [], edges: [], width: 0, height: 0 };

    const nodes = [];
    const edges = [];

    const assignLeafSlots = (node, counter = { val: 0 }) => {
        if (!node.children || node.children.length === 0) {
            node._leafIndex = counter.val++;
        } else {
            node.children.forEach(c => assignLeafSlots(c, counter));
        }
    };
    assignLeafSlots(root, { val: 0 });

    const assignCoords = (node, depth = 0) => {
        const y = depth * Y_SPACING;
        let x = 0;

        if (!node.children || node.children.length === 0) {
            x = node._leafIndex * (NODE_WIDTH + X_SPACING);
        } else {
            node.children.forEach(c => assignCoords(c, depth + 1));
            const firstChildX = node.children[0]._x;
            const lastChildX = node.children[node.children.length - 1]._x;
            x = (firstChildX + lastChildX) / 2;
        }

        node._x = x;
        node._y = y;
        nodes.push(node);

        if (node.children) {
            node.children.forEach(c => {
                edges.push({
                    x1: x + NODE_WIDTH / 2,
                    y1: y + NODE_HEIGHT,
                    x2: c._x + NODE_WIDTH / 2,
                    y2: c._y,
                    key: `${node.id}-${c.id}`
                });
            });
        }
    };
    assignCoords(root);

    const minX = Math.min(...nodes.map(n => n._x));
    const maxX = Math.max(...nodes.map(n => n._x));
    const minY = Math.min(...nodes.map(n => n._y));
    const maxY = Math.max(...nodes.map(n => n._y));

    const padding = 40;
    const xOffset = -minX + padding;
    const yOffset = padding;

    nodes.forEach(n => {
        n._x += xOffset;
        n._y += yOffset;
    });
    edges.forEach(e => {
        e.x1 += xOffset;
        e.y1 += yOffset;
        e.x2 += xOffset;
        e.y2 += yOffset;
    });

    const width = (maxX - minX) + (padding * 2) + NODE_WIDTH;
    const height = (maxY - minY) + (padding * 2) + NODE_HEIGHT;

    return { nodes, edges, width, height };
};

const TypeFactorTree = ({
    onClick,
    onPrevious,
    onAnswerChange,
    questionPaper,
    activeQuestionIndex,
    topic,
    grade,
    timeTakeRef,
    // New props for reuse
    treeDataProp,
    userAnswersProp,
    readOnly = false
}) => {
    const [answers, setAnswers] = useState({});

    // Determine source of data
    // If treeDataProp is provided, use it (Reusable mode)
    // Else use questionPaper (Quiz mode)
    const currentQuestion = treeDataProp ? { tree: treeDataProp } : (questionPaper ? questionPaper[activeQuestionIndex] : null);

    // Clone tree data
    // If treeDataProp is passed, we assume it's stable or memoize outside. But safely clone here too.
    const treeData = useMemo(() =>
        currentQuestion?.tree ? JSON.parse(JSON.stringify(currentQuestion.tree)) : null,
        [currentQuestion]);

    const layout = useMemo(() => calculateTreeLayout(treeData), [treeData]);

    // Sync answers
    useEffect(() => {
        if (userAnswersProp) {
            setAnswers(userAnswersProp);
        } else if (currentQuestion?.userAnswer) {
            try {
                const stored = JSON.parse(currentQuestion.userAnswer);
                setAnswers(stored || {});
            } catch (e) {
                setAnswers({});
            }
        } else {
            setAnswers({});
        }
    }, [userAnswersProp, currentQuestion]);

    const handleInputChange = (nodeId, value) => {
        if (readOnly) return;
        if (value && !/^\d*$/.test(value)) return;
        const newAnswers = { ...answers, [nodeId]: value };
        setAnswers(newAnswers);
        if (onAnswerChange) {
            onAnswerChange(JSON.stringify(newAnswers));
        }
    };

    const handleSubmit = () => {
        if (onClick) {
            onClick(JSON.stringify(answers), timeTakeRef?.current);
        }
    };

    const showNavigation = !readOnly && questionPaper;

    const isLastQuestion = questionPaper && activeQuestionIndex === questionPaper.length - 1;

    return (
        <div className={Styles.quizContainer}>
            {/* Header only if part of quiz/paper context */}
            {questionPaper && (
                <div className={Styles.header}>
                    <div className={Styles.questionNumber}>{activeQuestionIndex + 1}</div>
                    <div className={Styles.topicTitle}>{topic}</div>
                </div>
            )}

            {currentQuestion?.question && readOnly === false && (
                <div className={Styles.questionText}>
                    <MathRenderer content={currentQuestion.question} />
                </div>
            )}

            <div className={Styles.treeScrollContainer}>
                <div className={Styles.treeCanvas} style={{ width: layout.width, height: layout.height }}>
                    <svg className={Styles.svgLayer} width={layout.width} height={layout.height}>
                        {layout.edges.map(e => (
                            <line
                                key={e.key}
                                x1={e.x1}
                                y1={e.y1}
                                x2={e.x2}
                                y2={e.y2}
                                className={Styles.connectorLine}
                            />
                        ))}
                    </svg>

                    {layout.nodes.map(node => {
                        const isInput = node.isInput;
                        const hasChildren = node.children && node.children.length > 0;
                        const value = answers[node.id] !== undefined ? answers[node.id] : "";

                        const nodeClass = hasChildren ? Styles.compositeNode : Styles.primeNode;

                        // Add visual indicator for user-entered values in report view
                        const userEnteredStyle = readOnly && isInput ? {
                            border: '2px dashed #3b82f6',
                            backgroundColor: '#eff6ff',
                            fontWeight: '600'
                        } : {};

                        return (
                            <div
                                key={node.id}
                                className={`${Styles.nodeAbsolute} ${nodeClass}`}
                                style={{ left: node._x, top: node._y, ...userEnteredStyle }}
                            >
                                {isInput ? (
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className={Styles.inputField}
                                        value={value}
                                        onChange={(e) => handleInputChange(node.id, e.target.value)}
                                        autoComplete="off"
                                        readOnly={readOnly}
                                        style={{
                                            cursor: readOnly ? 'default' : 'text',
                                            ...(readOnly ? { backgroundColor: 'transparent', fontWeight: '600' } : {})
                                        }}
                                    />
                                ) : (
                                    <span className={Styles.staticText}>{node.val}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>



            {showNavigation && (
                <div className={Styles.navigationContainer}>
                    <div className={Styles.leftButtons}>
                        {activeQuestionIndex > 0 && (
                            <Button
                                onClick={onPrevious}
                                size="large"
                                startIcon={<ArrowLeft />}
                                className={Styles.previousButton}
                            >
                                Previous
                            </Button>
                        )}
                    </div>
                    <Button
                        onClick={handleSubmit}
                        size="large"
                        endIcon={isLastQuestion ? <Check /> : <ArrowRight />}
                        className={isLastQuestion ? Styles.submitButton : Styles.nextButton}
                    >
                        {isLastQuestion ? 'Submit' : 'Next'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default TypeFactorTree;
