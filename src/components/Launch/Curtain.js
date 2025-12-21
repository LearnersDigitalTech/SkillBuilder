"use client";

import React from "react";

const Curtain = ({ open }) => {
    return (
        <div
            className={`fixed inset-0 z-[9999] pointer-events-none flex ${open ? "opacity-0 transition-opacity delay-1000 duration-500" : "opacity-100"
                }`}
        >
            {/* Left Curtain */}
            <div
                className={`relative h-full w-1/2 transition-transform duration-[2000ms] ease-[cubic-bezier(0.77,0,0.175,1)] ${open ? "-translate-x-full" : "translate-x-0"
                    }`}
                style={{
                    background: "linear-gradient(90deg, #0f1035 0%, #2e2b69 20%, #1a1a4a 40%, #3e3b85 60%, #1a1a4a 80%, #2e2b69 100%)",
                    boxShadow: "10px 0 30px rgba(0,0,0,0.8), inset -5px 0 15px rgba(0,0,0,0.5)"
                }}
            >
                {/* Subtle texture/noise overlay (optional, keeping clean for now using gradients) */}
                {/* Gold trim line on right edge */}
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-yellow-600 shadow-[0_0_10px_rgba(255,215,0,0.6)]"></div>
            </div>

            {/* Right Curtain */}
            <div
                className={`relative h-full w-1/2 transition-transform duration-[2000ms] ease-[cubic-bezier(0.77,0,0.175,1)] ${open ? "translate-x-full" : "translate-x-0"
                    }`}
                style={{
                    background: "linear-gradient(90deg, #2e2b69 0%, #1a1a4a 20%, #3e3b85 40%, #1a1a4a 60%, #2e2b69 80%, #0f1035 100%)",
                    boxShadow: "-10px 0 30px rgba(0,0,0,0.8), inset 5px 0 15px rgba(0,0,0,0.5)"
                }}
            >
                {/* Gold trim line on left edge */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-600 shadow-[0_0_10px_rgba(255,215,0,0.6)]"></div>
            </div>
        </div>
    );
};

export default Curtain;
