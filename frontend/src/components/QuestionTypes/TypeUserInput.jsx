/**
 * TypeUserInput Component
 * Text input question type - migrated from Next.js
 */
import { useState, useEffect, useRef } from 'react'
import styles from './TypeUserInput.module.css'

export default function TypeUserInput({
    question,
    userAnswer,
    onChange,
    onNext,
    isLastQuestion = false,
    inputType = 'text', // text, number
    placeholder = 'Enter your answer',
    imageUrl = null
}) {
    const [answer, setAnswer] = useState(userAnswer || '')
    const inputRef = useRef(null)

    useEffect(() => {
        setAnswer(userAnswer || '')
    }, [userAnswer, question])

    useEffect(() => {
        // Auto-focus input when component mounts
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [question])

    const handleInputChange = (e) => {
        let value = e.target.value

        // For number type, only allow digits and decimal
        if (inputType === 'number') {
            value = value.replace(/[^0-9.-]/g, '')
        }

        setAnswer(value)
        if (onChange) {
            onChange(value)
        }
    }

    const handleSubmit = () => {
        if (onNext) {
            onNext(answer)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

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

            {/* Input Area */}
            <div className={styles.inputContainer}>
                <input
                    ref={inputRef}
                    type={inputType === 'number' ? 'number' : 'text'}
                    value={answer}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={styles.input}
                    autoComplete="off"
                />
                <span className={styles.hint}>Press Enter to submit</span>
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
