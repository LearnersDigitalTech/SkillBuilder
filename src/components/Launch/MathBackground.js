"use client";
import React, { useEffect, useState } from "react";

const SYMBOLS = [
    "∑", "∫", "π", "∞", "√", "≈", "≠", "±", "×", "÷",
    "α", "β", "θ", "λ", "Δ", "Ω", "μ", "φ",
    "x²", "sin(x)", "log(x)", "e^x",
    "a² + b² = c²", "E = mc²", "F = ma"
];

const MathBackground = () => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        // Generate random math items
        const newItems = Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            text: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: Math.random() * 3 + 2, // 2rem to 5rem (larger)
            duration: Math.random() * 10 + 10, // 10s to 20s (smoother, continuous)
            delay: Math.random() * 5,
            opacity: Math.random() * 0.15 + 0.05, // 0.05 to 0.2 opacity (subtle)
        }));
        setItems(newItems);
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="absolute font-serif text-white whitespace-nowrap select-none"
                    style={{
                        left: `${item.left}%`,
                        top: `${item.top}%`,
                        fontSize: `${item.size}rem`,
                        opacity: item.opacity,
                        animation: `float ${item.duration}s infinite linear`,
                        animationDelay: `-${item.delay}s`,
                    }}
                >
                    {item.text}
                </div>
            ))}
        </div>
    );
};

export default MathBackground;
