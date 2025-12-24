"use client"

import { useEffect, useState, memo } from "react"
import { db } from "@/backend/firebaseHandler"
import { collection, query, orderBy, limit, getDocs, where, getCountFromServer } from "firebase/firestore"
import { Trophy, Timer, TrendingUp, Sparkles } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

interface LeaderboardEntry {
    id: string
    displayName: string
    avgTime: number
    totalQuestions: number
    userId: string
    childId?: string | null
    parentEmail?: string | null
}

interface UserRankData {
    rank: number
    entry: LeaderboardEntry
}

export const SpeedTestLeaderboard = memo(function SpeedTestLeaderboard({
    limitCount = 10,
    lastUpdated = 0
}: {
    limitCount?: number
    lastUpdated?: number
}) {
    const { user, activeChildId } = useAuth()
    const [topScores, setTopScores] = useState<LeaderboardEntry[]>([])
    const [userRank, setUserRank] = useState<UserRankData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true)
            try {
                console.time("leaderboard-fetch")

                // Query 1: Fetch top 10 qualified users
                // Note: This requires a composite index on (totalQuestions, avgTime)
                // Firebase will provide the index creation link in console if needed
                const topQuery = query(
                    collection(db, "rapidMathSpeedTest"),
                    where("totalQuestions", ">=", 10),
                    orderBy("avgTime", "asc"),
                    limit(limitCount)
                )

                const topSnapshot = await getDocs(topQuery)
                const fetchedScores: LeaderboardEntry[] = []

                topSnapshot.forEach((doc) => {
                    const data = doc.data() as Omit<LeaderboardEntry, "id">
                    fetchedScores.push({ id: doc.id, ...data })
                })

                // Secondary sort for tie-breaking (if avgTime is identical)
                fetchedScores.sort((a, b) => {
                    if (Math.abs(a.avgTime - b.avgTime) < 0.01) {
                        return b.totalQuestions - a.totalQuestions
                    }
                    return a.avgTime - b.avgTime
                })

                setTopScores(fetchedScores)

                // Query 2: Fetch current user's rank (if logged in)
                if (user?.uid) {
                    // CRITICAL FIX: Query by BOTH userId AND childId to get correct child's rank
                    const userQuery = activeChildId
                        ? query(
                            collection(db, "rapidMathSpeedTest"),
                            where("userId", "==", user.uid),
                            where("childId", "==", activeChildId)
                        )
                        : query(
                            collection(db, "rapidMathSpeedTest"),
                            where("userId", "==", user.uid)
                        )

                    const userSnapshot = await getDocs(userQuery)

                    if (!userSnapshot.empty) {
                        const userDoc = userSnapshot.docs[0]
                        const userData = userDoc.data() as Omit<LeaderboardEntry, "id">
                        const userEntry: LeaderboardEntry = { id: userDoc.id, ...userData }

                        // Check if current child is already in top 10
                        const isInTop10 = fetchedScores.some(score =>
                            score.userId === user.uid &&
                            (!activeChildId || !score.childId || score.childId === activeChildId)
                        )

                        if (!isInTop10 && userEntry.totalQuestions >= 10) {
                            // Calculate user's rank by counting better scores
                            const betterScoresQuery = query(
                                collection(db, "rapidMathSpeedTest"),
                                where("totalQuestions", ">=", 10),
                                where("avgTime", "<", userEntry.avgTime)
                            )

                            const betterSnapshot = await getCountFromServer(betterScoresQuery)
                            const rank = betterSnapshot.data().count + 1

                            setUserRank({ rank, entry: userEntry })
                        } else {
                            setUserRank(null) // User is in top 10 or not qualified
                        }
                    }
                }

                console.timeEnd("leaderboard-fetch")
            } catch (error) {
                console.error("Error fetching leaderboard:", error)
                if (error instanceof Error) {
                    if (error.message.includes("Cloud Firestore API")) {
                        console.error("🔥 FIREBASE API DISABLED! Enable at: https://console.firebase.google.com/")
                    } else if (error.message.includes("index")) {
                        console.warn("🔥 Composite Index Required! Check console for link.")
                    }
                }
            } finally {
                setLoading(false)
            }
        }

        fetchLeaderboard()
    }, [limitCount, lastUpdated, user?.uid])

    // Get motivational message based on rank
    const getMotivationalMessage = (rank: number): string => {
        if (rank <= 15) return "So close to top 10! Keep pushing! 🔥"
        if (rank <= 25) return "Great progress! You're in the top 25! 💪"
        if (rank <= 50) return "Keep practicing to climb higher! 🚀"
        return "Every practice session counts! 📈"
    }

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
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-slate-900/50 dark:to-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-500 fill-yellow-500" size={20} />
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">Top Speedsters</h3>
                </div>
                {topScores.length > 0 && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                        Top {topScores.length}
                    </span>
                )}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                {topScores.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <Sparkles className="mx-auto mb-3 text-slate-300" size={32} />
                        <p className="font-medium">No scores yet. Be the first!</p>
                        <p className="text-sm mt-1">Complete 10+ questions to qualify</p>
                    </div>
                ) : (
                    <>
                        {topScores.map((score, index) => {
                            // Match both userId and childId for accurate identification
                            const isCurrentUser = user?.uid === score.userId &&
                                (!activeChildId || !score.childId || score.childId === activeChildId)
                            const rankEmoji = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""

                            return (
                                <div
                                    key={score.id}
                                    className={`p-3 flex items-center justify-between transition-all ${isCurrentUser
                                        ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                            ${index === 0 ? "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-300" :
                                                index === 1 ? "bg-slate-200 text-slate-700 ring-2 ring-slate-300" :
                                                    index === 2 ? "bg-orange-100 text-orange-800 ring-2 ring-orange-300" :
                                                        isCurrentUser ? "bg-blue-100 text-blue-700 ring-2 ring-blue-300" :
                                                            "bg-slate-50 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}
                                        `}>
                                            {rankEmoji || (index + 1)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`font-medium truncate max-w-[120px] ${isCurrentUser
                                                ? "text-blue-700 dark:text-blue-400 font-bold"
                                                : "text-slate-700 dark:text-slate-300"
                                                }`}>
                                                {isCurrentUser ? "You" : score.displayName}
                                            </span>
                                            {isCurrentUser && (
                                                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                                                    <Trophy size={10} /> Your Rank: #{index + 1}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                            <span className="font-semibold">Q:</span>
                                            <span className="font-bold">{score.totalQuestions}</span>
                                        </div>
                                        <div className={`flex items-center gap-1 font-mono font-bold ${isCurrentUser
                                            ? "text-blue-600 dark:text-blue-400"
                                            : "text-slate-600 dark:text-slate-400"
                                            }`} title="Average Time">
                                            <Timer size={14} />
                                            <span>{score.avgTime.toFixed(2)}s</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {/* User's rank if outside top 10 */}
                        {userRank && (
                            <>
                                <div className="p-2 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center">
                                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                        <span className="font-medium">{userRank.rank - topScores.length} more</span>
                                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                    </div>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-l-4 border-blue-500">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm ring-2 ring-blue-300">
                                                {userRank.rank}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                                                    <TrendingUp size={14} />
                                                    You ({userRank.entry.displayName})
                                                </span>
                                                <span className="text-xs text-blue-600 dark:text-blue-500 font-medium">
                                                    {getMotivationalMessage(userRank.rank)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs">
                                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                                <span className="font-semibold">Q:</span>
                                                <span className="font-bold">{userRank.entry.totalQuestions}</span>
                                            </div>
                                            <div className="w-px h-4 bg-blue-300 dark:bg-blue-600"></div>
                                            <div className="flex items-center gap-1 font-mono font-bold text-blue-700 dark:text-blue-400">
                                                <Timer size={12} />
                                                <span>{userRank.entry.avgTime.toFixed(2)}s</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Message for users not on leaderboard */}
                        {user && !userRank && !topScores.some(s => s.userId === user.uid) && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-center">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Complete 10+ questions in Speed Test to see your rank! 🎯
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
})
