'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Sparkles, Zap } from 'lucide-react'
import React from 'react'

import { ComboState } from '@/types/game'

interface ComboDisplayProps {
  combo: ComboState
}

const comboContainerVariants = {
  initial: { opacity: 0, scale: 0.8, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
}

const pulseAnimation = {
  scale: [1, 1.2, 1],
  transition: {
    duration: 0.3,
    repeat: Infinity,
    repeatType: 'mirror' as const
  }
}

const getComboIcon = (count: number) => {
  if (count >= 8) return Sparkles
  if (count >= 4) return Flame
  return Zap
}

const getComboColor = (count: number) => {
  if (count >= 8) return 'text-purple-500'
  if (count >= 4) return 'text-orange-500'
  return 'text-yellow-500'
}

export function ComboDisplay({ combo }: ComboDisplayProps) {
  const ComboIcon = getComboIcon(combo.count)
  const iconColor = getComboColor(combo.count)

  return (
    <AnimatePresence mode="wait">
      {combo.isActive && (
        <motion.div
          variants={comboContainerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute right-4 top-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-background/80 p-2 backdrop-blur-sm"
        >
          <ComboIcon className={`size-5 ${iconColor}`} />
          <div className="flex flex-col">
            <motion.div animate={pulseAnimation} className="text-sm font-bold">
              {combo.count}x COMBO!
            </motion.div>
            <div className="text-xs text-muted-foreground">
              {combo.multiplier.toFixed(1)}x Multiplier
            </div>
          </div>
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-primary"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{
              duration: combo.timeWindow / 1000,
              ease: 'linear'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
