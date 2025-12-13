"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, XCircle, Clock, Zap, RotateCcw, Home, Trophy, AlertTriangle } from "lucide-react"
import Navigation from "@/components/Navigation/Navigation.component"
import { useAuth } from "@/context/AuthContext"
import { ref, set, get, push } from "firebase/database"
import { firebaseDatabase, getUserDatabaseKey } from "@/backend/firebaseHandler"

interface TestResult {
  question: string
  correctAnswer: number
  userAnswer: number
  timeTaken: number
  isCorrect: boolean
  operation: string
  num1: number
  num2: number
  skipped: boolean
}

export default function SummaryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reportId = searchParams.get("reportId")
  const { user, userData, loading: authLoading } = useAuth()

  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const savedRef = useRef(false) // Prevent double saving

  useEffect(() => {
    const fetchData = async () => {
      // 0. Wait for Auth to load
      if (authLoading) return;

      // Mode 1: Viewing past report
      if (reportId && user) {
        try {
          const userKey = getUserDatabaseKey(user)
          // Since we typically sanitize in the dashboard, let's look there first.
          // Or if the key is just correct from the helper. 
          // Note: DashboardClient uses `userKey.replace('.', '_')`. Let's match that just in case.
          const sanitizedKey = userKey?.replace('.', '_');

          // We need to find where the report is located. 
          // Try user root and children.

          let foundReport = null;

          // Try sanitized path first (standard for this app apparently)
          if (sanitizedKey) {
            const reportsRef = ref(firebaseDatabase, `NMD_2025/Reports/${sanitizedKey}`)
            const snapshot = await get(reportsRef);
            if (snapshot.exists()) {
              const data = snapshot.val();
              if (data[reportId]) foundReport = data[reportId]; // Check root
              else {
                Object.values(data).forEach((childData: any) => {
                  if (childData && childData[reportId]) {
                    foundReport = childData[reportId];
                  }
                })
              }
            }
          }

          // If not found, maybe try raw key? (Just in case)
          if (!foundReport && userKey && userKey !== sanitizedKey) {
            const reportsRef = ref(firebaseDatabase, `NMD_2025/Reports/${userKey}`)
            const snapshot = await get(reportsRef);
            if (snapshot.exists()) {
              const data = snapshot.val();
              if (data[reportId]) foundReport = data[reportId];
              else {
                Object.values(data).forEach((childData: any) => {
                  if (childData && childData[reportId]) {
                    foundReport = childData[reportId];
                  }
                })
              }
            }
          }

          if (foundReport && foundReport.questions) {
            setResults(foundReport.questions)
          }

        } catch (e) {
          console.error("Error fetching report", e)
        } finally {
          setLoading(false)
        }
        return
      }

      // Mode 2: New Result (from Session Storage)
      const stored = sessionStorage.getItem("testResults")
      if (stored) {
        try {
          const parsedResults = JSON.parse(stored)
          setResults(parsedResults)

          // SAVE TO FIREBASE logic
          // Only save if:
          // 1. User is authenticated
          // 2. Auth loading is finished (so we have userData)
          // 3. Not already saved
          // 4. Not viewing a past report
          if (user && !authLoading && !savedRef.current && !reportId) {
            savedRef.current = true; // Mark as saved immediately

            let userKey = getUserDatabaseKey(user)
            if (userKey) userKey = userKey.replace('.', '_'); // SANITIZE KEY

            // determine active child
            let activeChildId = "default";
            // Wait for userData to be present if we want to associate with a child
            if (userData && userData.children) {
              const childKeys = Object.keys(userData.children)
              if (childKeys.length > 0) {
                activeChildId = childKeys[0]; // Default to first
                // Try to get from local storage preference
                if (typeof window !== "undefined") {
                  // Re-use valid userKey for local storage lookup
                  const storedId = window.localStorage.getItem(`activeChild_${userKey}`)
                  if (storedId && childKeys.includes(storedId)) activeChildId = storedId
                }
              }
            } else if (!userData) {
              // If userData is missing but user is logged in, it might still be loading or failed.
              // But we checked !authLoading. So it means no profile exists?
              // We will save to 'default' in that case.
              console.warn("Saving report without full user profile data.");
            }

            const correct = parsedResults.filter((r: any) => r.isCorrect).length
            const total = parsedResults.length
            const totalTime = parsedResults.reduce((sum: any, r: any) => sum + r.timeTaken, 0)
            const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

            const newReportId = `rapid_math_${Date.now()}`
            const reportData = {
              id: newReportId,
              type: 'RAPID_MATH',
              timestamp: new Date().toISOString(),
              summary: {
                totalQuestions: total,
                correctAnswers: correct,
                accuracyPercent: accuracy,
                timeTaken: totalTime,
                accuracy: `${accuracy}%` // Backup for display
              },
              questions: parsedResults
            }

            // Save to NMD_2025/Reports/{userKey}/{childId}/{reportId}
            const reportRef = ref(firebaseDatabase, `NMD_2025/Reports/${userKey}/${activeChildId}/${newReportId}`)
            await set(reportRef, reportData)
            // console.log("Rapid Math result saved!")

            // Optionally clear session storage now? No, keep it for refresh until "New Test"
          }

        } catch (e) {
          console.error("Parse error:", e)
        }
      }
      setLoading(false)
    }

    fetchData()
  }, [user, userData, authLoading, reportId]) // Re-run if user auth loads late

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-slate-500 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 animate-spin"></div>
          <span className="text-xl font-medium">Loading Results...</span>
        </div>
      </main>
    )
  }

  const correct = results.filter((r) => r.isCorrect).length
  const total = results.length
  const totalTime = results.reduce((sum, r) => sum + r.timeTaken, 0)
  const avgTime = total > 0 ? (totalTime / total).toFixed(1) : "0"
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <Navigation />
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4 pt-20">

        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className={`
                inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-xl
                ${accuracy >= 80 ? "bg-gradient-to-br from-yellow-300 to-amber-500 text-white" : "bg-gradient-to-br from-blue-400 to-indigo-600 text-white"}
            `}>
            {accuracy >= 80 ? <Trophy size={40} /> : <CheckCircle2 size={40} />}
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {accuracy >= 80 ? "Outstanding!" : accuracy >= 50 ? "Well Done!" : "Keep Practicing!"}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            You scored <span className="font-bold text-slate-900 dark:text-white">{accuracy}%</span> accuracy in {totalTime} seconds.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Correct Answers"
            value={correct.toString()}
            subtext={`out of ${total}`}
            icon={CheckCircle2}
            color="text-green-600 dark:text-green-400"
            bg="bg-green-50 dark:bg-green-900/30"
            border="border-green-100 dark:border-green-800"
          />
          <StatsCard
            label="Skips"
            value={(total - correct).toString()}
            subtext="Review them below"
            icon={XCircle}
            color="text-red-600 dark:text-red-400"
            bg="bg-red-50 dark:bg-red-900/30"
            border="border-red-100 dark:border-red-800"
          />
          <StatsCard
            label="Avg. Time"
            value={`${avgTime}s`}
            subtext="per question"
            icon={Zap}
            color="text-amber-600 dark:text-amber-400"
            bg="bg-amber-50 dark:bg-amber-900/30"
            border="border-amber-100 dark:border-amber-800"
          />
          <StatsCard
            label="Total Time"
            value={`${Math.floor(totalTime / 60)}m ${totalTime % 60}s`}
            subtext="Duration"
            icon={Clock}
            color="text-blue-600 dark:text-blue-400"
            bg="bg-blue-50 dark:bg-blue-900/30"
            border="border-blue-100 dark:border-blue-800"
          />
        </div>

        {/* Detailed Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Question Breakdown</h2>
            <div className="text-sm text-slate-500">
              Showing all {results.length} results
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`
                            relative overflow-hidden p-5 rounded-2xl border transition-all hover:shadow-md
                            ${result.isCorrect
                    ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    : "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/50"
                  }
                        `}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Question {idx + 1}</span>
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${result.isCorrect ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}`}>
                    {result.isCorrect ? <><CheckCircle2 size={12} /> Correct</> : <><XCircle size={12} /> {result.skipped ? "Skipped" : "Incorrect"}</>}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {result.question}
                  </div>
                  <div className="text-right">
                    {result.isCorrect ? (
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {result.userAnswer}
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-red-500 line-through decoration-2 opacity-75">
                          {result.skipped ? "-" : result.userAnswer}
                        </span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400 block bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">
                          Ans: {result.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><Clock size={12} /> {result.timeTaken}s</span>
                  {/* We could add logic here to show "Fast!" or "Slow" tag */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="sticky bottom-4 z-20 mx-auto max-w-sm">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex gap-2">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              size="lg"
              className="flex-1 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Home size={20} className="mr-2" /> Home
            </Button>
            <Button
              onClick={() => {
                sessionStorage.removeItem("testResults")
                router.push("/rapid-math")
              }}
              size="lg"
              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
            >
              <RotateCcw size={20} className="mr-2" /> New Test
            </Button>
          </div>
        </div>

      </div>
    </main>
  )
}

function StatsCard({ label, value, subtext, icon: Icon, color, bg, border }: any) {
  return (
    <Card className={`border-2 shadow-sm ${bg} ${border}`}>
      <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
        <div className={`mb-2 p-2 rounded-full bg-white/60 dark:bg-black/10 ${color}`}>
          <Icon size={24} />
        </div>
        <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtext}</div>
      </CardContent>
    </Card>
  )
}

