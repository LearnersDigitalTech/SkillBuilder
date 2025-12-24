'use client';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, IconButton, Typography, Box, Button, TextField, Grid } from '@mui/material';
import { X, CheckCircle, RefreshCw, Trophy } from 'lucide-react';
import { ref, set } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';
// Trying import, if fails I'll use a fallback or remove it. 
// Actually, since I can't install, I should not import 'canvas-confetti'. 
// I will simulate confetti or use a simple implementation below.

// Canvas-based Confetti Implementation
const triggerConfetti = () => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '9999';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ec4899', '#a855f7', '#06b6d4'];

    const createParticle = (x, y) => ({
        x, y,
        vx: (Math.random() - 0.5) * 30, // Horizontal spread
        vy: (Math.random() - 1) * 30 - 10, // Upward explosive force
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        gravity: 0.8,
        drag: 0.95,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
    });

    // Create explosion from center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < 200; i++) {
        particles.push(createParticle(centerX, centerY));
    }

    let animationId;
    const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let activeParticles = 0;

        particles.forEach(p => {
            if (p.size <= 0.1) return;
            activeParticles++;

            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.size *= 0.96;
            p.rotation += p.rotationSpeed;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });

        if (activeParticles > 0) {
            animationId = requestAnimationFrame(render);
        } else {
            cancelAnimationFrame(animationId);
            if (document.body.contains(canvas)) {
                document.body.removeChild(canvas);
            }
        }
    };

    render();
};

