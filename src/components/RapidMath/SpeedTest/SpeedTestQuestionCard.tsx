"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CalculatorKeypad } from "../calculator-keypad"
import { CheckCircle2, XCircle } from "lucide-react"

interface QuestionData {
    id: number
    question: string
    correctAnswer: number
    operation: string
    num1: number
    num2: number
}

interface SpeedTestQuestionCardProps {
    question: QuestionData
    onSubmit: (userAnswer: number) => void
    questionNumber: number
}

export function SpeedTestQuestionCard({
    question,
    onSubmit,
    questionNumber,
}: SpeedTestQuestionCardProps) {
    const [userAnswer, setUserAnswer] = useState("")
    const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        setUserAnswer("")
        setFeedback(null)
        setSubmitted(false)
    }, [question.id])

    // Keyboard input handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if already submitted
            if (submitted || feedback === "correct") return

            // Handle number keys (0-9)
            if (e.key >= '0' && e.key <= '9') {
                e.preventDefault()
                handleAnswerChange(userAnswer + e.key)
            }
            // Handle backspace or delete
            else if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault()
                handleAnswerChange(userAnswer.slice(0, -1))
            }
            // Handle minus sign for negative numbers
            else if (e.key === '-' && userAnswer === '') {
                e.preventDefault()
                handleAnswerChange('-')
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [userAnswer, submitted, feedback])

    useEffect(() => {
        if (userAnswer && !submitted) {
            const answer = Number(userAnswer)
            if (!isNaN(answer) && answer === question.correctAnswer) {
                setFeedback("correct")
                setSubmitted(true)
                setTimeout(() => {
                    onSubmit(answer)
                }, 500) // Faster transition for speed test
            }
        }
    }, [userAnswer, question.correctAnswer, submitted, onSubmit])

    const handleAnswerChange = (value: string) => {
        if (submitted || feedback === "correct") return

        if (value === "") {
            setUserAnswer("")
            setFeedback(null)
            return
        }

        if (value === "-") {
            setUserAnswer("-")
            setFeedback(null)
            return
        }

        if (isNaN(Number(value))) return

        const answer = Number(value)
        const correctStr = question.correctAnswer.toString()
        const valueStr = value.toString()

        if (answer === question.correctAnswer) {
            setUserAnswer(value)
        } else if (correctStr.startsWith(valueStr)) {
            setUserAnswer(value)
            setFeedback(null)
        } else {
            setUserAnswer(value)
            setFeedback("incorrect")
            setTimeout(() => {
                setUserAnswer("")
                setFeedback(null)
            }, 300) // Faster error clear for speed test
        }
    }

    return (
        <Card className="w-full max-w-4xl mx-auto border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row h-full">
                    {/* Left/Top: Question & Display */}
                    <div className="flex-1 p-8 flex flex-col items-center justify-center space-y-8 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/50">

                        <div className="text-sm font-bold text-orange-500 uppercase tracking-widest">
                            Question {questionNumber}
                        </div>

                        <div className="text-center space-y-2">
                            <div className="text-6xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tighter whitespace-nowrap">
                                {question.num1} {question.operation.replace('*', '×').replace('/', '÷')} {question.num2}
                            </div>
                            <div className="text-4xl text-slate-300 dark:text-slate-600">=</div>
                        </div>

                        <div className={`
                    relative w-full max-w-xs h-24 rounded-2xl flex items-center justify-center text-5xl sm:text-6xl font-mono font-bold tracking-widest
                    transition-all duration-200 border-2
                    ${feedback === "correct"
                                ? "bg-green-50 border-green-200 text-green-600 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                                : "bg-white dark:bg-black/20 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-inner"
                            }
                `}>
                            {userAnswer || <span className="opacity-20">?</span>}

                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {feedback === "correct" && <CheckCircle2 size={40} className="text-green-500 animate-in zoom-in spin-in-12 duration-300" />}
                                {feedback === "incorrect" && <XCircle size={40} className="text-red-500 animate-in zoom-in duration-300" />}
                            </div>
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
