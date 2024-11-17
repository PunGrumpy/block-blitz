'use client'

import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

import { useGameLoop } from '@/hooks/use-game-loop'
import { LinesClearedEffect } from '@/lib/effects'
import { cn } from '@/lib/utils'
import { GamePiece, GameState } from '@/types/game'

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
  const [isMounted, setIsMounted] = React.useState(false)
  const [clearedRows, setClearedRows] = React.useState<number[]>([])

  const getGhostPosition = React.useCallback(
    (piece: GamePiece): number => {
      let ghostY = piece.position.y
      while (ghostY < state.board.length) {
        if (ghostY + 1 >= state.board.length) break
        const hasCollision = piece.shape.some((row, y) =>
          row.some(
            (cell, x) =>
              cell &&
              state.board[ghostY + y + 1]?.[piece.position.x + x] !== null
          )
        )
        if (hasCollision) break
        ghostY++
      }
      return ghostY
    },
    [state.board]
  )

  const drawBoard = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { board, currentPiece } = state

      // Clear the canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

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
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize)
          }
        })
      })

      // Draw ghost piece with motion
      if (showGhost && currentPiece && !state.isPaused && !state.isGameOver) {
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

      // Draw current piece with motion
      if (currentPiece) {
        ctx.fillStyle = currentPiece.color
        currentPiece.shape.forEach((row, y) => {
          row.forEach((isSet, x) => {
            if (isSet) {
              const pieceX = (currentPiece.position.x + x) * cellSize
              const pieceY = (currentPiece.position.y + y) * cellSize
              ctx.fillRect(pieceX, pieceY, cellSize, cellSize)
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
    [state, cellSize, showGhost, showGrid, showParticles, getGhostPosition]
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
      setTimeout(() => setClearedRows([]), 300) // Clear after animation
    }
  }, [state.board])

  if (!isMounted) {
    return null
  }

  return (
    <motion.div
      className={cn('relative aspect-[1/2] h-full', className)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        width={state.board[0].length * cellSize}
        height={state.board.length * cellSize}
        className="size-full rounded-lg border border-border"
        aria-label="Game Board"
        role="img"
      >
        Your browser does not support the canvas element.
      </canvas>

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
    </motion.div>
  )
}
