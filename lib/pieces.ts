import { GamePiece } from '@/types/game'

export const PIECE_TYPES = {
  I: {
    shape: [
      [false, false, false, false],
      [true, true, true, true],
      [false, false, false, false],
      [false, false, false, false]
    ],
    color: '#00f0f0'
  },
  O: {
    shape: [
      [true, true],
      [true, true]
    ],
    color: '#f0f000'
  },
  T: {
    shape: [
      [false, true, false],
      [true, true, true],
      [false, false, false]
    ],
    color: '#a000f0'
  },
  L: {
    shape: [
      [false, false, true],
      [true, true, true],
      [false, false, false]
    ],
    color: '#f0a000'
  },
  J: {
    shape: [
      [true, false, false],
      [true, true, true],
      [false, false, false]
    ],
    color: '#0000f0'
  }
} as const

export function createPiece(type: keyof typeof PIECE_TYPES): GamePiece {
  return {
    shape: PIECE_TYPES[type].shape.map(row => [...row]),
    color: PIECE_TYPES[type].color,
    position: {
      x: Math.floor(10 / 2) - Math.floor(PIECE_TYPES[type].shape[0].length / 2),
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
