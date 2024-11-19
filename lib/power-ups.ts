import { POWER_UPS } from '@/constants/power-ups'
import { adjustColor } from '@/lib/color'
import { GamePiece, GameState, Position } from '@/types/game'
import { ActivePowerUp, PowerUp, PowerUpType } from '@/types/power-ups'

interface PowerUpState {
  lastGenerated: number
  consecutiveCount: number
}

const POWER_UP_CONFIG = {
  BASE_CHANCE: 0.085,
  MIN_CHANCE: 0.02,
  MAX_CHANCE: 0.25,
  SCORE_BONUS_INTERVAL: 500,
  SCORE_BONUS_CAP: 0.15,
  LEVEL_BONUS: 0.02,
  COOLDOWN: 5000,
  CONSECUTIVE_PENALTY: 0.5
} as const

const POWER_UP_WEIGHTS = {
  [PowerUpType.COLOR_BOMB]: {
    weight: 15,
    minLevel: 2,
    scoreRequirement: 1000
  },
  [PowerUpType.LINE_BLAST]: {
    weight: 25,
    minLevel: 1,
    scoreRequirement: 0
  },
  [PowerUpType.TIME_FREEZE]: {
    weight: 20,
    minLevel: 3,
    scoreRequirement: 2000
  },
  [PowerUpType.GHOST_BLOCK]: {
    weight: 20,
    minLevel: 4,
    scoreRequirement: 3000
  },
  [PowerUpType.SHUFFLE]: {
    weight: 10,
    minLevel: 5,
    scoreRequirement: 4000
  }
} as const

const powerUpState: PowerUpState = {
  lastGenerated: 0,
  consecutiveCount: 0
}

export function shouldGeneratePowerUp(score: number, level: number): boolean {
  const now = Date.now()

  if (now - powerUpState.lastGenerated < POWER_UP_CONFIG.COOLDOWN) {
    return false
  }

  let chance =
    POWER_UP_CONFIG.BASE_CHANCE *
    Math.pow(POWER_UP_CONFIG.CONSECUTIVE_PENALTY, powerUpState.consecutiveCount)

  const scoreBonus = Math.min(
    POWER_UP_CONFIG.SCORE_BONUS_CAP,
    Math.floor(score / POWER_UP_CONFIG.SCORE_BONUS_INTERVAL) * 0.01
  )

  const levelBonus = (level - 1) * POWER_UP_CONFIG.LEVEL_BONUS

  chance = Math.max(
    POWER_UP_CONFIG.MIN_CHANCE,
    Math.min(POWER_UP_CONFIG.MAX_CHANCE, chance + scoreBonus + levelBonus)
  )

  const shouldGenerate = Math.random() < chance

  if (shouldGenerate) {
    powerUpState.lastGenerated = now
    powerUpState.consecutiveCount++
  } else {
    powerUpState.consecutiveCount = Math.max(
      0,
      powerUpState.consecutiveCount - 1
    )
  }

  return shouldGenerate
}

export function getRandomPowerUpType(
  level: number,
  score: number
): PowerUpType {
  const availablePowerUps = Object.entries(POWER_UP_WEIGHTS).filter(
    ([_, config]) =>
      config.minLevel <= level && score >= config.scoreRequirement
  )

  const totalWeight = availablePowerUps.reduce(
    (sum, [_, config]) => sum + config.weight,
    0
  )

  let random = Math.random() * totalWeight

  for (const [type, config] of availablePowerUps) {
    random -= config.weight
    if (random <= 0) {
      return type as PowerUpType
    }
  }

  return PowerUpType.LINE_BLAST
}

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
    powerUp,
    visuals: {
      gradient: powerUp.visual.gradient,
      glow: powerUp.visual.glow,
      shadow: adjustColor(powerUp.visual.shadow, -40) // Darken the base color for shadow
    }
  }
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

export function handlePowerUpEffects(state: GameState): Partial<GameState> {
  const now = Date.now()
  const activePowerUps = state.activePowerUps.filter(
    powerUp => powerUp.endTime > now
  )

  const effects: Partial<GameState> = {
    activePowerUps,
    isTimeFrozen: false,
    isGhostMode: false
  }

  activePowerUps.forEach(powerUp => {
    switch (powerUp.type) {
      case PowerUpType.TIME_FREEZE:
        effects.isTimeFrozen = true
        break
      case PowerUpType.GHOST_BLOCK:
        effects.isGhostMode = true
        break
    }
  })

  return effects
}

