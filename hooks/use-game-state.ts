import { useCallback, useReducer, useEffect } from 'react'
import {
  GameState,
  GameAction,
  GameConfig,
  Position,
  GamePiece
} from '@/types/game'
import { getRandomPiece, rotatePiece } from '../lib/pieces'
import {
  hasCollision,
  mergePieceToBoard,
  findFullRows,
  clearRows,
  isGameOver
} from '../lib/collision'

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
  lastComboTime: Date.now()
}

function isValidMove(
  board: (string | null)[][],
  piece: GamePiece,
  newPosition: Position
): boolean {
  const movedPiece = { ...piece, position: newPosition }
  return !hasCollision(board, movedPiece)
}

function calculateScore(linesCleared: number): number {
  const basePoints = [0, 100, 300, 500, 800]
  return basePoints[linesCleared] || 0
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
      if (isValidMove(state.board, state.currentPiece, newPosition)) {
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
      if (isValidMove(state.board, state.currentPiece, newPosition)) {
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

      if (isValidMove(state.board, state.currentPiece, newPosition)) {
        return {
          ...state,
          currentPiece: {
            ...state.currentPiece,
            position: newPosition
          }
        }
      } else {
        // Piece has landed
        const newBoard = mergePieceToBoard(state.board, state.currentPiece)
        const fullRows = findFullRows(newBoard)
        const updatedBoard = clearRows(newBoard, fullRows)
        const additionalScore = calculateScore(fullRows.length)

        if (isGameOver({ ...state, board: updatedBoard })) {
          return {
            ...state,
            board: updatedBoard,
            isGameOver: true
          }
        }

        return {
          ...state,
          board: updatedBoard,
          currentPiece: state.nextPiece,
          nextPiece: getRandomPiece(),
          score: state.score + additionalScore,
          lines: state.lines + fullRows.length,
          level: Math.floor((state.lines + fullRows.length) / 10) + 1
        }
      }
    }

    case 'HARD_DROP': {
      if (!state.currentPiece) return state
      let dropDistance = 0
      let newPosition = { ...state.currentPiece.position }

      // Find the furthest valid position
      while (
        isValidMove(state.board, state.currentPiece, {
          x: newPosition.x,
          y: newPosition.y + 1
        })
      ) {
        newPosition.y += 1
        dropDistance += 1
      }

      // Immediately place the piece and process the result
      const newBoard = mergePieceToBoard(state.board, {
        ...state.currentPiece,
        position: newPosition
      })
      const fullRows = findFullRows(newBoard)
      const updatedBoard = clearRows(newBoard, fullRows)
      const additionalScore = calculateScore(fullRows.length) + dropDistance

      if (isGameOver({ ...state, board: updatedBoard })) {
        return {
          ...state,
          board: updatedBoard,
          isGameOver: true
        }
      }

      return {
        ...state,
        board: updatedBoard,
        currentPiece: state.nextPiece,
        nextPiece: getRandomPiece(),
        score: state.score + additionalScore,
        lines: state.lines + fullRows.length,
        level: Math.floor((state.lines + fullRows.length) / 10) + 1
      }
    }

    case 'ROTATE': {
      if (!state.currentPiece) return state
      const rotatedShape = rotatePiece(state.currentPiece)
      const rotatedPiece = {
        ...state.currentPiece,
        shape: rotatedShape
      }

      if (isValidMove(state.board, rotatedPiece, state.currentPiece.position)) {
        return {
          ...state,
          currentPiece: rotatedPiece
        }
      }
      return state
    }

    case 'TICK': {
      const now = Date.now()
      const deltaTime = now - state.lastTick
      const newTimeLeft = Math.max(0, state.timeLeft - deltaTime / 1000)

      if (newTimeLeft === 0) {
        return {
          ...state,
          timeLeft: 0,
          isGameOver: true,
          lastTick: now
        }
      }

      return {
        ...state,
        timeLeft: newTimeLeft,
        lastTick: now
      }
    }

    case 'TOGGLE_PAUSE':
      return {
        ...state,
        isPaused: !state.isPaused,
        lastTick: Date.now() // Reset tick timer when toggling pause
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
        dispatch({ type: 'MOVE_DOWN' })
      },
      Math.max(100, 800 - (state.level - 1) * 50)
    ) // Speed increases with level

    return () => clearInterval(timer)
  }, [state.isPaused, state.isGameOver, state.level])

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