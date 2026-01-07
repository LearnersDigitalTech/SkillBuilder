/**
 * TypeMCQ Component
 * Multiple Choice Question type - migrated from Next.js
 */
import { useState, useEffect } from 'react'
import styles from './TypeMCQ.module.css'

export default function TypeMCQ({
    question,
    options = [],
    userAnswer,
    onChange,
    onNext,
    isLastQuestion = false,
    imageUrl = null
}) {
    const [selectedOption, setSelectedOption] = useState(userAnswer || null)

    useEffect(() => {
        setSelectedOption(userAnswer || null)
    }, [userAnswer, question])

    const handleOptionSelect = (optionId) => {
        setSelectedOption(optionId)
        if (onChange) {
            onChange(optionId)
        }
    }

    const handleSubmit = () => {
        if (onNext) {
            onNext(selectedOption)
        }
    }

    // Parse options if they're objects with id/text structure
    const parsedOptions = options.map((opt, idx) => {
        if (typeof opt === 'object' && opt !== null) {
            return {
                id: opt.id || opt.key || String.fromCharCode(97 + idx),
                text: opt.text || opt.value || opt.label || JSON.stringify(opt)
            }
        }
        return {
            id: String.fromCharCode(97 + idx),
            text: String(opt)
        }
    })

    return (
        <div className={styles.container}>
            {/* Question Text */}
            <div className={styles.questionSection}>
                <p className={styles.questionText}>{question}</p>

                {imageUrl && (
                    <div className={styles.imageContainer}>
                        <img src={imageUrl} alt="Question illustration" className={styles.image} />
                    </div>
                )}
            </div>

            {/* Options */}
            <div className={styles.optionsContainer}>
                {parsedOptions.map((option) => (
                    <button
                        key={option.id}
                        className={`${styles.option} ${selectedOption === option.id ? styles.selected : ''}`}
                        onClick={() => handleOptionSelect(option.id)}
                    >
                        <span className={styles.optionLabel}>{option.id.toUpperCase()}</span>
                        <span className={styles.optionText}>{option.text}</span>
                    </button>
                ))}
            </div>

            {/* Next Button */}
            <button
                onClick={handleSubmit}
                className={`${styles.nextButton} ${isLastQuestion ? styles.submit : ''}`}
            >
                {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
            </button>
        </div>
    )
}
