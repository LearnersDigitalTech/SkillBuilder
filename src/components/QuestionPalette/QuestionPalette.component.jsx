import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Button, IconButton, Typography, Box } from '@mui/material';
import { Grid, X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Styles from './QuestionPalette.module.css';

const QuestionPalette = ({
    questions,
    activeQuestionIndex,
    onSelect,
    onPrevious,
    onNext,
    isLastQuestion
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const gridRef = useRef(null);

    const toggleDrawer = (open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setIsOpen(open);
    };

    const PaletteContent = ({ onClose }) => (
        <>
            <div className={Styles.drawerHeader}>
                <Typography variant="h6" fontWeight="bold">Question Palette</Typography>
                {onClose && (
                    <IconButton onClick={onClose}>
                        <X size={24} />
                    </IconButton>
                )}
            </div>

            <div className={Styles.gridContainer} ref={gridRef}>
                {questions.map((q, index) => {
                    if (!q) return null;
                    let isCompleted = q.userAnswer !== null && q.userAnswer !== undefined && q.userAnswer !== "";

                    // Logic to handle JSON strings (e.g. "{}", "[]") which should be treated as not answered
                    if (isCompleted && typeof q.userAnswer === 'string') {
                        const trimmed = q.userAnswer.trim();
                        if (trimmed === '{}' || trimmed === '[]') {
                            isCompleted = false;
                        }
                    }
                    const isActive = index === activeQuestionIndex;
                    const isMarkedForReview = q.markedForReview || false;

                    let className = Styles.gridItem;
                    if (isMarkedForReview) {
                        className += ` ${Styles.markedForReview}`;
                    } else if (isCompleted) {
                        className += ` ${Styles.completed}`;
                    }
                    if (isActive) {
                        className += ` ${Styles.active}`;
                    }

                    return (
                        <button
                            key={index}
                            className={className}
                            data-index={index}
                            onClick={() => {
                                onSelect(index);
                                if (onClose) onClose();
                            }}
                        >
                            {index + 1}
                        </button>
                    );
                })}
            </div>

            <div className={Styles.legend}>
                <div className={Styles.legendItem}>
                    <span className={`${Styles.dot} ${Styles.completed}`}></span>
                    <span>Answered</span>
                </div>
                {/* <div className={Styles.legendItem}>
                    <span className={`${Styles.dot} ${Styles.markedForReview}`}></span>
                    <span>Marked for Review</span>
                </div> */}
                <div className={Styles.legendItem}>
                    <span className={`${Styles.dot} ${Styles.active}`}></span>
                    <span>Current</span>
                </div>
                <div className={Styles.legendItem}>
                    <span className={Styles.dot}></span>
                    <span>Not Answered</span>
                </div>
            </div>
        </>
    );

    useEffect(() => {
        // Use setTimeout to ensure DOM is fully rendered
        const scrollTimer = setTimeout(() => {
            if (!gridRef.current) return;

            const button = gridRef.current.querySelector(`[data-index="${activeQuestionIndex}"]`);
            if (!button) return;

            // Try scrollIntoView first
            if (typeof button.scrollIntoView === 'function') {
                button.scrollIntoView({
                    block: 'center',
                    inline: 'nearest',
                    behavior: 'smooth'
                });
            } else {
                // Fallback: manually scroll the container
                const container = gridRef.current;
                const buttonTop = button.offsetTop;
                const buttonHeight = button.offsetHeight;
                const containerHeight = container.clientHeight;
                const scrollTop = buttonTop - (containerHeight / 2) + (buttonHeight / 2);

                container.scrollTo({
                    top: scrollTop,
                    behavior: 'smooth'
                });
            }
        }, 100); // Small delay to ensure rendering is complete

        return () => clearTimeout(scrollTimer);
    }, [activeQuestionIndex]);

    return (
        <>
            {/* Desktop View: Expanded Palette */}
            <div className={Styles.desktopPalette}>
                <PaletteContent />

                {/* Navigation Buttons for Desktop */}
                {(onPrevious || onNext) && (
                    <div className={Styles.navigationContainer}>
                        <Button
                            onClick={onPrevious}
                            disabled={activeQuestionIndex === 0}
                            startIcon={<ArrowLeft size={18} />}
                            className={Styles.navButton}
                            variant="outlined"
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={onNext}
                            endIcon={isLastQuestion ? <Check size={18} /> : <ArrowRight size={18} />}
                            className={isLastQuestion ? Styles.submitButton : Styles.nextButton}
                            variant="contained"
                        >
                            {isLastQuestion ? 'Finish' : 'Next'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Mobile View: Button + Drawer */}
            <div className={Styles.mobilePalette}>
                <Button
                    variant="contained"
                    startIcon={<Grid size={20} />}
                    onClick={toggleDrawer(true)}
                    className={Styles.paletteButton}
                    sx={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        borderColor: 'transparent',
                        borderRadius: '999px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                        py: 0.75,
                        '&:hover': {
                            backgroundColor: '#1d4ed8',
                        }
                    }}
                >
                    Questions
                </Button>

                <Drawer
                    anchor="left"
                    open={isOpen}
                    onClose={toggleDrawer(false)}
                    PaperProps={{
                        sx: { width: 320, maxWidth: '80vw' }
                    }}
                >
                    <PaletteContent onClose={toggleDrawer(false)} />
                </Drawer>
            </div>
        </>
    );
};

export default QuestionPalette;

