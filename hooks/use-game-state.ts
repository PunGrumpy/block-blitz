import { useCallback, useReducer, useEffect } from 'react'
import {
  GameState,
  GameAction,
  GameConfig,
  Position,
  GamePiece
} from '@/types/game'
import { getRandomPiece, rotatePiece } from '@/lib/pieces'
import {
  hasCollision,
  mergePieceToBoard,
  findFullRows,
  clearRows,
  isGameOver
} from '@/lib/collision'
import { SCORING } from '@/constants/game'
import {
  shouldGeneratePowerUp,
  getRandomPowerUpType,
  createPowerUpPiece,
  activatePowerUp,
  updatePowerUps,
  handleShuffle,
  handleLineBlast,
  handleColorBomb
} from '@/lib/power-ups'
import { PowerUpType } from '@/types/power-ups'

const INITIAL_STATE: GameState = {
  board: Array(20)
    .fill(null)
    .map(() => Array(10).fill(null)),
  currentPiece: getRandomPiece(),
  nextPiece: getRandomPiece(),
  score: 0,
  level: 1,
  lines: 0,
  isGameOver: false,
  isPaused: false,
  timeLeft: 180,
  lastTick: Date.now(),
  combo: 0,
  lastComboTime: Date.now(),
  activePowerUps: [],
  isTimeFrozen: false,
  isGhostMode: false,
  powerUpStates: {
    COLOR_BOMB: { isActive: false, remainingDuration: 0 },
    LINE_BLAST: { isActive: false, remainingDuration: 0 },
    TIME_FREEZE: { isActive: false, remainingDuration: 0 },
    SHUFFLE: { isActive: false, remainingDuration: 0 },
    GHOST_BLOCK: { isActive: false, remainingDuration: 0 }
  }
}

export function isValidMove(
  board: (string | null)[][],
  piece: GamePiece,
  newPosition: Position,
  gameState: GameState
): boolean {
  // Ghost mode allows passing through other pieces but not boundaries
  if (gameState.isGhostMode) {
    return piece.shape.every((row, y) =>
      row.every((isSet, x) => {
        if (!isSet) return true
        const newX = newPosition.x + x
        const newY = newPosition.y + y
        return (
          newX >= 0 &&
          newX < board[0].length &&
          newY >= 0 &&
          newY < board.length
        )
      })
    )
  }

  // Normal collision check
  return !piece.shape.some((row, y) =>
    row.some((isSet, x) => {
      if (!isSet) return false
      const newX = newPosition.x + x
      const newY = newPosition.y + y
      return (
        newX < 0 ||
        newX >= board[0].length ||
        newY >= board.length ||
        (newY >= 0 && board[newY][newX] !== null)
      )
    })
  )
}

function calculateScore(
  linesCleared: number,
  dropDistance: number = 0,
  isSoftDrop: boolean = false,
  level: number = 1,
  powerUpBonus: number = 0
): number {
  let score = 0

  // Calculate line clear score
  switch (linesCleared) {
    case 1:
      score += SCORING.singleLine
      break
    case 2:
      score += SCORING.doubleLine
      break
    case 3:
      score += SCORING.tripleLine
      break
    case 4:
      score += SCORING.tetris
      break
  }

  // Add drop bonus
  if (dropDistance > 0) {
    score += Math.floor(
      dropDistance * (isSoftDrop ? SCORING.softDrop : SCORING.hardDrop)
    )
  }

  // Add power-up bonus
  score += powerUpBonus

  // Level multiplier (10% increase per level)
  score = Math.floor(score * (1 + (level - 1) * 0.1))

  return Math.floor(score)
}

