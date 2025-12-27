"use client";
import { motion } from "framer-motion";
import { FileCheck, Compass, MessageCircleHeart } from "lucide-react";

const ParentOutcomesSection = () => {
    const benefits = [
        {
            icon: FileCheck,
            title: "Clear Skill Picture",
            description: "See what your child is confident in and where they need support.",
        },
        {
            icon: Compass,
            title: "Personalized Learning Plan",
            description: "A clear next step for your child’s Math journey.",
        },
        {
            icon: MessageCircleHeart,
            title: "Access to Mentors",
            description: "Friendly mentors who guide you and your child when needed.",
        },
    ];

    return (
        <section className="py-20 md:py-28 bg-white">
            <div className="container px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left side - Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[#0B2545]">
                                What You'll<span className="text-[#0096FF]"> Understand</span> 
                            </h2>
                            <p className="text-lg text-[#0B2545]/70 mb-10 leading-relaxed">
                                As a parent, you'll receive insights that help you understand
                                your child's skills and progress in their Math journey.
                            </p>

                            <div className="space-y-6">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex gap-5"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: 0.1 * index }}
                                    >
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#0096FF]/10 flex items-center justify-center">
                                            <benefit.icon className="w-6 h-6 text-[#0096FF]" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-[#0B2545] mb-1">{benefit.title}</h3>
                                            <p className="text-[#0B2545]/70">{benefit.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right side - Visual */}
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="relative">
                                {/* Decorative background shapes */}
                                <div className="absolute -top-6 -right-6 w-full h-full bg-[#0096FF]/10 rounded-3xl transform rotate-3" />
                                <div className="absolute -top-3 -right-3 w-full h-full bg-[#FF9F43]/5 rounded-3xl transform rotate-1" />

                                {/* Main card */}
                                <div className="relative bg-white rounded-3xl shadow-lg p-8 border border-blue-50">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FBFF]">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                <span className="text-lg text-green-600">✓</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#0B2545]">Skill Report</p>
                                                <p className="text-sm text-[#0B2545]/60">Detailed breakdown of abilities</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FBFF]">
                                            <div className="w-10 h-10 rounded-full bg-[#0096FF]/10 flex items-center justify-center">
                                                <span className="text-lg">📊</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#0B2545]">Growth Areas</p>
                                                <p className="text-sm text-[#0B2545]/60">Where to focus next</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FBFF]">
                                            <div className="w-10 h-10 rounded-full bg-[#FF9F43]/10 flex items-center justify-center">
                                                <span className="text-lg">💡</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#0B2545]">Personal Tutors </p>
                                                <p className="text-sm text-[#0B2545]/60">One-on-One Mentorship</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ParentOutcomesSection;
