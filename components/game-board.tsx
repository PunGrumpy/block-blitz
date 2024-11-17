'use client'

import React from 'react'

import { Card } from '@/components/ui/card'
import { useGameLoop } from '@/hooks/use-game-loop'
import { GameState } from '@/types/game'

interface GameBoardProps {
  state: GameState
  cellSize?: number
}

export function GameBoard({ state, cellSize = 30 }: GameBoardProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const drawBoard = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { board, currentPiece } = state

      // Clear the canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      // Draw the grid
      ctx.strokeStyle = '#333'
      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
          ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize)
        }
      }

      // Draw placed pieces
      board.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            ctx.fillStyle = cell
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
          }
        })
      })

      // Draw current piece
      if (currentPiece) {
        ctx.fillStyle = currentPiece.color
        currentPiece.shape.forEach((row, y) => {
          row.forEach((isSet, x) => {
            if (isSet) {
              const pieceX = (currentPiece.position.x + x) * cellSize
              const pieceY = (currentPiece.position.y + y) * cellSize
              ctx.fillRect(pieceX, pieceY, cellSize, cellSize)
            }
          })
        })
      }
    },
    [state, cellSize]
  )

  useGameLoop(canvasRef, drawBoard)

  return (
    <Card className="bg-background p-4">
      <canvas
        ref={canvasRef}
        width={state.board[0].length * cellSize}
        height={state.board.length * cellSize}
        className="border border-border"
      />
    </Card>
  )
}
