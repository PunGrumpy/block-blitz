'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { GameState } from '@/types/game'

interface GameOverDialogProps {
  isOpen: boolean
  state: GameState
  targetScore: number
  onRestart: () => void
}

export function GameOverDialog({
  isOpen,
  state,
  targetScore,
  onRestart
}: GameOverDialogProps) {
  const isWin = state.score >= targetScore

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isWin ? '🎉 Congratulations!' : 'Game Over'}
          </DialogTitle>
          <DialogDescription>
            {isWin
              ? `You've reached the target score of ${targetScore}!`
              : `Better luck next time! You scored ${state.score} points.`}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{state.score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{state.lines}</div>
              <div className="text-sm text-muted-foreground">Lines</div>
            </div>
          </div>
          <Button onClick={onRestart} className="w-full">
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
