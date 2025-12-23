'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Skeleton } from '@mui/material';
import { Brain, ArrowRight, Lock } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';
import PuzzleModal from './PuzzleModal';

const PuzzleCard = ({ user, activeChild, activeChildId }) => {
    const [puzzle, setPuzzle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    // Construct unique Learner ID
    const getLearnerId = () => {
        let baseId = user?.uid || user?.phoneNumber || 'anonymous';
        // Sanitize baseId if it is email (replace . with _) - naive check but safe to do
        baseId = baseId.replace(/\./g, '_');

        if (activeChildId) {
            return `${baseId}_${activeChildId}`;
        }
        return baseId;
    };

    const learnerId = getLearnerId();

    useEffect(() => {
        const fetchPuzzleAndStatus = async () => {
            const today = new Date().toLocaleDateString('en-CA');

            // 1. Identify User Grade (Critical for Bank)
            const gradeSource = activeChild?.grade || user?.grade;
            let userGrade = null;

            if (gradeSource) {
                const gradeString = String(gradeSource);
                const match = gradeString.match(/\d+/);
                if (match) {
                    userGrade = parseInt(match[0]);
                }
            }
            // console.log("🧩 User Grade Parsed:", userGrade, "Source:", gradeSource);

            if (!userGrade) {
                setLoading(false);
                return;
            }

            try {
                // 1. Check Daily Limit First (One Random Puzzle Per Day)
                try {
                    const lastCompletionRef = ref(firebaseDatabase, `NMD_2025/UserLastCompletion/${learnerId}`);
                    const lastSnapshot = await get(lastCompletionRef);

                    if (lastSnapshot.exists() && lastSnapshot.val() === today) {
                        console.log("🧩 Already solved a puzzle today:", today);
                        setIsCompleted(true);
                        setLoading(false);
                        return; // Stop here, show "Come back tomorrow"
                    } else {
                        setIsCompleted(false);
                    }
                } catch (error) {
                    console.warn("⚠️ Error checking last completion:", error);
                    // Proceed on error (fail open or closed? Open feels safer for UX, letting them play)
                }    // 2. Fetch User Completions
                const completionsRef = ref(firebaseDatabase, `NMD_2025/UserCompletions/${learnerId}`);
                const completionsSnapshot = await get(completionsRef);
                const completedPuzzleIds = new Set();

                if (completionsSnapshot.exists()) {
                    const data = completionsSnapshot.val();
                    // data is like { "puzzle_id_1": true, "puzzle_id_2": true }
                    Object.keys(data).forEach(id => completedPuzzleIds.add(id));
                }

                // 3. Fetch Puzzle Bank for Grade
                const bankRef = ref(firebaseDatabase, `NMD_2025/PuzzleBank/${userGrade}`);
                const bankSnapshot = await get(bankRef);

                if (bankSnapshot.exists()) {
                    const allPuzzles = Object.values(bankSnapshot.val());

                    // 4. Filter out completed puzzles
                    const availablePuzzles = allPuzzles.filter(p => !completedPuzzleIds.has(p.id));

                    if (availablePuzzles.length > 0) {
                        // 5. Pick Random
                        const randomIndex = Math.floor(Math.random() * availablePuzzles.length);
                        const selectedPuzzle = availablePuzzles[randomIndex];
                        setPuzzle(selectedPuzzle);
                        setIsCompleted(false); // Just loaded a fresh one
                    } else {
                        // All solved!
                        // Maybe show a "You've solved everything!" state or just Completed state if we want to blocking
                        // Logic change: If all solved, we could show the "Completed" view.
                        setIsCompleted(true);
                        setPuzzle(null);
                    }
                } else {
                    setPuzzle(null); // No puzzles in bank for this grade
                }

            } catch (error) {
                console.error("Error fetching puzzle:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPuzzleAndStatus();
    }, [user, activeChild, learnerId]);

    const handlePuzzleComplete = () => {
        setIsCompleted(true);
        setModalOpen(false);
    };

    // Check completion status (optional optimization: can check in modal too, 
    // but good to show status on card if possible. Skipping for now to keep simple, 
    // status will be managed inside Modal or local storage for quick check)

    if (loading) {
        return <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 4 }} />;
    }

    // COMPLETED STATE
    if (isCompleted) {
        return (
            <Box sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald Gradient
                borderRadius: 4,
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.2 }}>
                    <Brain size={120} />
                </Box>
                <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', mb: 1.5 }}>
                    <Brain size={28} />
                </Box>
                <Typography variant="h6" fontWeight="bold">
                    Puzzle Solved!
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: '90%' }}>
                    Great job! Come back tomorrow for a new challenge.
                </Typography>
            </Box>
        );
    }

    if (!puzzle) {
        // Fallback or "No Puzzle Today" state
        return (
            <Box sx={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: 4,
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid #dee2e6'
            }}>
                <Brain size={32} color="#adb5bd" style={{ marginBottom: 8 }} />
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    No puzzle today
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Check back tomorrow!
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Box sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', // Indigo Gradient
                borderRadius: 4,
                p: 3,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 20px 25px -5px rgba(79, 70, 229, 0.4)'
                }
            }}
                onClick={() => setModalOpen(true)}
            >
                {/* Background Decoration */}
                <Box sx={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.2 }}>
                    <Brain size={120} />
                </Box>

                <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                        <Box sx={{ p: 0.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                            <Brain size={18} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ opacity: 0.9, letterSpacing: '0.5px' }}>
                            PUZZLE OF THE DAY
                        </Typography>
                    </Box>

                    <Typography variant="h6" fontWeight="800" sx={{ mb: 2, lineHeight: 1.3, maxWidth: '85%' }}>
                        Ready to exercise your brain?
                    </Typography>

                    <Button
                        variant="contained"
                        size="small"
                        endIcon={<ArrowRight size={16} />}
                        sx={{
                            bgcolor: 'white',
                            color: '#4f46e5',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            borderRadius: 2,
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.9)'
                            }
                        }}
                    >
                        Solve Now
                    </Button>
                </Box>
            </Box>

            <PuzzleModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                puzzle={puzzle}
                user={user}
                learnerId={learnerId}
                onComplete={handlePuzzleComplete}
            />
        </>
    );
};

export default PuzzleCard;
