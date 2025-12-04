import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Button, IconButton, Typography, Box } from '@mui/material';
import { Grid, X } from 'lucide-react';
import Styles from './QuestionPalette.module.css';

const QuestionPalette = ({ questions, activeQuestionIndex, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const gridRef = useRef(null);

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
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
                    const isCompleted = q.userAnswer !== null && q.userAnswer !== undefined && q.userAnswer !== "";
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
        if (!gridRef.current) return;
        const button = gridRef.current.querySelector(`[data-index="${activeQuestionIndex}"]`);
        if (button && typeof button.scrollIntoView === 'function') {
            button.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    }, [activeQuestionIndex]);

    return (
        <>
            {/* Desktop View: Expanded Palette */}
            <div className={Styles.desktopPalette}>
                <PaletteContent />
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
