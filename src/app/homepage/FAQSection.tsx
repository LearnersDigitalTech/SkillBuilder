"use client";
import { motion } from "framer-motion";
import { Clock, BookOpen, Award } from "lucide-react";

const FAQSection = () => {
    const faqs = [
        {
            icon: Clock,
            question: "Is this timed?",
            answer: "There's a gentle time frame, but children can take their time. We value thoughtful exploration over rushing.",
        },
        {
            icon: BookOpen,
            question: "Does my child need to prepare?",
            answer: "No preparation needed at all. Just come as you are — curious and ready to explore.",
        },
        {
            icon: Award,
            question: "Is this graded?",
            answer: "Not in the traditional sense. We focus on understanding how your child thinks, not on right or wrong answers.",
        },
    ];

    return (
        <section className="py-16 md:py-20 bg-white border-t border-blue-50">
            <div className="container px-4">
                <motion.div
                    className="max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5 }}
                >
                    <h3 className="text-2xl font-bold text-center mb-10 text-[#0B2545]">
                        Quick Answers
                    </h3>

                    <div className="grid md:grid-cols-3 gap-6">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                className="p-6 rounded-2xl bg-[#F8FBFF] border border-blue-50"
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.1 * index }}
                            >
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm">
                                    <faq.icon className="w-5 h-5 text-[#0096FF]" />
                                </div>
                                <h4 className="font-bold text-[#0B2545] mb-2">{faq.question}</h4>
                                <p className="text-sm text-[#0B2545]/70 leading-relaxed">{faq.answer}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FAQSection;
