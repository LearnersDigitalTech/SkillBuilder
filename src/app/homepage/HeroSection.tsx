"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import GearsOfThought from "@/components/ui/GearsOfThought";
import { useRouter } from "next/navigation";

const HeroSection = () => {
    const router = useRouter();
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#F8FBFF] via-[#F0F7FF] to-[#E0F2FE]">
            {/* Decorative floating elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-20 left-[10%] w-20 h-20 rounded-full bg-[#0096FF]/10"
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <GearsOfThought className="absolute top-[15%] right-[10%] md:right-[15%] scale-150" />
                <motion.div
                    className="absolute top-40 right-[15%] w-14 h-14 rounded-full bg-[#FF9F43]/20"
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
                <motion.div
                    className="absolute bottom-32 left-[20%] w-24 h-24 rounded-full bg-[#0096FF]/10"
                    animate={{ y: [0, -25, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
                <motion.div
                    className="absolute bottom-40 right-[25%] w-16 h-16 rounded-full bg-[#FF9F43]/15"
                    animate={{ y: [0, -18, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />
            </div>

            <div className="container relative z-10 px-4 pt-0 pb-20">
                <motion.div
                    className="max-w-4xl mx-auto text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Badge */}
                    {/* <motion.div
                        className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white shadow-sm border border-blue-100"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <span className="text-sm font-medium text-[#0B2545]/70">An Initiative by Learners Digital</span>
                    </motion.div> */}

                    {/* Main headline */}
                    <motion.h1
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        style={{ fontFamily: 'var(--font-nunito)' }}
                    >
                        <span className="text-[#0d3773]">Discover Your Child's</span>
                        <br />
                        <span className="text-[#0096FF]">Math Superpowers</span>
                    </motion.h1>

                    {/* Sub-headline */}
                    <motion.p
                        className="text-xl md:text-2xl text-[#0B2545]/70 mb-4 max-w-2xl lg:max-w-4xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        A joyful experience that helps children feel confident about Math.
                    </motion.p>

                    {/* Audience clarity */}
                    <motion.p
                        className="text-lg text-[#0B2545]/60 mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        For students in Grades 1–10, any board, any skill level.
                    </motion.p>

                    {/* Assurance strip */}
                    <motion.div
                        className="flex flex-row items-center justify-center gap-3 sm:gap-8 md:gap-12 mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        {[
                            { title: "Love", subtitle: "to Discover." },
                            { title: "Learn", subtitle: "to Build." },
                            { title: "Grow", subtitle: "Confidence." },
                        ].map((item, index) => (
                            <div key={index} className="flex items-center">
                                {/* Vertical Divider (only for 2nd and 3rd items on desktop) */}
                                {index > 0 && (
                                    <div className="hidden md:block w-px h-16 bg-[#D4AF37] mx-12"></div>
                                )}

                                <div className="text-center">
                                    <h3
                                        className="text-3xl sm:text-4xl md:text-6xl text-[#D4AF37] mb-1 md:mb-2"
                                        style={{ fontFamily: 'var(--font-great-vibes)' }}
                                    >
                                        {item.title}
                                    </h3>
                                    <p className="text-[#0B2545] text-[10px] sm:text-sm md:text-base font-medium tracking-wide">
                                        {item.subtitle}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Primary CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                    >
                        <Button
                            variant="hero"
                            size="xl"
                            className="group bg-[#007AFF] hover:bg-[#0060C9] text-white border-none shadow-lg shadow-blue-500/20"
                            style={{ fontFamily: 'var(--font-nunito)' }}
                            onClick={() => router.push('/lottery')}
                        >
                            Get Your Lucky Number
                            <motion.span
                                className="inline-block ml-1"
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                →
                            </motion.span>
                        </Button>
                        {/* <p className="mt-4 text-sm text-[#0B2545]/60">
                            Takes just 20–30 minutes
                        </p> */}
                    </motion.div>
                </motion.div>
            </div>

            {/* Bottom wave decoration */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                    <path
                        d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                        className="fill-white"
                    />
                </svg>
            </div>
        </section>
    );
};

export default HeroSection;

