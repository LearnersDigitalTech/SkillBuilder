"use client"

import { useState, useEffect, useCallback } from 'react'
import { ViolationType, ViolationEvent, ViolationLog, BrowserInfo } from '../types'
import { db, auth } from '@/backend/firebaseHandler'
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
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

    // Initialize session in Firebase
    useEffect(() => {
        if (!enabled || !user) return

        const initializeSession = async () => {
            try {
                const violationLog: Omit<ViolationLog, 'endTime'> & { endTime: null } = {
                    userId: user.uid,
                    childId: activeChildId || null,
                    childName: activeChild?.name || null,
                    testType,
                    testId,
                    sessionId,
                    startTime,
                    endTime: null,
                    violations: [],
                    browserInfo: getBrowserInfo(),
                    autoSubmitted: false,
                    totalViolations: 0
                }

                const docRef = await addDoc(collection(db, 'testViolations'), {
                    ...violationLog,
                    startTime: serverTimestamp(),
                    endTime: null
                })

                setSessionDocId(docRef.id)
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

            // Update Firebase - use Date objects instead of serverTimestamp() in arrays
            updateDoc(doc(db, 'testViolations', sessionDocId), {
                violations: updated, // Don't transform timestamps - use Date objects directly
                totalViolations: updated.length
            }).catch(err => console.error('Error updating violations:', err))

            return updated
        })

        console.log(`🚨 Violation logged: ${type} - ${details}`)
    }, [enabled, sessionDocId])

    // End session
    const endSession = useCallback(async (autoSubmitted: boolean = false) => {
        if (!enabled || !sessionDocId) return

        try {
            await updateDoc(doc(db, 'testViolations', sessionDocId), {
                endTime: serverTimestamp(),
                autoSubmitted,
                totalViolations: violations.length
            })
            console.log('✅ Security session ended:', sessionId)
        } catch (error) {
            console.error('Error ending security session:', error)
        }
    }, [enabled, sessionDocId, violations.length, sessionId])

    return {
        logViolation,
        endSession,
        violations,
        sessionId
    }
}
