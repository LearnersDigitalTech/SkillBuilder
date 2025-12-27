"use client";
import { motion } from "framer-motion";
import { Smile, Star, Rocket, ThumbsUp } from "lucide-react";

const ChildOutcomesSection = () => {
    const outcomes = [
        {
            icon: Star,
            title: "I am Aware",
            description: "They learn what they're good at and where they can improve.",
        },
        {
            icon: ThumbsUp,
            title: "I want to do it Again",
            description: "Every attempt is celebrated. Mistakes are part of learning.",
        },
        {
            icon: Smile,
            title: "I can do Math!",
            description: "Children leave with a positive feeling about math, not anxiety.",
        },
        {
            icon: Rocket,
            title: "I am Ready!",
            description: "A clearer sense of where they are in their math journey.",
        },
    ];

    return (
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-[#F0F7FF]">
            <div className="container px-4">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#0B2545]">
                        What Your Child
                        <span className="text-[#0096FF]"> Experiences</span>
                    </h2>
                    <p className="text-lg md:text-xl text-[#0B2545]/70 max-w-2xl mx-auto">
                        Fall in love with math, one step at a time. 
                    </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {outcomes.map((outcome, index) => (
                        <motion.div
                            key={index}
                            className="relative group"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 * index }}
                        >
                            <div className="absolute inset-0 bg-[#0096FF]/5 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300" />
                            <div className="relative p-8 rounded-3xl bg-white shadow-card border border-blue-100">
                                <div className="w-16 h-16 rounded-2xl bg-[#0096FF]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <outcome.icon className="w-8 h-8 text-[#0096FF]" />
                                </div>
                                <h3
                                    className="text-xl font-bold text-[#0B2545] mb-3"
                                    style={{ fontFamily: 'var(--font-nunito)' }}
                                >
                                    {outcome.title}
                                </h3>
                                <p className="text-[#0B2545]/60 leading-relaxed">{outcome.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ChildOutcomesSection;
