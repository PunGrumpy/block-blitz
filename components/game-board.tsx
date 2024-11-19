'use client'

import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

import { ComboDisplay } from '@/components/combo-display'
import { PowerUpIndicator } from '@/components/power-up-indicator'
import { useGameLoop } from '@/hooks/use-game-loop'
import { hasCollision } from '@/lib/collision'
import { adjustColor } from '@/lib/color'
import { LinesClearedEffect } from '@/lib/effects'
import { renderHelpers } from '@/lib/pieces'
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

  const drawBlock = React.useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      piece: GamePiece,
      opacity: number = 1,
      isGhost: boolean = false,
      isCurrentPiece: boolean = false
    ) => {
      const size = cellSize - 1 // Leave 1px gap for grid effect

      ctx.save()
      ctx.globalAlpha = opacity

      if (!isGhost) {
        // Add glow effect for active pieces
        if (isCurrentPiece) {
          renderHelpers.addBlockGlow(ctx, x, y, size, piece, 1.5)
        }

        // Add shadow for depth
        renderHelpers.addBlockShadow(ctx, piece)

        // Create gradient fill
        ctx.fillStyle = renderHelpers.createBlockGradient(
          ctx,
          x,
          y,
          size,
          piece
        )
      } else {
        // Ghost piece styling
        ctx.fillStyle = piece.color
        ctx.globalAlpha = 0.2
      }

      // Draw the main block shape with rounded corners
      ctx.beginPath()
      ctx.roundRect(x, y, size, size, 4)
      ctx.fill()

      if (!isGhost) {
        // Add highlight effect
        ctx.globalAlpha = 0.3
        const highlightGradient = ctx.createLinearGradient(x, y, x, y + size)
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)')
        highlightGradient.addColorStop(0.5, 'transparent')
        ctx.fillStyle = highlightGradient
        ctx.fill()

        // Add subtle inner border
        ctx.strokeStyle = piece.visuals.shadow
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.3
        ctx.stroke()
      }

      ctx.restore()
    },
    [cellSize]
  )

  const drawPowerUpBlock = React.useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, piece: GamePiece) => {
      if (!piece.powerUp) return

      const size = cellSize - 1

      ctx.save()

      // Create power-up glow effect
      const time = Date.now() / 1000
      const glowIntensity = (Math.sin(time * 4) + 1) / 2
      ctx.shadowColor = piece.powerUp.color
      ctx.shadowBlur = 10 * glowIntensity

      // Create animated gradient
      const gradient = ctx.createLinearGradient(x, y, x + size, y + size)
      gradient.addColorStop(0, piece.powerUp.color)
      gradient.addColorStop(1, adjustColor(piece.powerUp.color, -30))
      ctx.fillStyle = gradient

      // Draw block with rounded corners
      ctx.beginPath()
      ctx.roundRect(x, y, size, size, 4)
      ctx.fill()

      // Add shine effect
      ctx.globalAlpha = 0.4 * glowIntensity
      const shineGradient = ctx.createLinearGradient(x, y, x + size, y + size)
      shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
      shineGradient.addColorStop(0.5, 'transparent')
      shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)')
      ctx.fillStyle = shineGradient
      ctx.fill()

      ctx.restore()
    },
    [cellSize]
  )

  const drawBoard = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // Clear the canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      // Add global power-up effects
      if (state.isTimeFrozen) {
        ctx.fillStyle = 'rgba(0, 191, 255, 0.1)'
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

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

        const time = Date.now() / 1000
        const opacity = Math.sin(time * 2) * 0.1 + 0.2
        ctx.fillStyle = `rgba(152, 251, 152, ${opacity})`
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      }

      // Draw the grid if enabled
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
        ctx.lineWidth = 1
        for (let i = 0; i < state.board.length; i++) {
          for (let j = 0; j < state.board[i].length; j++) {
            ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize)
          }
        }
      }

      // Draw placed blocks
      state.board.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const placedPiece: GamePiece = {
              shape: [[true]],
              color: cell,
              position: { x, y },
              rotation: 0,
              visuals: {
                gradient: `linear-gradient(135deg, ${cell} 0%, ${adjustColor(cell, -20)} 100%)`,
                shadow: adjustColor(cell, -40),
                glow: `${cell}80`
              }
            }
            drawBlock(
              ctx,
              x * cellSize,
              y * cellSize,
              placedPiece,
              1,
              false,
              false
            )
          }
        })
      })

      const currentPiece = state.currentPiece
      if (currentPiece) {
        // Draw ghost piece
        if (
          showGhost &&
          !state.isPaused &&
          !state.isGameOver &&
          !state.isGhostMode
        ) {
          const ghostY = getGhostPosition(currentPiece)
          currentPiece.shape.forEach((row, y) => {
            row.forEach((isSet, x) => {
              if (isSet) {
                drawBlock(
                  ctx,
                  (currentPiece.position.x + x) * cellSize,
                  (ghostY + y) * cellSize,
                  currentPiece,
                  0.2,
                  true,
                  false
                )
              }
            })
          })
        }

        // Draw current piece
        currentPiece.shape.forEach((row, y) => {
          row.forEach((isSet, x) => {
            if (isSet) {
              const pieceX = currentPiece.position.x + x
              const pieceY = currentPiece.position.y + y

              if (currentPiece.powerUp) {
                drawPowerUpBlock(
                  ctx,
                  pieceX * cellSize,
                  pieceY * cellSize,
                  currentPiece
                )
              } else {
                drawBlock(
                  ctx,
                  pieceX * cellSize,
                  pieceY * cellSize,
                  currentPiece,
                  1,
                  false,
                  true
                )
              }
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
      drawBlock,
      drawPowerUpBlock
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
