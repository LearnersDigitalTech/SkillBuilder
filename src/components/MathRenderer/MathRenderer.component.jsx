"use client";
import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * MathRenderer Component
 * 
 * Intelligently renders text containing mathematical expressions using KaTeX.
 * Supports:
 * - Inline math: $expression$
 * - Display math: $$expression$$
 * - Mixed content: text with embedded math
 * - HTML tags (preserves existing HTML structure)
 * 
 * @param {string} content - The content to render (may contain LaTeX, HTML, and plain text)
 * @param {string} className - Optional CSS class for the container
 */
const MathRenderer = ({ content, className = '' }) => {
    if (!content) return null;

    // Parse content and identify math expressions
    const parseContent = (text) => {
        const parts = [];
        let currentIndex = 0;
        let partKey = 0;

        // Regular expression to match $$...$$ (display math) or $...$ (inline math)
        // We need to handle display math first to avoid conflicts
        const displayMathRegex = /\$\$(.*?)\$\$/g;
        const inlineMathRegex = /\$(.*?)\$/g;

        // First, replace display math with placeholders
        const displayMathMatches = [];
        let tempText = text.replace(displayMathRegex, (match, expression, offset) => {
            displayMathMatches.push({ expression, offset, type: 'display' });
            return `__DISPLAY_MATH_${displayMathMatches.length - 1}__`;
        });

        // Then, replace inline math with placeholders
        const inlineMathMatches = [];
        tempText = tempText.replace(inlineMathRegex, (match, expression, offset) => {
            inlineMathMatches.push({ expression, offset, type: 'inline' });
            return `__INLINE_MATH_${inlineMathMatches.length - 1}__`;
        });

        // Now split by placeholders and reconstruct with rendered math
        const allMatches = [
            ...displayMathMatches.map((m, i) => ({ ...m, placeholder: `__DISPLAY_MATH_${i}__` })),
            ...inlineMathMatches.map((m, i) => ({ ...m, placeholder: `__INLINE_MATH_${i}__` }))
        ];

        // Sort matches by their position in the final tempText string
        // This is crucial because we process them sequentially using remainingText
        allMatches.sort((a, b) => tempText.indexOf(a.placeholder) - tempText.indexOf(b.placeholder));

        // Split text by all placeholders
        let remainingText = tempText;
        const segments = [];

        allMatches.forEach((match) => {
            const index = remainingText.indexOf(match.placeholder);
            if (index !== -1) {
                // Add text before placeholder
                if (index > 0) {
                    segments.push({ type: 'text', content: remainingText.substring(0, index) });
                }
                // Add math
                segments.push({ type: match.type, content: match.expression });
                // Update remaining text
                remainingText = remainingText.substring(index + match.placeholder.length);
            }
        });

        // Add any remaining text
        if (remainingText) {
            segments.push({ type: 'text', content: remainingText });
        }

        // Render segments
        return segments.map((segment, index) => {
            if (segment.type === 'text') {
                // Render as HTML to preserve existing HTML tags
                return (
                    <span
                        key={`text-${index}`}
                        dangerouslySetInnerHTML={{ __html: segment.content }}
                    />
                );
            } else {
                // Render math
                try {
                    const html = katex.renderToString(segment.content, {
                        displayMode: segment.type === 'display',
                        throwOnError: false,
                        output: 'html',
                        strict: false
                    });
                    return (
                        <span
                            key={`math-${index}`}
                            dangerouslySetInnerHTML={{ __html: html }}
                            style={segment.type === 'display' ? { display: 'block', textAlign: 'center', margin: '1rem 0' } : {}}
                        />
                    );
                } catch (error) {
                    console.error('KaTeX rendering error:', error);
                    // Fallback to original text if rendering fails
                    return <span key={`error-${index}`}>${segment.content}$</span>;
                }
            }
        });
    };

    return (
        <div className={className}>
            {parseContent(content)}
        </div>
    );
};

export default MathRenderer;
