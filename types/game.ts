import {
  ActivePowerUp,
  PowerUp,
  PowerUpState,
  PowerUpType
} from '@/types/power-ups'

// Board Types
export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

// Block Types
export interface BlockVisuals {
  gradient: string
  shadow: string
  glow: string
}

// Game Piece Types
export interface GamePiece {
  shape: boolean[][]
  color: string
  position: Position
  rotation: number
  powerUp?: PowerUp
  visuals: BlockVisuals
}

// Combo System
export interface ComboState {
  count: number
  lastTime: number
  multiplier: number
  isActive: boolean
  timeWindow: number
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
  combo: ComboState

  // Active power-ups
  activePowerUps: ActivePowerUp[]
  isTimeFrozen: boolean
  isGhostMode: boolean
  powerUpStates: Record<PowerUpType, PowerUpState>
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
