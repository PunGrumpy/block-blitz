import { PIECE_TYPES } from '@/constants/pieces'
import { GamePiece } from '@/types/game'

export function createPiece(type: keyof typeof PIECE_TYPES): GamePiece {
  const { shape, visuals } = PIECE_TYPES[type]
  return {
    shape: shape.map(row => [...row]),
    color: visuals.color,
    visuals: {
      gradient: visuals.gradient,
      shadow: visuals.shadow,
      glow: visuals.glow
    },
    position: {
      x: Math.floor(10 / 2) - Math.floor(shape[0].length / 2),
      y: 0
    },
    rotation: 0
  }
}

export function getRandomPiece(): GamePiece {
  const pieces = Object.keys(PIECE_TYPES) as (keyof typeof PIECE_TYPES)[]
  const randomType = pieces[Math.floor(Math.random() * pieces.length)]
  return createPiece(randomType)
}

export function rotatePiece(piece: GamePiece): boolean[][] {
  const matrix = piece.shape
  const N = matrix.length
  const rotated = Array(N)
    .fill(false)
    .map(() => Array(N).fill(false))

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      rotated[j][N - 1 - i] = matrix[i][j]
    }
  }

  return rotated
}

// Helper functions for rendering
export const renderHelpers = {
  createBlockGradient: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    piece: GamePiece
  ): CanvasGradient => {
    const gradient = ctx.createLinearGradient(x, y, x + size, y + size)
    gradient.addColorStop(0, piece.color)
    gradient.addColorStop(1, piece.visuals.shadow)
    return gradient
  },

  addBlockShadow: (ctx: CanvasRenderingContext2D, piece: GamePiece): void => {
    ctx.shadowColor = piece.visuals.shadow
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
  },

  addBlockGlow: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    piece: GamePiece,
    intensity: number = 1
  ): void => {
    const previousFilter = ctx.filter
    ctx.filter = `blur(${4 * intensity}px)`
    ctx.fillStyle = piece.visuals.glow
    ctx.fillRect(x - 2, y - 2, size + 4, size + 4)
    ctx.filter = previousFilter
  }
}
