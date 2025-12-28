'use client';
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Button,
    Grid,
    Chip,
    Container,
    TextField,
    MenuItem
} from '@mui/material';
import { ref, get } from 'firebase/database';
import { firebaseDatabase } from '@/backend/firebaseHandler';
import confetti from 'canvas-confetti';
import { Users, Trophy } from 'lucide-react';

const LotteryDraw = ({ isModal = false }) => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Grand Draw State
    const [grandDrawState, setGrandDrawState] = useState('idle'); // 'idle', 'drawing', 'completed'
    const [currentReveal, setCurrentReveal] = useState(''); // 'parent', 'student', 'teacher', 'guest'
    const [roundName, setRoundName] = useState('Round 1');
    const [drawFilter, setDrawFilter] = useState('All');
    const [winnerCount, setWinnerCount] = useState(1);
    const [grandWinners, setGrandWinners] = useState({
        parent: [],
        student: [],
        teacher: [],
        guest: []
    });

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const triggerConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 9999, // Ensure confetti is on top for modal
            colors: ['#FFD700', '#FFA500', '#FF4500', '#008000', '#0000FF', '#4B0082', '#EE82EE']
        });
    };

    const [previousWinners, setPreviousWinners] = useState(new Set());
    const BLACKLIST = ['P1121', 'S12011', 'T1005', 'G1005'];

    useEffect(() => {
        const fetchWinners = async () => {
            try {
                const winnersRef = ref(firebaseDatabase, 'Lottery/Winners');
                const snapshot = await get(winnersRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const codes = new Set(Object.values(data).map(w => w.ticketCode));
                    setPreviousWinners(codes);
                }
            } catch (error) {
                console.error("Error fetching winners for exclusion:", error);
            }
        };
        fetchWinners();
    }, []);

    const handleGrandDraw = async () => {
        if (registrations.length === 0) return;

        setGrandDrawState('drawing');
        setGrandWinners({ parent: [], student: [], teacher: [], guest: [] });
        setCurrentReveal('initiating');

        // Helper to get random unique items
        const getRandomUnique = (pool, count) => {
            if (pool.length === 0) return [];
            const shuffled = [...pool].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, Math.min(count, pool.length));
        };

        // EXCLUSION LOGIC: Filter out Blacklist and Previous Winners
        const eligibleRegistrations = registrations.filter(r =>
            !BLACKLIST.includes(r.ticketCode) &&
            !previousWinners.has(r.ticketCode)
        );

        console.log(`Pool Size: ${registrations.length} -> Eligible: ${eligibleRegistrations.length}`);

        const pools = {
            parent: eligibleRegistrations.filter(r => r.effectiveUserType === 'parent'),
            student: eligibleRegistrations.filter(r => r.effectiveUserType === 'student'),
            teacher: eligibleRegistrations.filter(r => r.effectiveUserType === 'teacher'),
            guest: eligibleRegistrations.filter(r => ['guest', 'other'].includes(r.effectiveUserType))
        };

        // Determine Sequence of Draws
        let drawSequence = [];

        if (drawFilter === 'All') {
            // Standard flow: 1 of each
            ['parent', 'student', 'teacher', 'guest'].forEach(role => {
                const winner = getRandomUnique(pools[role], 1)[0];
                drawSequence.push({ role, winner, label: `Lucky ${role.charAt(0).toUpperCase() + role.slice(1)}` });
            });
        } else {
            // Filtered flow: N of specific role
            const winners = getRandomUnique(pools[drawFilter], winnerCount);
            winners.forEach((w, i) => {
                drawSequence.push({
                    role: drawFilter,
                    winner: w,
                    label: `Lucky ${drawFilter.charAt(0).toUpperCase() + drawFilter.slice(1)} #${i + 1}`
                });
            });
        }

        const { push } = await import('firebase/database');
        const winnersRef = ref(firebaseDatabase, 'Lottery/Winners');

        for (const step of drawSequence) {
            setCurrentReveal(step.role); // For loading state
            await wait(2000); // Suspense

            if (step.winner) {
                // Update state to show card
                setGrandWinners(prev => ({
                    ...prev,
                    [step.role]: [...(prev[step.role] || []), step.winner]
                }));

                triggerConfetti();

                // Save to Firebase
                try {
                    const winnerData = {
                        ...step.winner,
                        role: step.role,
                        round: roundName || 'Round 1',
                        timestamp: Date.now(),
                        wonAt: new Date().toISOString()
                    };
                    await push(winnersRef, winnerData);

                    // Update local exclusion list immediately
                    setPreviousWinners(prev => new Set(prev).add(step.winner.ticketCode));

                } catch (e) {
                    console.error("Error saving winner:", e);
                }

                await wait(2000); // Celebrate (shorter wait for multiple)
            } else {
                await wait(1000);
            }
        }

        setGrandDrawState('completed');
        setCurrentReveal('');
    };

    const renderWinnerCard = (role, title, color, count, index = 0) => {
        const winnersList = grandWinners[role] || [];
        const winner = winnersList[index];
        const isRevealing = currentReveal === role && winnersList.length === index;

        let content;
        if (winner) {
            content = (
                <>
                    <Typography variant={isModal ? "h4" : "h3"} fontWeight="bold" sx={{ color: color, mb: 1, textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                        {winner.ticketCode}
                    </Typography>
                    <Typography variant={isModal ? "h6" : "h5"} fontWeight="bold" noWrap title={winner.displayName}>
                        {winner.displayName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {winner.effectiveUserType?.toUpperCase()}
                    </Typography>
                </>
            );
        } else if (isRevealing) {
            content = (
                <Box display="flex" flexDirection="column" alignItems="center">
                    <CircularProgress size={isModal ? 40 : 50} sx={{ color: color, mb: 2 }} />
                    <Typography variant="h6" fontWeight="bold" color="text.secondary" sx={{ animation: 'pulse 1s infinite' }}>
                        Picking...
                    </Typography>
                </Box>
            );
        } else if (count === 0) {
            content = (
                <Typography variant="h6" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                    No Candidates
                </Typography>
            );
        } else {
            content = (
                <Typography variant="h1" color="text.disabled" fontWeight="900" sx={{ opacity: 0.1, fontSize: isModal ? '4rem' : '6rem' }}>
                    ?
                </Typography>
            );
        }

        return (
            <Paper
                elevation={winner ? 12 : 2}
                sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 4,
                    height: '100%',
                    minHeight: isModal ? 220 : 280,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: winner ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: winner ? `4px solid ${color}` : '2px dashed #90caf9',
                    transform: winner ? 'scale(1.05) translateY(-5px)' : 'scale(1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {winner && <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 8, bgcolor: color }} />}
                <Typography variant="subtitle1" fontWeight="bold" sx={{ textTransform: 'uppercase', color: color, mb: isModal ? 1 : 3, letterSpacing: 1.5 }}>
                    {title}
                </Typography>
                {content}
                <Chip
                    label={`${count} Entries`}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 'auto', pt: 0.5, borderColor: color, color: color, opacity: 0.7, fontWeight: 600 }}
                />
            </Paper>
        );
    };

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const registrationsRef = ref(firebaseDatabase, 'Lottery/Registrations');
            const snapshot = await get(registrationsRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const formattedData = Object.entries(data).map(([key, val]) => {
                    // Start of Normalization Logic
                    let effectiveUserType = (val.userType || 'parent').toLowerCase();

                    if (val.ticketCode) {
                        const code = String(val.ticketCode).toUpperCase();
                        if (code.startsWith('O')) effectiveUserType = 'other';
                        else if (code.startsWith('G')) effectiveUserType = 'guest';
                    }

                    return {
                        id: key,
                        ...val,
                        userType: val.userType || 'parent',
                        effectiveUserType: effectiveUserType,
                        displayName: val.name || val.parentName || val.studentName || "Unknown"
                    };
                });

                setRegistrations(formattedData);
            } else {
                setRegistrations([]);
            }
        } catch (error) {
            console.error("Error fetching lottery data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const parentCount = registrations.filter(r => r.effectiveUserType === 'parent').length;
    const studentCount = registrations.filter(r => r.effectiveUserType === 'student').length;
    const teacherCount = registrations.filter(r => r.effectiveUserType === 'teacher').length;
    const guestCount = registrations.filter(r => ['guest', 'other'].includes(r.effectiveUserType)).length;

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={isModal ? "400px" : "100vh"} sx={{ background: isModal ? 'transparent' : 'radial-gradient(circle at 70% 50%, #ffffff 0%, #e0f2fe 100%)' }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: isModal ? 'auto' : '100vh',
                background: isModal ? 'transparent' : 'radial-gradient(circle at 70% 50%, #ffffff 0%, #e0f2fe 100%)',
                p: { xs: 2, md: isModal ? 2 : 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: '100%'
            }}
        >
            <Container maxWidth="xl" disableGutters={isModal}>
                <Box textAlign="center" mb={isModal ? 3 : 6}>
                    <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={2}>
                        <img
                            src="/LearnersLogoTransparent.png"
                            alt="Learners Logo"
                            style={{
                                height: isModal ? '60px' : '80px',
                                width: 'auto',
                                objectFit: 'contain'
                            }}
                        />
                        <Typography
                            variant="h2"
                            component="h1"
                            fontWeight="900"
                            sx={{
                                background: 'linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%)',
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                letterSpacing: '-0.02em',
                                fontSize: isModal ? { xs: '2rem', md: '3rem' } : { xs: '2.5rem', md: '4rem' }
                            }}
                        >
                            Lucky Numbers Draw
                        </Typography>
                    </Box>
                    <Box
                        display="inline-flex"
                        alignItems="center"
                        gap={1}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.6)',
                            py: 1,
                            px: 3,
                            borderRadius: 10,
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}
                    >
                        <Users size={20} color="#4b5563" />
                        <Typography variant="h6" color="text.secondary" fontWeight="600">
                            Total Participants:
                        </Typography>
                        <Typography variant="h6" color="primary" fontWeight="800">
                            {registrations.length}
                        </Typography>
                    </Box>
                </Box>

                {/* GRAND CEREMONY DRAW SECTION */}
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 5 },
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.4)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
                    }}
                >
                    <Grid container spacing={4} sx={{ pt: 2, justifyContent: 'center' }}>
                        {drawFilter === 'All' ? (
                            <>
                                <Grid item xs={12} sm={6} md={3}>
                                    {renderWinnerCard('parent', 'Lucky Parent', '#059669', parentCount)}
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    {renderWinnerCard('student', 'Lucky Student', '#2563eb', studentCount)}
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    {renderWinnerCard('teacher', 'Lucky Teacher', '#d97706', teacherCount)}
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    {renderWinnerCard('guest', 'Lucky Guest', '#7c3aed', guestCount)}
                                </Grid>
                            </>
                        ) : (
                            // Render N cards for the selected filter
                            Array.from({ length: winnerCount }).map((_, idx) => {
                                const labels = {
                                    parent: 'Lucky Parent',
                                    student: 'Lucky Student',
                                    teacher: 'Lucky Teacher',
                                    guest: 'Lucky Guest'
                                };
                                const colors = {
                                    parent: '#059669',
                                    student: '#2563eb',
                                    teacher: '#d97706',
                                    guest: '#7c3aed'
                                };
                                const counts = {
                                    parent: parentCount,
                                    student: studentCount,
                                    teacher: teacherCount,
                                    guest: guestCount
                                };
                                return (
                                    <Grid item xs={12} sm={6} md={Math.max(3, 12 / winnerCount)} key={idx}>
                                        {renderWinnerCard(drawFilter, `${labels[drawFilter]} #${idx + 1}`, colors[drawFilter], counts[drawFilter], idx)}
                                    </Grid>
                                );
                            })
                        )}
                    </Grid>

                    <Box display="flex" flexDirection="column" alignItems="center" mt={5} gap={3}>
                        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
                            <TextField
                                label="Round Name"
                                variant="outlined"
                                value={roundName}
                                onChange={(e) => setRoundName(e.target.value)}
                                sx={{ bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1, minWidth: 200 }}
                                disabled={grandDrawState === 'drawing'}
                            />
                            <TextField
                                select
                                label="Filter Category"
                                value={drawFilter}
                                onChange={(e) => {
                                    setDrawFilter(e.target.value);
                                    if (e.target.value === 'All') setWinnerCount(1);
                                }}
                                sx={{ bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1, minWidth: 200 }}
                                disabled={grandDrawState === 'drawing'}
                            >
                                <MenuItem value="All">All Categories</MenuItem>
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="parent">Parent</MenuItem>
                                <MenuItem value="teacher">Teacher</MenuItem>
                                <MenuItem value="guest">Guest</MenuItem>
                            </TextField>

                            {drawFilter !== 'All' && (
                                <TextField
                                    select
                                    label="Winner Count"
                                    value={winnerCount}
                                    onChange={(e) => setWinnerCount(Number(e.target.value))}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1, minWidth: 150 }}
                                    disabled={grandDrawState === 'drawing'}
                                >
                                    {[1, 2, 3, 4].map(n => (
                                        <MenuItem key={n} value={n}>{n} Winner{n > 1 ? 's' : ''}</MenuItem>
                                    ))}
                                </TextField>
                            )}
                        </Box>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleGrandDraw}
                            disabled={grandDrawState === 'drawing' || registrations.length === 0}
                            sx={{
                                px: 8,
                                py: 2.5,
                                fontSize: '1.4rem',
                                borderRadius: 50,
                                background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                                boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
                                fontWeight: '800',
                                textTransform: 'none',
                                letterSpacing: 0.5,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.6)',
                                    transform: 'translateY(-3px) scale(1.02)'
                                },
                                '&:active': {
                                    transform: 'translateY(1px)'
                                }
                            }}
                        >
                            {grandDrawState === 'drawing' ? 'Drawing in progress...' : 'Start Grand Draw 🎲'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default LotteryDraw;
