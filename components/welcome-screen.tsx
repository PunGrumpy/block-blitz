'use client'

import { motion } from 'framer-motion'
import {
  Command,
  Crown,
  Gamepad2,
  HelpCircle,
  Laptop2,
  Smartphone,
  Timer,
  Trophy
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { DEFAULT_CONFIG } from '@/constants/game'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

interface WelcomeScreenProps {
  onStart: () => void
  isOpen: boolean
}

interface DeviceContentProps {
  isDesktop: boolean
  isMobile: boolean
  isTablet: boolean
  onStart: () => void
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      type: 'spring',
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  }
}

function DeviceContent({
  isDesktop,
  isMobile,
  isTablet,
  onStart
}: DeviceContentProps) {
  if (isDesktop) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Block Blitz
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">
            A modern take on classic block-falling puzzle games
          </DialogDescription>
        </DialogHeader>

        <motion.div
          variants={itemVariants}
          className="grid gap-4 sm:gap-6 md:grid-cols-2"
        >
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Crown className="size-4 text-yellow-500 sm:size-5" />
                Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 sm:space-y-4">
              <ul className="list-inside space-y-2 text-xs text-muted-foreground sm:text-sm">
                <li className="flex items-start gap-2">
                  <Timer className="mt-0.5 size-3.5 shrink-0 sm:size-4" />
                  <span>Clear lines before time runs out</span>
                </li>
                <li className="flex items-start gap-2">
                  <Crown className="mt-0.5 size-3.5 shrink-0 sm:size-4" />
                  <span>Reach target score to win</span>
                </li>
                <li className="flex items-start gap-2">
                  <Command className="mt-0.5 size-3.5 shrink-0 sm:size-4" />
                  <span>Use power-ups to boost score</span>
                </li>
                <li className="flex items-start gap-2 text-xs sm:text-sm">
                  <HelpCircle className="mt-0.5 size-3.5 shrink-0 sm:size-4" />
                  <span>
                    Score {DEFAULT_CONFIG.targetScore.toLocaleString()} points
                    in {DEFAULT_CONFIG.timeLimit} seconds
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Laptop2 className="size-4 text-emerald-500 sm:size-5" />
                Keyboard Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-1.5 text-xs sm:gap-2 sm:text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    <kbd className="rounded border px-1 font-mono text-[10px] shadow-sm sm:px-1.5 sm:text-xs">
                      ←
                    </kbd>
                    <kbd className="rounded border px-1 font-mono text-[10px] shadow-sm sm:px-1.5 sm:text-xs">
                      →
                    </kbd>
                    <span className="mx-0.5 text-muted-foreground sm:mx-1">
                      or
                    </span>
                    <kbd className="rounded border px-1 font-mono text-[10px] shadow-sm sm:px-1.5 sm:text-xs">
                      A
                    </kbd>
                    <kbd className="rounded border px-1 font-mono text-[10px] shadow-sm sm:px-1.5 sm:text-xs">
                      D
                    </kbd>
                  </div>
                  <span className="text-muted-foreground">Move Block</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <kbd className="rounded border px-1 font-mono text-[10px] shadow-sm sm:px-1.5 sm:text-xs">
                      ↑
                    </kbd>
                    <span className="mx-0.5 text-muted-foreground sm:mx-1">
                      or
                    </span>
                    <kbd className="rounded border px-1 font-mono text-[10px] shadow-sm sm:px-1.5 sm:text-xs">
                      W
                    </kbd>
                  </div>
                  <span className="text-muted-foreground">Rotate Block</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <kbd className="rounded border px-1 font-mono text-[10px] shadow-sm sm:px-1.5 sm:text-xs">
                      ↓
                    </kbd>
                    <span className="mx-0.5 text-muted-foreground sm:mx-1">
                      or
                    </span>
                    <kbd className="rounded border px-1 font-mono text-[10px] shadow-sm sm:px-1.5 sm:text-xs">
                      S
                    </kbd>
                  </div>
                  <span className="text-muted-foreground">Soft Drop</span>
                </div>
                <div className="flex items-center justify-between">
                  <kbd className="rounded border px-1.5 font-mono text-[10px] shadow-sm sm:px-2 sm:text-xs">
                    Space
                  </kbd>
                  <span className="text-muted-foreground">Hard Drop</span>
                </div>
                <div className="flex items-center justify-between">
                  <kbd className="rounded border px-1 font-mono text-[10px] shadow-sm sm:px-1.5 sm:text-xs">
                    P
                  </kbd>
                  <span className="text-muted-foreground">Pause Game</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Separator />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center gap-3 sm:gap-4"
        >
          <Button
            size="lg"
            className="h-10 gap-2 px-6 text-base sm:h-12 sm:px-8 sm:text-lg"
            onClick={onStart}
          >
            Start Game
          </Button>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Press{' '}
            <kbd className="rounded border px-1 font-mono text-[10px] shadow-sm sm:px-1.5 sm:text-xs">
              Enter
            </kbd>{' '}
            to start or{' '}
            <kbd className="rounded border px-1 font-mono text-[10px] shadow-sm sm:px-1.5 sm:text-xs">
              H
            </kbd>{' '}
            for help
          </p>
        </motion.div>
      </motion.div>
    )
  }

  // Mobile/Tablet Content
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <DialogHeader className="space-y-4">
        <DialogTitle className="text-center text-2xl font-bold">
          Block Blitz
        </DialogTitle>
        <DialogDescription asChild className="text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            {isMobile ? (
              <Smartphone className="size-5 text-primary" />
            ) : (
              <Gamepad2 className="size-5 text-primary" />
            )}
            <span>{isMobile ? 'Mobile' : 'Tablet'} Controls Enabled</span>
          </div>
        </DialogDescription>
      </DialogHeader>

      <motion.div variants={itemVariants} className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="size-4 text-yellow-500" />
              Game Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 text-sm">
            <p className="text-muted-foreground">
              Score {DEFAULT_CONFIG.targetScore.toLocaleString()} points in{' '}
              {DEFAULT_CONFIG.timeLimit} seconds!
            </p>
            <div className="flex items-center gap-2">
              <Timer className="size-4 text-blue-500" />
              <span className="text-muted-foreground">
                Clear lines before time runs out
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Gamepad2 className="size-4 text-emerald-500" />
              Touch Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>• Tap side arrows to move left/right</span>
            </div>
            <div className="flex items-center gap-2">
              <span>• Tap rotate button to turn piece</span>
            </div>
            <div className="flex items-center gap-2">
              <span>• Tap down button for hard drop</span>
            </div>
            {isTablet && (
              <div className="mt-2 rounded-md bg-primary/10 p-2 text-xs">
                <p className="text-primary">
                  Tip: Use both thumbs for better controls
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Separator />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center gap-3"
      >
        <Button
          size="lg"
          className={cn(
            'h-10 w-full gap-2 text-base',
            isTablet && 'sm:h-12 sm:text-lg'
          )}
          onClick={onStart}
        >
          Start Game
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {isMobile
            ? 'Use on-screen controls to play'
            : 'Controls are optimized for tablet'}
        </p>
      </motion.div>
    </motion.div>
  )
}

export default function WelcomeScreen({ onStart, isOpen }: WelcomeScreenProps) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
  const isDesktop = !isMobile && !isTablet

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Enter') {
        onStart()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onStart])

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        hideClose
        className={cn(
          isDesktop
            ? 'max-h-[90vh] max-w-2xl overflow-y-auto sm:max-h-[85vh]'
            : 'max-h-[85vh] max-w-md overflow-y-auto',
          'duration-300'
        )}
      >
        <DeviceContent
          isDesktop={isDesktop}
          isMobile={isMobile}
          isTablet={isTablet}
          onStart={onStart}
        />
      </DialogContent>
    </Dialog>
  )
}
