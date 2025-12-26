'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import HomeContent from '@/components/Home/HomeContent';

// Dynamic import for LotteryDraw with ssr: false to prevent hydration errors
const LotteryDraw = dynamic(() => import('../../components/Admin/LotteryDraw.component'), {
    ssr: false,
    loading: () => <CircularProgress />,
});

const LotteryDrawPage = () => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Basic authorization check (placeholder)
        // In a real app, verify admin status via Firebase/Auth context
        setIsAuthorized(true);
    }, []);

    if (!isAuthorized) {
        return null; // Or a loading spinner
    }

    return (
        <main style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
            {/* Background: Home Page (Visual Only) */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none', // Prevent interaction with background
            }}>
                <HomeContent />
            </div>

            {/* Overlay */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 10,
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflowY: 'auto'
            }}>
                <Button
                    startIcon={<ArrowLeft />}
                    onClick={() => router.push('/dashboard')}
                    sx={{
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        zIndex: 20,
                        bgcolor: 'white',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        '&:hover': { bgcolor: '#f8fafc' }
                    }}
                    variant="outlined"
                >
                    Back
                </Button>

                <div style={{ width: '100%', maxWidth: '1000px', padding: '20px' }}>
                    <LotteryDraw isModal={true} />
                </div>
            </div>
        </main>
    );
};

export default LotteryDrawPage;
