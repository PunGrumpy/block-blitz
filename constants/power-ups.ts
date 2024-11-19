import { PowerUp, PowerUpType } from '@/types/power-ups'
import { Zap, Minimize2, Timer, Shuffle, Ghost } from 'lucide-react'

export const POWER_UPS: Record<PowerUpType, PowerUp> = {
  [PowerUpType.COLOR_BOMB]: {
    type: PowerUpType.COLOR_BOMB,
    duration: 0,
    color: '#FF4D4D',
    visual: {
      glow: 'rgba(255, 77, 77, 0.5)',
      gradient: 'linear-gradient(135deg, #FF4D4D 0%, #FF0000 100%)',
      shadow: '#FF0000'
    },
    description: 'Clears all blocks of selected color',
    icon: Zap
  },
  [PowerUpType.LINE_BLAST]: {
    type: PowerUpType.LINE_BLAST,
    duration: 0,
    color: '#FFD700',
    visual: {
      glow: 'rgba(255, 215, 0, 0.5)',
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFC400 100%)',
      shadow: '#FFC400'
    },
    description: 'Clears entire row or column',
    icon: Minimize2
  },
  [PowerUpType.TIME_FREEZE]: {
    type: PowerUpType.TIME_FREEZE,
    duration: 10,
    color: '#00BFFF',
    visual: {
      glow: 'rgba(0, 191, 255, 0.5)',
      gradient: 'linear-gradient(135deg, #00BFFF 0%, #1E90FF 100%)',
      shadow: '#1E90FF'
    },
    description: 'Pauses block descent',
    icon: Timer
  },
  [PowerUpType.SHUFFLE]: {
    type: PowerUpType.SHUFFLE,
    duration: 0,
    color: '#9370DB',
    visual: {
      glow: 'rgba(147, 112, 219, 0.5)',
      gradient: 'linear-gradient(135deg, #9370DB 0%, #8A2BE2 100%)',
      shadow: '#8A2BE2'
    },
    description: 'Reorganizes all placed blocks',
    icon: Shuffle
  },
  [PowerUpType.GHOST_BLOCK]: {
    type: PowerUpType.GHOST_BLOCK,
    duration: 15,
    color: '#98FB98',
    visual: {
      glow: 'rgba(152, 251, 152, 0.5)',
      gradient: 'linear-gradient(135deg, #98FB98 0%, #32CD32 100%)',
      shadow: '#32CD32'
    },
    description: 'Pieces pass through others',
    icon: Ghost
  }
}
