import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names with Tailwind CSS conflict resolution
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

/**
 * Format date to readable string
 */
export function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    }
    return new Date(date).toLocaleDateString('en-IN', defaultOptions)
}

/**
 * Format time duration from seconds
 */
export function formatDuration(seconds) {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get grade display name
 */
export function getGradeDisplay(grade) {
    if (!grade) return ''
    if (grade.toLowerCase() === 'neet') return 'NEET'
    if (grade.toLowerCase() === 'sat') return 'SAT'
    return grade
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value, total) {
    if (!total) return 0
    return Math.round((value / total) * 100)
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}
