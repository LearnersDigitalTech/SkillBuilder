'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

import { Nunito } from 'next/font/google';

const nunito = Nunito({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
});

const SplashScreen = ({ onComplete }: { onComplete?: () => void }) => {
    // Start invisible to prevent flash if already seen
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if splash screen has already been shown in this session
        const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');

        if (!hasSeenSplash) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                sessionStorage.setItem('hasSeenSplash', 'true');
                if (onComplete) {
                    onComplete();
                }
            }, 1500); // Show for 1.5 seconds

            return () => clearTimeout(timer);
        } else {
            if (onComplete) {
                onComplete();
            }
        }
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-center"
                    >
                        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-6">
                            <Image
                                src="/LearnersLogoTransparent.png"
                                alt="Learners Digital Logo"
                                fill
                                style={{ objectFit: 'contain' }}
                                priority
                            />
                        </div>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className={`${nunito.className} text-xl md:text-3xl font-extrabold tracking-wider`}
                            style={{ color: '#0096FF' }}
                        >
                            An Initiative of Learners Digital
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
