"use client"

import { useState, useEffect, useCallback } from "react"
import { SpeedTestQuestionCard } from "./SpeedTestQuestionCard"
import { SpeedTestLeaderboard } from "./SpeedTestLeaderboard"
import { Button } from "@/components/ui/button"
import { Play, Timer as TimerIcon, BarChart2, StopCircle } from "lucide-react"
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

                const betterScoresQuery = query(scoresRef, where("avgTime", "<", stats.avgTime))
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
            setRankFeedback("Error saving score. Please try again.")
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
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                            Speed Test
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400">
                            How fast can you calculate? Solve as many questions as you can.
                            Your average speed determines your rank!
                        </p>
                    </div>

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
                        className="w-full text-2xl font-bold py-8 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-xl shadow-orange-500/20"
                    >
                        <Play fill="currentColor" className="mr-2" /> Start Challenge
                    </Button>

                    <SpeedTestLeaderboard />
                </div>
            </div>
        )
    }

    if (gameState === "summary") {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-8">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Click to Finish</h2>
                    {/* Note: In summary we show stats */}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                            <div className="text-slate-500 text-sm uppercase font-bold mb-1">Avg Speed</div>
                            <div className="text-4xl font-black text-orange-500">{stats.avgTime.toFixed(2)}s</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                            <div className="text-slate-500 text-sm uppercase font-bold mb-1">Solved</div>
                            <div className="text-4xl font-black text-blue-500">{stats.totalQuestions}</div>
                        </div>
                    </div>

                    {rankFeedback && (
                        <div className={`p-4 rounded-xl font-bold text-lg animate-in zoom-in ${rankFeedback.includes("moved up") ? "bg-green-100 text-green-700" : rankFeedback.includes("Log in") ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                            {rankFeedback}
                        </div>
                    )}

                    {!user && stats.totalQuestions >= 10 && (
                        <Button
                            onClick={handleLoginAndSave}
                            disabled={isSaving}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 text-lg"
                        >
                            {isSaving ? "Saving..." : "Log in & Save to Leaderboard"}
                        </Button>
                    )}

                    {/* Manual Retry/Debug for Authenticated Users */}
                    {user && stats.totalQuestions >= 10 && saveStatus !== "saved" && (
                        <div className="space-y-2">
                            <div className="text-xs text-slate-400 font-mono">Status: {saveStatus}</div>
                            <Button
                                onClick={() => saveScore(user)}
                                disabled={isSaving}
                                variant="secondary"
                                className="w-full"
                            >
                                {isSaving ? "Saving..." : "Retry Save Score"}
                            </Button>
                        </div>
                    )}

                    {stats.totalQuestions < 10 && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl text-sm">
                            Solve at least 10 questions to appear on the leaderboard!
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button onClick={startGame} className="flex-1" size="lg" variant="outline">
                            Try Again
                        </Button>
                        <Button onClick={() => setGameState("intro")} className="flex-1" size="lg">
                            Home
                        </Button>
                    </div>

                    <SpeedTestLeaderboard lastUpdated={lastLeaderboardUpdate} />
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
