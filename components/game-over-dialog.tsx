import { Medal, RotateCcw, Trophy } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { ConfettiExplosion } from './confetti-explosion'
import { LeaderBoard } from './leader-board'

interface LeaderboardEntry {
  id: string
  name: string
  score: number
  level: number
  lines: number
  timestamp: number
  rank: number
}

interface GameOverDialogProps {
  isOpen: boolean
  score: number
  level: number
  lines: number
  timeLeft: number
  targetScore: number
  onRestart: () => void
}

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

  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmitScore = async () => {
    if (!playerName.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName.trim(),
          score,
          level,
          lines
        })
      })

      if (!response.ok) throw new Error('Failed to submit score')

      setHasSubmitted(true)
      setShowLeaderboard(true)
    } catch (error) {
      setError('Failed to submit score')
      console.error('Score submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewLeaderboard = () => {
    setShowLeaderboard(true)
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent hideClose className="sm:max-w-md">
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

        {!showLeaderboard ? (
          <div className="mt-6 flex flex-col gap-2 space-y-2">
            {!hasSubmitted && (
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="text-sm font-medium">Submit Your Score</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                    maxLength={20}
                    className="flex-1"
                    disabled={isSubmitting}
                  />
                  <Button
                    onClick={handleSubmitScore}
                    disabled={!playerName.trim() || isSubmitting}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            )}
            <Button
              onClick={handleViewLeaderboard}
              variant="outline"
              className="w-full gap-2"
            >
              <Trophy className="size-4" />
              View Leaderboard
            </Button>
            <Button onClick={onRestart} className="w-full gap-2">
              <RotateCcw className="size-4" />
              Play Again
            </Button>
          </div>
        ) : (
          <LeaderBoard onClose={() => setShowLeaderboard(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}
