"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Trigger change when scrolled past roughly the hero section (viewport height)
            setIsScrolled(window.scrollY > window.innerHeight - 100);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100/50"
        >
            <div className="container mx-auto px-4 py-3 flex items-center justify-between relative">
                <div className="flex items-center gap-3">
                    <Image
                        src="/LearnersLogoTransparent.png"
                        alt="Learners Logo"
                        width={120}
                        height={40}
                        className="w-auto h-10 md:h-12"
                        priority
                    />
                    <span
                        className="text-xl font-bold text-[#0d3773]"
                        style={{ fontFamily: 'var(--font-nunito)' }}
                    >
                        Skill Builder
                    </span>
                </div>

                <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8">

                    <a href="#benefits" className="text-sm font-semibold text-[#0B2545]/80 hover:text-[#0096FF] transition-colors">
                        Practice
                    </a>
                    <a href="#faq" className="text-sm font-semibold text-[#0B2545]/80 hover:text-[#0096FF] transition-colors">
                        Rapid Math
                    </a>
                    <a href="#faq" className="text-sm font-semibold text-[#0B2545]/80 hover:text-[#0096FF] transition-colors">
                        SAT
                    </a>
                </nav>

                <AnimatePresence mode="wait">
                    {isScrolled ? (
                        <motion.div
                            key="journey"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link href="/quiz">
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="shadow-md bg-[#0096FF] hover:bg-[#007AFF] text-white rounded-xl px-6"
                                    style={{ fontFamily: 'var(--font-nunito)' }}
                                >
                                    Begin your Journey
                                    <motion.div
                                        className="inline-block ml-2"
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.div>
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link href="/login">
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="shadow-md bg-[#007AFF] hover:bg-[#0060C9] text-white rounded-xl px-6"
                                    style={{ fontFamily: 'var(--font-nunito)' }}
                                >
                                    Log in
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
};

export default Header;