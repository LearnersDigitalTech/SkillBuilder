"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

interface ExtensionWarningProps {
    isOpen: boolean
    onProceed: () => void
    testName: string
}

export function ExtensionWarningScreen({ isOpen, onProceed, testName }: ExtensionWarningProps) {
    const [extensionsDetected, setExtensionsDetected] = useState(false)
    const [checking, setChecking] = useState(true)
    const [detectionDetails, setDetectionDetails] = useState<string[]>([])

    useEffect(() => {
        if (!isOpen) return

        const detectExtensions = () => {
            const detectedMethods: string[] = []
            let hasExtensions = false

            // Method 1: Check for extension resources (most reliable)
            if (typeof performance !== 'undefined' && performance.getEntriesByType) {
                const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
                const extensionResources = resources.filter(r =>
                    r.name.includes('chrome-extension://') ||
                    r.name.includes('moz-extension://') ||
                    r.name.includes('extension://')
                )
                if (extensionResources.length > 0) {
                    detectedMethods.push(`${extensionResources.length} active extension(s) loading resources`)
                    hasExtensions = true
                }
            }

            // Method 2: Check for injected scripts (active extensions)
            const scripts = Array.from(document.getElementsByTagName('script'))
            const extensionScripts = scripts.filter(s =>
                s.src && (
                    s.src.includes('chrome-extension://') ||
                    s.src.includes('moz-extension://') ||
                    s.src.includes('extension://')
                )
            )
            if (extensionScripts.length > 0) {
                detectedMethods.push(`${extensionScripts.length} extension script(s) actively running`)
                hasExtensions = true
            }

            // Method 3: Check for extension-injected DOM elements (active modifications)
            const extensionElements = document.querySelectorAll(
                '[data-extension], [class*="chrome-extension"], [id*="chrome-extension"], ' +
                '[class*="moz-extension"], [id*="moz-extension"]'
            )
            if (extensionElements.length > 0) {
                detectedMethods.push(`${extensionElements.length} extension-injected element(s) found`)
                hasExtensions = true
            }

            // Method 4: Check for active extension iframes
            const iframes = Array.from(document.getElementsByTagName('iframe'))
            const extensionIframes = iframes.filter(iframe =>
                iframe.src && (
                    iframe.src.includes('chrome-extension://') ||
                    iframe.src.includes('moz-extension://')
                )
            )
            if (extensionIframes.length > 0) {
                detectedMethods.push(`${extensionIframes.length} extension iframe(s) detected`)
                hasExtensions = true
            }

            // Method 5: Check for Grammarly (common cheating tool)
            if ((window as any).grammarly || (window as any).Grammarly) {
                const grammarlyElements = document.querySelectorAll('[data-grammarly-shadow-root]')
                if (grammarlyElements.length > 0) {
                    detectedMethods.push('Grammarly extension is active')
                    hasExtensions = true
                }
            }

            // Method 6: Check for extension stylesheets
            const links = Array.from(document.getElementsByTagName('link'))
            const extensionStyles = links.filter(link =>
                link.href && (
                    link.href.includes('chrome-extension://') ||
                    link.href.includes('moz-extension://')
                )
            )
            if (extensionStyles.length > 0) {
                detectedMethods.push(`${extensionStyles.length} extension stylesheet(s) loaded`)
                hasExtensions = true
            }

            setDetectionDetails(detectedMethods)
            setExtensionsDetected(hasExtensions)
            setChecking(false)
        }

        // Run detection after a delay to allow extensions to load
        setTimeout(detectExtensions, 1500)
    }, [isOpen])

    const handleProceed = () => {
        if (!extensionsDetected) {
            onProceed()
        }
    }

    const handleForceStart = () => {
        // Allow proceeding even with extensions (will be logged)
        onProceed()
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Security Check - Browser Extensions
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status Indicator */}
                    <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                        {checking ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="text-lg">Checking for extensions...</span>
                            </>
                        ) : extensionsDetected ? (
                            <>
                                <XCircle className="w-8 h-8 text-red-500" />
                                <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                                    Browser Extensions Detected
                                </span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                                    No Extensions Detected
                                </span>
                            </>
                        )}
                    </div>

                    {/* Detection Details */}
                    {extensionsDetected && detectionDetails.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                                Detected Issues:
                            </p>
                            <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                                {detectionDetails.map((detail, i) => (
                                    <li key={i}>• {detail}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Warning Message */}
                    {extensionsDetected && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                                <div className="space-y-2">
                                    <p className="font-semibold text-orange-800 dark:text-orange-300">
                                        Please disable all browser extensions before starting the {testName}
                                    </p>
                                    <p className="text-sm text-orange-700 dark:text-orange-400">
                                        Extensions may interfere with test security and could be used for cheating.
                                        All extension usage will be logged and flagged for admin review.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">How to Disable Extensions:</h3>

                        <div className="space-y-3">
                            {/* Chrome Instructions */}
                            <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <span className="text-blue-600">Chrome / Edge</span>
                                </h4>
                                <ol className="text-sm space-y-1 list-decimal list-inside">
                                    <li>Click the three dots (⋮) in the top-right corner</li>
                                    <li>Go to <strong>Extensions</strong> → <strong>Manage Extensions</strong></li>
                                    <li>Toggle <strong>OFF</strong> all extensions</li>
                                    <li>Close and reopen your browser</li>
                                    <li>Navigate back to this page</li>
                                </ol>
                            </div>

                            {/* Firefox Instructions */}
                            <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <span className="text-orange-600">Firefox</span>
                                </h4>
                                <ol className="text-sm space-y-1 list-decimal list-inside">
                                    <li>Click the three lines (☰) in the top-right corner</li>
                                    <li>Go to <strong>Add-ons and themes</strong></li>
                                    <li>Click <strong>Extensions</strong> on the left</li>
                                    <li>Disable all extensions using the toggle switches</li>
                                    <li>Close and reopen your browser</li>
                                    <li>Navigate back to this page</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        {!checking && !extensionsDetected && (
                            <Button
                                onClick={handleProceed}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                size="lg"
                            >
                                ✓ Start {testName}
                            </Button>
                        )}

                        {!checking && extensionsDetected && (
                            <>
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="w-full"
                                    size="lg"
                                    variant="default"
                                >
                                    I've Disabled Extensions - Recheck
                                </Button>

                                <Button
                                    onClick={handleForceStart}
                                    className="w-full"
                                    size="lg"
                                    variant="outline"
                                >
                                    Continue Anyway (Not Recommended)
                                </Button>

                                <p className="text-xs text-center text-slate-500">
                                    ⚠️ Starting with extensions enabled will be logged and may result in test invalidation
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
