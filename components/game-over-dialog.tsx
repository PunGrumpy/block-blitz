'use client'

import { RotateCcw, Trophy } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { submitScore } from '@/actions/leaderboard'
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
import { ConfettiExplosion } from './confetti-explosion'
import { LeaderBoard } from './leader-board'

// Types
interface GameStats {
  moves: number
  lineClears: number[]
  powerUpsUsed: string[]
  gameTime: number
}

interface GameOverDialogProps {
  isOpen: boolean
  score: number
  level: number
  lines: number
  timeLeft: number
  targetScore: number
  gameStats?: Partial<GameStats>
  onRestart: () => void
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      type: 'spring',
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  }
}

export function GameOverDialog({
  isOpen,
  score,
  level,
  lines,
  timeLeft,
  targetScore,
  gameStats,
  onRestart
}: GameOverDialogProps) {
  // State management
  const hasWon = score >= targetScore
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPlayerName('')
      setIsSubmitting(false)
      setHasSubmitted(false)
      setError('')
      setShowLeaderboard(false)
    }
  }, [isOpen])

  // Handle score submission
  const handleSubmitScore = async () => {
    if (!playerName.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      setError('')

      const sanitizedName = playerName.trim().slice(0, 30)

      // Create default gameStats if not provided
      const defaultGameStats = {
        gameTime: timeLeft,
        moves: lines * 4, // Estimate based on lines cleared
        lineClears: Array(lines).fill(1),
        powerUpsUsed: []
      }

      const result = await submitScore({
        name: sanitizedName,
        score,
        level,
        lines,
        clientData: {
          ...defaultGameStats,
          ...gameStats
        }
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      setHasSubmitted(true)
      setShowLeaderboard(true)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to submit score'
      )
      console.error('Score submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle keyboard events
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting && playerName.trim()) {
      handleSubmitScore()
    }
  }

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent hideClose className="sm:max-w-md">
        {hasWon && <ConfettiExplosion />}

        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              key="game-over-content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
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

              <motion.div
                key="stats-grid"
                variants={itemVariants}
                className="mt-4 grid grid-cols-2 gap-4"
              >
                <Card className="flex flex-col items-center p-4">
                  <div className="text-2xl font-bold">
                    {score.toLocaleString()}
                  </div>
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
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-xs text-muted-foreground">Time Left</div>
                </Card>
              </motion.div>

              <AnimatePresence mode="wait">
                {!showLeaderboard ? (
                  <motion.div
                    key="game-over-actions"
                    variants={itemVariants}
                    className="mt-6 flex flex-col gap-2"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    {/* Score Submission Form */}
                    {!hasSubmitted && (
                      <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="text-sm font-medium">
                          Submit Your Score
                        </h3>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter your name"
                              value={playerName}
                              onChange={e => {
                                setPlayerName(e.target.value)
                                setError('')
                              }}
                              onKeyPress={handleKeyPress}
                              maxLength={30}
                              className="flex-1"
                              disabled={isSubmitting}
                              aria-label="Player name"
                            />
                            <Button
                              onClick={handleSubmitScore}
                              disabled={!playerName.trim() || isSubmitting}
                            >
                              {isSubmitting ? 'Submitting...' : 'Submit'}
                            </Button>
                          </div>
                          {error && (
                            <p className="text-sm text-destructive">{error}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => setShowLeaderboard(true)}
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

                    {/* Game Statistics */}
                    {gameStats && (
                      <motion.div
                        key="game-stats"
                        variants={itemVariants}
                        className="mt-2 space-y-1 rounded-lg bg-muted p-3 text-sm"
                      >
                        <p className="text-xs font-medium">Game Statistics</p>
                        <p className="text-xs text-muted-foreground">
                          Total Moves: {gameStats.moves || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Lines Cleared:{' '}
                          {gameStats.lineClears?.length.toString() || lines}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Power-ups Used:{' '}
                          {gameStats.powerUpsUsed?.length.toString() || '0'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Play Time: {formatTime(gameStats.gameTime || 0)}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="leaderboard-view"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={itemVariants}
                  >
                    <LeaderBoard onClose={() => setShowLeaderboard(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
