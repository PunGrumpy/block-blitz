'use client'

import { Card } from '@/components/ui/card'
import { GameState } from '@/types/game'

interface GameStatsProps {
  state: GameState
  targetScore: number
}

export function GameStats({ state, targetScore }: GameStatsProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = Math.min((state.score / targetScore) * 100, 100)

  return (
    <Card className="space-y-4 p-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Score</span>
          <span className="font-medium">{state.score}</span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-muted">
          <div
            className="h-2.5 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Level</span>
          <span className="font-medium">{state.level}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Lines</span>
          <span className="font-medium">{state.lines}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Time</span>
          <span className="font-medium">{formatTime(state.timeLeft)}</span>
        </div>
      </div>

      <div className="border-t border-border pt-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Target</span>
          <span className="font-medium">{targetScore}</span>
        </div>
      </div>
    </Card>
  )
}
