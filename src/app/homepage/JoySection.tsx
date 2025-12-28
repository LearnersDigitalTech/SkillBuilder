"use client";
import { motion } from "framer-motion";
import { Dice5, Gift, PartyPopper } from "lucide-react";

const JoySection = () => {
    return (
        <section className="py-20 md:py-28 bg-[#F0F7FF]">
            <div className="container px-4">
                <motion.div
                    className="max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-center mb-12">
                        <motion.div
                            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white border border-blue-100 shadow-sm"
                            initial={{ scale: 0.9 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3 }}
                        >
                            <PartyPopper className="w-4 h-4 text-[#FF9F43]" />
                            <span className="text-sm font-semibold text-[#0B2545]/80">A Special Surprise</span>
                        </motion.div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#0B2545]">
                            Your <span className="text-[#0096FF]">Lucky Math Number</span>
                        </h2>
                        <p className="text-lg md:text-xl text-[#0B2545]/70 max-w-2xl mx-auto">
                            Every child who participates receives their own special Lucky Math Number —
                            a celebration of their effort, not their score.
                        </p>
                    </div>

                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {/* Decorative background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0096FF]/5 via-[#FF9F43]/5 to-[#0B2545]/5 rounded-3xl transform rotate-1" />

                        <div className="relative bg-white rounded-3xl shadow-lg p-8 md:p-12 border border-blue-50">
                            <div className="grid md:grid-cols-3 gap-8 text-center">
                                <div className="space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-[#0096FF]/10 flex items-center justify-center mx-auto">
                                        <Dice5 className="w-8 h-8 text-[#0096FF]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#0B2545]">Unique to Them</h3>
                                    <p className="text-[#0B2545]/60 text-sm">
                                        Generated based on their journey, making it truly personal.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-[#FF9F43]/10 flex items-center justify-center mx-auto">
                                        <Gift className="w-8 h-8 text-[#FF9F43]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#0B2545]">Participation Reward</h3>
                                    <p className="text-[#0B2545]/60 text-sm">
                                        Everyone wins! It's about taking part, not being "the best."
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-[#0B2545]/10 flex items-center justify-center mx-auto">
                                        <PartyPopper className="w-8 h-8 text-[#0B2545]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#0B2545]">A Keepsake</h3>
                                    <p className="text-[#0B2545]/60 text-sm">
                                        Something fun to share, remember, and feel proud about.
                                    </p>
                                </div>
                            </div>

                            {/* Sample lucky number display */}
                            <div className="mt-10 pt-8 border-t border-blue-50">
                                <p className="text-center text-sm text-[#0B2545]/50 mb-4">Example Lucky Math Number</p>
                                <div className="flex items-center justify-center gap-3">
                                    {['7', '2', '4', '9'].map((num, index) => (
                                        <motion.div
                                            key={index}
                                            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#007AFF]/5 border-2 border-[#007AFF]/20 flex items-center justify-center"
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                                        >
                                            <span className="text-2xl md:text-3xl font-bold text-[#007AFF]">{num}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default JoySection;

