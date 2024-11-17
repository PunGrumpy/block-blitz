import { GameConfig, ScoreSystem } from '@/types/game'

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
