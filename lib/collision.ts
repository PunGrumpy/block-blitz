import { GamePiece, GameState } from '@/types/game'

export function hasCollision(
  board: (string | null)[][],
  piece: GamePiece,
  position = piece.position,
  isGhostMode = false
): boolean {
  const { shape } = piece

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newX = position.x + x
        const newY = position.y + y

        // Always check boundaries
        if (newX < 0 || newX >= board[0].length || newY >= board.length) {
          return true
        }

        // In ghost mode, ignore collisions with other pieces
        if (!isGhostMode && newY >= 0 && board[newY][newX] !== null) {
          return true
        }
      }
    }
  }

  return false
}

export function isGameOver(state: GameState): boolean {
  // Check if any pieces are in the top row
  return state.board[0].some(cell => cell !== null)
}

export function mergePieceToBoard(
  board: (string | null)[][],
  piece: GamePiece
): (string | null)[][] {
  const newBoard = board.map(row => [...row])
  const { shape, position, color } = piece

  shape.forEach((row, y) => {
    row.forEach((isSet, x) => {
      if (isSet) {
        const boardY = y + position.y
        const boardX = x + position.x
        if (
          boardY >= 0 &&
          boardY < board.length &&
          boardX >= 0 &&
          boardX < board[0].length
        ) {
          newBoard[boardY][boardX] = color
        }
      }
    })
  })

  return newBoard
}

export function findFullRows(board: (string | null)[][]): number[] {
  return board
    .map((row, index) => (row.every(cell => cell !== null) ? index : -1))
    .filter(index => index !== -1)
}

export function clearRows(
  board: (string | null)[][],
  rowsToClear: number[]
): (string | null)[][] {
  const newBoard = board.filter((_, index) => !rowsToClear.includes(index))

  // Add new empty rows at the top
  const emptyRows = Array(rowsToClear.length)
    .fill(null)
    .map(() => Array(board[0].length).fill(null))

  return [...emptyRows, ...newBoard]
}

export function findMatchingBlocks(
  board: (string | null)[][],
  minMatch: number = 3
): { positions: { x: number; y: number }[]; color: string }[] {
  const matches: { positions: { x: number; y: number }[]; color: string }[] = []
  const visited = new Set<string>()

  function checkMatch(
    x: number,
    y: number,
    color: string
  ): { x: number; y: number }[] {
    const key = `${x},${y}`
    if (
      visited.has(key) ||
      x < 0 ||
      x >= board[0].length ||
      y < 0 ||
      y >= board.length ||
      board[y][x] !== color
    ) {
      return []
    }

    visited.add(key)
    const positions = [{ x, y }]

    // Check adjacent positions
    positions.push(
      ...checkMatch(x + 1, y, color),
      ...checkMatch(x - 1, y, color),
      ...checkMatch(x, y + 1, color),
      ...checkMatch(x, y - 1, color)
    )

    return positions
  }

  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      const color = board[y][x]
      if (color && !visited.has(`${x},${y}`)) {
        const matchPositions = checkMatch(x, y, color)
        if (matchPositions.length >= minMatch) {
          matches.push({ positions: matchPositions, color })
        }
      }
    }
  }

  return matches
}
