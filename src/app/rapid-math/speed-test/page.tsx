"use client"

import Header from "@/app/homepage/Header"
import { SpeedTestGame } from "@/components/RapidMath/SpeedTest/SpeedTestGame"

export default function SpeedTestPage() {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans">
            <Header />
            <SpeedTestGame />
        </main>
    )
}
