"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Brain, Trophy, Zap, GraduationCap } from "lucide-react"

import Navigation from "@/components/Navigation/Navigation.component"

export default function Home() {
  const router = useRouter()
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("normal")
  const [questionCount, setQuestionCount] = useState(10)

  const handleStartTest = () => {
    if (!selectedDifficulty) return
    router.push(`/rapid-math/test?difficulty=${selectedDifficulty}&questions=${questionCount}`)
  }

  const difficultyInfo: Record<string, any> = {
    easy: {
      label: "Easy",
      description: "Foundations",
      icon: Sparkles,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-200",
      activeBorder: "border-green-500",
      range: "1-2 digits"
    },
    normal: {
      label: "Normal",
      description: "Standard Mix",
      icon: GraduationCap,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-200",
      activeBorder: "border-blue-500",
      range: "2 digits"
    },
    medium: {
      label: "Medium",
      description: "Brain Teaser",
      icon: Brain,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-200",
      activeBorder: "border-orange-500",
      range: "2-3 digits"
    },
    hard: {
      label: "Hard",
      description: "Expert Mode",
      icon: Zap,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-200",
      activeBorder: "border-red-500",
      range: "3-4 digits"
    },
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans overflow-hidden">
      <Navigation />

      <div className="flex-1 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500 max-h-[calc(100vh-64px)]">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Hero / Intro Section */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                Math <span className="text-blue-600 dark:text-blue-400">Mastery</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Sharpen your arithmetic skills with rapid-fire quizzes. Challenge yourself and track your progress.
              </p>
            </div>

            <div className="hidden lg:flex gap-6 opacity-75">
              <div className="flex items-center gap-2 text-base text-slate-500">
                <Trophy size={20} /> <span>Track Progress</span>
              </div>
              <div className="flex items-center gap-2 text-base text-slate-500">
                <Brain size={20} /> <span>Boost Mental Math</span>
              </div>
            </div>
          </div>

          {/* Configuration Card */}
          <Card className="w-full shadow-2xl border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8 space-y-6">

              {/* Difficulty Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Select Difficulty</h2>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                    {difficultyInfo[selectedDifficulty].range}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(difficultyInfo).map((level) => {
                    const info = difficultyInfo[level]
                    const Icon = info.icon
                    const isSelected = selectedDifficulty === level

                    return (
                      <button
                        key={level}
                        onClick={() => setSelectedDifficulty(level)}
                        className={`
                          relative group flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200
                          hover:scale-[1.02] hover:shadow-md
                          ${isSelected
                            ? `${info.activeBorder} ${info.bg}`
                            : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                          }
                        `}
                      >
                        <div className={`mb-3 p-2 rounded-lg ${isSelected ? "bg-white/80 dark:bg-black/20" : "bg-slate-50 dark:bg-slate-900"} ${info.color}`}>
                          <Icon size={24} />
                        </div>
                        <div className="text-left">
                          <div className={`font-bold text-base ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                            {info.label}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {info.description}
                          </div>
                        </div>

                        {isSelected && (
                          <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${info.color.replace('text-', 'bg-')}`} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Questions Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Questions</h2>
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {questionCount}
                  </span>
                </div>
                <div className="relative pt-2 pb-1">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
                  />
                  <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium px-1">
                    <span>5</span>
                    <span>25</span>
                    <span>50</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleStartTest}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 py-6 text-xl font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                Start Quiz
              </Button>

            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
