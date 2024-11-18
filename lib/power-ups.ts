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
  // Base chances per power-up type
  const POWER_UP_CHANCES = {
    [PowerUpType.COLOR_BOMB]: 0.02, // 2% base chance
    [PowerUpType.LINE_BLAST]: 0.03, // 3% base chance
    [PowerUpType.TIME_FREEZE]: 0.015, // 1.5% base chance
    [PowerUpType.GHOST_BLOCK]: 0.015, // 1.5% base chance
    [PowerUpType.SHUFFLE]: 0.01 // 1% base chance
  }

  const baseChance = Object.values(POWER_UP_CHANCES).reduce((a, b) => a + b, 0)
  const scoreBonus = Math.min(0.15, Math.floor(score / 500) * 0.01) // Caps at 15% bonus
  const levelBonus = Math.floor(score / 1000) * 0.02 // +2% per level

  return Math.random() < baseChance + scoreBonus + levelBonus
}

export function getRandomPowerUpType(): PowerUpType {
  const weights = {
    [PowerUpType.COLOR_BOMB]: 20,
    [PowerUpType.LINE_BLAST]: 30,
    [PowerUpType.TIME_FREEZE]: 15,
    [PowerUpType.GHOST_BLOCK]: 15,
    [PowerUpType.SHUFFLE]: 10
  }

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
  let random = Math.random() * totalWeight

  for (const [type, weight] of Object.entries(weights)) {
    random -= weight
    if (random <= 0) {
      return type as PowerUpType
    }
  }

  return PowerUpType.LINE_BLAST // Fallback
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
  const newBoard = state.board.map(row => [...row])
  let blocksCleared = 0
  let explosionRadius = 2 // Radius of explosion effect

  // Find center of explosion (piece position)
  const centerX = state.currentPiece?.position.x ?? 0
  const centerY = state.currentPiece?.position.y ?? 0

  // First wave: Clear immediate blocks
  for (let y = 0; y < newBoard.length; y++) {
    for (let x = 0; x < newBoard[0].length; x++) {
      if (newBoard[y][x] !== null) {
        // Calculate distance from explosion center
        const distance = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        )

        // Clear blocks in waves
        if (distance <= explosionRadius) {
          newBoard[y][x] = null
          blocksCleared++
        }
      }
    }
  }

  // Second wave: Chain reaction - clear adjacent blocks
  let moreBlocksCleared = true
  let chainReactionMultiplier = 1

  while (moreBlocksCleared && chainReactionMultiplier < 4) {
    moreBlocksCleared = false
    const blocksToClear: Position[] = []

    // Find blocks to clear in this wave
    for (let y = 0; y < newBoard.length; y++) {
      for (let x = 0; x < newBoard[0].length; x++) {
        if (newBoard[y][x] !== null) {
          // Check if block has adjacent empty space (cleared block)
          const hasAdjacentClear = [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0]
          ].some(([dx, dy]) => {
            const newX = x + dx
            const newY = y + dy
            return (
              newX >= 0 &&
              newX < newBoard[0].length &&
              newY >= 0 &&
              newY < newBoard.length &&
              newBoard[newY][newX] === null
            )
          })

          if (hasAdjacentClear) {
            blocksToClear.push({ x, y })
          }
        }
      }
    }

    // Clear blocks for this wave
    if (blocksToClear.length > 0) {
      moreBlocksCleared = true
      blocksToClear.forEach(({ x, y }) => {
        newBoard[y][x] = null
        blocksCleared += chainReactionMultiplier
      })
      chainReactionMultiplier += 0.5
    }
  }

  // Make blocks fall after explosion
  for (let x = 0; x < newBoard[0].length; x++) {
    let writePos = newBoard.length - 1
    for (let y = newBoard.length - 1; y >= 0; y--) {
      if (newBoard[y][x] !== null) {
        if (writePos !== y) {
          newBoard[writePos][x] = newBoard[y][x]
          newBoard[y][x] = null
        }
        writePos--
      }
    }
  }

  return {
    board: newBoard,
    score: state.score + blocksCleared * 150 // Increased score for chain reactions
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
