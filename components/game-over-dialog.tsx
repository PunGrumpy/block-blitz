import { RotateCcw, Trophy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

interface GameOverDialogProps {
  isOpen: boolean
  score: number
  level: number
  lines: number
  timeLeft: number
  targetScore: number
  onRestart: () => void
}

import { ConfettiExplosion } from '@/components/confetti-explosion'

export function GameOverDialog({
  isOpen,
  score,
  level,
  lines,
  timeLeft,
  targetScore,
  onRestart
}: GameOverDialogProps) {
  const hasWon = score >= targetScore

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        {hasWon && <ConfettiExplosion />}
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            {hasWon ? (
              <>
                <Trophy className="size-6 text-yellow-500" />
                Victory!
              </>
            ) : (
              'Game Over'
            )}
          </DialogTitle>
          <DialogDescription className="text-center">
            {hasWon
              ? 'Congratulations! You reached the target score!'
              : 'Better luck next time!'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <Card className="flex flex-col items-center p-4">
            <div className="text-2xl font-bold">{score}</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </Card>
          <Card className="flex flex-col items-center p-4">
            <div className="text-2xl font-bold">{level}</div>
            <div className="text-xs text-muted-foreground">Level</div>
          </Card>
          <Card className="flex flex-col items-center p-4">
            <div className="text-2xl font-bold">{lines}</div>
            <div className="text-xs text-muted-foreground">Lines</div>
          </Card>
          <Card className="flex flex-col items-center p-4">
            <div className="text-2xl font-bold">
              {Math.floor(timeLeft / 60)}:
              {String(Math.floor(timeLeft % 60)).padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground">Time Left</div>
          </Card>
        </div>

        <div className="mt-6 flex flex-col gap-2 space-y-2">
          <Button onClick={onRestart} className="w-full gap-2">
            <RotateCcw className="size-4" />
            Play Again
          </Button>
          {/* <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() =>
              navigator
                .share?.({
                  title: 'Block Blitz Score',
                  text: `I scored ${score} points in Block Blitz! Can you beat my score?`
                })
                .catch(() => {})
            }
          >
            <Share2 className="size-4" />
            Share Score
          </Button> */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
