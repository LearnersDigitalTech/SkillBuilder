"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";

export const GearsOfThought = ({ className = "" }: { className?: string }) => {
    return (
        <div className={`relative w-28 h-28 pointer-events-none select-none ${className}`}>
            {/* Gear 1: Large Blue - Clockwise */}
            <motion.div
                className="absolute top-0 right-0 text-[#0096FF]/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            >
                <Settings className="w-16 h-16" />
            </motion.div>

            {/* Gear 2: Medium Orange - Counter-Clockwise (Meshing) */}
            <motion.div
                className="absolute bottom-2 right-10 text-[#FF9F43]/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            >
                <Settings className="w-12 h-12" />
            </motion.div>

            {/* Gear 3: Small Navy - Clockwise */}
            <motion.div
                className="absolute top-2 right-14 text-[#0B2545]/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
                <Settings className="w-8 h-8" />
            </motion.div>
        </div>
    );
};

export default GearsOfThought;
