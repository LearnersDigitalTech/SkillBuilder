"use client"

import { useEffect, useState } from "react"

interface TimerProps {
  isActive: boolean
  onTimeUpdate?: (seconds: number) => void
}

import { Timer as TimerIcon } from "lucide-react"

export function Timer({ isActive, onTimeUpdate }: TimerProps) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const newSeconds = prev + 1
        onTimeUpdate?.(newSeconds)
        return newSeconds
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, onTimeUpdate])

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex items-center gap-2 text-xl font-bold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
      <TimerIcon size={20} className="text-blue-500" />
      <span className="font-mono">{formatTime(seconds)}</span>
    </div>
  )
}
