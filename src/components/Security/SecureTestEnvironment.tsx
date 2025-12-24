"use client"

import { useEffect, useCallback } from 'react'
import { SecureTestEnvironmentProps, ViolationType } from './types'
import { useViolationLogger } from './hooks/useViolationLogger'
import { useSecurityMonitor } from './hooks/useSecurityMonitor'
import { SecurityWarningModal } from './SecurityWarningModal'

export function SecureTestEnvironment({
    children,
    onViolation,
    onAutoSubmit,
    maxTabSwitches = 3,
    enableFullscreen = true,
    enableRightClickBlock = true,
    enableTabSwitchDetection = true,
    enableExtensionDetection = true,
    enableScreenshotDetection = true,
    testName = "Test",
    testType,
    testId,
    disableSecurityWhileNaming = false
}: SecureTestEnvironmentProps) {

    // Initialize violation logger
    const { logViolation, endSession, violations } = useViolationLogger({
        testType,
        testId,
        enabled: true
    })

    // Initialize security monitor
    const {
        tabSwitchCount,
        showWarning,
        setShowWarning,
        currentViolationType,
        enterFullscreen
    } = useSecurityMonitor({
        enableFullscreen: enableFullscreen && !disableSecurityWhileNaming, // Disable when naming
        enableTabSwitchDetection: enableTabSwitchDetection && !disableSecurityWhileNaming, // Disable when naming
        maxTabSwitches,
        onViolation,
        onAutoSubmit: () => {
            endSession(true) // Mark as auto-submitted
            onAutoSubmit?.()
        },
        logViolation
    })

    // Prevent right-click
    useEffect(() => {
        if (!enableRightClickBlock) return

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault()
            logViolation('right-click', 'Right-click attempt blocked', false)
        }

        document.addEventListener('contextmenu', handleContextMenu)
        return () => document.removeEventListener('contextmenu', handleContextMenu)
    }, [enableRightClickBlock, logViolation])

    // Prevent text selection and copy/paste
    useEffect(() => {
        if (!enableRightClickBlock) return

        const handleCopy = (e: ClipboardEvent) => {
            // Allow copy in input fields (for user's own typing)
            const target = e.target as HTMLElement
            const isInputField = target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
                || target.closest('[role="dialog"]') !== null // MUI Dialog

            // CRITICAL FIX: Skip ALL blocking if in input field
            if (isInputField) {
                return // Allow all keyboard input
            }

            if (!isInputField) {
                e.preventDefault()
                logViolation('copy-attempt', 'Copy attempt blocked', false)
            }
        }

        const handlePaste = (e: ClipboardEvent) => {
            // Allow paste in input fields
            const target = e.target as HTMLElement
            const isInputField = target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
                || target.closest('[role="dialog"]') !== null // MUI Dialog

            // CRITICAL FIX: Skip ALL blocking if in input field
            if (isInputField) {
                return // Allow all keyboard input
            }

            if (!isInputField) {
                e.preventDefault()
                logViolation('paste-attempt', 'Paste attempt blocked', false)
            }
        }

        const handleSelectStart = (e: Event) => {
            // Allow text selection in input fields (needed for typing/editing)
            const target = e.target as HTMLElement
            const isInputField = target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable
                || target.closest('[role="dialog"]') !== null // MUI Dialog

            // CRITICAL FIX: Skip ALL blocking if in input field
            if (isInputField) {
                return // Allow all keyboard input
            }

            if (!isInputField) {
                e.preventDefault()
            }
        }

        document.addEventListener('copy', handleCopy)
        document.addEventListener('paste', handlePaste)
        document.addEventListener('selectstart', handleSelectStart)

        return () => {
            document.removeEventListener('copy', handleCopy)
            document.removeEventListener('paste', handlePaste)
            document.removeEventListener('selectstart', handleSelectStart)
        }
    }, [enableRightClickBlock, logViolation])

    // Block keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Allow typing in input fields, textareas, and select elements
            const target = e.target as HTMLElement
            const isInputField = target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable
                || target.closest('[role="dialog"]') !== null // MUI Dialog

            // CRITICAL FIX: Skip ALL blocking if in input field
            if (isInputField) {
                return // Allow all keyboard input
            }

            // F12 - Developer Tools
            if (e.key === 'F12') {
                e.preventDefault()
                logViolation('keyboard-shortcut', 'F12 (DevTools) blocked', false)
                return
            }

            // Ctrl+Shift+I - Inspect Element
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault()
                logViolation('keyboard-shortcut', 'Ctrl+Shift+I (Inspect) blocked', false)
                return
            }

            // Ctrl+Shift+J - Console
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault()
                logViolation('keyboard-shortcut', 'Ctrl+Shift+J (Console) blocked', false)
                return
            }

            // Ctrl+Shift+C - Element Picker
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault()
                logViolation('keyboard-shortcut', 'Ctrl+Shift+C (Element Picker) blocked', false)
                return
            }

            // Ctrl+U - View Source
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault()
                logViolation('keyboard-shortcut', 'Ctrl+U (View Source) blocked', false)
                return
            }

            // Ctrl+S - Save Page
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault()
                logViolation('keyboard-shortcut', 'Ctrl+S (Save) blocked', false)
                return
            }

            // Ctrl+P - Print
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault()
                logViolation('keyboard-shortcut', 'Ctrl+P (Print) blocked', false)
                return
            }

            // Windows Calculator shortcuts
            // Win key (blocks Windows key to prevent Win+R, Win+Calc, etc.)
            // BUT allow normal typing in input fields
            if ((e.key === 'Meta' || e.metaKey) && !isInputField) {
                e.preventDefault()
                logViolation('keyboard-shortcut', 'Windows key blocked (prevents calculator/run dialog)', false)
                return
            }

            // Calculator key (some keyboards have dedicated calc key)
            if (e.key === 'Calculator') {
                e.preventDefault()
                logViolation('keyboard-shortcut', 'Calculator key blocked', false)
                return
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [logViolation])

    // Detect PrintScreen and screenshot attempts
    useEffect(() => {
        if (!enableScreenshotDetection) return

        const handleKeyUp = (e: KeyboardEvent) => {
            // PrintScreen key
            if (e.key === 'PrintScreen') {
                logViolation('screenshot-attempt', 'PrintScreen key detected', false)
                // Clear clipboard to prevent screenshot paste
                navigator.clipboard.writeText('').catch(() => { })
            }

            // Windows Snipping Tool (Win + Shift + S)
            if (e.key === 's' && e.shiftKey && e.metaKey) {
                e.preventDefault()
                logViolation('screenshot-attempt', 'Snipping tool shortcut detected', false)
            }
        }

        document.addEventListener('keyup', handleKeyUp)
        return () => document.removeEventListener('keyup', handleKeyUp)
    }, [enableScreenshotDetection, logViolation])

    // Detect when window loses focus (potential screenshot tool or Google Lens)
    useEffect(() => {
        if (!enableScreenshotDetection) return

        const handleBlur = () => {
            logViolation('screenshot-attempt', 'Window lost focus - possible external tool usage', false)
        }

        window.addEventListener('blur', handleBlur)
        return () => window.removeEventListener('blur', handleBlur)
    }, [enableScreenshotDetection, logViolation])

    // Detect DevTools opening
    useEffect(() => {
        const detectDevTools = () => {
            const threshold = 160
            const widthThreshold = window.outerWidth - window.innerWidth > threshold
            const heightThreshold = window.outerHeight - window.innerHeight > threshold

            if (widthThreshold || heightThreshold) {
                logViolation('devtools-open', 'Developer tools detected as open', false)
            }
        }

        const interval = setInterval(detectDevTools, 1000)
        return () => clearInterval(interval)
    }, [logViolation])

    // Detect browser extensions (basic detection)
    useEffect(() => {
        if (!enableExtensionDetection) return

        const detectExtensions = () => {
            // Check for common extension indicators
            const hasExtensions =
                (window as any).chrome?.runtime?.id ||
                document.documentElement.getAttribute('data-extension') ||
                document.querySelectorAll('[data-extension]').length > 0

            if (hasExtensions) {
                logViolation('extension-detected', 'Browser extension detected', false)
            }
        }

        // Run detection after a delay to allow extensions to load
        setTimeout(detectExtensions, 2000)
    }, [enableExtensionDetection, logViolation])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            endSession(false)
        }
    }, [endSession])

    return (
        <>
            <div
                className="secure-test-environment"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' } as any}
            >
                {children}
            </div>

            <SecurityWarningModal
                isOpen={showWarning}
                onClose={() => setShowWarning(false)}
                violationType={currentViolationType || 'tab-switch'}
                violationCount={tabSwitchCount}
                maxViolations={maxTabSwitches}
                testName={testName}
                onContinue={enterFullscreen}
            />
        </>
    )
}
