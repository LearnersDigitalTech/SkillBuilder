"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, XCircle, Eye, Keyboard } from "lucide-react"
import { SecurityWarningModalProps, ViolationType } from './types'

export function SecurityWarningModal({
    isOpen,
    onClose,
    violationType,
    violationCount,
    maxViolations,
    testName,
    onContinue
}: SecurityWarningModalProps) {
    const remainingAttempts = maxViolations - violationCount
    const isLastWarning = remainingAttempts === 0

    const getViolationIcon = () => {
        switch (violationType) {
            case 'tab-switch':
                return <Eye className="w-12 h-12 text-orange-500" />
            case 'fullscreen-exit':
                return <XCircle className="w-12 h-12 text-red-500" />
            case 'right-click':
            case 'copy-attempt':
            case 'paste-attempt':
                return <Keyboard className="w-12 h-12 text-yellow-500" />
            default:
                return <AlertTriangle className="w-12 h-12 text-orange-500" />
        }
    }

    const getViolationTitle = () => {
        if (isLastWarning) {
            return "⚠️ Test Auto-Submitted!"
        }

        switch (violationType) {
            case 'tab-switch':
                return `Warning ${violationCount}/${maxViolations}: Tab Switch Detected`
            case 'fullscreen-exit':
                return "Warning: Fullscreen Required"
            case 'right-click':
                return "Warning: Right-Click Disabled"
            case 'copy-attempt':
            case 'paste-attempt':
                return "Warning: Copy/Paste Disabled"
            default:
                return "Security Warning"
        }
    }

    const getViolationMessage = () => {
        if (isLastWarning) {
            return `You have switched tabs ${maxViolations} times. Your ${testName} has been automatically submitted for review.`
        }

        switch (violationType) {
            case 'tab-switch':
                return `You have switched tabs ${violationCount} time(s). ${remainingAttempts} warning(s) remaining before auto-submit.`
            case 'fullscreen-exit':
                return `Please stay in fullscreen mode during the ${testName}. The test will automatically re-enter fullscreen.`
            case 'right-click':
                return `Right-clicking is disabled during the ${testName} to maintain test integrity.`
            case 'copy-attempt':
            case 'paste-attempt':
                return `Copy and paste operations are disabled during the ${testName}.`
            default:
                return `Please follow the test guidelines for ${testName}.`
        }
    }

    const handleContinue = async () => {
        // Trigger fullscreen re-entry immediately (needs user gesture)
        if (onContinue) {
            await onContinue()
        }
        // Close modal after fullscreen is activated
        onClose()
    }

    // Block ALL attempts to close the modal
    const handleOpenChange = (open: boolean) => {
        // Do nothing - modal cannot be closed except via Continue button
        return
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={handleOpenChange}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex flex-col items-center space-y-4 text-center">
                        {getViolationIcon()}
                        <DialogTitle className="text-xl font-bold">
                            {getViolationTitle()}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="text-center space-y-4">
                    <div className="text-base text-slate-700 dark:text-slate-300">
                        {getViolationMessage()}
                    </div>

                    {!isLastWarning && violationType === 'tab-switch' && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                                <span className="font-semibold text-orange-800 dark:text-orange-300">
                                    Remaining Warnings
                                </span>
                            </div>
                            <div className="flex justify-center gap-2">
                                {Array.from({ length: maxViolations }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i < violationCount
                                            ? 'bg-red-500 text-white'
                                            : 'bg-green-500 text-white'
                                            }`}
                                    >
                                        {i < violationCount ? '✕' : '✓'}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isLastWarning && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4">
                            <div className="font-bold text-red-700 dark:text-red-300">
                                All violations have been logged and saved with your test results.
                            </div>
                        </div>
                    )}
                </div>

                <Button
                    onClick={handleContinue}
                    className="w-full"
                    variant={isLastWarning ? "destructive" : "default"}
                >
                    {isLastWarning ? "Understood" : "Continue Test"}
                </Button>
            </DialogContent>
        </Dialog>
    )
}
