'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, Trophy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

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
  // Game state
  const hasWon = score >= targetScore
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  // Form state
  const [playerName, setPlayerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Name validation state
  const [isCheckingName, setIsCheckingName] = useState(false)
  const [nameError, setNameError] = useState('')
  const [nameCooldown, setNameCooldown] = useState<number | null>(null)
  const checkNameTimeoutRef = useRef<NodeJS.Timeout>()

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPlayerName('')
      setIsSubmitting(false)
      setHasSubmitted(false)
      setError('')
      setShowLeaderboard(false)
      setNameError('')
      setNameCooldown(null)
      setIsCheckingName(false)
    }
  }, [isOpen])

  // Handle name validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value.trim()
    setPlayerName(newName)
    setError('')
    setNameError('')
    setNameCooldown(null)

    // Clear previous timeout
    if (checkNameTimeoutRef.current) {
      clearTimeout(checkNameTimeoutRef.current)
    }

    // Skip validation for empty or short names
    if (!newName || newName.length < 3) {
      return
    }

    // Validate name format
    const nameRegex = /^[a-zA-Z0-9_\- ]+$/
    if (!nameRegex.test(newName)) {
      setNameError('Only letters, numbers, spaces, and - _ allowed')
      return
    }

    // Set timeout for name validation
    setIsCheckingName(true)
    checkNameTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await submitScore({
          name: newName,
          score: 0, // Dummy score for validation
          level: 1,
          lines: 0,
          clientData: {
            gameTime: 0,
            moves: 0,
            lineClears: [],
            powerUpsUsed: []
          }
        })

        if (!result.success && result.error) {
          setNameError(result.error)
        }
      } catch (error) {
        console.error('Name validation error:', error)
      } finally {
        setIsCheckingName(false)
      }
    }, 500)
  }

  // Handle score submission
  const handleSubmitScore = async () => {
    if (!playerName.trim() || isSubmitting || nameError) return

    try {
      setIsSubmitting(true)
      setError('')

      // Create default gameStats if not provided
      const defaultGameStats = {
        gameTime: Math.max(0, targetScore - timeLeft),
        moves: lines * 4, // Estimate based on lines cleared
        lineClears: Array(lines).fill(1),
        powerUpsUsed: []
      }

      const result = await submitScore({
        name: playerName.trim(),
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
    if (e.key === 'Enter' && !isSubmitting && playerName.trim() && !nameError) {
      handleSubmitScore()
    }
  }

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Check if submit is allowed
  const canSubmit =
    playerName.trim().length >= 3 &&
    !isSubmitting &&
    !isCheckingName &&
    !nameError

  // Render name input form
  const renderNameInput = () => (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="text-sm font-medium">Submit Your Score</h3>
      <div className="space-y-2">
        <div className="relative">
          <Input
            placeholder="Enter your name (3-30 characters)"
            value={playerName}
            onChange={handleNameChange}
            onKeyPress={handleKeyPress}
            maxLength={30}
            className={cn(
              'pr-8',
              nameError && 'border-destructive focus-visible:ring-destructive'
            )}
            disabled={isSubmitting}
            aria-label="Player name"
          />
          {isCheckingName && (
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              ○
            </motion.div>
          )}
        </div>

        {nameError && (
          <p className="text-sm text-destructive">
            {nameError}
            {nameCooldown && (
              <span>
                {' '}
                (Available in {Math.ceil(nameCooldown / (1000 * 60 * 60))}{' '}
                hours)
              </span>
            )}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSubmitScore}
            disabled={!canSubmit}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Score'}
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowLeaderboard(true)}
                >
                  <Trophy className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Leaderboard</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="rounded-lg bg-muted p-2 text-xs text-muted-foreground">
          <ul className="space-y-1">
            <li>• Name must be 3-30 characters</li>
            <li>• Only letters, numbers, spaces, and - _ allowed</li>
            <li>• Limited to 3 submissions per name per day</li>
          </ul>
        </div>
      </div>
    </div>
  )

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

              {/* Stats Grid */}
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
                    {!hasSubmitted && renderNameInput()}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {hasSubmitted && (
                        <Button
                          onClick={() => setShowLeaderboard(true)}
                          variant="outline"
                          className="w-full gap-2"
                        >
                          <Trophy className="size-4" />
                          View Leaderboard
                        </Button>
                      )}
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
                        className="mt-2 space-y-1 rounded-lg bg-muted p-3"
                      >
                        <p className="text-xs font-medium">Game Statistics</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <p className="text-xs text-muted-foreground">
                            Moves: {gameStats.moves || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Lines: {gameStats.lineClears?.length || lines}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Power-ups: {gameStats.powerUpsUsed?.length || '0'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Time: {formatTime(gameStats.gameTime || 0)}
                          </p>
                        </div>
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
