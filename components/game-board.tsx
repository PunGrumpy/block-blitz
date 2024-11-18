'use client'

import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

import { ComboDisplay } from '@/components/combo-display'
import { PowerUpIndicator } from '@/components/power-up-indicator'
import { useGameLoop } from '@/hooks/use-game-loop'
import { hasCollision } from '@/lib/collision'
import { LinesClearedEffect } from '@/lib/effects'
import { cn } from '@/lib/utils'
import { GamePiece, GameState } from '@/types/game'
import { PowerUp } from '@/types/power-ups'

// Animation variants
const rowClearVariants = {
  initial: { scaleY: 1, opacity: 1 },
  animate: {
    scaleY: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
}

const powerUpActivateVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'backOut'
    }
  },
  exit: {
    scale: 1.2,
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
}

interface GameBoardProps {
  state: GameState
  cellSize?: number
  showGhost?: boolean
  showGrid?: boolean
  showParticles?: boolean
  className?: string
}

export function GameBoard({
  state,
  cellSize = 30,
  showGhost = true,
  showGrid = true,
  showParticles = true,
  className
}: GameBoardProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const effectsRef = React.useRef<LinesClearedEffect>(new LinesClearedEffect())
  const prevLinesRef = React.useRef(state.lines)
  const boardLengthRef = React.useRef(state.board.length)
  const [isMounted, setIsMounted] = React.useState(false)
  const [clearedRows, setClearedRows] = React.useState<number[]>([])
  const [activatingPowerUp, setActivatingPowerUp] =
    React.useState<PowerUp | null>(null)

  const getGhostPosition = React.useCallback(
    (piece: GamePiece): number => {
      if (!piece) return 0

      let ghostY = piece.position.y
      while (
        !hasCollision(
          state.board,
          piece,
          { ...piece.position, y: ghostY + 1 },
          state.isGhostMode
        )
      ) {
        ghostY++
      }
      return ghostY
    },
    [state.board, state.isGhostMode]
  )

  const drawPowerUpEffect = React.useCallback(
    (ctx: CanvasRenderingContext2D, powerUp: PowerUp, x: number, y: number) => {
      const size = cellSize
      const centerX = x + size / 2
      const centerY = y + size / 2

      // Create a glowing effect
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        size
      )
      gradient.addColorStop(0, powerUp.color)
      gradient.addColorStop(0.6, `${powerUp.color}80`) // Semi-transparent
      gradient.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, size, size)

      // Add pulsing animation
      const time = Date.now() / 1000
      const scale = 1 + Math.sin(time * 4) * 0.1
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.scale(scale, scale)
      ctx.translate(-centerX, -centerY)
      ctx.fillStyle = powerUp.color
      ctx.globalAlpha = 0.3
      ctx.fillRect(x + size * 0.1, y + size * 0.1, size * 0.8, size * 0.8)
      ctx.restore()
    },
    [cellSize]
  )

  const drawBoard = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { board, currentPiece } = state

      // Clear the canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      // Draw global power-up effects
      if (state.isTimeFrozen) {
        ctx.fillStyle = 'rgba(0, 191, 255, 0.1)'
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        // Add frost effect at the edges
        const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)')
        gradient.addColorStop(0.1, 'transparent')
        gradient.addColorStop(0.9, 'transparent')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      }

      if (state.isGhostMode) {
        ctx.fillStyle = 'rgba(152, 251, 152, 0.1)'
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        // Add ethereal effect
        const time = Date.now() / 1000
        const opacity = Math.sin(time * 2) * 0.1 + 0.2
        ctx.fillStyle = `rgba(152, 251, 152, ${opacity})`
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      }

      // Draw the grid if enabled
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
        ctx.lineWidth = 1
        for (let i = 0; i < board.length; i++) {
          for (let j = 0; j < board[i].length; j++) {
            ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize)
          }
        }
      }

      // Draw placed pieces
      board.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            ctx.fillStyle = cell
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)

            // Add slight gradient for depth
            const gradient = ctx.createLinearGradient(
              x * cellSize,
              y * cellSize,
              x * cellSize,
              (y + 1) * cellSize
            )
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)')
            ctx.fillStyle = gradient
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)

            // Add border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize)
          }
        })
      })

      // Draw ghost piece
      if (
        showGhost &&
        currentPiece &&
        !state.isPaused &&
        !state.isGameOver &&
        !state.isGhostMode
      ) {
        const ghostY = getGhostPosition(currentPiece)
        ctx.globalAlpha = 0.2
        ctx.fillStyle = currentPiece.color
        currentPiece.shape.forEach((row, y) => {
          row.forEach((isSet, x) => {
            if (isSet) {
              ctx.fillRect(
                (currentPiece.position.x + x) * cellSize,
                (ghostY + y) * cellSize,
                cellSize,
                cellSize
              )
            }
          })
        })
        ctx.globalAlpha = 1
      }

      // Draw current piece
      if (currentPiece) {
        currentPiece.shape.forEach((row, y) => {
          row.forEach((isSet, x) => {
            if (isSet) {
              const pieceX = (currentPiece.position.x + x) * cellSize
              const pieceY = (currentPiece.position.y + y) * cellSize

              if (currentPiece.powerUp) {
                // Draw power-up piece with special effects
                drawPowerUpEffect(ctx, currentPiece.powerUp, pieceX, pieceY)
              } else {
                // Draw normal piece
                ctx.fillStyle = currentPiece.color
                ctx.fillRect(pieceX, pieceY, cellSize, cellSize)

                // Add highlighting
                const gradient = ctx.createLinearGradient(
                  pieceX,
                  pieceY,
                  pieceX,
                  pieceY + cellSize
                )
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)')
                ctx.fillStyle = gradient
                ctx.fillRect(pieceX, pieceY, cellSize, cellSize)
              }

              ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
              ctx.strokeRect(pieceX, pieceY, cellSize, cellSize)
            }
          })
        })
      }

      // Draw particles if enabled
      if (showParticles && effectsRef.current) {
        effectsRef.current.update()
        effectsRef.current.draw(ctx)

        if (effectsRef.current.hasParticles()) {
          requestAnimationFrame(() => drawBoard(ctx))
        }
      }
    },
    [
      state,
      cellSize,
      showGhost,
      showGrid,
      showParticles,
      getGhostPosition,
      drawPowerUpEffect
    ]
  )

  useGameLoop(canvasRef, drawBoard)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Track cleared rows for animation
  React.useEffect(() => {
    const currentRows = state.board.reduce((acc, row, index) => {
      if (row.every(cell => cell !== null)) {
        acc.push(index)
      }
      return acc
    }, [] as number[])

    if (currentRows.length > 0) {
      setClearedRows(currentRows)
      setTimeout(() => setClearedRows([]), 300)
    }
  }, [state.board])

  // Track power-up activation
  React.useEffect(() => {
    if (state.currentPiece?.powerUp) {
      setActivatingPowerUp(state.currentPiece.powerUp)
      setTimeout(() => setActivatingPowerUp(null), 500)
    }
  }, [state.currentPiece])

  // Check for cleared lines and create particles
  React.useEffect(() => {
    if (showParticles && state.lines > prevLinesRef.current) {
      const linesCleared = state.lines - prevLinesRef.current
      const canvasWidth = canvasRef.current?.width || 0
      boardLengthRef.current = state.board.length

      for (let i = 0; i < linesCleared; i++) {
        effectsRef.current.createParticles(
          boardLengthRef.current - 1 - i,
          cellSize,
          canvasWidth
        )
      }
    }
    prevLinesRef.current = state.lines
  }, [state.lines, showParticles, cellSize, state.board.length])

  if (!isMounted) {
    return null
  }

  return (
    <div
      className={cn('relative aspect-[1/2] size-full', className)}
      aria-label="Game Board"
    >
      {/* Main Game Canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative size-full"
      >
        <canvas
          ref={canvasRef}
          width={state.board[0].length * cellSize}
          height={state.board.length * cellSize}
          className="size-full rounded-lg border border-border"
          role="img"
          aria-label="Game Board Canvas"
        >
          Your browser does not support the canvas element.
        </canvas>

        {/* Row Clear Animation */}
        <AnimatePresence>
          {clearedRows.map(rowIndex => (
            <motion.div
              key={rowIndex}
              className="absolute inset-x-0 bg-foreground/20"
              style={{
                top: rowIndex * cellSize,
                height: cellSize
              }}
              variants={rowClearVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            />
          ))}
        </AnimatePresence>

        {/* Power-up Activation Effect */}
        <AnimatePresence>
          {activatingPowerUp && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              variants={powerUpActivateVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div
                className="rounded-full p-8"
                style={{ backgroundColor: `${activatingPowerUp.color}40` }}
              >
                {React.createElement(activatingPowerUp.icon, {
                  size: 48
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Power-ups List */}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          <AnimatePresence>
            {state.activePowerUps.map(powerUp => (
              <PowerUpIndicator key={powerUp.startTime} powerUp={powerUp} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
      {/* Game State Overlays */}
      {(state.isPaused || state.isGameOver) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h2 className="mb-2 text-3xl font-bold">
              {state.isGameOver ? 'Game Over' : 'Paused'}
            </h2>
            <p className="text-muted-foreground">
              {state.isGameOver
                ? `Final Score: ${state.score}`
                : 'Press P to resume'}
            </p>
          </motion.div>
        </div>
      )}
      {/* Game Status Effects */}
      <AnimatePresence>
        {state.isTimeFrozen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent" />
          </motion.div>
        )}

        {state.isGhostMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Level Up Animation */}
      <AnimatePresence>
        {state.level > 1 && (
          <motion.div
            key={state.level}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="text-4xl font-bold text-primary">
              Level {state.level}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Power-up Tutorial Hints */}
      {state.currentPiece?.powerUp && !state.isPaused && !state.isGameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg border border-border bg-background/80 px-4 py-2 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            <state.currentPiece.powerUp.icon
              className="size-4"
              style={{ color: state.currentPiece.powerUp.color }}
            />
            <span className="text-sm">
              {state.currentPiece.powerUp.description}
            </span>
          </div>
        </motion.div>
      )}
      {/* Combo Display */}
      <ComboDisplay combo={state.combo} />
    </div>
  )
}

// Helper function to calculate score
function calculateScore(lines: number): number {
  switch (lines) {
    case 1:
      return 100
    case 2:
      return 300
    case 3:
      return 500
    case 4:
      return 800
    default:
      return 0
  }
}
