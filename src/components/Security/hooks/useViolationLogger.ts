"use client"

import { useState, useEffect, useCallback } from 'react'
import { ViolationType, ViolationEvent, ViolationLog, BrowserInfo } from '../types'
import { useAuth } from '@/context/AuthContext'

interface UseViolationLoggerProps {
    testType: 'speed-test' | 'assessment'
    testId: string
    enabled: boolean
}

export function useViolationLogger({ testType, testId, enabled }: UseViolationLoggerProps) {
    const { user, activeChild, activeChildId } = useAuth()
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    const [violations, setViolations] = useState<ViolationEvent[]>([])
    const [sessionDocId, setSessionDocId] = useState<string | null>(null)
    const [startTime] = useState(new Date())

    // Get browser information
    const getBrowserInfo = useCallback((): BrowserInfo => {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`
        }
    }, [])

    // Initialize session via API
    useEffect(() => {
        if (!enabled || !user) return

        const initializeSession = async () => {
            try {
                // Use API
                await fetch('/api/security', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'start',
                        sessionId,
                        userId: user.uid,
                        childId: activeChildId || null,
                        childName: activeChild?.name || null,
                        testType,
                        testId,
                        startTime,
                        browserInfo: getBrowserInfo()
                    })
                });

                setSessionDocId(sessionId) // Use sessionId as docId equivalent
                console.log('📝 Security session initialized:', sessionId)
            } catch (error) {
                console.error('Error initializing security session:', error)
            }
        }

        initializeSession()
    }, [enabled, user, activeChildId, activeChild, testType, testId, sessionId, startTime, getBrowserInfo])

    // Log a violation
    const logViolation = useCallback(async (
        type: ViolationType,
        details: string,
        warningShown: boolean = false
    ) => {
        if (!enabled || !sessionDocId) return

        const violation: ViolationEvent = {
            type,
            timestamp: new Date(),
            details,
            warningShown
        }

        setViolations(prev => {
            const updated = [...prev, violation]

            // Send to API
            fetch('/api/security', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'log',
                    sessionId: sessionDocId,
                    violation
                })
            }).catch(err => console.error('Error logging violation:', err))

            return updated
        })

        console.log(`🚨 Violation logged: ${type} - ${details}`)
    }, [enabled, sessionDocId])

    // End session
    const endSession = useCallback(async (autoSubmitted: boolean = false) => {
        if (!enabled || !sessionDocId) return

        try {
            await fetch('/api/security', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'end',
                    sessionId: sessionDocId,
                    autoSubmitted
                })
            });
            console.log('✅ Security session ended:', sessionId)
        } catch (error) {
            console.error('Error ending security session:', error)
        }
    }, [enabled, sessionDocId, sessionId])

    return {
        logViolation,
        endSession,
        violations,
        sessionId
    }
}
