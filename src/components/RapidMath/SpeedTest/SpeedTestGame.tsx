"use client"

import { useState, useEffect, useCallback } from "react"
import { SpeedTestQuestionCard } from "./SpeedTestQuestionCard"
import { SpeedTestLeaderboard } from "./SpeedTestLeaderboard"
import { Button } from "@/components/ui/button"
import { Play, Timer as TimerIcon, BarChart2, StopCircle, Trophy } from "lucide-react"
import { db, auth, googleProvider } from "@/backend/firebaseHandler"
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, getCountFromServer } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import { signInWithPopup } from "firebase/auth"

interface Question {
    id: number
    question: string
    correctAnswer: number
    operation: string
    num1: number
    num2: number
}

interface GameStats {
    totalQuestions: number
    totalTime: number // in seconds
    avgTime: number
    correct?: number // optional: number of correct answers
}

export function SpeedTestGame() {
    const { user } = useAuth()
    const [gameState, setGameState] = useState<"intro" | "playing" | "summary">("intro")
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
    const [questionStartTime, setQuestionStartTime] = useState(0)
    const [stats, setStats] = useState<GameStats>({
        totalQuestions: 0,
        totalTime: 0,
        avgTime: 0
    })
    const [rankFeedback, setRankFeedback] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [lastLeaderboardUpdate, setLastLeaderboardUpdate] = useState(0)

    // Specific question generation logic
    const generateQuestion = useCallback((): Question => {
        const ops = ["+", "-", "*", "/"]
        const operation = ops[Math.floor(Math.random() * ops.length)]

        let num1 = 0, num2 = 0, correctAnswer = 0

        if (operation === "+") {
            // 2 digit + 2 digit
            num1 = Math.floor(Math.random() * 90) + 10 // 10-99
            num2 = Math.floor(Math.random() * 90) + 10
            correctAnswer = num1 + num2
        } else if (operation === "-") {
            // 2 digit - 2 digit (positive result)
            num1 = Math.floor(Math.random() * 90) + 10
            num2 = Math.floor(Math.random() * 90) + 10
            if (num1 < num2) [num1, num2] = [num2, num1]
            correctAnswer = num1 - num2
        } else if (operation === "*") {
            // Up to 20 only (ignore easy ones like 1, 10 is debatable but user said "ignore easy ones")
            // Let's exclude 0, 1, 10
            const valid = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
            num1 = valid[Math.floor(Math.random() * valid.length)]
            num2 = valid[Math.floor(Math.random() * valid.length)]
            correctAnswer = num1 * num2
        } else if (operation === "/") {
            // one number up to 100, other up to 20
            const divisor = Math.floor(Math.random() * 19) + 2 // 2-20
            const quotient = Math.floor(Math.random() * 50) + 1 // roughly to keep dividend <= 100ish, logic below
            // Actually requirement: "one number up to 100 and the other is up to 20"
            // Usually format is Dividend / Divisor = Quotient
            // So Dividend <= 100, Divisor <= 20.
            const d = Math.floor(Math.random() * 19) + 2 // Divisor 2-20
            // Max dividend is 100. So max quotient is 100/d.
            const maxQ = Math.floor(100 / d)
            const q = Math.floor(Math.random() * maxQ) + 1

            num2 = d
            num1 = q * d // Dividend
            correctAnswer = q
        }

        return {
            id: Date.now(),
            question: `${num1} ${operation} ${num2}`,
            correctAnswer: correctAnswer,
            operation: operation,
            num1: num1,
            num2: num2
        }
    }, [])

    const startGame = () => {
        setStats({ totalQuestions: 0, totalTime: 0, avgTime: 0 })
        setCurrentQuestion(generateQuestion())
        setQuestionStartTime(Date.now())
        setGameState("playing")
    }

    const handleAnswerObject = (answer: number) => {
        const endTime = Date.now()
        const timeTaken = (endTime - questionStartTime) / 1000

        setStats(prev => {
            const newTotalQuestions = prev.totalQuestions + 1
            const newTotalTime = prev.totalTime + timeTaken
            return {
                totalQuestions: newTotalQuestions,
                totalTime: newTotalTime,
                avgTime: newTotalTime / newTotalQuestions
            }
        })

        // Next question
        setCurrentQuestion(generateQuestion())
        setQuestionStartTime(Date.now())
    }

    const [saveStatus, setSaveStatus] = useState<string>("idle")

    const saveScore = async (currentUser: any) => {
        console.log("Attempting to save score...", {
            uid: currentUser?.uid,
            questions: stats.totalQuestions,
            avgTime: stats.avgTime
        })

        if (!currentUser) {
            setSaveStatus("error: not logged in")
            return
        }
        if (stats.totalQuestions < 10) {
            setSaveStatus("error: not enough questions")
            return
        }

        setIsSaving(true)
        setSaveStatus("saving...")
        try {
            const scoresRef = collection(db, "rapidMathSpeedTest")
            const q = query(scoresRef, where("userId", "==", currentUser.uid))
            const snapshot = await getDocs(q)

            let shouldUpdate = false
            let existingDocId = null

            if (!snapshot.empty) {
                const doc = snapshot.docs[0]
                existingDocId = doc.id
                const data = doc.data()

                console.log("Found existing score:", data)

                if (stats.avgTime < data.avgTime) {
                    shouldUpdate = true
                } else if (Math.abs(stats.avgTime - data.avgTime) < 0.01 && stats.totalQuestions > data.totalQuestions) {
                    shouldUpdate = true
                }
            } else {
                shouldUpdate = true
            }

            console.log("Should update?", shouldUpdate)

            if (shouldUpdate) {
                const scoreData = {
                    userId: currentUser.uid,
                    displayName: currentUser.displayName || currentUser.email?.split('@')[0] || "Anonymous",
                    avgTime: stats.avgTime,
                    totalQuestions: stats.totalQuestions,
                    timestamp: serverTimestamp()
                }

                if (existingDocId) {
                    await updateDoc(doc(db, "rapidMathSpeedTest", existingDocId), scoreData)
                } else {
                    await addDoc(scoresRef, scoreData)
                }

                console.log("Score saved successfully!")
                setSaveStatus("saved")
                setLastLeaderboardUpdate(Date.now())

                // Calculate rank by counting better scores (only qualified users)
                const betterScoresQuery = query(
                    scoresRef,
                    where("totalQuestions", ">=", 10),
                    where("avgTime", "<", stats.avgTime)
                )
                const betterSnapshot = await getCountFromServer(betterScoresQuery)
                const rank = betterSnapshot.data().count + 1

                setRankFeedback(`You moved up to Rank #${rank}!`)
            } else {
                console.log("Score not better.")
                setSaveStatus("no-update")
                setRankFeedback("You didn't beat your previous best record.")
            }
        } catch (err) {
            console.error("Error saving score:", err)
            setSaveStatus(`error: ${err instanceof Error ? err.message : String(err)}`)

            // Check if it's a Firebase API disabled error
            if (err instanceof Error && err.message.includes("Cloud Firestore API")) {
                setRankFeedback("⚠️ Firebase API is disabled. Please enable Cloud Firestore in Firebase Console.")
            } else if (err instanceof Error && err.message.includes("index")) {
                setRankFeedback("⚠️ Firebase index required. Check console for index creation link.")
            } else {
                setRankFeedback("Error saving score. Please try again.")
            }
        } finally {
            setIsSaving(false)
        }
    }

    const finishGame = async () => {
        setGameState("summary")
        if (user) {
            console.log("User is logged in, attempting to save score...")
            await saveScore(user)
        } else {
            console.log("User not logged in.")
            setRankFeedback("Log in to save your score on the leaderboard!")
        }
    }

    const handleLoginAndSave = async () => {
        try {
            console.log("Starting login flow...")
            const result = await signInWithPopup(auth, googleProvider)
            if (result.user) {
                console.log("Login successful, saving score for user:", result.user.uid)
                await saveScore(result.user)
            }
        } catch (error) {
            console.error("Login failed", error)
            setRankFeedback("Login failed. Please try again.")
        }
    }

    if (gameState === "intro") {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 py-8">
                {/* Title Section */}
                <div className="w-full max-w-6xl text-center space-y-4 mb-8 animate-in fade-in duration-500">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                        Speed Test
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        How fast can you calculate? Solve as many questions as you can.
                        Your average speed determines your rank!
                    </p>
                </div>

                {/* Side-by-Side Layout: Rules + Leaderboard */}
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 animate-in zoom-in duration-500 delay-100">

                    {/* Left Column: Rules + Start Button */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Rules</h3>
                            <ul className="text-left space-y-3 text-slate-600 dark:text-slate-400">
                                <li className="flex gap-3">
                                    <span className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm shrink-0">1</span>
                                    <span>Addition & Subtraction with 2-digit numbers.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm shrink-0">2</span>
                                    <span>Multiplication up to 20, Division within 100.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm shrink-0">3</span>
                                    <span>Minimum <strong>10 questions</strong> to qualify for the leaderboard.</span>
                                </li>
                            </ul>
                        </div>

                        <Button
                            onClick={startGame}
                            size="lg"
                            className="w-full text-xl md:text-2xl font-bold py-6 md:py-8 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-xl shadow-orange-500/20 transition-all hover:scale-105"
                        >
                            <Play fill="currentColor" className="mr-2" /> Start Challenge
                        </Button>
                    </div>

                    {/* Right Column: Leaderboard */}
                    <div className="lg:sticky lg:top-8 lg:self-start">
                        <SpeedTestLeaderboard />
                    </div>
                </div>
            </div>
        )
    }

    if (gameState === "summary") {
        // Calculate performance tier based on average time
        const getPerformanceTier = (avgTime: number) => {
            if (avgTime < 5) return {
                tier: "Lightning Fast",
                iconName: "Zap",
                gradient: "from-yellow-400 to-orange-500",
                textColor: "text-yellow-600",
                bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
                message: "Incredible speed! You're a math champion!"
            }
            if (avgTime < 8) return {
                tier: "Excellent",
                iconName: "Star",
                gradient: "from-blue-500 to-indigo-600",
                textColor: "text-blue-600",
                bgColor: "bg-blue-50 dark:bg-blue-900/20",
                message: "Outstanding performance! Keep it up!"
            }
            if (avgTime < 12) return {
                tier: "Good",
                iconName: "ThumbsUp",
                gradient: "from-green-500 to-emerald-600",
                textColor: "text-green-600",
                bgColor: "bg-green-50 dark:bg-green-900/20",
                message: "Great job! You're improving!"
            }
            return {
                tier: "Keep Practicing",
                iconName: "TrendingUp",
                gradient: "from-orange-400 to-red-500",
                textColor: "text-orange-600",
                bgColor: "bg-orange-50 dark:bg-orange-900/20",
                message: "Every practice makes you faster!"
            }
        }

        // Get personalized next steps based on performance
        const getNextSteps = (avgTime: number, totalQuestions: number) => {
            if (avgTime < 5) {
                return [
                    "Try Hard difficulty mode",
                    "Aim for sub-4 second average",
                    "Help others improve"
                ]
            }
            if (avgTime < 8) {
                return [
                    "Challenge yourself with more questions",
                    "Try to beat your own record",
                    "Aim for top 5 on leaderboard"
                ]
            }
            if (avgTime < 12) {
                return [
                    "Practice multiplication tables",
                    "Try 15 questions next time",
                    "Aim for sub-8 second average"
                ]
            }
            return [
                "Practice 5 minutes daily",
                "Focus on addition & subtraction first",
                "Every attempt makes you faster!"
            ]
        }

        // Extract rank number from rankFeedback
        const getRankNumber = () => {
            if (!rankFeedback) return null
            const match = rankFeedback.match(/#(\d+)/)
            return match ? parseInt(match[1]) : null
        }

        const performance = getPerformanceTier(stats.avgTime)
        const nextSteps = getNextSteps(stats.avgTime, stats.totalQuestions)
        const rankNumber = getRankNumber()
        // Note: Speed Test doesn't track correct/incorrect, only speed

        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 py-8">
                {/* Celebration Header */}
                <div className="w-full max-w-6xl text-center space-y-3 mb-8 animate-in fade-in duration-500">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                        Amazing Work{user ? `, ${user.displayName?.split(' ')[0]}` : ''}!
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        You completed the Speed Test Challenge!
                    </p>
                </div>

                {/* Side-by-Side Layout: Performance + Leaderboard */}
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                    {/* Left Column: Performance Stats */}
                    <div className="space-y-6 animate-in slide-in-from-left duration-500">

                        {/* Performance Tier Banner */}
                        <div className={`p-6 rounded-2xl bg-gradient-to-r ${performance.gradient} text-white shadow-xl`}>
                            <div className="flex items-center justify-between mb-2">
                                {performance.iconName === "Zap" && <TimerIcon className="w-10 h-10" />}
                                {performance.iconName === "Star" && <BarChart2 className="w-10 h-10" />}
                                {performance.iconName === "ThumbsUp" && <BarChart2 className="w-10 h-10" />}
                                {performance.iconName === "TrendingUp" && <BarChart2 className="w-10 h-10" />}
                                <span className="text-2xl font-black">{performance.tier}</span>
                            </div>
                            <p className="text-white/90 text-sm">{performance.message}</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 space-y-4">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Your Performance</h3>

                            {/* Avg Speed */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Average Speed</span>
                                    <span className={`text-2xl font-black ${performance.textColor}`}>
                                        {stats.avgTime.toFixed(2)}s
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full bg-gradient-to-r ${performance.gradient} transition-all duration-1000`}
                                        style={{ width: `${Math.min((15 / stats.avgTime) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Questions Solved */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Questions Solved</span>
                                    <span className="text-2xl font-black text-blue-600">
                                        {stats.totalQuestions}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                                        style={{ width: `${(stats.totalQuestions / 50) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Speed Test focuses on speed, not accuracy */}
                        </div>

                        {/* Rank Achievement Banner */}
                        {rankNumber && stats.totalQuestions >= 10 && (
                            <div className={`p-6 rounded-2xl shadow-xl border-2 ${rankNumber <= 3
                                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400'
                                : rankNumber <= 10
                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-400'
                                    : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-400'
                                }`}>
                                <div className="text-center space-y-2">
                                    <div className="text-4xl">
                                        {rankNumber <= 3 && <Trophy className="w-12 h-12 mx-auto text-yellow-600" />}
                                        {rankNumber > 3 && <Trophy className="w-12 h-12 mx-auto text-slate-600" />}
                                    </div>
                                    <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
                                        {rankNumber <= 3 ? `YOU'RE #${rankNumber}!` : `Rank #${rankNumber}`}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {rankNumber === 1 ? "You're the fastest speedster!" :
                                            rankNumber <= 3 ? "You're on the podium! Amazing!" :
                                                rankNumber <= 10 ? "You're in the top 10! Excellent!" :
                                                    rankNumber <= 25 ? `Just ${26 - rankNumber} spots from top 25!` :
                                                        "Keep practicing to climb higher!"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Next Steps */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Next Steps</h3>
                            <ul className="space-y-3">
                                {nextSteps.map((step, index) => (
                                    <li key={index} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                                        <span className="text-slate-400">•</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            {!user && stats.totalQuestions >= 10 && (
                                <Button
                                    onClick={handleLoginAndSave}
                                    disabled={isSaving}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 text-lg font-bold shadow-lg"
                                >
                                    {isSaving ? "Saving..." : "Log in & Save to Leaderboard"}
                                </Button>
                            )}

                            {stats.totalQuestions < 10 && (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl text-sm font-medium text-center">
                                    Solve at least 10 questions to qualify for the leaderboard!
                                </div>
                            )}

                            <div className="flex gap-4">
                                <Button
                                    onClick={startGame}
                                    className="flex-1 py-6 text-lg font-bold rounded-xl"
                                    size="lg"
                                    variant="outline"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    onClick={() => setGameState("intro")}
                                    className="flex-1 py-6 text-lg font-bold rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                                    size="lg"
                                >
                                    Home
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Leaderboard */}
                    <div className="lg:sticky lg:top-8 lg:self-start animate-in slide-in-from-right duration-500 delay-100">
                        <SpeedTestLeaderboard lastUpdated={lastLeaderboardUpdate} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            {/* Header Stats */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-bold uppercase">Avg Time</span>
                            <span className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-200">
                                {stats.avgTime.toFixed(1)}s
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-bold uppercase">Solved</span>
                            <span className="text-2xl font-mono font-bold text-blue-600">
                                {stats.totalQuestions}
                            </span>
                        </div>
                    </div>

                    <Button
                        onClick={finishGame}
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <StopCircle className="mr-2" size={20} /> Finish
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                {currentQuestion && (
                    <SpeedTestQuestionCard
                        key={currentQuestion.id}
                        question={currentQuestion}
                        onSubmit={handleAnswerObject}
                        questionNumber={stats.totalQuestions + 1}
                    />
                )}
            </div>
        </div>
    )
}