const PuzzleModal = ({ open, onClose, puzzle, user, learnerId, onComplete }) => {
    const [answer, setAnswer] = useState(''); // Text/MCQ
    const [matchPairs, setMatchPairs] = useState({}); // { left: right, ... }
    const [orderList, setOrderList] = useState([]); // Array of strings
    const [selectedLeft, setSelectedLeft] = useState(null); // For Match
    const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
    const [attempts, setAttempts] = useState(0);

    // Initialize state when puzzle changes
    useEffect(() => {
        if (puzzle) {
            setAnswer('');
            setMatchPairs({});
            setFeedback(null);
            setAttempts(0);

            if (puzzle.type === 'ORDER' && puzzle.options) {
                // Shuffle for Order type
                const shuffled = [...puzzle.options].sort(() => Math.random() - 0.5);
                setOrderList(shuffled);
            }
        }
    }, [puzzle, open]);

    const handleSubmit = async () => {
        let isCorrect = false;

        // Validation Logic
        if (puzzle.type === 'MCQ') {
            isCorrect = answer === puzzle.correctAnswer;
        } else if (puzzle.type === 'TEXT' || puzzle.type === 'FILL_BLANK' || puzzle.type === 'userInput') {
            const possibleAnswers = puzzle.correctAnswer.split(',').map(s => s.trim().toLowerCase());
            isCorrect = possibleAnswers.includes(answer.toLowerCase().trim());
        } else if (puzzle.type === 'MATCH') {
            // Check if all pairs match
            isCorrect = puzzle.pairs.every(p => matchPairs[p.left] === p.right);
            // Ensure all pairs are matched
            if (Object.keys(matchPairs).length !== puzzle.pairs.length) isCorrect = false;
        } else if (puzzle.type === 'ORDER') {
            isCorrect = JSON.stringify(orderList) === JSON.stringify(puzzle.options);
        }

        if (isCorrect) {
            setFeedback('correct');
            triggerConfetti();

            // Log success to Firebase
            if (learnerId) {
                try {
                    // New Random Bank Logic: Save by Puzzle ID, not Date
                    const completionRef = ref(firebaseDatabase, `NMD_2025/UserCompletions/${learnerId}/${puzzle.id}`);
                    await set(completionRef, true);

                    // Also save "Last Completion Date" to enforce 1 puzzle per day
                    const today = new Date().toLocaleDateString('en-CA');
                    const lastCompletionRef = ref(firebaseDatabase, `NMD_2025/UserLastCompletion/${learnerId}`);
                    await set(lastCompletionRef, today);

                    // Delay slightly to let animation play, then trigger completion handler
                    setTimeout(() => {
                        if (onComplete) onComplete();
                    }, 2000);
                } catch (e) { console.error("Error saving completion:", e) }
            }
        } else {
            setFeedback('incorrect');
            setAttempts(prev => prev + 1);
        }
    };

    const handleMatchClick = (side, value) => {
        if (side === 'left') {
            setSelectedLeft(value);
        } else {
            if (selectedLeft) {
                setMatchPairs({ ...matchPairs, [selectedLeft]: value });
                setSelectedLeft(null);
            }
        }
    };

    const handleOrderSwap = (fromIdx, toIdx) => {
        const newList = [...orderList];
        const temp = newList[fromIdx];
        newList[fromIdx] = newList[toIdx];
        newList[toIdx] = temp;
        setOrderList(newList);
    };

    if (!puzzle) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    minHeight: '60vh',
                    backgroundImage: 'radial-gradient(circle at top right, #f3f4f6 0%, #ffffff 100%)'
                }
            }}
        >
            <DialogContent sx={{ p: 4, display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ p: 1, bgcolor: '#e0e7ff', borderRadius: '50%' }}>
                            <Trophy size={20} color="#4f46e5" />
                        </Box>
                        <Typography variant="h6" fontWeight="bold" color="#374151">
                            Puzzle of the Day
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small" sx={{ bgcolor: '#f3f4f6' }}>
                        <X size={20} />
                    </IconButton>
                </Box>

                {/* QUESTION AREA */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        align="center"
                        sx={{ color: '#111827' }}
                        dangerouslySetInnerHTML={{ __html: puzzle.question }}
                    />

                    {puzzle.imageUrl && (
                        <Box sx={{ borderRadius: 3, overflow: 'hidden', maxHeight: 300, mx: 'auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            <img src={puzzle.imageUrl} alt="Puzzle" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        </Box>
                    )}

                    {/* INTERACTION AREA */}
                    <Box sx={{ mt: 2 }}>
                        {/* MCQ */}
                        {puzzle.type === 'MCQ' && (
                            <Grid container spacing={2}>
                                {puzzle.options.map((opt, idx) => (
                                    <Grid item xs={12} sm={6} key={idx}>
                                        <Button
                                            variant={answer === opt ? 'contained' : 'outlined'}
                                            fullWidth
                                            onClick={() => { setAnswer(opt); setFeedback(null); }}
                                            sx={{
                                                py: 2,
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontSize: '1.1rem',
                                                borderColor: answer === opt ? 'primary.main' : '#e5e7eb',
                                                bgcolor: answer === opt ? 'primary.main' : 'white',
                                                color: answer === opt ? 'white' : '#374151',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    bgcolor: answer === opt ? 'primary.dark' : '#f9fafb'
                                                }
                                            }}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: opt }} />
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        {/* TEXT / FILL BLANK / USER INPUT */}
                        {(puzzle.type === 'TEXT' || puzzle.type === 'FILL_BLANK' || puzzle.type === 'userInput') && (
                            <TextField
                                fullWidth
                                placeholder="Type your answer here..."
                                value={answer}
                                onChange={(e) => { setAnswer(e.target.value); setFeedback(null); }}
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        fontSize: '1.2rem',
                                        bgcolor: 'white'
                                    }
                                }}
                            />
                        )}

                        {/* MATCH */}
                        {puzzle.type === 'MATCH' && (
                            <Grid container spacing={4}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" gutterBottom align="center" sx={{ color: '#6b7280' }}>Items</Typography>
                                    <Box display="flex" flexDirection="column" gap={2}>
                                        {puzzle.pairs.map((p, idx) => (
                                            <Button
                                                key={idx}
                                                variant={selectedLeft === p.left ? "contained" : "outlined"}
                                                onClick={() => handleMatchClick('left', p.left)}
                                                disabled={!!matchPairs[p.left]} // Disable if already matched
                                                sx={{
                                                    justifyContent: 'flex-start',
                                                    py: 1.5,
                                                    bgcolor: !!matchPairs[p.left] ? '#f0fdf4' : (selectedLeft === p.left ? 'primary.main' : 'white'),
                                                    borderColor: !!matchPairs[p.left] ? '#86efac' : '#e5e7eb',
                                                    color: !!matchPairs[p.left] ? '#15803d' : (selectedLeft === p.left ? 'white' : '#374151')
                                                }}
                                            >
                                                {p.left}
                                                {!!matchPairs[p.left] && <CheckCircle size={16} style={{ marginLeft: 'auto' }} />}
                                            </Button>
                                        ))}
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" gutterBottom align="center" sx={{ color: '#6b7280' }}>Match With</Typography>
                                    <Box display="flex" flexDirection="column" gap={2}>
                                        {puzzle.pairs.map((p, idx) => { // Render right side options (shuffled conceptually, but here just list them)
                                            // Actually should shuffle right side visually?
                                            // For simplicity, we just iterate pairs but we need to find the right value.
                                            // Ideally, pass matched status.
                                            const isMatched = Object.values(matchPairs).includes(p.right);
                                            return (
                                                <Button
                                                    key={idx}
                                                    variant="outlined"
                                                    onClick={() => handleMatchClick('right', p.right)}
                                                    disabled={isMatched}
                                                    sx={{
                                                        justifyContent: 'flex-start',
                                                        py: 1.5,
                                                        bgcolor: isMatched ? '#f0fdf4' : 'white',
                                                        borderColor: isMatched ? '#86efac' : '#e5e7eb',
                                                        color: isMatched ? '#15803d' : '#374151'
                                                    }}
                                                >
                                                    {p.right}
                                                </Button>
                                            )
                                        })}
                                    </Box>
                                </Grid>
                            </Grid>
                        )}

                        {/* ORDER (Simple Swap) */}
                        {puzzle.type === 'ORDER' && (
                            <Box display="flex" flexDirection="column" gap={2}>
                                {orderList.map((item, idx) => (
                                    <Box key={idx} display="flex" alignItems="center" gap={2}>
                                        <Typography fontWeight="bold" color="text.secondary" sx={{ minWidth: 20 }}>{idx + 1}.</Typography>
                                        <Box
                                            sx={{
                                                flex: 1,
                                                p: 2,
                                                bgcolor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: 2,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            {item}
                                            <Box>
                                                {idx > 0 && (
                                                    <IconButton size="small" onClick={() => handleOrderSwap(idx, idx - 1)}>↑</IconButton>
                                                )}
                                                {idx < orderList.length - 1 && (
                                                    <IconButton size="small" onClick={() => handleOrderSwap(idx, idx + 1)}>↓</IconButton>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* FEEDBACK & ACTIONS */}
                <Box mt={4} display="flex" flexDirection="column" alignItems="center" gap={2}>
                    {feedback === 'correct' ? (
                        <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, width: '100%', textAlign: 'center', border: '1px solid #86efac' }}>
                            <Typography variant="h6" color="#166534" fontWeight="bold">
                                🎉 Brilliant! That's correct!
                            </Typography>
                        </Box>
                    ) : feedback === 'incorrect' ? (
                        <Box sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: 2, width: '100%', textAlign: 'center', border: '1px solid #fecaca' }}>
                            <Typography variant="subtitle1" color="#991b1b" fontWeight="bold">
                                Not quite right. Try again!
                            </Typography>
                        </Box>
                    ) : null}

                    {feedback !== 'correct' && (
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={handleSubmit}
                            sx={{
                                py: 1.8,
                                borderRadius: 3,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                background: 'linear-gradient(to right, #4f46e5, #6366f1)',
                                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                            }}
                        >
                            Submit Answer
                        </Button>
                    )}

                    {feedback === 'correct' && (
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            sx={{ borderRadius: 3 }}
                        >
                            Close Puzzle
                        </Button>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default PuzzleModal;
