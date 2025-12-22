"use client";
import React, { useEffect, useState } from "react";

const Balloons = ({ show }) => {
    const [balloons, setBalloons] = useState([]);

    useEffect(() => {
        if (show) {
            const colors = ["#ef4444", "#3b82f6", "#eab308", "#22c55e", "#a855f7", "#f97316"]; // Tailwind colors: red, blue, yellow, green, purple, orange
            const newBalloons = Array.from({ length: 30 }).map((_, i) => ({
                id: i,
                left: Math.random() * 100,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 2,
                duration: 4 + Math.random() * 3,
                scale: 0.8 + Math.random() * 0.4
            }));
            setBalloons(newBalloons);
        }
    }, [show]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden">
            {balloons.map((b) => (
                <div
                    key={b.id}
                    className="absolute bottom-[-100px] flex flex-col items-center"
                    style={{
                        left: `${b.left}%`,
                        animation: `floatUp ${b.duration}s ease-in forwards`,
                        animationDelay: `${b.delay}s`,
                        transform: `scale(${b.scale})`
                    }}
                >
                    {/* Balloon Body */}
                    <div
                        className="w-16 h-20 rounded-t-full rounded-b-full shadow-lg relative"
                        style={{
                            backgroundColor: b.color,
                            boxShadow: `inset -5px -5px 10px rgba(0,0,0,0.1), 2px 2px 5px rgba(0,0,0,0.2)`,
                            borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%'
                        }}
                    >
                        {/* Shine */}
                        <div className="absolute top-3 left-3 w-3 h-6 bg-white opacity-30 rounded-full transform -rotate-45"></div>
                    </div>
                    {/* Balloon Knot */}
                    <div
                        className="w-2 h-2 mt-[-2px] relative z-10"
                        style={{ backgroundColor: b.color, borderRadius: '50%' }}
                    ></div>
                    {/* String */}
                    <div className="w-[1px] h-24 bg-gray-400 opacity-60 origin-top animate-wiggle"></div>
                </div>
            ))}
            <style jsx>{`
                @keyframes floatUp {
                    0% {
                        bottom: -100px;
                        opacity: 1;
                        transform: translateX(0) scale(var(--scale, 1));
                    }
                    50% {
                        opacity: 1;
                        transform: translateX(10px) scale(var(--scale, 1));
                    }
                    100% {
                        bottom: 120vh;
                        opacity: 0;
                        transform: translateX(-10px) scale(var(--scale, 1));
                    }
                }
                @keyframes wiggle {
                    0%, 100% { transform: rotate(-5deg); }
                    50% { transform: rotate(5deg); }
                }
                .animate-wiggle {
                    animation: wiggle 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default Balloons;
