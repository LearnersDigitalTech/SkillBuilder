"use client"

import { useState, useEffect, useCallback } from 'react'
import { ViolationType } from '../types'

interface UseSecurityMonitorProps {
    enableFullscreen: boolean
    enableTabSwitchDetection: boolean
    maxTabSwitches: number
    onViolation?: (type: ViolationType, count: number) => void
    onAutoSubmit?: () => void
    logViolation: (type: ViolationType, details: string, warningShown: boolean) => void
}

export function useSecurityMonitor({
    enableFullscreen,
    enableTabSwitchDetection,
    maxTabSwitches,
    onViolation,
    onAutoSubmit,
    logViolation
}: UseSecurityMonitorProps) {
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [tabSwitchCount, setTabSwitchCount] = useState(0)
    const [showWarning, setShowWarning] = useState(false)
    const [currentViolationType, setCurrentViolationType] = useState<ViolationType | null>(null)

    // Enter fullscreen
    const enterFullscreen = useCallback(async () => {
        if (!enableFullscreen) return

        try {
            const elem = document.documentElement
            if (elem.requestFullscreen) {
                await elem.requestFullscreen()
            } else if ((elem as any).webkitRequestFullscreen) {
                await (elem as any).webkitRequestFullscreen()
            } else if ((elem as any).msRequestFullscreen) {
                await (elem as any).msRequestFullscreen()
            }
        } catch (error) {
            console.error('Error entering fullscreen:', error)
            logViolation('fullscreen-exit', 'Failed to enter fullscreen', false)
        }
    }, [enableFullscreen, logViolation])

    // Monitor fullscreen changes
    useEffect(() => {
        if (!enableFullscreen) return

        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(
                document.fullscreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).msFullscreenElement
            )

            setIsFullscreen(isCurrentlyFullscreen)

            if (!isCurrentlyFullscreen && enableFullscreen) {
                // User exited fullscreen
                logViolation('fullscreen-exit', 'User exited fullscreen mode', true)
                setCurrentViolationType('fullscreen-exit')
                setShowWarning(true)
                onViolation?.('fullscreen-exit', 1)

                // Re-enter fullscreen after a short delay
                setTimeout(() => {
                    enterFullscreen()
                }, 2000)
            }
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
        document.addEventListener('msfullscreenchange', handleFullscreenChange)

        // Enter fullscreen on mount
        enterFullscreen()

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
            document.removeEventListener('msfullscreenchange', handleFullscreenChange)
        }
    }, [enableFullscreen, enterFullscreen, logViolation, onViolation])

    // Monitor tab switches (visibility changes)
    useEffect(() => {
        if (!enableTabSwitchDetection) return

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitchCount(prev => {
                    const newCount = prev + 1
                    const warningShown = newCount <= maxTabSwitches

                    logViolation(
                        'tab-switch',
                        `Tab switch #${newCount} detected`,
                        warningShown
                    )

                    // Show warning for 1st and 2nd violations only
                    if (newCount < maxTabSwitches) {
                        setCurrentViolationType('tab-switch')
                        setShowWarning(true)
                        onViolation?.('tab-switch', newCount)
                    }

                    if (newCount >= maxTabSwitches) {
                        // Auto-submit after max violations
                        // DON'T show warning modal - go directly to name dialog
                        console.log('🚨 Max tab switches reached, auto-submitting...')
                        setShowWarning(false) // Ensure warning is closed
                        setTimeout(() => {
                            onAutoSubmit?.()
                        }, 100) // Reduced delay
                    }

                    return newCount
                })
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [enableTabSwitchDetection, maxTabSwitches, logViolation, onViolation, onAutoSubmit])

    return {
        isFullscreen,
        tabSwitchCount,
        showWarning,
        setShowWarning,
        currentViolationType,
        enterFullscreen
    }
}
