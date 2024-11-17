'use client'

import { Pause, Play, RefreshCw } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { GameState } from '@/types/game'

interface GameStatusBarProps {
  state: GameState
  targetScore: number
  onPause: () => void
  onReset: () => void
  className?: string
}

export function GameStatusBar({
  state,
  targetScore,
  onPause,
  onReset,
  className
}: GameStatusBarProps) {
  // Calculate progress percentage
  const progress = Math.min((state.score / targetScore) * 100, 100)

  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Determine time warning state
  const timeWarning =
    state.timeLeft <= 30 && !state.isPaused && !state.isGameOver

  return (
    <div
      className={cn(
        'rounded-lg bg-muted/50 p-4 shadow-lg backdrop-blur-sm',
        className
      )}
    >
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Score Section */}
        <div>
          <div className="mb-1 text-sm font-medium text-muted-foreground">
            Score
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {state.score.toLocaleString()}
          </div>
          <Progress value={progress} className="mt-2 h-1" />
        </div>

        {/* Level Section */}
        <div>
          <div className="mb-1 text-sm font-medium text-muted-foreground">
            Level
          </div>
          <div className="text-2xl font-bold">
            {state.level}
            <Badge variant="secondary" className="ml-2 text-xs">
              {`${state.lines} lines`}
            </Badge>
          </div>
        </div>

        {/* Time Section */}
        <div className="relative">
          <div className="mb-1 text-sm font-medium text-muted-foreground">
            Time
          </div>
          <div
            className={cn(
              'text-2xl font-bold tabular-nums transition-colors',
              timeWarning && 'animate-pulse text-red-500'
            )}
          >
            {formatTime(state.timeLeft)}
          </div>
          {timeWarning && (
            <div className="absolute -bottom-1 text-xs text-red-500">
              Time running out!
            </div>
          )}
        </div>

        {/* Controls Section */}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPause}
            disabled={state.isGameOver}
            aria-label={state.isPaused ? 'Resume game' : 'Pause game'}
          >
            {state.isPaused ? (
              <Play className="size-4" />
            ) : (
              <Pause className="size-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onReset}
            aria-label="Reset game"
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      {/* Game Status Messages */}
      {(state.isPaused || state.isGameOver) && (
        <div
          className="rounded-md bg-accent px-4 py-2 text-center text-accent-foreground"
          role="status"
          aria-live="polite"
        >
          {state.isGameOver ? (
            <span>Game Over! Final Score: {state.score}</span>
          ) : (
            <span>Game Paused - Press P to resume</span>
          )}
        </div>
      )}

      {/* Screen Reader Only Info */}
      <div className="sr-only" aria-live="polite">
        {`Current score ${state.score} out of ${targetScore} target score. `}
        {`Level ${state.level} with ${state.lines} lines cleared. `}
        {`Time remaining: ${formatTime(state.timeLeft)}`}
      </div>
    </div>
  )
}
