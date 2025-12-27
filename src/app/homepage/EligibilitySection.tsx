"use client";
import { motion } from "framer-motion";
import { GraduationCap, Book, Users } from "lucide-react";

const EligibilitySection = () => {
  const criteria = [
    {
      icon: GraduationCap,
      title: "Grades 1 – 10",
      description: "Designed for students across all primary and secondary levels.",
    },
    {
      icon: Book,
      title: "Any Board",
      description: "CBSE, ICSE, State Boards, International — all welcome.",
    },
    {
      icon: Users,
      title: "Any Skill Level",
      description: "Whether your child loves math or finds it challenging.",
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="container px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0B2545]">
              Is This For <span className="text-[#0096FF]">Your Child?</span>
            </h2>
            <p className="text-lg text-[#0B2545]/70">
              Yes, if they fall into any of these categories.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {criteria.map((item, index) => (
              <motion.div
                key={index}
                className="text-center p-8 rounded-3xl bg-[#F8FBFF] shadow-sm border border-blue-50"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <div className="w-16 h-16 rounded-2xl bg-[#0096FF]/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-8 h-8 text-[#0096FF]" />
                </div>
                <h3 className="text-xl font-bold text-[#0B2545] mb-2">{item.title}</h3>
                <p className="text-[#0B2545]/70">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EligibilitySection;
