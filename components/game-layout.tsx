'use client'

import { HelpCircle, Volume2, VolumeX } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { GameState } from '@/types/game'

interface GameLayoutProps {
  children: React.ReactNode
  gameState: GameState
  className?: string
  onToggleSound?: () => void
  isSoundEnabled?: boolean
  onShowHelp?: () => void
}

export function GameLayout({
  children,
  gameState,
  className,
  onToggleSound,
  isSoundEnabled = true,
  onShowHelp
}: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Block Blitz</h1>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onToggleSound}
                      className="size-9"
                      aria-label={
                        isSoundEnabled ? 'Mute sound' : 'Enable sound'
                      }
                    >
                      {isSoundEnabled ? (
                        <Volume2 className="size-4" />
                      ) : (
                        <VolumeX className="size-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isSoundEnabled ? 'Mute sound' : 'Enable sound'}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onShowHelp}
                      className="size-9"
                      aria-label="Show help"
                    >
                      <HelpCircle className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Show help</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Game stats bar */}
          <div className="mt-4 grid grid-cols-3 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-muted p-3 text-center">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-xl font-bold">{gameState.score}</div>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <div className="text-sm text-muted-foreground">Level</div>
              <div className="text-xl font-bold">{gameState.level}</div>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <div className="text-sm text-muted-foreground">Lines</div>
              <div className="text-xl font-bold">{gameState.lines}</div>
            </div>
            <div className="hidden rounded-lg bg-muted p-3 text-center md:block">
              <div className="text-sm text-muted-foreground">Time</div>
              <div className="text-xl font-bold">
                {Math.floor(gameState.timeLeft / 60)}:
                {(gameState.timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </header>

        <main className={cn('relative', className)}>
          {/* Game alert banner */}
          {(gameState.isPaused || gameState.isGameOver) && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm"
              role="alert"
              aria-live="assertive"
            >
              <div className="text-center">
                <h2 className="mb-2 text-3xl font-bold">
                  {gameState.isGameOver ? 'Game Over' : 'Paused'}
                </h2>
                <p className="text-muted-foreground">
                  {gameState.isGameOver
                    ? `Final Score: ${gameState.score}`
                    : 'Press P to resume'}
                </p>
              </div>
            </div>
          )}

          {children}
        </main>

        {/* Game instructions - Only visible on larger screens */}
        <footer className="mt-8 hidden text-sm text-muted-foreground md:block">
          <p className="text-center">
            Use arrow keys or WASD to move • Space to hard drop • P to pause
          </p>
        </footer>
      </div>
    </div>
  )
}
