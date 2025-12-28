"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const FinalCTASection = () => {
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();

    return (
        <section className="py-24 md:py-32 bg-gradient-to-br from-[#F8FBFF] via-[#F0F7FF] to-[#E0F2FE] relative overflow-hidden">
            {/* ... keeping existing background ... */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/3 left-1/4 w-64 h-64 bg-[#0096FF]/10 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-[#FF9F43]/10 rounded-full blur-3xl"
                    animate={{ scale: [1.2, 1, 1.2] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
            </div>

            <div className="container px-4 relative z-10">
                <motion.div
                    className="max-w-3xl mx-auto text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    {/* ... keeping existing sparkler div ... */}
                    <motion.div
                        className="inline-flex items-center gap-2 mb-6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        {/* <Sparkles className="w-6 h-6 text-[#0096FF]" /> */}
                    </motion.div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[#0B2545] leading-tight">
                        Let Your Child Discover
                        <br />
                        <span className="text-[#0096FF]">The Joy of Learning</span>
                    </h2>

                    <p className="text-lg md:text-xl text-[#0B2545]/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                        A safe, encouraging, and fun experience awaits. 
                    </p>

                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Button
                            variant="hero"
                            size="xl"
                            className="group w-full sm:w-auto bg-[#007AFF] hover:bg-[#0060C9] text-white border-none shadow-lg shadow-blue-500/20 transition-all duration-300 min-w-[200px]"
                            style={{ fontFamily: 'var(--font-nunito)' }}
                            onClick={() => router.push("/lottery")}

                        >
                            Start Now
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </motion.div>

                    {/* <motion.p
                        className="mt-6 text-sm text-[#0B2545]/60"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        Takes 20–30 minutes • For Grades 1–10 • All boards welcome
                    </motion.p> */}
                </motion.div>
            </div>
        </section>
    );
};

export default FinalCTASection;
