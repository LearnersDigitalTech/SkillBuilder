"use client";
import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * RichText Component - Renders formatted text with markup support
 * 
 * Supported Markup:
 * - **bold** - Bold text
 * - *italic* - Italic text  
 * - $formula$ - Inline KaTeX math
 * - $$formula$$ - Block KaTeX math
 * - `code` - Inline code
 * - \n or actual line breaks - New lines
 * - [u]underline[/u] - Underlined text
 * - [sub]subscript[/sub] - Subscript (like H[sub]2[/sub]O)
 * - [sup]superscript[/sup] - Superscript (like x[sup]2[/sup])
 */

const RichText = ({ text, className = '' }) => {
    if (!text) return null;

    // Convert text to string if it's not
    const content = String(text);

    // Parse and render the content
    const renderContent = () => {
        // Split by block math first ($$...$$)
        const blockMathParts = content.split(/(\$\$[^$]+\$\$)/g);

        return blockMathParts.map((part, blockIdx) => {
            // Check if this is a block math
            if (part.startsWith('$$') && part.endsWith('$$')) {
                const math = part.slice(2, -2);
                try {
                    return (
                        <div key={blockIdx} className="my-2">
                            <BlockMath math={math} />
                        </div>
                    );
                } catch (e) {
                    return <span key={blockIdx} className="text-red-500">{part}</span>;
                }
            }

            // Process inline content (split by new lines first)
            const lines = part.split(/\\n|\n/);

            return lines.map((line, lineIdx) => (
                <React.Fragment key={`${blockIdx}-${lineIdx}`}>
                    {lineIdx > 0 && <br />}
                    {renderInlineContent(line, `${blockIdx}-${lineIdx}`)}
                </React.Fragment>
            ));
        });
    };

    const renderInlineContent = (text, keyPrefix) => {
        // Regex patterns for inline elements
        const patterns = [
            { regex: /\$([^$]+)\$/g, type: 'math' },           // $inline math$
            { regex: /\*\*([^*]+)\*\*/g, type: 'bold' },       // **bold**
            { regex: /\*([^*]+)\*/g, type: 'italic' },         // *italic*
            { regex: /`([^`]+)`/g, type: 'code' },             // `code`
            { regex: /\[u\]([^\[]+)\[\/u\]/g, type: 'underline' }, // [u]underline[/u]
            { regex: /\[sub\]([^\[]+)\[\/sub\]/g, type: 'subscript' }, // [sub]subscript[/sub]
            { regex: /\[sup\]([^\[]+)\[\/sup\]/g, type: 'superscript' }, // [sup]superscript[/sup]
        ];

        // Find all matches with their positions
        let elements = [];
        let lastIndex = 0;

        // Combined regex to find all matches
        const combinedRegex = /(\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[u\][^\[]+\[\/u\]|\[sub\][^\[]+\[\/sub\]|\[sup\][^\[]+\[\/sup\])/g;

        let match;
        let matchIndex = 0;
        while ((match = combinedRegex.exec(text)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
                elements.push(
                    <span key={`${keyPrefix}-text-${matchIndex}`}>
                        {text.slice(lastIndex, match.index)}
                    </span>
                );
            }

            // Process the match
            const matchText = match[0];
            matchIndex++;

            if (matchText.startsWith('$$')) {
                // Block math - already handled above
            } else if (matchText.startsWith('$') && matchText.endsWith('$')) {
                // Inline math
                const math = matchText.slice(1, -1);
                try {
                    elements.push(<InlineMath key={`${keyPrefix}-math-${matchIndex}`} math={math} />);
                } catch (e) {
                    elements.push(<span key={`${keyPrefix}-math-${matchIndex}`} className="text-red-500">{matchText}</span>);
                }
            } else if (matchText.startsWith('**') && matchText.endsWith('**')) {
                // Bold
                elements.push(
                    <strong key={`${keyPrefix}-bold-${matchIndex}`} className="font-bold">
                        {matchText.slice(2, -2)}
                    </strong>
                );
            } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
                // Italic
                elements.push(
                    <em key={`${keyPrefix}-italic-${matchIndex}`} className="italic">
                        {matchText.slice(1, -1)}
                    </em>
                );
            } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
                // Inline code
                elements.push(
                    <code key={`${keyPrefix}-code-${matchIndex}`} className="bg-slate-100 px-1 py-0.5 rounded text-sm font-mono text-pink-600">
                        {matchText.slice(1, -1)}
                    </code>
                );
            } else if (matchText.startsWith('[u]') && matchText.endsWith('[/u]')) {
                // Underline
                elements.push(
                    <span key={`${keyPrefix}-underline-${matchIndex}`} className="underline">
                        {matchText.slice(3, -4)}
                    </span>
                );
            } else if (matchText.startsWith('[sub]') && matchText.endsWith('[/sub]')) {
                // Subscript
                elements.push(
                    <sub key={`${keyPrefix}-sub-${matchIndex}`}>
                        {matchText.slice(5, -6)}
                    </sub>
                );
            } else if (matchText.startsWith('[sup]') && matchText.endsWith('[/sup]')) {
                // Superscript
                elements.push(
                    <sup key={`${keyPrefix}-sup-${matchIndex}`}>
                        {matchText.slice(5, -6)}
                    </sup>
                );
            }

            lastIndex = match.index + matchText.length;
        }

        // Add remaining text
        if (lastIndex < text.length) {
            elements.push(
                <span key={`${keyPrefix}-text-final`}>
                    {text.slice(lastIndex)}
                </span>
            );
        }

        return elements.length > 0 ? elements : text;
    };

    return (
        <div className={className}>
            {renderContent()}
        </div>
    );
};

export default RichText;
