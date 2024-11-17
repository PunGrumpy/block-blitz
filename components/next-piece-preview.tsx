'use client'

import React from 'react'

import { GamePiece } from '@/types/game'

interface NextPiecePreviewProps {
  piece: GamePiece | null
  cellSize?: number
}

export function NextPiecePreview({
  piece,
  cellSize = 30
}: NextPiecePreviewProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !piece) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate centering offsets
    const pieceWidth = piece.shape[0].length * cellSize
    const pieceHeight = piece.shape.length * cellSize
    const offsetX = (canvas.width - pieceWidth) / 2
    const offsetY = (canvas.height - pieceHeight) / 2

    // Draw piece with minimal style
    ctx.fillStyle = piece.color
    piece.shape.forEach((row, y) => {
      row.forEach((isSet, x) => {
        if (isSet) {
          // Draw block
          ctx.fillRect(
            offsetX + x * cellSize,
            offsetY + y * cellSize,
            cellSize,
            cellSize
          )

          // Add subtle border
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
          ctx.strokeRect(
            offsetX + x * cellSize,
            offsetY + y * cellSize,
            cellSize,
            cellSize
          )
        }
      })
    })
  }, [piece, cellSize])

  return (
    <canvas
      ref={canvasRef}
      width={6 * cellSize}
      height={6 * cellSize}
      className="h-56 w-full rounded-lg border border-border bg-background"
      aria-label="Next piece preview"
    />
  )
}
