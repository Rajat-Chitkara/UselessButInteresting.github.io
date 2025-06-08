"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, HelpCircle, Trophy, RotateCcw, Brain, Target, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Fact } from "@/lib/types"

interface TriviaProps {
  facts: Fact[]
}

export default function TriviaMode({ facts }: TriviaProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [triviaFacts, setTriviaFacts] = useState<Fact[]>([])
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [fakeFacts] = useState<string[]>([
    "Humans can breathe underwater if they practice enough.",
    "The Great Wall of China is visible from the Moon with the naked eye.",
    "Goldfish have a memory span of only three seconds.",
    "Humans only use 10% of their brains.",
    "If you touch a baby bird, its mother will reject it.",
    "Lightning never strikes the same place twice.",
    "Different parts of your tongue detect different tastes.",
    "Eating turkey makes you sleepy because of the tryptophan.",
    "Bats are blind.",
    "You lose most of your body heat through your head.",
    "Hair and fingernails continue to grow after death.",
    "Cracking your knuckles causes arthritis.",
    "You need to wait 24 hours before filing a missing person report.",
    "Bulls are enraged by the color red.",
    "Chameleons change color to blend in with their surroundings.",
  ])

  const totalQuestions = 10

  useEffect(() => {
    prepareTrivia()
  }, [facts])

  const prepareTrivia = () => {
    setCurrentQuestion(0)
    setScore(0)
    setShowAnswer(false)
    setUserAnswer(null)
    setGameOver(false)
    setStreak(0)

    if (facts.length === 0) return

    const shuffledFacts = [...facts].sort(() => 0.5 - Math.random()).slice(0, Math.floor(totalQuestions / 2))
    const selectedFakeFacts = fakeFacts.sort(() => 0.5 - Math.random()).slice(0, Math.ceil(totalQuestions / 2))

    const triviaQuestions = [
      ...shuffledFacts.map((fact) => ({ ...fact, isTrue: true })),
      ...selectedFakeFacts.map((text, index) => ({
        id: `fake-${index}`,
        text,
        category: "Trivia",
        isTrue: false,
      })),
    ].sort(() => 0.5 - Math.random())

    setTriviaFacts(triviaQuestions)
  }

  const handleAnswer = (answer: boolean) => {
    const isCorrect = answer === triviaFacts[currentQuestion].isTrue
    setUserAnswer(answer)
    setShowAnswer(true)

    if (isCorrect) {
      setScore(score + 1)
      setStreak(streak + 1)
      if (streak + 1 > bestStreak) {
        setBestStreak(streak + 1)
      }
    } else {
      setStreak(0)
    }

    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setShowAnswer(false)
        setUserAnswer(null)
      } else {
        setGameOver(true)
      }
    }, 1500)
  }

  const restartGame = () => {
    prepareTrivia()
  }

  if (triviaFacts.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-700 border-2 border-purple-200 dark:border-purple-800 shadow-xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="h-16 w-16 mx-auto mb-6 text-purple-500 animate-pulse" />
            <h3 className="text-2xl font-bold mb-2">Preparing trivia questions...</h3>
            <p className="text-gray-600 dark:text-gray-300">Get ready to test your knowledge!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (gameOver) {
    const percentage = Math.round((score / totalQuestions) * 100)
    return (
      <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-700 border-2 border-purple-200 dark:border-purple-800 shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Game Over!
          </CardTitle>
          <CardDescription className="text-xl">
            You scored {score} out of {totalQuestions} ({percentage}%)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full p-8 mb-8">
            <Trophy
              className={cn(
                "h-24 w-24",
                score === totalQuestions
                  ? "text-yellow-500"
                  : score >= totalQuestions * 0.7
                    ? "text-purple-500"
                    : "text-gray-400",
              )}
            />
          </div>

          <h3 className="text-3xl font-bold mb-4 text-center">
            {score === totalQuestions
              ? "Perfect Score! 🎉"
              : score >= totalQuestions * 0.7
                ? "Great Job! 👏"
                : score >= totalQuestions * 0.5
                  ? "Good Effort! 👍"
                  : "Better Luck Next Time! 💪"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-md">
            <div className="text-center bg-white/50 dark:bg-gray-700/50 rounded-lg p-4">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Correct</div>
            </div>
            <div className="text-center bg-white/50 dark:bg-gray-700/50 rounded-lg p-4">
              <Award className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{bestStreak}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Best Streak</div>
            </div>
            <div className="text-center bg-white/50 dark:bg-gray-700/50 rounded-lg p-4">
              <Brain className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{percentage}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Accuracy</div>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-center mb-8 max-w-md leading-relaxed">
            {score === totalQuestions
              ? "You're a fact master! You got every question right!"
              : score >= totalQuestions * 0.7
                ? "You really know your facts! Just a few mistakes."
                : score >= totalQuestions * 0.5
                  ? "You got more than half right. Keep learning!"
                  : "Don't worry, facts can be tricky. Try again to improve your score!"}
          </p>

          <Button 
            onClick={restartGame} 
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg text-lg px-8 py-3"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Play Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentFact = triviaFacts[currentQuestion]

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-700 border-2 border-purple-200 dark:border-purple-800 shadow-xl">
      <CardHeader className="pb-6">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Fact or Fiction?
          </CardTitle>
          <Badge variant="outline" className="text-lg px-4 py-2 bg-white/50 dark:bg-gray-700/50">
            Question {currentQuestion + 1}/{totalQuestions}
          </Badge>
        </div>
        <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
          Decide whether each statement is true or false.
        </CardDescription>
        <div className="space-y-3">
          <Progress value={(currentQuestion / totalQuestions) * 100} className="h-3" />
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>Score: {score}/{totalQuestions}</span>
            <span>Streak: {streak}</span>
            <span>Best: {bestStreak}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-8">
        <div className="bg-white/50 dark:bg-gray-700/50 rounded-xl p-8 mb-8 border-2 border-dashed border-purple-300 dark:border-purple-600">
          <p className="text-xl font-medium text-center leading-relaxed text-gray-800 dark:text-gray-200">
            {currentFact.text}
          </p>
        </div>

        <div className="flex justify-center gap-6">
          <Button
            variant={
              userAnswer === true
                ? showAnswer
                  ? currentFact.isTrue
                    ? "default"
                    : "destructive"
                  : "default"
                : "outline"
            }
            className={cn(
              "w-40 h-20 text-xl font-semibold transition-all duration-300 hover:scale-105",
              userAnswer === true && showAnswer && currentFact.isTrue && "bg-green-600 hover:bg-green-700 text-white",
            )}
            onClick={() => handleAnswer(true)}
            disabled={showAnswer}
          >
            {userAnswer === true &&
              showAnswer &&
              (currentFact.isTrue ? <CheckCircle className="h-6 w-6 mr-2" /> : <XCircle className="h-6 w-6 mr-2" />)}
            True
          </Button>

          <Button
            variant={
              userAnswer === false
                ? showAnswer
                  ? currentFact.isTrue
                    ? "destructive"
                    : "default"
                  : "default"
                : "outline"
            }
            className={cn(
              "w-40 h-20 text-xl font-semibold transition-all duration-300 hover:scale-105",
              userAnswer === false && showAnswer && !currentFact.isTrue && "bg-green-600 hover:bg-green-700 text-white",
            )}
            onClick={() => handleAnswer(false)}
            disabled={showAnswer}
          >
            {userAnswer === false &&
              showAnswer &&
              (currentFact.isTrue ? <XCircle className="h-6 w-6 mr-2" /> : <CheckCircle className="h-6 w-6 mr-2" />)}
            False
          </Button>
        </div>

        {showAnswer && (
          <div
            className={cn(
              "mt-8 p-6 rounded-xl text-center border-2",
              currentFact.isTrue === userAnswer 
                ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600" 
                : "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-600",
            )}
          >
            <div className="flex items-center justify-center mb-3">
              {currentFact.isTrue === userAnswer ? (
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mr-2" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400 mr-2" />
              )}
              <p className="text-xl font-bold">
                {currentFact.isTrue ? "This fact is TRUE!" : "This fact is FALSE!"}
              </p>
            </div>
            <p className="text-lg">
              {currentFact.isTrue === userAnswer ? "Correct! Well done! 🎉" : "Incorrect. Better luck next time! 💪"}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between border-t border-purple-200 dark:border-purple-800 p-6">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Progress: {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%
        </div>
        <Button variant="ghost" size="sm" onClick={restartGame} className="hover:bg-purple-100 dark:hover:bg-purple-900/30">
          <RotateCcw className="h-4 w-4 mr-2" />
          Restart
        </Button>
      </CardFooter>
    </Card>
  )
}