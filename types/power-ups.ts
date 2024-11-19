import { LucideIcon } from 'lucide-react'
import { BlockVisuals, Position } from '@/types/game'

export enum PowerUpType {
  COLOR_BOMB = 'COLOR_BOMB',
  LINE_BLAST = 'LINE_BLAST',
  TIME_FREEZE = 'TIME_FREEZE',
  SHUFFLE = 'SHUFFLE',
  GHOST_BLOCK = 'GHOST_BLOCK'
}

export interface PowerUp {
  type: PowerUpType
  duration: number
  color: string
  visual: BlockVisuals
  description: string
  icon: LucideIcon
}

export interface ActivePowerUp extends PowerUp {
  startTime: number
  endTime: number
}

export interface PowerUpState {
  isActive: boolean
  remainingDuration: number
  affectedBlocks?: Position[]
}
