"use client";
import { motion } from "framer-motion";
import { Lightbulb, HeartHandshake, Eye, ShieldCheck } from "lucide-react";

const PositioningSection = () => {
    return (
        <section className="pt-10 pb-10 md:pt-16 md:pb-12 bg-white">
            <div className="container px-4">
                <motion.div
                    className="max-w-3xl mx-auto text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[#0B2545]">
                        This Is About
                        <span className="text-[#33d649]"> Skills</span>
                    </h2>

                    <p className="text-lg md:text-xl text-[#0B2545]/70 leading-relaxed mb-12">
                        This isn’t about marks. It’s about understanding how your child learns and supporting them with clarity and confidence at every step.
                        {/* This isn’t about marks. It’s about understanding how your child thinks, nurturing their curiosity, and supporting them step by step toward full confidence and 100% proficiency in math. */}
                        {/* Unlike traditional assessments that focus purely on scores, this experience is designed to <span className="font-semibold text-[#0B2545]">understand how your child thinks</span>.
                        We're here to celebrate curiosity and help achieve<span className="text-[#FF9F43]"> 100% proficiency in Math</span>. */}
                    </p>
                </motion.div>

                {/* <motion.div
                    className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {[
                        {
                            icon: Eye,
                            title: "Observation, Not Evaluation",
                            description: "We watch how children approach problems, not just if they solve them.",
                        },
                        {
                            icon: HeartHandshake,
                            title: "Understanding, Not Judging",
                            description: "Every child's unique thinking style is valued and respected.",
                        },
                        {
                            icon: Lightbulb,
                            title: "Insight, Not Ranking",
                            description: "Discover strengths and gaps, not where they stand versus others.",
                        },
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            className="group p-8 rounded-3xl bg-white shadow-card border border-[#33d649]/50 hover:shadow-lg transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 * index }}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-[#33d649]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                                <item.icon className="w-7 h-7 text-[#33d649]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0B2545] mb-3">{item.title}</h3>
                            <p className="text-[#0B2545]/60 leading-relaxed">{item.description}</p>
                        </motion.div>
                    ))}
                </motion.div> */}
                <motion.div
                    className="max-w-4xl mx-auto mt-16"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0B2545] to-[#1e4b8a] p-8 md:p-12 shadow-2xl">
                        {/* Decorative background effects */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0096FF]/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF9F43]/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            {/* <div className="w-16 h-16 mb-6 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                <ShieldCheck className="w-8 h-8 text-[#0096FF]" />
                            </div> */}

                            <p className="text-xl md:text-2xl font-bold text-white leading-relaxed max-w-2xl">
                                "When children feel safe and confident, real learning begins."
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default PositioningSection;

