import { PowerUpType, PowerUp, ActivePowerUp } from '@/types/power-ups'
import { POWER_UPS } from '@/constants/power-ups'
import { GameState, GamePiece, Position } from '@/types/game'

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
  const cells = state.board
    .flatMap((row, y) =>
      row.map((cell, x) => ({ cell, x, y })).filter(({ cell }) => cell !== null)
    )
    .sort(() => Math.random() - 0.5)

  const newBoard = Array(state.board.length)
    .fill(null)
    .map(() => Array(state.board[0].length).fill(null))

  cells.forEach(({ cell }, index) => {
    const y = Math.floor(index / state.board[0].length)
    const x = index % state.board[0].length
    if (y < newBoard.length && x < newBoard[0].length) {
      newBoard[y][x] = cell
    }
  })

  // Only award points if the shuffle creates potential matches
  const potentialMatches = findPotentialMatches(newBoard)
  const score = potentialMatches.length * 20

  return {
    board: newBoard,
    score: state.score + score
  }
}

function findPotentialMatches(board: (string | null)[][]): Position[] {
  const matches: Position[] = []

  // Check horizontal potential matches
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length - 2; x++) {
      if (board[y][x] && board[y][x] === board[y][x + 1]) {
        matches.push({ x, y })
      }
    }
  }

  // Check vertical potential matches
  for (let y = 0; y < board.length - 2; y++) {
    for (let x = 0; x < board[0].length; x++) {
      if (board[y][x] && board[y][x] === board[y + 1][x]) {
        matches.push({ x, y })
      }
    }
  }

  return matches
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
