"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Visual Style Constants
const BG_COLOR = "bg-[#0a192f]"; // Deep navy/charcoal
const TEXT_COLOR = "text-white";
const ACCENT_COLOR = "text-cyan-400"; // Subtle math accent

export default function LaunchPage() {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [fade, setFade] = useState("opacity-0");
    const [countdown, setCountdown] = useState(5);
    const [showPurposeLine2, setShowPurposeLine2] = useState(false);

    // Slide Configuration
    const slides = [
        { id: 1, duration: 5000 }, // Context
        { id: 2, duration: 6000 }, // Problem
        { id: 3, duration: 6000 }, // Purpose
        { id: 4, duration: 6000 }, // Mission
        { id: 5, duration: 6000 }, // Moment
        { id: 6, duration: 6000 }, // Brand
        { id: 7, duration: 5500 }, // Countdown (5s + buffer)
        { id: 8, duration: 0 },    // Launch Button (No auto-advance)
    ];

    useEffect(() => {
        // Current slide duration logic
        const slideConfig = slides[currentSlide];
        if (!slideConfig) return;

        // Fade In
        setTimeout(() => setFade("opacity-100"), 100);

        let timer;
        let interval;

        // Special logic for specific slides
        if (slideConfig.id === 3) {
            // Purpose Slide - Reveal second line halfway through
            setShowPurposeLine2(false);
            timer = setTimeout(() => setShowPurposeLine2(true), 2500);
        }

        if (slideConfig.id === 7) {
            // Countdown Logic
            const interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        // Move to Launch Button slide automatically when countdown ends
                        setCurrentSlide(7); // Index for id:8
                        return 1;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }

        // Transition to next slide (only if not slide 7 or 8)
        if (slideConfig.id !== 7 && slideConfig.id !== 8) {
            timer = setTimeout(() => {
                if (currentSlide < slides.length - 1) {
                    setFade("opacity-0");
                    setTimeout(() => {
                        setCurrentSlide((prev) => prev + 1);
                    }, 1000); // Wait for fade out
                }
            }, slideConfig.duration);
        }

        return () => {
            if (timer) clearTimeout(timer);
            if (interval) clearInterval(interval);
        };
    }, [currentSlide, router]);

    // Render Content based on Slide ID
    const renderContent = () => {
        switch (slides[currentSlide].id) {
            case 1: // Context
                return (
                    <div className="text-center max-w-2xl px-6">
                        <h1 className="text-3xl md:text-5xl font-light mb-6 tracking-wide">
                            “Mathematics is not just about <span className={ACCENT_COLOR}>numbers</span>.”
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 font-light">
                            It is about thinking, confidence, and clarity.
                        </p>
                    </div>
                );
            case 2: // The Problem
                return (
                    <div className="text-center max-w-3xl px-6">
                        <h1 className="text-3xl md:text-5xl font-light mb-8 leading-tight">
                            “For many students, math becomes a <span className="text-red-300">fear</span>.”
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 font-light">
                            Not because they can’t learn — but because they weren’t guided right.
                        </p>
                    </div>
                );
            case 3: // The Purpose
                return (
                    <div className="text-center max-w-3xl px-6 space-y-8">
                        <h1 className="text-3xl md:text-5xl font-light">
                            What if practice felt <span className={ACCENT_COLOR}>simple</span>?
                        </h1>
                        <h1
                            className={`text-3xl md:text-5xl font-light transition-all duration-1000 ${showPurposeLine2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                                }`}
                        >
                            What if progress felt <span className={ACCENT_COLOR}>visible</span>?
                        </h1>
                    </div>
                );
            case 4: // The Mission
                return (
                    <div className="text-center max-w-3xl px-6">
                        <h1 className="text-3xl md:text-5xl font-light mb-8">
                            “We built a platform to strengthen math <span className={ACCENT_COLOR}>basics</span>.”
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide">
                            One step. One concept. One student at a time.
                        </p>
                    </div>
                );
            case 5: // The Moment
                return (
                    <div className="text-center px-6">
                        <h1 className="text-3xl md:text-6xl font-light tracking-widest">
                            Today, on National Mathematics Day 2025…
                        </h1>
                    </div>
                );
            case 6: // The Brand
                return (
                    <div className="text-center px-6 flex flex-col items-center justify-center">
                        <h1 className="text-2xl md:text-4xl font-light mb-8 text-gray-300">
                            Powered by
                        </h1>
                        <div className="relative w-64 h-24 md:w-96 md:h-40 mb-6">
                            <Image
                                src="/LearnersLogoTransparent__1_-removebg-preview.png"
                                alt="Learners Digital"
                                fill
                                className="object-contain" // Removed invert filter
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority
                            />
                        </div>
                        <p className="text-lg md:text-xl text-gray-400 font-light mt-4">
                            Supporting learners across schools and beyond.
                        </p>
                    </div>
                );
            case 7: // Countdown
                return (
                    <div className="text-center">
                        <div className="text-[10rem] md:text-[15rem] font-thin tabular-nums animate-pulse text-white">
                            {countdown}
                        </div>
                    </div>
                );
            case 8: // Launch Button
                return (
                    <div className="text-center animate-in fade-in zoom-in duration-1000">
                        <button
                            onClick={() => router.push("/?launched=true")}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white text-xl md:text-3xl font-bold py-4 px-12 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all transform hover:scale-105 active:scale-95 tracking-widest uppercase"
                        >
                            Launch Website
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <main
            className={`fixed inset-0 z-50 flex items-center justify-center ${BG_COLOR} ${TEXT_COLOR} overflow-hidden font-sans selection:bg-cyan-500 selection:text-white`}
        >
            <div
                className={`transition-opacity duration-1000 ease-in-out ${fade} w-full flex justify-center`}
            >
                {renderContent()}
            </div>

        </main>
    );
}
