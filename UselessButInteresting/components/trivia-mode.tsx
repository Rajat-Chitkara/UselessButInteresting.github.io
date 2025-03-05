"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, HelpCircle, Trophy, RotateCcw } from "lucide-react"
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
  const [fakeFacts, setFakeFacts] = useState<string[]>([
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
  ])

  const totalQuestions = 10

  useEffect(() => {
    // Prepare trivia questions
    prepareTrivia()
  }, [])

  const prepareTrivia = () => {
    // Reset game state
    setCurrentQuestion(0)
    setScore(0)
    setShowAnswer(false)
    setUserAnswer(null)
    setGameOver(false)

    // Shuffle and select facts
    const shuffledFacts = [...facts].sort(() => 0.5 - Math.random()).slice(0, totalQuestions / 2)

    // Create fake facts (in a real app, these would be more sophisticated)
    const selectedFakeFacts = fakeFacts.sort(() => 0.5 - Math.random()).slice(0, totalQuestions / 2)

    // Combine real and fake facts
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
    }

    // Move to next question after 1.5 seconds
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

  // If trivia facts aren't loaded yet, show loading
  if (triviaFacts.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
            <h3 className="text-xl font-medium">Preparing trivia questions...</h3>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Game over screen
  if (gameOver) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Game Over!</CardTitle>
          <CardDescription className="text-center">
            You scored {score} out of {totalQuestions}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Trophy
            className={cn(
              "h-24 w-24 mb-6",
              score === totalQuestions
                ? "text-yellow-500"
                : score >= totalQuestions * 0.7
                  ? "text-primary"
                  : "text-muted-foreground",
            )}
          />

          <h3 className="text-2xl font-bold mb-4">
            {score === totalQuestions
              ? "Perfect Score!"
              : score >= totalQuestions * 0.7
                ? "Great Job!"
                : score >= totalQuestions * 0.5
                  ? "Good Effort!"
                  : "Better Luck Next Time!"}
          </h3>

          <p className="text-muted-foreground text-center mb-8">
            {score === totalQuestions
              ? "You're a fact master! You got every question right!"
              : score >= totalQuestions * 0.7
                ? "You really know your facts! Just a few mistakes."
                : score >= totalQuestions * 0.5
                  ? "You got more than half right. Keep learning!"
                  : "Don't worry, facts can be tricky. Try again to improve your score!"}
          </p>

          <Button onClick={restartGame} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Play Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentFact = triviaFacts[currentQuestion]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle>Fact or Fiction?</CardTitle>
          <Badge variant="outline">
            Question {currentQuestion + 1}/{totalQuestions}
          </Badge>
        </div>
        <CardDescription>Decide whether each statement is true or false.</CardDescription>
        <Progress value={(currentQuestion / totalQuestions) * 100} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="py-6">
        <div className="text-xl font-medium text-center mb-8 px-4">{currentFact.text}</div>

        <div className="flex justify-center gap-4">
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
              "w-32 h-16 text-lg",
              userAnswer === true && showAnswer && currentFact.isTrue && "bg-green-600 hover:bg-green-700",
            )}
            onClick={() => handleAnswer(true)}
            disabled={showAnswer}
          >
            {userAnswer === true &&
              showAnswer &&
              (currentFact.isTrue ? <CheckCircle className="h-5 w-5 mr-2" /> : <XCircle className="h-5 w-5 mr-2" />)}
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
              "w-32 h-16 text-lg",
              userAnswer === false && showAnswer && !currentFact.isTrue && "bg-green-600 hover:bg-green-700",
            )}
            onClick={() => handleAnswer(false)}
            disabled={showAnswer}
          >
            {userAnswer === false &&
              showAnswer &&
              (currentFact.isTrue ? <XCircle className="h-5 w-5 mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />)}
            False
          </Button>
        </div>

        {showAnswer && (
          <div
            className={cn(
              "mt-6 p-4 rounded-lg text-center",
              currentFact.isTrue === userAnswer ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30",
            )}
          >
            <p className="font-medium">{currentFact.isTrue ? "This fact is TRUE!" : "This fact is FALSE!"}</p>
            <p className="text-sm mt-1 text-muted-foreground">
              {currentFact.isTrue === userAnswer ? "You got it right!" : "Better luck next time!"}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between border-t p-4">
        <div className="text-sm text-muted-foreground">Score: {score}</div>
        <Button variant="ghost" size="sm" onClick={restartGame}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Restart
        </Button>
      </CardFooter>
    </Card>
  )
}

