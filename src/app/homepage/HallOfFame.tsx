"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";

const HallOfFame = () => {
    // Curated list of students from validated directories
    const students = [
        { name: "Aditi Manu", grade: "Grade 1", image: "/success/grade1/Aditi Manu.jpeg" },
        { name: "Hiba Ameen", grade: "Grade 5", image: "/success/grade5/Hiba Ameen.png" },
        { name: "Aleena Mohammadi", grade: "Grade 9", image: "/success/grade9/Aleena Mohammadi.png" },
        { name: "Yoshita Konareddy", grade: "Grade 10", image: "/success/grade10/Yoshita Konareddy.png" },
        { name: "Chiranth", grade: "Grade 2", image: "/success/grade2/chiranth.jpg" },
        { name: "Abhigna Manu", grade: "Grade 3", image: "/success/grade3/Abhigna Manu.png" },
        { name: "Jhenkar K T", grade: "Grade 4", image: "/success/grade4/Jhenkar K T .png" },
        { name: "Bhuvan", grade: "Grade 6", image: "/success/grade6/Bhuavn.png" },
        { name: "Dhanush", grade: "Grade 7", image: "/success/grade7/Dhanush .png" },
        { name: "Uday Narayan", grade: "Grade 8", image: "/success/grade8/Uday Narayan .png" },
        { name: "Mohith", grade: "Grade 5", image: "/success/grade5/Mohith.png" },
        { name: "Yaduveer Rajpreeth", grade: "Grade 1", image: "/success/grade1/Yaduveer Rajpreeth.jpeg" },
        { name: "Charithrya", grade: "Grade 3", image: "/success/grade3/Charithrya.png" },
        { name: "Mohammed Aswad", grade: "Grade 4", image: "/success/grade4/Mohammed Aswad shaik.png" },
        { name: "Manvith S", grade: "Grade 6", image: "/success/grade6/Manvith. S.png" },
        { name: "Keerthana", grade: "Grade 7", image: "/success/grade7/Keerthana .png" },
        { name: "Yashaswini", grade: "Grade 9", image: "/success/grade9/Yashaswini .png" },
        { name: "Sirishree", grade: "Grade 2", image: "/success/grade2/sirishree.jpg" },
        { name: "Tushitha", grade: "Grade 3", image: "/success/grade3/Tushitha .png" },
        { name: "Mohammed Mustaqim", grade: "Grade 1", image: "/success/grade1/Mohammed Mustaqim.png" },
    ];

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="container px-4 mb-12">
                <motion.div
                    className="text-center max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B2545]">
                            Join the <span className="text-[#0096FF]">100% Club</span>
                        </h2>
                        <Link href="/quiz">
                            <Button
                                size="lg"
                                className="rounded-full bg-[#007AFF] hover:bg-[#0060C9] text-white font-bold px-8 shadow-lg shadow-blue-200"
                                style={{ fontFamily: 'var(--font-nunito)' }}
                            >
                                Proficiency Check
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                    <p className="text-lg text-[#0B2545]/70">
                        Recognizing students who have mastered math fundamentals.
                    </p>
                </motion.div>
            </div>

            {/* Marquee Container */}
            <div
                className="relative w-full flex overflow-hidden"
                style={{
                    maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
                    WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)"
                }}
            >
                <motion.div
                    className="flex gap-6 md:gap-8 px-4"
                    animate={{
                        x: ["0%", "-50%"],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 40, // Adjust speed here (higher = slower)
                            ease: "linear",
                        },
                    }}
                    style={{ width: "fit-content" }}
                >
                    {/* Render the list twice to create seamless loop */}
                    {[...students, ...students].map((student, index) => (
                        <div
                            key={index}
                            className="relative flex-shrink-0 w-64 md:w-72 bg-white rounded-2xl shadow-sm border border-blue-50 flex flex-col items-center text-center overflow-hidden group hover:shadow-md transition-shadow"
                        >
                            <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100">
                                <Image
                                    src={student.image}
                                    alt={student.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 256px, 288px"
                                />
                            </div>
                            <div className="p-4 w-full">
                                <h3 className="text-lg font-bold text-[#0B2545] line-clamp-1">
                                    {student.name}
                                </h3>
                                <p className="text-sm text-[#0096FF] font-medium">
                                    {student.grade}
                                </p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

        </section>
    );
};

export default HallOfFame;
