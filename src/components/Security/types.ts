// Security violation types and interfaces

export type ViolationType =
    | 'tab-switch'
    | 'fullscreen-exit'
    | 'right-click'
    | 'copy-attempt'
    | 'paste-attempt'
    | 'keyboard-shortcut'
    | 'extension-detected'
    | 'screenshot-attempt'
    | 'print-screen'
    | 'devtools-open'

export interface ViolationEvent {
    type: ViolationType
    timestamp: Date
    details: string
    warningShown: boolean
}

export interface BrowserInfo {
    userAgent: string
    platform: string
    language: string
    screenResolution: string
}

export interface ViolationLog {
    userId: string
    childId: string | null
    childName: string | null
    testType: 'speed-test' | 'assessment'
    testId: string
    sessionId: string // unique per test attempt
    startTime: Date
    endTime: Date | null
    violations: ViolationEvent[]
    browserInfo: BrowserInfo
    autoSubmitted: boolean
    totalViolations: number
}

export interface SecureTestEnvironmentProps {
    children: React.ReactNode
    onViolation?: (type: ViolationType, count: number) => void
    onAutoSubmit?: () => void
    maxTabSwitches?: number // default: 3
    enableFullscreen?: boolean // default: true
    enableRightClickBlock?: boolean // default: true
    enableTabSwitchDetection?: boolean // default: true
    enableExtensionDetection?: boolean // default: true
    enableScreenshotDetection?: boolean // default: true
    testName?: string // for warning messages
    testType: 'speed-test' | 'assessment'
    testId: string
    disableSecurityWhileNaming?: boolean // Disable security when name dialog is open
}

export interface SecurityWarningModalProps {
    isOpen: boolean
    onClose: () => void
    violationType: ViolationType
    violationCount: number
    maxViolations: number
    testName: string
    onContinue?: () => void // Callback for re-entering fullscreen
}
