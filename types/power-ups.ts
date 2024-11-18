import { LucideIcon } from 'lucide-react'

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
  description: string
  icon: LucideIcon
}

export interface ActivePowerUp extends PowerUp {
  startTime: number
  endTime: number
}
