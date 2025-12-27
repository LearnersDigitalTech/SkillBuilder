"use client";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const Footer = () => {
    return (
        <footer className="py-8 bg-white border-t border-blue-50">
            <div className="container px-4">
                <motion.div
                    className="flex flex-col md:flex-row items-center justify-between gap-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    {/* <div className="flex items-center gap-2 text-[#0B2545]/60 text-sm">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-[#FF9F43] fill-[#FF9F43]" />
                        <span>for curious young minds</span>
                    </div> */}

                    {/* <div className="flex items-center gap-6 text-sm text-[#0B2545]/60">
                        <a href="#" className="hover:text-[#007AFF] transition-colors">
                            Privacy
                        </a>
                        <a href="#" className="hover:text-[#007AFF] transition-colors">
                            Terms
                        </a>
                        <a href="#" className="hover:text-[#007AFF] transition-colors">
                            Contact
                        </a>
                    </div> */}

                    <p className="text-sm text-[#0B2545]/60">
                        © 2025 Learners Digital Private Limited
                    </p>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;

