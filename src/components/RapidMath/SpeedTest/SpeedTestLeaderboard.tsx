"use client"

import { useEffect, useState } from "react"
import { db } from "@/backend/firebaseHandler"
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore"
import { Trophy, Timer, Hash } from "lucide-react"

interface LeaderboardEntry {
    id: string
    displayName: string
    avgTime: number
    totalQuestions: number
    userId: string
}

export function SpeedTestLeaderboard({ limitCount = 50, lastUpdated = 0 }: { limitCount?: number, lastUpdated?: number }) {
    const [scores, setScores] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true)
            try {
                // Query: Order by avgTime ASC (lower is better), then totalQuestions DESC (higher is better)
                // Firestore requires an index for multiple orderBys. 
                // If index is missing, we might need to sort client side for now or create index.
                // For now, let's fetch based on avgTime and sort strictly client side for exact tie breaking if needed,
                // but Firestore sort is better.
                // Complex queries often need composite indexes. To avoid breaking immediately, 
                // let's grab the top 50 by avgTime and then filter/sort more if needed.
                // Ideally: .where("totalQuestions", ">=", 10).orderBy("totalQuestions").orderBy("avgTime") etc.

                console.time("leaderboard-fetch")
                // To avoid needing a specific composite index immediately, we'll fetch top (limit * 2) by speed
                // and filter for the qualification of >= 10 questions on the client side.
                // We fetch a bit more than limit to account for filtered out items
                const fetchLimit = limitCount < 50 ? 50 : limitCount
                const q = query(
                    collection(db, "rapidMathSpeedTest"),
                    orderBy("avgTime", "asc"),
                    limit(fetchLimit)
                )

                const querySnapshot = await getDocs(q)
                console.timeEnd("leaderboard-fetch")

                let fetchedScores: LeaderboardEntry[] = []

                querySnapshot.forEach((doc) => {
                    const data = doc.data() as Omit<LeaderboardEntry, "id">
                    // Client-side filter for qualification
                    if (data.totalQuestions >= 10) {
                        fetchedScores.push({ id: doc.id, ...data })
                    }
                })

                // Take top limitCount after filtering
                fetchedScores = fetchedScores.slice(0, limitCount)

                // Secondary sort client-side just in case
                fetchedScores.sort((a, b) => {
                    if (Math.abs(a.avgTime - b.avgTime) < 0.01) {
                        return b.totalQuestions - a.totalQuestions // Higher questions better
                    }
                    return a.avgTime - b.avgTime
                })

                setScores(fetchedScores)
            } catch (error) {
                console.error("Error fetching leaderboard:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchLeaderboard()
    }, [limitCount, lastUpdated])

    if (loading) {
        return (
            <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden p-8 animate-pulse">
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6 mx-auto"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700/50 rounded-xl"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <Trophy className="text-yellow-500" size={20} />
                <h3 className="font-bold text-slate-700 dark:text-slate-200">Top Speedsters</h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[400px] overflow-y-auto">
                {scores.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No scores yet. Be the first!
                    </div>
                ) : (
                    scores.map((score, index) => (
                        <div key={score.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${index === 0 ? "bg-yellow-100 text-yellow-700" :
                                        index === 1 ? "bg-slate-200 text-slate-700" :
                                            index === 2 ? "bg-orange-100 text-orange-800" :
                                                "bg-slate-50 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}
                     `}>
                                    {index + 1}
                                </div>
                                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                                    {score.displayName}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-slate-500" title="Total Questions">
                                    <Hash size={14} />
                                    <span>{score.totalQuestions}</span>
                                </div>
                                <div className="flex items-center gap-1 font-mono font-bold text-blue-600 dark:text-blue-400" title="Average Time">
                                    <Timer size={14} />
                                    <span>{score.avgTime.toFixed(2)}s</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
