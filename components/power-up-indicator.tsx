'use client'

import { motion } from 'framer-motion'

import { ActivePowerUp } from '@/types/power-ups'

interface PowerUpIndicatorProps {
  powerUp: ActivePowerUp
}

export function PowerUpIndicator({ powerUp }: PowerUpIndicatorProps) {
  const progress =
    powerUp.duration > 0
      ? (powerUp.endTime - Date.now()) / (powerUp.duration * 1000)
      : 0

  const Icon = powerUp.icon

  return (
    <motion.div
      key={`powerup-${powerUp.type}-${powerUp.startTime}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative flex items-center gap-2 rounded-lg border border-border bg-background/80 p-2 backdrop-blur-sm"
    >
      <Icon className="size-5" style={{ color: powerUp.color }} />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{powerUp.type}</span>
        {powerUp.duration > 0 && (
          <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
            <motion.div
              key={`progress-${powerUp.type}-${powerUp.startTime}`}
              className="h-full bg-primary"
              initial={{ width: '100%' }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}
