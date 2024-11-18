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

function handleColorBomb(state: GameState): Partial<GameState> {
  const selectedColor = state.currentPiece?.color
  if (!selectedColor) return {}

  const newBoard = state.board.map(row =>
    row.map(cell => (cell === selectedColor ? null : cell))
  )

  return {
    board: newBoard,
    score: state.score + 500 // Bonus points for using power-up
  }
}

function handleLineBlast(state: GameState): Partial<GameState> {
  if (!state.currentPiece) return {}

  const rowToBlast = state.currentPiece.position.y
  const newBoard = state.board.map((row, index) =>
    index === rowToBlast ? row.map(() => null) : row
  )

  return {
    board: newBoard,
    score: state.score + 300
  }
}

function handleShuffle(state: GameState): Partial<GameState> {
  // Collect all non-null cells
  const cells = state.board
    .flatMap((row, y) =>
      row.map((cell, x) => ({ cell, x, y })).filter(({ cell }) => cell !== null)
    )
    .sort(() => Math.random() - 0.5)

  // Create new empty board
  const newBoard: (string | null)[][] = state.board.map(row =>
    row.map(() => null)
  )

  // Place cells back randomly
  cells.forEach(({ cell }, index) => {
    const y = Math.floor(index / state.board[0].length)
    const x = index % state.board[0].length
    if (y < newBoard.length && x < newBoard[0].length) {
      newBoard[y][x] = cell
    }
  })

  return {
    board: newBoard,
    score: state.score + 100
  }
}

export function updatePowerUps(state: GameState): Partial<GameState> {
  const now = Date.now()
  const activePowerUps = state.activePowerUps.filter(
    powerUp => powerUp.endTime > now
  )

  return {
    activePowerUps,
    isTimeFrozen: activePowerUps.some(
      powerUp => powerUp.type === PowerUpType.TIME_FREEZE
    ),
    isGhostMode: activePowerUps.some(
      powerUp => powerUp.type === PowerUpType.GHOST_BLOCK
    )
  }
}