function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.isGameOver && action.type !== 'RESET') return state
  if (state.isPaused && !['TOGGLE_PAUSE', 'RESET'].includes(action.type))
    return state

  switch (action.type) {
    case 'MOVE_LEFT': {
      if (!state.currentPiece) return state
      const newPosition = {
        x: state.currentPiece.position.x - 1,
        y: state.currentPiece.position.y
      }
      if (
        !hasCollision(
          state.board,
          state.currentPiece,
          newPosition,
          state.isGhostMode
        )
      ) {
        return {
          ...state,
          currentPiece: {
            ...state.currentPiece,
            position: newPosition
          }
        }
      }
      return state
    }

    case 'MOVE_RIGHT': {
      if (!state.currentPiece) return state
      const newPosition = {
        x: state.currentPiece.position.x + 1,
        y: state.currentPiece.position.y
      }
      if (
        !hasCollision(
          state.board,
          state.currentPiece,
          newPosition,
          state.isGhostMode
        )
      ) {
        return {
          ...state,
          currentPiece: {
            ...state.currentPiece,
            position: newPosition
          }
        }
      }
      return state
    }

    case 'MOVE_DOWN': {
      if (!state.currentPiece) return state
      const newPosition = {
        x: state.currentPiece.position.x,
        y: state.currentPiece.position.y + 1
      }

      if (
        !hasCollision(
          state.board,
          state.currentPiece,
          newPosition,
          state.isGhostMode
        )
      ) {
        return {
          ...state,
          currentPiece: {
            ...state.currentPiece,
            position: newPosition
          },
          score: state.score + SCORING.softDrop
        }
      }

      // Handle power-up activation when piece lands
      if (state.currentPiece.powerUp) {
        let powerUpEffect: Partial<GameState> = {}

        switch (state.currentPiece.powerUp.type) {
          case PowerUpType.COLOR_BOMB:
            powerUpEffect = handleColorBomb(state)
            break
          case PowerUpType.LINE_BLAST:
            powerUpEffect = handleLineBlast(state)
            break
          case PowerUpType.TIME_FREEZE:
            powerUpEffect = {
              isTimeFrozen: true,
              activePowerUps: [
                ...state.activePowerUps,
                {
                  ...state.currentPiece.powerUp,
                  startTime: Date.now(),
                  endTime:
                    Date.now() + state.currentPiece.powerUp.duration * 1000
                }
              ]
            }
            break
          case PowerUpType.GHOST_BLOCK:
            powerUpEffect = {
              isGhostMode: true,
              activePowerUps: [
                ...state.activePowerUps,
                {
                  ...state.currentPiece.powerUp,
                  startTime: Date.now(),
                  endTime:
                    Date.now() + state.currentPiece.powerUp.duration * 1000
                }
              ]
            }
            break
          case PowerUpType.SHUFFLE:
            powerUpEffect = handleShuffle(state)
            break
        }

        return {
          ...state,
          ...powerUpEffect,
          currentPiece: state.nextPiece,
          nextPiece: shouldGeneratePowerUp(state.score)
            ? createPowerUpPiece(getRandomPowerUpType())
            : getRandomPiece()
        }
      }

      // Normal piece landing logic
      const newBoard = mergePieceToBoard(state.board, state.currentPiece)
      const fullRows = findFullRows(newBoard)
      const updatedBoard = clearRows(newBoard, fullRows)
      const additionalScore = calculateScore(
        fullRows.length,
        0,
        false,
        state.level
      )

      if (isGameOver({ ...state, board: updatedBoard })) {
        return {
          ...state,
          board: updatedBoard,
          isGameOver: true
        }
      }

      const now = Date.now()
      const isCombo =
        fullRows.length > 0 &&
        now - state.lastComboTime < SCORING.combo.timeWindow
      const comboMultiplier = isCombo
        ? Math.pow(SCORING.combo.multiplier, state.combo)
        : 1
      const finalScore = Math.floor(
        state.score + additionalScore * comboMultiplier
      )

      return {
        ...state,
        board: updatedBoard,
        currentPiece: state.nextPiece,
        nextPiece: shouldGeneratePowerUp(finalScore)
          ? createPowerUpPiece(getRandomPowerUpType())
          : getRandomPiece(),
        score: finalScore,
        lines: state.lines + fullRows.length,
        level: Math.floor((state.lines + fullRows.length) / 10) + 1,
        combo: isCombo ? state.combo + 1 : 0,
        lastComboTime: fullRows.length > 0 ? now : state.lastComboTime
      }
    }

    case 'ROTATE': {
      if (!state.currentPiece) return state
      const rotatedShape = rotatePiece(state.currentPiece)
      const rotatedPiece = {
        ...state.currentPiece,
        shape: rotatedShape
      }

      if (
        !hasCollision(
          state.board,
          rotatedPiece,
          state.currentPiece.position,
          state.isGhostMode
        )
      ) {
        return {
          ...state,
          currentPiece: rotatedPiece
        }
      }
      return state
    }

    case 'HARD_DROP': {
      if (!state.currentPiece) return state
      let dropDistance = 0
      let newPosition = { ...state.currentPiece.position }

      while (
        !hasCollision(
          state.board,
          state.currentPiece,
          {
            x: newPosition.x,
            y: newPosition.y + 1
          },
          state.isGhostMode
        )
      ) {
        newPosition.y += 1
        dropDistance += 1
      }

      // If it's a power-up piece, activate it
      if (state.currentPiece.powerUp) {
        let powerUpEffect: Partial<GameState> = {}

        switch (state.currentPiece.powerUp.type) {
          case PowerUpType.COLOR_BOMB:
            powerUpEffect = handleColorBomb(state)
            break
          case PowerUpType.LINE_BLAST:
            powerUpEffect = handleLineBlast(state)
            break
          case PowerUpType.TIME_FREEZE:
            powerUpEffect = {
              isTimeFrozen: true,
              activePowerUps: [
                ...state.activePowerUps,
                {
                  ...state.currentPiece.powerUp,
                  startTime: Date.now(),
                  endTime:
                    Date.now() + state.currentPiece.powerUp.duration * 1000
                }
              ]
            }
            break
          case PowerUpType.GHOST_BLOCK:
            powerUpEffect = {
              isGhostMode: true,
              activePowerUps: [
                ...state.activePowerUps,
                {
                  ...state.currentPiece.powerUp,
                  startTime: Date.now(),
                  endTime:
                    Date.now() + state.currentPiece.powerUp.duration * 1000
                }
              ]
            }
            break
          case PowerUpType.SHUFFLE:
            powerUpEffect = handleShuffle(state)
            break
        }

        return {
          ...state,
          ...powerUpEffect,
          score:
            state.score + calculateScore(0, dropDistance, false, state.level),
          currentPiece: state.nextPiece,
          nextPiece: shouldGeneratePowerUp(state.score)
            ? createPowerUpPiece(getRandomPowerUpType())
            : getRandomPiece()
        }
      }

      const newBoard = mergePieceToBoard(state.board, {
        ...state.currentPiece,
        position: newPosition
      })
      const fullRows = findFullRows(newBoard)
      const updatedBoard = clearRows(newBoard, fullRows)

      if (isGameOver({ ...state, board: updatedBoard })) {
        return {
          ...state,
          board: updatedBoard,
          isGameOver: true
        }
      }

      const additionalScore = calculateScore(
        fullRows.length,
        dropDistance,
        false,
        state.level
      )

      const now = Date.now()
      const isCombo =
        fullRows.length > 0 &&
        now - state.lastComboTime < SCORING.combo.timeWindow
      const comboMultiplier = isCombo
        ? Math.pow(SCORING.combo.multiplier, state.combo)
        : 1
      const finalScore = Math.floor(
        state.score + additionalScore * comboMultiplier
      )

      return {
        ...state,
        board: updatedBoard,
        score: finalScore,
        currentPiece: state.nextPiece,
        nextPiece: shouldGeneratePowerUp(state.score)
          ? createPowerUpPiece(getRandomPowerUpType())
          : getRandomPiece(),
        lines: state.lines + fullRows.length,
        level: Math.floor((state.lines + fullRows.length) / 10) + 1,
        combo: isCombo ? state.combo + 1 : 0,
        lastComboTime: fullRows.length > 0 ? now : state.lastComboTime
      }
    }

    case 'TICK': {
      if (state.isTimeFrozen) {
        const now = Date.now()
        const timeFreezeEffect = state.activePowerUps.find(
          p => p.type === PowerUpType.TIME_FREEZE
        )

        if (!timeFreezeEffect || timeFreezeEffect.endTime <= now) {
          return {
            ...state,
            isTimeFrozen: false,
            activePowerUps: state.activePowerUps.filter(
              p => p.type !== PowerUpType.TIME_FREEZE
            ),
            lastTick: now
          }
        }
        return {
          ...state,
          lastTick: now
        }
      }

      const now = Date.now()
      const deltaTime = now - state.lastTick
      const newTimeLeft = Math.max(0, state.timeLeft - deltaTime / 1000)

      // Update ghost mode status
      const ghostEffect = state.activePowerUps.find(
        p => p.type === PowerUpType.GHOST_BLOCK
      )
      const isGhostMode = ghostEffect ? ghostEffect.endTime > now : false

      // Clean up expired power-ups
      const activePowerUps = state.activePowerUps.filter(
        powerUp => powerUp.endTime > now
      )

      if (newTimeLeft === 0) {
        return {
          ...state,
          timeLeft: 0,
          isGameOver: true,
          lastTick: now,
          activePowerUps,
          isGhostMode
        }
      }

      // Move piece down if not frozen
      if (!state.isTimeFrozen && state.currentPiece) {
        const newPosition = {
          x: state.currentPiece.position.x,
          y: state.currentPiece.position.y + 1
        }

        if (
          !hasCollision(
            state.board,
            state.currentPiece,
            newPosition,
            isGhostMode
          )
        ) {
          return {
            ...state,
            timeLeft: newTimeLeft,
            lastTick: now,
            activePowerUps,
            isGhostMode,
            currentPiece: {
              ...state.currentPiece,
              position: newPosition
            }
          }
        } else {
          // Apply same logic as MOVE_DOWN when piece lands
          return gameReducer(
            {
              ...state,
              timeLeft: newTimeLeft,
              lastTick: now,
              activePowerUps,
              isGhostMode
            },
            { type: 'MOVE_DOWN' }
          )
        }
      }

      return {
        ...state,
        timeLeft: newTimeLeft,
        lastTick: now,
        activePowerUps,
        isGhostMode
      }
    }

    case 'TOGGLE_PAUSE':
      return {
        ...state,
        isPaused: !state.isPaused,
        lastTick: Date.now()
      }

    case 'RESET':
      return {
        ...INITIAL_STATE,
        timeLeft: action.timeLimit || INITIAL_STATE.timeLeft,
        lastTick: Date.now()
      }

    default:
      return state
  }
}

