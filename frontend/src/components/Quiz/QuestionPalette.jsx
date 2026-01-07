/**
 * Question Palette Component
 * Shows question navigation grid - migrated from Next.js
 */
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './QuestionPalette.module.css'

export default function QuestionPalette({
    questions = [],
    activeQuestionIndex = 0,
    onSelect,
    onPrevious,
    onNext,
    isLastQuestion = false
}) {
    const getQuestionStatus = (question, index) => {
        if (index === activeQuestionIndex) return 'active'
        if (question?.userAnswer) return 'answered'
        if (question?.markedForReview) return 'review'
        return 'unanswered'
    }

    return (
        <div className={styles.palette}>
            <div className={styles.header}>
                <h3>Questions</h3>
                <span className={styles.count}>
                    {questions.filter(q => q?.userAnswer).length}/{questions.length}
                </span>
            </div>

            <div className={styles.grid}>
                {questions.map((question, index) => (
                    <button
                        key={index}
                        className={`${styles.questionButton} ${styles[getQuestionStatus(question, index)]}`}
                        onClick={() => onSelect(index)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <span className={`${styles.dot} ${styles.answered}`}></span>
                    <span>Answered</span>
                </div>
                <div className={styles.legendItem}>
                    <span className={`${styles.dot} ${styles.unanswered}`}></span>
                    <span>Not Answered</span>
                </div>
                <div className={styles.legendItem}>
                    <span className={`${styles.dot} ${styles.active}`}></span>
                    <span>Current</span>
                </div>
            </div>

            <div className={styles.navigation}>
                <button
                    onClick={onPrevious}
                    disabled={activeQuestionIndex === 0}
                    className={styles.navButton}
                >
                    <ChevronLeft size={20} />
                    Previous
                </button>
                <button
                    onClick={onNext}
                    className={`${styles.navButton} ${isLastQuestion ? styles.submit : ''}`}
                >
                    {isLastQuestion ? 'Submit' : 'Next'}
                    {!isLastQuestion && <ChevronRight size={20} />}
                </button>
            </div>
        </div>
    )
}
