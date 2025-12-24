'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SkillBuilderLaunchPage() {

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black pointer-events-none" />

            <div className="max-w-6xl w-full z-10 flex flex-col items-center gap-10">

                {/* Header Text */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center space-y-4"
                >
                    <h2 className="text-2xl md:text-3xl font-light tracking-[0.2em] text-blue-300 uppercase">
                        Learners Digital
                    </h2>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent drop-shadow-2xl">
                        Launch of Math Skill Builder
                    </h1>
                </motion.div>

                {/* Video Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="w-full aspect-video rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.2)] border border-white/10 relative bg-gray-900"
                >
                    <iframe
                        src="https://www.youtube.com/embed/BnYiNL81S-s?autoplay=0&controls=1&rel=0&modestbranding=1"
                        className="absolute top-0 left-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Math Skill Builder Launch Video"
                    />
                </motion.div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.8 }}
                >
                    <Link href="/">
                        <button className="group relative px-10 py-4 bg-white text-black font-bold text-xl rounded-full overflow-hidden hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                            <span className="relative z-10 flex items-center gap-2">
                                Skill Builder
                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                        </button>
                    </Link>
                </motion.div>

            </div>
        </div>
    );
}
