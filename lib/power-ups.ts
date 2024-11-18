import { PowerUpType, PowerUp, ActivePowerUp } from '@/types/power-ups'
import { POWER_UPS } from '@/constants/power-ups'
import { GameState, GamePiece } from '@/types/game'

export function createPowerUpPiece(type: PowerUpType): GamePiece {
  const powerUp = POWER_UPS[type]
  return {
    shape: [
      [true, true],
      [true, true]
    ],
    color: powerUp.color,
    position: {
      x: 4,
      y: 0
    },
    rotation: 0,
    powerUp: powerUp
  }
}

export function shouldGeneratePowerUp(score: number): boolean {
  // Increase power-up frequency with score
  const baseChance = 0.05 // 5% base chance
  const scoreMultiplier = Math.floor(score / 1000) * 0.01 // +1% per 1000 points
  return Math.random() < baseChance + scoreMultiplier
}

export function getRandomPowerUpType(): PowerUpType {
  const types = Object.values(PowerUpType)
  return types[Math.floor(Math.random() * types.length)]
}

export function activatePowerUp(
  state: GameState,
  powerUp: PowerUp
): Partial<GameState> {
  const now = Date.now()
  const activePowerUp: ActivePowerUp = {
    ...powerUp,
    startTime: now,
    endTime: powerUp.duration > 0 ? now + powerUp.duration * 1000 : now
  }

  switch (powerUp.type) {
    case PowerUpType.COLOR_BOMB:
      return handleColorBomb(state)
    case PowerUpType.LINE_BLAST:
      return handleLineBlast(state)
    case PowerUpType.SHUFFLE:
      return handleShuffle(state)
    default:
      return {
        activePowerUps: [...state.activePowerUps, activePowerUp]
      }
  }
}

export function handleColorBomb(state: GameState): Partial<GameState> {
  const targetColor = state.currentPiece?.color
  if (!targetColor) return {}

  let blocksCleared = 0
  const newBoard = state.board.map(row =>
    row.map(cell => {
      // Match any non-null cell (all blocks) for color bomb
      if (cell !== null) {
        blocksCleared++
        return null
      }
      return cell
    })
  )

  return {
    board: newBoard,
    score: state.score + blocksCleared * 100
  }
}

export function handleLineBlast(state: GameState): Partial<GameState> {
  if (!state.currentPiece) return {}

  const y = state.currentPiece.position.y
  const x = state.currentPiece.position.x

  // Deep copy the board
  const newBoard = state.board.map(row => [...row])
  let blocksCleared = 0

  // Clear entire row
  blocksCleared += newBoard[y].filter(cell => cell !== null).length
  newBoard[y] = Array(state.board[0].length).fill(null)

  // Clear entire column
  for (let row = 0; row < newBoard.length; row++) {
    if (newBoard[row][x] !== null) {
      blocksCleared++
      newBoard[row][x] = null
    }
  }

  // Make blocks fall after clearing
  for (let col = 0; col < newBoard[0].length; col++) {
    let writePos = newBoard.length - 1
    for (let row = newBoard.length - 1; row >= 0; row--) {
      if (newBoard[row][col] !== null) {
        if (writePos !== row) {
          newBoard[writePos][col] = newBoard[row][col]
          newBoard[row][col] = null
        }
        writePos--
      }
    }
  }

  return {
    board: newBoard,
    score: state.score + blocksCleared * 50
  }
}

export function handleShuffle(state: GameState): Partial<GameState> {
  // Collect non-null cells while preserving vertical order
  const cellsByColumn: { cell: string | null; y: number }[][] = Array(
    state.board[0].length
  )
    .fill(null)
    .map(() => [])

  // Group cells by column maintaining vertical order
  for (let x = 0; x < state.board[0].length; x++) {
    for (let y = state.board.length - 1; y >= 0; y--) {
      const cell = state.board[y][x]
      if (cell !== null) {
        cellsByColumn[x].push({ cell, y })
      }
    }
  }

  // Shuffle column positions only
  const shuffledColumnIndices = Array.from(
    { length: state.board[0].length },
    (_, i) => i
  ).sort(() => Math.random() - 0.5)

  // Create new empty board
  const newBoard: (string | null)[][] = Array(state.board.length)
    .fill(null)
    .map(() => Array(state.board[0].length).fill(null))

  // Place blocks in shuffled columns while maintaining stacking
  shuffledColumnIndices.forEach((newX, originalX) => {
    const column = cellsByColumn[originalX]
    let bottomY = state.board.length - 1

    column.forEach(({ cell }) => {
      newBoard[bottomY][newX] = cell
      bottomY--
    })
  })

  return {
    board: newBoard,
    score: state.score + 100
  }
}

export function updatePowerUps(state: GameState): Partial<GameState> {
  const now = Date.now()
  const activePowerUps = state.activePowerUps.filter(powerUp => {
    const isActive = powerUp.endTime > now
    // Clear effects when power-up expires
    if (!isActive && powerUp.type === PowerUpType.GHOST_BLOCK) {
      return {
        ...state,
        isGhostMode: false,
        currentPiece: state.currentPiece
          ? {
              ...state.currentPiece,
              powerUp: undefined
            }
          : null
      }
    }
    return isActive
  })

  // Update power-up states
  const powerUpStates = { ...state.powerUpStates }
  activePowerUps.forEach(powerUp => {
    powerUpStates[powerUp.type] = {
      isActive: true,
      remainingDuration: (powerUp.endTime - now) / 1000
    }
  })

  return {
    activePowerUps,
    powerUpStates,
    isTimeFrozen: activePowerUps.some(
      powerUp => powerUp.type === PowerUpType.TIME_FREEZE
    ),
    isGhostMode: activePowerUps.some(
      powerUp => powerUp.type === PowerUpType.GHOST_BLOCK
    )
  }
}
