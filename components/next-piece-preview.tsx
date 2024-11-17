'use client'

import React from 'react'

import { Card } from '@/components/ui/card'
import { GamePiece } from '@/types/game'

interface NextPiecePreviewProps {
  piece: GamePiece | null
  cellSize?: number
}

export function NextPiecePreview({
  piece,
  cellSize = 25
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

    // Draw piece
    ctx.fillStyle = piece.color
    piece.shape.forEach((row, y) => {
      row.forEach((isSet, x) => {
        if (isSet) {
          ctx.fillRect(
            offsetX + x * cellSize,
            offsetY + y * cellSize,
            cellSize,
            cellSize
          )
          // Draw border
          ctx.strokeStyle = '#ffffff33'
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
    <Card className="p-4">
      <div className="mb-2 text-sm text-muted-foreground">Next Piece</div>
      <canvas
        ref={canvasRef}
        width={6 * cellSize}
        height={6 * cellSize}
        className="border border-border bg-background"
      />
    </Card>
  )
}
