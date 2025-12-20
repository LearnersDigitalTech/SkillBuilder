'use client';
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Typography, IconButton, Grid, Paper, Stack, Chip, Divider, InputAdornment } from '@mui/material';
import { Plus, Trash2, Save, Calendar, Check, X, MoveVertical, Image as ImageIcon } from 'lucide-react';
import { ref, set, get } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';

const PUZZLE_TYPES = [
    { value: 'MCQ', label: 'Multiple Choice' },
    { value: 'TEXT', label: 'Text / Numerical Answer' },
    { value: 'MATCH', label: 'Match the Following' },
    { value: 'FILL_BLANK', label: 'Fill in the Blanks' },
    { value: 'ORDER', label: 'Reorder / Sequence' }
];

const PuzzleManager = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [puzzle, setPuzzle] = useState({
        type: 'MCQ',
        question: '',
        imageUrl: '',
        options: ['', '', '', ''],
        correctAnswer: '', // For MCQ (index/value), TEXT (string)
        pairs: [{ left: '', right: '' }, { left: '', right: '' }], // For MATCH
        blanks: [], // For FILL_BLANK (auto-generated from question?) -> actually simpler to just have "answer" field and instructions
        order: [] // For ORDER
    });

    // Load existing puzzle for date
    useEffect(() => {
        const loadPuzzle = async () => {
            setLoading(true);
            try {
                const puzzleRef = ref(firebaseDatabase, `NMD_2025/Puzzles/${selectedDate}`);
                const snapshot = await get(puzzleRef);
                if (snapshot.exists()) {
                    setPuzzle({
                        type: 'MCQ',
                        question: '',
                        imageUrl: '',
                        options: ['', '', '', ''],
                        pairs: [{ left: '', right: '' }, { left: '', right: '' }],
                        ...snapshot.val()
                    });
                } else {
                    // Reset to default
                    setPuzzle({
                        type: 'MCQ',
                        question: '',
                        imageUrl: '',
                        options: ['', '', '', ''],
                        correctAnswer: '',
                        pairs: [{ left: '', right: '' }, { left: '', right: '' }],
                        blanks: [],
                        order: []
                    });
                }
            } catch (error) {
                console.error("Error loading puzzle:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPuzzle();
    }, [selectedDate]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const puzzleRef = ref(firebaseDatabase, `NMD_2025/Puzzles/${selectedDate}`);
            await set(puzzleRef, {
                ...puzzle,
                updatedAt: new Date().toISOString()
            });
            alert('Puzzle saved successfully!');
        } catch (error) {
            console.error("Error saving puzzle:", error);
            alert('Failed to save puzzle.');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionChange = (idx, value) => {
        const newOptions = [...puzzle.options];
        newOptions[idx] = value;
        setPuzzle({ ...puzzle, options: newOptions });
    };

    const addOption = () => {
        setPuzzle({ ...puzzle, options: [...puzzle.options, ''] });
    };

    const removeOption = (idx) => {
        const newOptions = puzzle.options.filter((_, i) => i !== idx);
        setPuzzle({ ...puzzle, options: newOptions });
    };

    const handlePairChange = (idx, field, value) => {
        const newPairs = [...puzzle.pairs];
        newPairs[idx][field] = value;
        setPuzzle({ ...puzzle, pairs: newPairs });
    };

    const addPair = () => {
        setPuzzle({ ...puzzle, pairs: [...puzzle.pairs, { left: '', right: '' }] });
    };

    const removePair = (idx) => {
        const newPairs = puzzle.pairs.filter((_, i) => i !== idx);
        setPuzzle({ ...puzzle, pairs: newPairs });
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h5" fontWeight="bold" color="text.primary">
                        Puzzle of the Day Manager
                    </Typography>
                    <TextField
                        type="date"
                        size="small"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        sx={{ width: 200 }}
                    />
                </Box>

                <Stack spacing={3}>
                    {/* TYPE SELECTION */}
                    <TextField
                        select
                        label="Puzzle Type"
                        value={puzzle.type}
                        onChange={(e) => setPuzzle({ ...puzzle, type: e.target.value })}
                        fullWidth
                    >
                        {PUZZLE_TYPES.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* QUESTION & IMAGE */}
                    <TextField
                        label="Question / Instructions"
                        multiline
                        rows={3}
                        value={puzzle.question}
                        onChange={(e) => setPuzzle({ ...puzzle, question: e.target.value })}
                        fullWidth
                        placeholder="Enter the main question or instructions here..."
                    />

                    <TextField
                        label="Image URL (Optional)"
                        value={puzzle.imageUrl}
                        onChange={(e) => setPuzzle({ ...puzzle, imageUrl: e.target.value })}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <ImageIcon size={20} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    {puzzle.imageUrl && (
                        <Box sx={{ mt: 1, borderRadius: 2, overflow: 'hidden', maxHeight: 200, maxWidth: '100%' }}>
                            <img src={puzzle.imageUrl} alt="Preview" style={{ height: '100%', objectFit: 'contain' }} />
                        </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* DYNAMIC CONTENT BASED ON TYPE */}
                    {puzzle.type === 'MCQ' && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">Options (Select the correct one)</Typography>
                            <Stack spacing={2}>
                                {puzzle.options.map((opt, idx) => (
                                    <Box key={idx} display="flex" gap={2} alignItems="center">
                                        <Button
                                            variant={puzzle.correctAnswer === opt && opt !== '' ? "contained" : "outlined"}
                                            onClick={() => setPuzzle({ ...puzzle, correctAnswer: opt })}
                                            color={puzzle.correctAnswer === opt ? "success" : "primary"}
                                            sx={{ minWidth: 40, p: 1 }}
                                        >
                                            {puzzle.correctAnswer === opt ? <Check size={20} /> : String.fromCharCode(65 + idx)}
                                        </Button>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={opt}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            placeholder={`Option ${idx + 1}`}
                                        />
                                        <IconButton onClick={() => removeOption(idx)} color="error" size="small">
                                            <Trash2 size={18} />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button startIcon={<Plus size={18} />} onClick={addOption} variant="text" sx={{ alignSelf: 'start' }}>
                                    Add Option
                                </Button>
                            </Stack>
                        </Box>
                    )}

                    {(puzzle.type === 'TEXT' || puzzle.type === 'FILL_BLANK') && (
                        <Box>
                            <TextField
                                label="Correct Answer"
                                value={puzzle.correctAnswer}
                                onChange={(e) => setPuzzle({ ...puzzle, correctAnswer: e.target.value })}
                                fullWidth
                                helperText="For text answers, this will be matched case-insensitively. For Fill in Blanks, if there are multiple blanks, separate answers with commas (e.g., 'cat, dog'). "
                            />
                        </Box>
                    )}

                    {puzzle.type === 'MATCH' && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">Matching Pairs</Typography>
                            <Stack spacing={2}>
                                {puzzle.pairs.map((pair, idx) => (
                                    <Box key={idx} display="flex" gap={2} alignItems="center">
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={pair.left}
                                            onChange={(e) => handlePairChange(idx, 'left', e.target.value)}
                                            placeholder="Left Item"
                                        />
                                        <MoveVertical size={20} color="#94a3b8" />
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={pair.right}
                                            onChange={(e) => handlePairChange(idx, 'right', e.target.value)}
                                            placeholder="Right Item"
                                        />
                                        <IconButton onClick={() => removePair(idx)} color="error" size="small">
                                            <Trash2 size={18} />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button startIcon={<Plus size={18} />} onClick={addPair} variant="text" sx={{ alignSelf: 'start' }}>
                                    Add Pair
                                </Button>
                            </Stack>
                        </Box>
                    )}

                    {puzzle.type === 'ORDER' && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">Correct Sequence (Top to Bottom)</Typography>
                            <Stack spacing={2}>
                                {puzzle.options.map((opt, idx) => (
                                    <Box key={idx} display="flex" gap={2} alignItems="center">
                                        <Chip label={idx + 1} size="small" />
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={opt}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            placeholder={`Item ${idx + 1}`}
                                        />
                                        <IconButton onClick={() => removeOption(idx)} color="error" size="small">
                                            <Trash2 size={18} />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button startIcon={<Plus size={18} />} onClick={addOption} variant="text" sx={{ alignSelf: 'start' }}>
                                    Add Item
                                </Button>
                            </Stack>
                        </Box>
                    )}

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={loading ? null : <Save />}
                        onClick={handleSave}
                        disabled={loading}
                        sx={{ mt: 4, py: 1.5, fontWeight: 'bold' }}
                    >
                        {loading ? 'Saving...' : 'Save Puzzle'}
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
};

export default PuzzleManager;
