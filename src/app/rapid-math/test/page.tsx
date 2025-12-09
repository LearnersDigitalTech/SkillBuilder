"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Timer } from "@/components/RapidMath/timer"
import { QuestionCard } from "@/components/RapidMath/question-card"
import { Loader2 } from "lucide-react"
import Navigation from "@/components/Navigation/Navigation.component"

interface Question {
  id: number
  question: string
  correctAnswer: number
  operation: string
  num1: number
  num2: number
}

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

export default function TestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const difficulty = (searchParams.get("difficulty") as any) || "easy"
  const totalQuestions = Number(searchParams.get("questions") || 10)

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [results, setResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timerActive, setTimerActive] = useState(true)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [questionTimer, setQuestionTimer] = useState(0)

  const getRange = (diff: string) => {
    const ranges: any = {
      normal: { min: 1, max: 20 },
      easy: { min: 1, max: 50 },
      medium: { min: 10, max: 100 },
      hard: { min: 100, max: 500 },
    }
    return ranges[diff] || ranges.easy
  }

  const generateQuestion = useCallback((): Question => {
    const range = getRange(difficulty)
    let num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
    let num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
    const ops = ["+", "-", "*", "/"]
    const operation = ops[Math.floor(Math.random() * ops.length)]

    // For division, ensure we only generate proper divisions (no decimals)
    if (operation === "/") {
      const divisor = Math.floor(Math.random() * range.max) + 1
      const quotient = Math.floor(Math.random() * (range.max / 2)) + 1
      return {
        id: Date.now() + Math.random(),
        question: `${divisor * quotient} / ${divisor}`,
        correctAnswer: quotient,
        operation: "/",
        num1: divisor * quotient,
        num2: divisor,
      }
    }

    let correctAnswer = 0
    if (operation === "+") {
      correctAnswer = num1 + num2
    } else if (operation === "-") {
      // Ensure result is always positive
      if (num1 < num2) {
        const temp = num1;
        num1 = num2;
        num2 = temp;
      }
      correctAnswer = num1 - num2
    } else if (operation === "*") {
      correctAnswer = num1 * num2
    }

    return {
      id: Date.now() + Math.random(),
      question: `${num1} ${operation} ${num2}`,
      correctAnswer: correctAnswer,
      operation: operation,
      num1: num1,
      num2: num2,
    }
  }, [difficulty])

  useEffect(() => {
    const qs = Array.from({ length: totalQuestions }, () => generateQuestion())
    setQuestions(qs)
    setIsLoading(false)
    setQuestionStartTime(Date.now())
  }, [totalQuestions, generateQuestion])

  useEffect(() => {
    if (!timerActive) return
    const interval = setInterval(() => {
      setQuestionTimer(Math.floor((Date.now() - questionStartTime) / 1000))
    }, 100)
    return () => clearInterval(interval)
  }, [timerActive, questionStartTime])

  const currentQuestion = questions[currentQuestionIndex]

  const handleSubmitAnswer = useCallback(
    (userAnswer: number) => {
      if (!currentQuestion) return

      const timeTaken = Math.round((Date.now() - questionStartTime) / 1000)
      const isCorrect = userAnswer === currentQuestion.correctAnswer

      const result: TestResult = {
        question: currentQuestion.question,
        correctAnswer: currentQuestion.correctAnswer,
        userAnswer: userAnswer,
        timeTaken: timeTaken,
        isCorrect: isCorrect,
        operation: currentQuestion.operation,
        num1: currentQuestion.num1,
        num2: currentQuestion.num2,
        skipped: false,
      }

      const newResults = [...results, result]
      setResults(newResults)
      moveToNextQuestion(newResults)
    },
    [currentQuestion, currentQuestionIndex, totalQuestions, questionStartTime],
  )

  const handleSkipQuestion = useCallback(() => {
    if (!currentQuestion) return
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000)
    const result: TestResult = {
      question: currentQuestion.question,
      correctAnswer: currentQuestion.correctAnswer,
      userAnswer: 0,
      timeTaken: timeTaken,
      isCorrect: false,
      operation: currentQuestion.operation,
      num1: currentQuestion.num1,
      num2: currentQuestion.num2,
      skipped: true,
    }
    const newResults = [...results, result]
    setResults(newResults)
    moveToNextQuestion(newResults)
  }, [currentQuestion, currentQuestionIndex, totalQuestions, questionStartTime])

  const moveToNextQuestion = (newResults: TestResult[]) => {
    const nextIndex = currentQuestionIndex + 1
    if (nextIndex < totalQuestions) {
      setCurrentQuestionIndex(nextIndex)
      setQuestionStartTime(Date.now())
      setQuestionTimer(0)
    } else {
      setTimerActive(false)
      sessionStorage.setItem("testResults", JSON.stringify(newResults))
      router.push("/rapid-math/test/summary")
    }
  }

  // Pre-load results to session storage on unload to prevent data loss on accidental refresh/close
  useEffect(() => {
    const handleUnload = () => {
      if (results.length > 0) {
        sessionStorage.setItem("testResults", JSON.stringify(results))
      }
    }
    window.addEventListener("beforeunload", handleUnload)
    return () => window.removeEventListener("beforeunload", handleUnload)
  }, [results])

  const labels: any = { normal: "Normal", easy: "Easy", medium: "Medium", hard: "Hard" }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col font-sans overflow-hidden">
      <Navigation />

      {/* Floating Header */}
      <div className="fixed top-20 left-0 right-0 z-10 px-4 md:px-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 pointer-events-auto">
            <span className="text-sm uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mr-2">Mode</span>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{labels[difficulty]}</span>
          </div>

          <div className="pointer-events-auto">
            <Timer isActive={timerActive} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 pt-20">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-slate-500 animate-pulse">
            <Loader2 size={48} className="animate-spin text-blue-500" />
            <span className="text-xl font-medium">Preparing your quiz...</span>
          </div>
        ) : (
          currentQuestion && (
            <div className="w-full max-w-5xl animate-in zoom-in-95 duration-500">
              <QuestionCard
                question={currentQuestion}
                onSubmit={handleSubmitAnswer}
                onSkip={handleSkipQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
                secondsElapsed={questionTimer}
              />
            </div>
          )
        )}
      </div>
    </main>
  )
}
