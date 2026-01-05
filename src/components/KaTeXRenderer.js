"use client";
import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * Render text with KaTeX formulas
 * Supports inline ($...$) and display ($$...$$) math
 * 
 * @param {string} text - Text containing KaTeX formulas
 * @param {string} className - Additional CSS classes
 */
export default function KaTeXRenderer({ text, className = '' }) {
    if (!text) return null;

    try {
        // Split text by display math ($$...$$) first
        const displayParts = text.split(/(\$\$[^$]+\$\$)/g);

        return (
            <span className={className}>
                {displayParts.map((part, idx) => {
                    // Check if this is a display math block
                    if (part.startsWith('$$') && part.endsWith('$$')) {
                        const formula = part.slice(2, -2);
                        return (
                            <span key={idx} className="block my-2">
                                <BlockMath math={formula} errorColor="#dc2626" />
                            </span>
                        );
                    }

                    // Split by inline math ($...$)
                    const inlineParts = part.split(/(\$[^$]+\$)/g);

                    return inlineParts.map((inlinePart, inlineIdx) => {
                        // Check if this is inline math
                        if (inlinePart.startsWith('$') && inlinePart.endsWith('$') && inlinePart.length > 2) {
                            const formula = inlinePart.slice(1, -1);
                            return (
                                <InlineMath
                                    key={`${idx}-${inlineIdx}`}
                                    math={formula}
                                    errorColor="#dc2626"
                                />
                            );
                        }

                        // Regular text
                        return <span key={`${idx}-${inlineIdx}`}>{inlinePart}</span>;
                    });
                })}
            </span>
        );
    } catch (error) {
        console.error('KaTeX rendering error:', error);
        // Fallback to plain text if rendering fails
        return <span className={className}>{text}</span>;
    }
}

/**
 * Simple wrapper for inline formulas only
 */
export function InlineFormula({ formula, className = '' }) {
    if (!formula) return null;

    try {
        return <InlineMath math={formula} errorColor="#dc2626" className={className} />;
    } catch (error) {
        console.error('KaTeX inline rendering error:', error);
        return <span className={className}>${formula}$</span>;
    }
}

/**
 * Simple wrapper for display formulas only
 */
export function DisplayFormula({ formula, className = '' }) {
    if (!formula) return null;

    try {
        return (
            <div className={`my-2 ${className}`}>
                <BlockMath math={formula} errorColor="#dc2626" />
            </div>
        );
    } catch (error) {
        console.error('KaTeX display rendering error:', error);
        return <div className={className}>$${formula}$$</div>;
    }
}