export function resetPowerUpState(): void {
  powerUpState.lastGenerated = 0
  powerUpState.consecutiveCount = 0
}

// Constants for power-up effects
const POWER_UP_EFFECTS = {
  COLOR_BOMB: {
    radius: 2,
    chainReactionLimit: 4,
    pointsPerBlock: 150,
    chainMultiplierIncrease: 0.5
  },
  LINE_BLAST: {
    pointsPerBlock: 50
  },
  SHUFFLE: {
    basePoints: 100
  }
} as const

export function handleColorBomb(state: GameState): Partial<GameState> {
  const newBoard = state.board.map(row => [...row])
  let blocksCleared = 0
  const centerX = state.currentPiece?.position.x ?? 0
  const centerY = state.currentPiece?.position.y ?? 0
  let chainReactionMultiplier = 1

  // Initial explosion
  for (let y = 0; y < newBoard.length; y++) {
    for (let x = 0; x < newBoard[0].length; x++) {
      if (newBoard[y][x] !== null) {
        const distance = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        )
        if (distance <= POWER_UP_EFFECTS.COLOR_BOMB.radius) {
          newBoard[y][x] = null
          blocksCleared++
        }
      }
    }
  }

  // Chain reactions
  let chainCount = 0
  let moreBlocksCleared = true

  while (
    moreBlocksCleared &&
    chainCount < POWER_UP_EFFECTS.COLOR_BOMB.chainReactionLimit
  ) {
    moreBlocksCleared = false
    const blocksToClear: Position[] = []

    for (let y = 0; y < newBoard.length; y++) {
      for (let x = 0; x < newBoard[0].length; x++) {
        if (newBoard[y][x] !== null && hasAdjacentClear(newBoard, x, y)) {
          blocksToClear.push({ x, y })
        }
      }
    }

    if (blocksToClear.length > 0) {
      moreBlocksCleared = true
      blocksToClear.forEach(({ x, y }) => {
        newBoard[y][x] = null
        blocksCleared += chainReactionMultiplier
      })
      chainReactionMultiplier +=
        POWER_UP_EFFECTS.COLOR_BOMB.chainMultiplierIncrease
      chainCount++
    }
  }

  // Make blocks fall
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
    score:
      state.score + blocksCleared * POWER_UP_EFFECTS.COLOR_BOMB.pointsPerBlock
  }
}

export function handleLineBlast(state: GameState): Partial<GameState> {
  if (!state.currentPiece) return {}

  const y = state.currentPiece.position.y
  const x = state.currentPiece.position.x
  const newBoard = state.board.map(row => [...row])
  let blocksCleared = 0

  // Clear row and column
  blocksCleared += newBoard[y].filter(cell => cell !== null).length
  newBoard[y] = Array(state.board[0].length).fill(null)

  for (let row = 0; row < newBoard.length; row++) {
    if (newBoard[row][x] !== null) {
      blocksCleared++
      newBoard[row][x] = null
    }
  }

  // Make blocks fall
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
    score:
      state.score + blocksCleared * POWER_UP_EFFECTS.LINE_BLAST.pointsPerBlock
  }
}

export function handleShuffle(state: GameState): Partial<GameState> {
  const cellsByColumn: { cell: string | null; y: number }[][] = Array(
    state.board[0].length
  )
    .fill(null)
    .map(() => [])

  // Group cells by column
  for (let x = 0; x < state.board[0].length; x++) {
    for (let y = state.board.length - 1; y >= 0; y--) {
      const cell = state.board[y][x]
      if (cell !== null) {
        cellsByColumn[x].push({ cell, y })
      }
    }
  }

  // Shuffle column positions
  const shuffledColumnIndices = Array.from(
    { length: state.board[0].length },
    (_, i) => i
  ).sort(() => Math.random() - 0.5)

  // Create new board
  const newBoard: (string | null)[][] = Array(state.board.length)
    .fill(null)
    .map(() => Array(state.board[0].length).fill(null))

  // Place blocks in shuffled positions
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
    score: state.score + POWER_UP_EFFECTS.SHUFFLE.basePoints
  }
}

function hasAdjacentClear(
  board: (string | null)[][],
  x: number,
  y: number
): boolean {
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0]
  ]

  return directions.some(([dx, dy]) => {
    const newX = x + dx
    const newY = y + dy
    return (
      newX >= 0 &&
      newX < board[0].length &&
      newY >= 0 &&
      newY < board.length &&
      board[newY][newX] === null
    )
  })
}