export function useGameState(config: GameConfig) {
  const [state, dispatch] = useReducer(gameReducer, {
    ...INITIAL_STATE,
    timeLeft: config.timeLimit,
    lastTick: Date.now()
  })

  // Timer effect
  useEffect(() => {
    if (state.isPaused || state.isGameOver) return

    const timer = setInterval(
      () => {
        dispatch({ type: 'TICK' })
        // Only move down if not time frozen
        if (!state.isTimeFrozen) {
          dispatch({ type: 'MOVE_DOWN' })
        }
      },
      Math.max(100, 800 - (state.level - 1) * 50)
    )

    return () => clearInterval(timer)
  }, [state.isPaused, state.isGameOver, state.level, state.isTimeFrozen])

  const moveLeft = useCallback(() => dispatch({ type: 'MOVE_LEFT' }), [])
  const moveRight = useCallback(() => dispatch({ type: 'MOVE_RIGHT' }), [])
  const moveDown = useCallback(() => dispatch({ type: 'MOVE_DOWN' }), [])
  const rotate = useCallback(
    () => dispatch({ type: 'ROTATE', direction: 'clockwise' }),
    []
  )
  const hardDrop = useCallback(() => dispatch({ type: 'HARD_DROP' }), [])
  const togglePause = useCallback(() => dispatch({ type: 'TOGGLE_PAUSE' }), [])
  const reset = useCallback(
    () => dispatch({ type: 'RESET', timeLimit: config.timeLimit }),
    [config.timeLimit]
  )

  return {
    state,
    actions: {
      moveLeft,
      moveRight,
      moveDown,
      rotate,
      hardDrop,
      togglePause,
      reset
    }
  }
}
