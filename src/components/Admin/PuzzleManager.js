'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, MenuItem, Typography, IconButton, Paper, Stack, Chip, Divider, InputAdornment, Checkbox, FormControlLabel, Accordion, AccordionSummary, AccordionDetails, Grid, Alert } from '@mui/material';
import { Plus, Trash2, Save, Check, MoveVertical, Image as ImageIcon, ChevronDown, Edit2, X, Upload } from 'lucide-react';
import { ref, set, get, remove, update } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';

const PUZZLE_TYPES = [
    { value: 'MCQ', label: 'Multiple Choice' },
    { value: 'TEXT', label: 'Text / Numerical Answer' },
    { value: 'userInput', label: 'User Input' },
    { value: 'MATCH', label: 'Match the Following' },
    { value: 'FILL_BLANK', label: 'Fill in the Blanks' },
    { value: 'ORDER', label: 'Reorder / Sequence' }
];

const ALL_GRADES = Array.from({ length: 10 }, (_, i) => i + 1); // [1, 2, ..., 10]

const PuzzleManager = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'bank'
    const [bankGrade, setBankGrade] = useState(1); // Default to Grade 1 for Bank View
    const [loading, setLoading] = useState(false);
    const [dailyPuzzles, setDailyPuzzles] = useState([]); // Array of puzzle objects
    const fileInputRef = useRef(null);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null); // ID if editing existing
    const [formPuzzle, setFormPuzzle] = useState({
        grades: [],
        type: 'MCQ',
        question: '',
        imageUrl: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        pairs: [{ left: '', right: '' }, { left: '', right: '' }],
        blanks: [],
        order: []
    });

    // Load available grades (those not assigned to other puzzles)
    const [assignedGrades, setAssignedGrades] = useState(new Set());

    // Load existing puzzles
    useEffect(() => {
        const loadPuzzles = async () => {
            setLoading(true);
            try {
                let puzzleRef;
                if (viewMode === 'bank') {
                    puzzleRef = ref(firebaseDatabase, `NMD_2025/PuzzleBank/${bankGrade}`);
                } else {
                    puzzleRef = ref(firebaseDatabase, `NMD_2025/Puzzles/${selectedDate}`);
                }

                const snapshot = await get(puzzleRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const puzzleList = Object.values(data);
                    setDailyPuzzles(puzzleList);
                } else {
                    setDailyPuzzles([]);
                }
                setIsEditing(false); // Reset form mode on date change
                setEditingId(null);
            } catch (error) {
                console.error("Error loading puzzles:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPuzzles();
    }, [selectedDate, viewMode, bankGrade]);

    // Recalculate assigned grades whenever dailyPuzzles changes
    useEffect(() => {
        const assigned = new Set();
        dailyPuzzles.forEach(p => {
            // If we are currently editing this puzzle, don't count its grades as "assigned/locked" 
            // from the perspective of the form (handled in render logic), but for global view they are assigned.
            if (p.id !== editingId) {
                (p.grades || []).forEach(g => assigned.add(g));
            }
        });
        setAssignedGrades(assigned);

        // Auto-select available grades for new form?
        if (!isEditing && !editingId) {
            // Only if we haven't manually touched the form? Simple logic: if formGrades is empty, fill with available.
            // But actually, 'useEffect' triggers on dailyPuzzles change (e.g. after save).
            // We can handle this logic in 'resetForm'.
        }
    }, [dailyPuzzles, editingId]);

    const resetForm = (puzzlesList = dailyPuzzles) => {
        // Calculate currently used grades to pre-fill remaining
        const used = new Set();
        puzzlesList.forEach(p => (p.grades || []).forEach(g => used.add(g)));

        const available = ALL_GRADES.filter(g => !used.has(g));

        setFormPuzzle({
            grades: available, // Default to all remaining grades
            type: 'MCQ',
            question: '',
            imageUrl: '',
            options: ['', '', '', ''],
            correctAnswer: '',
            pairs: [{ left: '', right: '' }, { left: '', right: '' }],
            blanks: [],
            order: []
        });
        setEditingId(null);
        setIsEditing(true); // Open form for new entry logic
    };

    const handleEditClick = (puzzle) => {
        setFormPuzzle({ ...puzzle });
        setEditingId(puzzle.id);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingId(null);
    };

    const handleSave = async () => {
        if (formPuzzle.grades.length === 0) {
            alert("Please select at least one grade.");
            return;
        }

        setLoading(true);
        try {
            const puzzleId = editingId || `puzzle_${Date.now()}`;
            const newPuzzleData = {
                ...formPuzzle,
                id: puzzleId,
                updatedAt: new Date().toISOString()
            };

            // Determine Save Path
            if (viewMode === 'bank') {
                // For Bank Mode, we save to the current Bank Grade view
                // Ideally, we should save to ALL assigned grades if multiple are selected,
                // but for simplicity in this view, we primarily manage the current bankGrade.
                // However, bulk upload duplicates to all. Let's replicate that behavior?
                // Or just save to the current view's grade for now to update IT.
                // NOTE: If user changes grades, we might need to write to other paths. 
                // Let's iterate selected grades and save/update there.

                const updates = {};
                newPuzzleData.grades.forEach(g => {
                    updates[`NMD_2025/PuzzleBank/${g}/${puzzleId}`] = newPuzzleData;
                });

                await update(ref(firebaseDatabase), updates);
            } else {
                // Daily Mode
                const puzzleRef = ref(firebaseDatabase, `NMD_2025/Puzzles/${selectedDate}/${puzzleId}`);
                await set(puzzleRef, newPuzzleData);
            }

            // Update local state optimistic
            // (Simulate fetch)
            const updatedPuzzles = editingId
                ? dailyPuzzles.map(p => p.id === editingId ? newPuzzleData : p)
                : [...dailyPuzzles, newPuzzleData];

            setDailyPuzzles(updatedPuzzles);
            alert('Puzzle saved successfully!');

            // Logic to determine if we should close form or reset
            // Simplified for now: Close form
            setIsEditing(false); // Close form
            setEditingId(null);

        } catch (error) {
            console.error("Error saving puzzle:", error);
            alert('Failed to save puzzle.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this puzzle?")) return;
        setLoading(true);
        try {
            let puzzleRef;
            if (viewMode === 'bank') {
                puzzleRef = ref(firebaseDatabase, `NMD_2025/PuzzleBank/${bankGrade}/${id}`);
            } else {
                puzzleRef = ref(firebaseDatabase, `NMD_2025/Puzzles/${selectedDate}/${id}`);
            }

            await remove(puzzleRef);
            setDailyPuzzles(prev => prev.filter(p => p.id !== id));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const handleClearBank = async () => {
        if (viewMode !== 'bank') return;
        if (!confirm(`Are you sure you want to DELETE ALL puzzles for Grade ${bankGrade}? This cannot be undone.`)) return;

        // Double confirmation
        const input = window.prompt(`Type "DELETE" to confirm clearing Grade ${bankGrade} puzzles.`);
        if (input !== "DELETE") return;

        setLoading(true);
        try {
            const bankRef = ref(firebaseDatabase, `NMD_2025/PuzzleBank/${bankGrade}`);
            await remove(bankRef);
            setDailyPuzzles([]);
            alert(`Grade ${bankGrade} Puzzle Bank has been cleared.`);
        } catch (e) {
            console.error("Error clearing bank:", e);
            alert("Failed to clear bank. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const handleClearAllBanks = async () => {
        if (viewMode !== 'bank') return;
        if (!confirm(`WARNING: This will DELETE ALL PUZZLES for ALL GRADES in the Puzzle Bank. This cannot be undone. Are you sure?`)) return;

        const input = window.prompt(`Type "DELETE ALL" to confirm wiping the ENTIRE Puzzle Bank.`);
        if (input !== "DELETE ALL") return;

        setLoading(true);
        try {
            const allBanksRef = ref(firebaseDatabase, `NMD_2025/PuzzleBank`);
            await remove(allBanksRef);
            setDailyPuzzles([]);
            alert("Entire Puzzle Bank has been cleared.");
        } catch (e) {
            console.error("Error clearing all banks:", e);
            alert("Failed to clear all banks.");
        } finally {
            setLoading(false);
        }
    };

    // --- BULK UPLOAD HANDLER ---
    const handleBulkUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if (!Array.isArray(json)) throw new Error("JSON must be an array of puzzles.");

                setLoading(true);
                let successCount = 0;
                let failCount = 0;

                const updates = {};
                // Prepare batch updates
                // We'll group by date to check if we need to refresh current view
                let needsRefresh = false;

                for (let i = 0; i < json.length; i++) {
                    const item = json[i];

                    // Simple Validation
                    if (!item.grades || !item.type || !item.question) {
                        console.warn(`Skipping invalid item at index ${i}`, item);
                        failCount++;
                        continue;
                    }

                    const puzzleId = `puzzle_${Date.now()}_${i}`;

                    const newPuzzleData = {
                        ...item,
                        id: puzzleId,
                        updatedAt: new Date().toISOString()
                    };
                    delete newPuzzleData.date; // Remove date from object if present

                    if (item.date) {
                        // Date specific logic (old behavior)
                        updates[`NMD_2025/Puzzles/${item.date}/${puzzleId}`] = newPuzzleData;
                        if (item.date === selectedDate) needsRefresh = true;
                    } else {
                        // Puzzle Bank Logic (New)
                        // Upload to each grade bank
                        if (item.grades && Array.isArray(item.grades)) {
                            item.grades.forEach(grade => {
                                // Add to bank for this grade
                                updates[`NMD_2025/PuzzleBank/${grade}/${puzzleId}`] = newPuzzleData;
                            });
                        }
                    }
                    successCount++;
                }

                if (Object.keys(updates).length > 0) {
                    await update(ref(firebaseDatabase), updates);
                    alert(`Bulk upload complete!\nSuccess: ${successCount}\nFailed: ${failCount}`);

                    // Refresh logic
                    if (json.length > 0) {
                        const firstDate = json[0].date;
                        if (firstDate) {
                            // Date based update
                            if (firstDate !== selectedDate) {
                                setSelectedDate(firstDate);
                            } else if (needsRefresh) {
                                // Reload current date
                                const puzzleRef = ref(firebaseDatabase, `NMD_2025/Puzzles/${selectedDate}`);
                                const snapshot = await get(puzzleRef);
                                setDailyPuzzles(snapshot.exists() ? Object.values(snapshot.val()) : []);
                            }
                        } else {
                            // Bank based update - just alert (or maybe switch to a Bank tab if we had one)
                            console.log("Uploaded to Puzzle Bank");
                        }
                    }
                } else {
                    alert("No valid puzzles found to upload.");
                }

            } catch (error) {
                console.error("Bulk upload error:", error);
                alert("Failed to parse JSON or upload data. Check console for details.");
            } finally {
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
            }
        };
        reader.readAsText(file);
    };


    // --- FORM HANDLERS ---
    const handleGradeToggle = (grade) => {
        const currentGrades = formPuzzle.grades || [];
        if (currentGrades.includes(grade)) {
            setFormPuzzle({ ...formPuzzle, grades: currentGrades.filter(g => g !== grade) });
        } else {
            setFormPuzzle({ ...formPuzzle, grades: [...currentGrades, grade].sort((a, b) => a - b) });
        }
    };

    const handleOptionChange = (idx, value) => {
        const newOptions = [...formPuzzle.options];
        newOptions[idx] = value;
        setFormPuzzle({ ...formPuzzle, options: newOptions });
    };
    const addOption = () => setFormPuzzle({ ...formPuzzle, options: [...formPuzzle.options, ''] });
    const removeOption = (idx) => setFormPuzzle({ ...formPuzzle, options: formPuzzle.options.filter((_, i) => i !== idx) });

    const handlePairChange = (idx, field, value) => {
        const newPairs = [...formPuzzle.pairs];
        newPairs[idx][field] = value;
        setFormPuzzle({ ...formPuzzle, pairs: newPairs });
    };
    const addPair = () => setFormPuzzle({ ...formPuzzle, pairs: [...formPuzzle.pairs, { left: '', right: '' }] });
    const removePair = (idx) => setFormPuzzle({ ...formPuzzle, pairs: formPuzzle.pairs.filter((_, i) => i !== idx) });


    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Puzzle of the Day Manager
                </Typography>
                <Box display="flex" gap={2} alignItems="center">
                    {/* View Mode Toggle */}
                    <Box display="flex" bgcolor="#f1f5f9" p={0.5} borderRadius={2}>
                        <Button
                            size="small"
                            variant={viewMode === 'daily' ? 'contained' : 'text'}
                            onClick={() => setViewMode('daily')}
                            sx={{ boxShadow: 'none', borderRadius: 1.5 }}
                        >
                            Daily
                        </Button>
                        <Button
                            size="small"
                            variant={viewMode === 'bank' ? 'contained' : 'text'}
                            onClick={() => setViewMode('bank')}
                            sx={{ boxShadow: 'none', borderRadius: 1.5 }}
                        >
                            Bank
                        </Button>
                    </Box>

                    {/* Date Picker (Only for Daily) */}
                    {viewMode === 'daily' && (
                        <TextField
                            type="date"
                            size="small"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            sx={{ width: 160 }}
                        />
                    )}

                    {/* Grade Selector (Only for Bank) */}
                    {viewMode === 'bank' && (
                        <TextField
                            select
                            size="small"
                            value={bankGrade}
                            onChange={(e) => setBankGrade(e.target.value)}
                            label="Grade"
                            sx={{ width: 120 }}
                        >
                            {ALL_GRADES.map(g => (
                                <MenuItem key={g} value={g}>Grade {g}</MenuItem>
                            ))}
                        </TextField>
                    )}

                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleBulkUpload}
                    />
                    <Button
                        startIcon={<Upload size={18} />}
                        variant="outlined"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        size="small"
                        sx={{ ml: 1 }}
                    >
                        Bulk Upload
                    </Button>

                    {viewMode === 'bank' && (
                        <>
                            {dailyPuzzles.length > 0 && (
                                <Button
                                    startIcon={<Trash2 size={18} />}
                                    variant="outlined"
                                    color="error"
                                    onClick={handleClearBank}
                                    disabled={loading}
                                    size="small"
                                    sx={{ ml: 1, borderColor: '#fecaca', color: '#dc2626', '&:hover': { borderColor: '#dc2626', bgcolor: '#fef2f2' } }}
                                >
                                    Clear Grade {bankGrade}
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleClearAllBanks}
                                disabled={loading}
                                size="small"
                                sx={{ ml: 1, borderColor: '#7f1d1d', color: '#7f1d1d', bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}
                            >
                                Clear ALL Grades
                            </Button>
                        </>
                    )}
                </Box>
            </Box>

            {/* LIST OF EXISTING PUZZLES */}
            <Stack spacing={2} mb={6}>
                {dailyPuzzles.map((p) => (
                    <Paper key={p.id} elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box display="flex" flexDirection="column" gap={0.5} flex={1}>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {(p.grades || []).map(g => (
                                    <Chip key={g} label={`Grade ${g}`} size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 'bold' }} />
                                ))}
                            </Box>
                            <Typography
                                variant="subtitle2"
                                // noWrap // Removing noWrap to see full question if needed, or keep it
                                sx={{ maxWidth: 600 }}
                                dangerouslySetInnerHTML={{ __html: p.question }}
                            />
                        </Box>
                        <Chip label={p.type} size="small" variant="outlined" />
                        <Box display="flex" gap={1}>
                            <IconButton onClick={(e) => { e.stopPropagation(); handleEditClick(p); }} size="small" sx={{ color: '#2563eb', bgcolor: '#eff6ff' }}>
                                <Edit2 size={16} />
                            </IconButton>
                            <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} size="small" sx={{ color: '#ef4444', bgcolor: '#fef2f2' }}>
                                <Trash2 size={16} />
                            </IconButton>
                        </Box>
                    </Paper>
                ))}

                {dailyPuzzles.length === 0 && !isEditing && (
                    <Box sx={{ p: 4, textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: 4 }}>
                        <Typography>No puzzles found {viewMode === 'daily' ? 'for this date' : `in Grade ${bankGrade} Bank`}.</Typography>
                        {viewMode === 'daily' && (
                            <Button startIcon={<Plus />} variant="contained" sx={{ mt: 2 }} onClick={() => resetForm([])}>Create First Puzzle</Button>
                        )}
                        {viewMode === 'bank' && (
                            <Typography variant="caption" display="block" mt={1}>Upload puzzles via Bulk Upload to populate the bank.</Typography>
                        )}
                    </Box>
                )}

                {dailyPuzzles.length > 0 && !isEditing && (assignedGrades.size < ALL_GRADES.length) && (
                    <Button
                        startIcon={<Plus />}
                        variant="outlined"
                        fullWidth
                        sx={{ py: 2, borderStyle: 'dashed' }}
                        onClick={() => resetForm(dailyPuzzles)}
                    >
                        Create Puzzle for Remaining Grades
                    </Button>
                )}
            </Stack>


            {/* EDIT/CREATE FORM */}
            {isEditing && (
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '2px solid #2563eb', bgcolor: '#ffff' }} id="puzzle-form">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6" fontWeight="bold" color="#2563eb">
                            {editingId ? 'Edit Puzzle' : 'New Puzzle'}
                        </Typography>
                        <IconButton onClick={handleCancelEdit} size="small"><X /></IconButton>
                    </Box>

                    {/* GRADE SELECTION */}
                    <Box mb={3} p={2} bgcolor="#f8fafc" borderRadius={2}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Select Grades</Typography>
                        <Grid container spacing={1}>
                            {ALL_GRADES.map(grade => {
                                // Disabled if assigned to another puzzle AND not part of current form
                                const isAssignedElsewhere = assignedGrades.has(grade) && !(formPuzzle.grades || []).includes(grade);
                                return (
                                    <Grid item key={grade}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={(formPuzzle.grades || []).includes(grade)}
                                                    onChange={() => handleGradeToggle(grade)}
                                                    disabled={isAssignedElsewhere}
                                                    size="small"
                                                />
                                            }
                                            label={<Typography variant="body2" color={isAssignedElsewhere ? 'text.disabled' : 'text.primary'}>Grade {grade}</Typography>}
                                        />
                                    </Grid>
                                )
                            })}
                        </Grid>
                        {assignedGrades.size === ALL_GRADES.length && !editingId && (
                            <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                                All grades are already assigned to other puzzles. Uncheck grades from existing puzzles to free them up.
                            </Typography>
                        )}
                    </Box>

                    <Stack spacing={3}>
                        <TextField
                            select
                            label="Puzzle Type"
                            value={formPuzzle.type}
                            onChange={(e) => setFormPuzzle({ ...formPuzzle, type: e.target.value })}
                            fullWidth
                        >
                            {PUZZLE_TYPES.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Question / Instructions"
                            multiline
                            rows={3}
                            value={formPuzzle.question}
                            onChange={(e) => setFormPuzzle({ ...formPuzzle, question: e.target.value })}
                            fullWidth
                            placeholder="Enter the main question..."
                            helperText="Supports basic HTML (e.g., <b>bold</b>, <br> line breaks, <i>italics</i>)"
                        />

                        <TextField
                            label="Image URL (Optional)"
                            value={formPuzzle.imageUrl}
                            onChange={(e) => setFormPuzzle({ ...formPuzzle, imageUrl: e.target.value })}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start"><ImageIcon size={20} /></InputAdornment>
                                ),
                            }}
                        />
                        {formPuzzle.imageUrl && (
                            <Box sx={{ mt: 1, borderRadius: 2, overflow: 'hidden', maxHeight: 200, maxWidth: '100%' }}>
                                <img src={formPuzzle.imageUrl} alt="Preview" style={{ height: '100%', objectFit: 'contain' }} />
                            </Box>
                        )}

                        <Divider />

                        {/* DYNAMIC FIELDS (MCQ, MATCH, etc.) - Same as before, just using formPuzzle */}
                        {formPuzzle.type === 'MCQ' && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">Options</Typography>
                                <Stack spacing={2}>
                                    {formPuzzle.options.map((opt, idx) => (
                                        <Box key={idx} display="flex" gap={2} alignItems="center">
                                            <Button
                                                variant={formPuzzle.correctAnswer === opt && opt !== '' ? "contained" : "outlined"}
                                                onClick={() => setFormPuzzle({ ...formPuzzle, correctAnswer: opt })}
                                                color={formPuzzle.correctAnswer === opt ? "success" : "primary"}
                                                sx={{ minWidth: 40, p: 1 }}
                                            >
                                                {formPuzzle.correctAnswer === opt ? <Check size={20} /> : String.fromCharCode(65 + idx)}
                                            </Button>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={opt}
                                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                placeholder={`Option ${idx + 1}`}
                                            />
                                            <IconButton onClick={() => removeOption(idx)} color="error" size="small"><Trash2 size={18} /></IconButton>
                                        </Box>
                                    ))}
                                    <Button startIcon={<Plus size={18} />} onClick={addOption} variant="text" sx={{ alignSelf: 'start' }}>Add Option</Button>
                                </Stack>
                            </Box>
                        )}

                        {(formPuzzle.type === 'TEXT' || formPuzzle.type === 'FILL_BLANK' || formPuzzle.type === 'userInput') && (
                            <TextField
                                label="Correct Answer"
                                value={formPuzzle.correctAnswer}
                                onChange={(e) => setFormPuzzle({ ...formPuzzle, correctAnswer: e.target.value })}
                                fullWidth
                                helperText="Comma separated valid answers."
                            />
                        )}

                        {formPuzzle.type === 'MATCH' && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">Pairs</Typography>
                                <Stack spacing={2}>
                                    {formPuzzle.pairs.map((pair, idx) => (
                                        <Box key={idx} display="flex" gap={2} alignItems="center">
                                            <TextField fullWidth size="small" value={pair.left} onChange={(e) => handlePairChange(idx, 'left', e.target.value)} placeholder="Left" />
                                            <MoveVertical size={20} color="#94a3b8" />
                                            <TextField fullWidth size="small" value={pair.right} onChange={(e) => handlePairChange(idx, 'right', e.target.value)} placeholder="Right" />
                                            <IconButton onClick={() => removePair(idx)} color="error" size="small"><Trash2 size={18} /></IconButton>
                                        </Box>
                                    ))}
                                    <Button startIcon={<Plus size={18} />} onClick={addPair} variant="text" sx={{ alignSelf: 'start' }}>Add Pair</Button>
                                </Stack>
                            </Box>
                        )}

                        {formPuzzle.type === 'ORDER' && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">Change Correct Sequence</Typography>
                                <Stack spacing={2}>
                                    {formPuzzle.options.map((opt, idx) => (
                                        <Box key={idx} display="flex" gap={2} alignItems="center">
                                            <Chip label={idx + 1} size="small" />
                                            <TextField fullWidth size="small" value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)} placeholder={`Item ${idx + 1}`} />
                                            <IconButton onClick={() => removeOption(idx)} color="error" size="small"><Trash2 size={18} /></IconButton>
                                        </Box>
                                    ))}
                                    <Button startIcon={<Plus size={18} />} onClick={addOption} variant="text" sx={{ alignSelf: 'start' }}>Add Item</Button>
                                </Stack>
                            </Box>
                        )}

                        <Box display="flex" gap={2} mt={2}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<Save />}
                                onClick={handleSave}
                                disabled={loading}
                                fullWidth
                                sx={{ py: 1.5, fontWeight: 'bold' }}
                            >
                                {loading ? 'Saving...' : 'Save Puzzle'}
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={handleCancelEdit}
                                disabled={loading}
                                fullWidth
                                sx={{ py: 1.5, fontWeight: 'bold' }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Stack>
                </Paper>
            )}
        </Box>
    );
};

export default PuzzleManager;
