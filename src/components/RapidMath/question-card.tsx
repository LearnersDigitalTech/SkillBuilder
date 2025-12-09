"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalculatorKeypad } from "./calculator-keypad"
import { CheckCircle2, XCircle, SkipForward } from "lucide-react"

interface QuestionData {
  id: number
  question: string
  correctAnswer: number
  operation: string
  num1: number
  num2: number
}

interface QuestionCardProps {
  question: QuestionData
  onSubmit: (userAnswer: number) => void
  onSkip: () => void
  questionNumber: number
  totalQuestions: number
  secondsElapsed: number
}

export function QuestionCard({
  question,
  onSubmit,
  onSkip,
  questionNumber,
  totalQuestions,
  secondsElapsed,
}: QuestionCardProps) {
  const [userAnswer, setUserAnswer] = useState("")
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // Show skip button if stuck for 15s or more (reduced from 30s to be more friendly)
  const showSkipButton = secondsElapsed >= 15

  useEffect(() => {
    setUserAnswer("")
    setFeedback(null)
    setSubmitted(false)
  }, [question.id])

  useEffect(() => {
    if (userAnswer && !submitted) {
      const answer = Number(userAnswer)
      if (!isNaN(answer) && answer === question.correctAnswer) {
        setFeedback("correct")
        setSubmitted(true)
        setTimeout(() => {
          onSubmit(answer)
        }, 800)
      }
    }
  }, [userAnswer, question.correctAnswer, submitted, onSubmit])

  const handleAnswerChange = (value: string) => {
    // If we're already showing feedback (especially 'correct'), ignore input
    if (submitted || feedback === "correct") return

    // Allow empty value (clearing)
    if (value === "") {
      setUserAnswer("")
      setFeedback(null)
      return
    }

    // Special case for negative numbers: Allow a single "-" as a start
    if (value === "-") {
      setUserAnswer("-")
      setFeedback(null)
      return
    }

    // Check if the input is numeric
    if (isNaN(Number(value))) return

    const answer = Number(value)
    const correctStr = question.correctAnswer.toString()
    const valueStr = value.toString()

    // 1. Exact Match: It's correct!
    if (answer === question.correctAnswer) {
      setUserAnswer(value)
      // Feedback logic handled in useEffect
    }
    // 2. Prefix Match: It's defined as a valid start of the answer?
    // e.g. correct=123, input=1 (ok), input=12 (ok) -> wait for more
    // e.g. correct=-15, input=- (ok via special case), input=-1 (ok)
    else if (correctStr.startsWith(valueStr)) {
      setUserAnswer(value)
      setFeedback(null)
    }
    // 3. Wrong Input
    else {
      // Show wrong feedback immediately
      setUserAnswer(value)
      setFeedback("incorrect")

      // Clear the WRONG input after a short delay
      setTimeout(() => {
        setUserAnswer("")
        setFeedback(null)
      }, 500)
    }
  }

  // Calculate progress percentage
  const progress = Math.round((questionNumber / totalQuestions) * 100)

  return (
    <Card className="w-full max-w-4xl mx-auto border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden">

      {/* Progress Bar Line */}
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row h-full">

          {/* Left/Top: Question & Display */}
          <div className="flex-1 p-8 flex flex-col items-center justify-center space-y-8 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/50">

            {/* Question Badge */}
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Question {questionNumber} / {totalQuestions}
            </div>

            {/* Mathematical Operation */}
            <div className="text-center space-y-2">
              <div className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter whitespace-nowrap">
                {question.num1} {question.operation.replace('*', '×').replace('/', '÷')} {question.num2}
              </div>
              {/* Placeholder for equality */}
              <div className="text-3xl text-slate-300 dark:text-slate-600">=</div>
            </div>

            {/* User Input Display */}
            <div className={`
                    relative w-full max-w-xs h-20 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-mono font-bold tracking-widest
                    transition-all duration-200 border-2
                    ${feedback === "correct"
                ? "bg-green-50 border-green-200 text-green-600 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                : "bg-white dark:bg-black/20 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-inner"
              }
                `}>
              {userAnswer || <span className="opacity-20">?</span>}

              {/* Status Icon Overlay */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {feedback === "correct" && <CheckCircle2 size={32} className="text-green-500 animate-in zoom-in spin-in-12 duration-300" />}
                {feedback === "incorrect" && <XCircle size={32} className="text-red-500 animate-in zoom-in duration-300" />}
              </div>
            </div>

            {/* Skip Button (Conditional) */}
            <div className="h-8 flex items-center justify-center">
              {showSkipButton && !submitted && (
                <Button
                  onClick={onSkip}
                  variant="ghost"
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full gap-2 transition-all animate-in fade-in"
                >
                  <SkipForward size={16} /> Skip this question
                </Button>
              )}
            </div>
          </div>

          {/* Right/Bottom: Keypad */}
          <div className="flex-1 bg-slate-50/50 dark:bg-black/20 p-6 flex items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800">
            <CalculatorKeypad
              value={userAnswer}
              onChange={handleAnswerChange}
              disabled={submitted}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
