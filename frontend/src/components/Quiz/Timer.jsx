/**
 * Timer Component
 * Countdown timer for quizzes - migrated from Next.js
 */
import { useState, useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'
import styles from './Timer.module.css'

export default function Timer({
    initialTime = 1800, // 30 minutes default
    onTimeUpdate,
    onTimeFinished
}) {
    const [timeLeft, setTimeLeft] = useState(initialTime)
    const intervalRef = useRef(null)

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                const newTime = prev - 1

                if (onTimeUpdate) {
                    onTimeUpdate(newTime)
                }

                if (newTime <= 0) {
                    clearInterval(intervalRef.current)
                    if (onTimeFinished) {
                        onTimeFinished(0)
                    }
                    return 0
                }

                return newTime
            })
        }, 1000)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [onTimeUpdate, onTimeFinished])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const isLowTime = timeLeft <= 60
    const isCriticalTime = timeLeft <= 30

    return (
        <div className={`${styles.timer} ${isLowTime ? styles.lowTime : ''} ${isCriticalTime ? styles.criticalTime : ''}`}>
            <Clock size={18} className={styles.icon} />
            <span className={styles.time}>{formatTime(timeLeft)}</span>
        </div>
    )
}
