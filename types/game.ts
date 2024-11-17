// Board Types
export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

// Piece Types
export interface GamePiece {
  shape: boolean[][]
  color: string
  position: Position
  rotation: number
}

// Game Configuration
export interface GameConfig {
  boardWidth: number
  boardHeight: number
  initialLevel: number
  timeLimit: number
  targetScore: number
  speedCurve: {
    initial: number
    decrement: number
    minimum: number
  }
}

// Game Statistics
export interface GameStats {
  score: number
  level: number
  lines: number
  combo: number
  lastComboTime: number
}

// Game State
export interface GameState {
  // Core game state
  board: (string | null)[][]
  currentPiece: GamePiece | null
  nextPiece: GamePiece | null

  // Game progress
  score: number
  level: number
  lines: number

  // Game status
  isGameOver: boolean
  isPaused: boolean

  // Time tracking
  timeLeft: number
  lastTick: number

  // Combo system
  combo: number
  lastComboTime: number
}

// Scoring System
export interface ScoreSystem {
  singleLine: number
  doubleLine: number
  tripleLine: number
  tetris: number
  softDrop: number
  hardDrop: number
  combo: {
    multiplier: number
    timeWindow: number
  }
}

// Game Actions
export type GameAction =
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'MOVE_DOWN' }
  | { type: 'ROTATE'; direction: 'clockwise' | 'counterclockwise' }
  | { type: 'HARD_DROP' }
  | { type: 'SOFT_DROP' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'TICK' }
  | { type: 'RESET'; timeLimit?: number }
  | { type: 'UPDATE_SCORE'; points: number }
  | { type: 'CLEAR_LINES'; count: number }
  | { type: 'GAME_OVER' }

// Constants
export const SCORING: ScoreSystem = {
  singleLine: 100,
  doubleLine: 300,
  tripleLine: 500,
  tetris: 800,
  softDrop: 1,
  hardDrop: 2,
  combo: {
    multiplier: 1.5,
    timeWindow: 10000 // 10 seconds
  }
} as const

export const DEFAULT_CONFIG: GameConfig = {
  boardWidth: 10,
  boardHeight: 20,
  initialLevel: 1,
  timeLimit: 180, // 3 minutes
  targetScore: 3000,
  speedCurve: {
    initial: 800,
    decrement: 50,
    minimum: 100
  }
} as const

// Game Events
export interface GameEventMap {
  'piece:lock': { piece: GamePiece; position: Position }
  'lines:clear': { count: number; rows: number[] }
  'score:update': { points: number; total: number }
  'level:up': { level: number }
  'game:over': { finalScore: number; reason: 'timeout' | 'topout' }
  'combo:update': { combo: number; multiplier: number }
}

// Game Controls Config
export interface ControlsConfig {
  repeatDelay: number // Initial delay before key repeat starts
  repeatInterval: number // Interval between repeats
  enabled: boolean // Whether controls are enabled
  touchEnabled?: boolean // Whether touch controls are enabled
}

// Game Settings
export interface GameSettings {
  controls: ControlsConfig
  audio: {
    enabled: boolean
    volume: number
    effects: boolean
    music: boolean
  }
  display: {
    showGhost: boolean
    showGrid: boolean
    particles: boolean
  }
}

// High Score Entry
export interface HighScoreEntry {
  score: number
  lines: number
  level: number
  date: string
  duration: number
}

// Game Statistics for Analytics
export interface GameMetrics {
  piecesPlaced: number
  rotationsUsed: number
  hardDropsUsed: number
  maxCombo: number
  averageSpeed: number
  totalPlayTime: number
}

// Utilities for type checking
export function isValidPosition(pos: Position): boolean {
  return typeof pos.x === 'number' && typeof pos.y === 'number'
}

export function isValidGamePiece(piece: GamePiece): boolean {
  return (
    Array.isArray(piece.shape) &&
    typeof piece.color === 'string' &&
    isValidPosition(piece.position) &&
    typeof piece.rotation === 'number'
  )
}
