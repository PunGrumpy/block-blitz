import { PowerUp, PowerUpType } from '@/types/power-ups'
import { Zap, Minimize2, Timer, Shuffle, Ghost } from 'lucide-react'

export const POWER_UPS: Record<PowerUpType, PowerUp> = {
  [PowerUpType.COLOR_BOMB]: {
    type: PowerUpType.COLOR_BOMB,
    duration: 0,
    color: '#FF5555',
    description: 'Clears all blocks of selected color',
    icon: Zap
  },
  [PowerUpType.LINE_BLAST]: {
    type: PowerUpType.LINE_BLAST,
    duration: 0,
    color: '#FFD700',
    description: 'Clears entire row or column',
    icon: Minimize2
  },
  [PowerUpType.TIME_FREEZE]: {
    type: PowerUpType.TIME_FREEZE,
    duration: 10,
    color: '#00BFFF',
    description: 'Pauses block descent',
    icon: Timer
  },
  [PowerUpType.SHUFFLE]: {
    type: PowerUpType.SHUFFLE,
    duration: 0,
    color: '#9370DB',
    description: 'Reorganizes all placed blocks',
    icon: Shuffle
  },
  [PowerUpType.GHOST_BLOCK]: {
    type: PowerUpType.GHOST_BLOCK,
    duration: 15,
    color: '#98FB98',
    description: 'Pieces pass through others',
    icon: Ghost
  }
}
