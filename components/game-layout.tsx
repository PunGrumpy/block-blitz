'use client'

import { HelpCircle, Volume2, VolumeX } from 'lucide-react'

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
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <div className="grid h-full grid-rows-[auto,1fr] gap-2 p-4">
        {/* Header */}
        <header className="grid grid-cols-[1fr,auto] items-center gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Block Blitz</h1>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSound}
                    className="size-8"
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
                    className="size-8"
                  >
                    <HelpCircle className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Show help</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        {/* Main Content */}
        <main className={cn('relative h-full', className)}>
          {/* Game alert banner */}
          {(gameState.isPaused || gameState.isGameOver) && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm"
              role="alert"
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

          {/* Game stats bar */}
          <div className="absolute inset-x-0 bottom-0 grid grid-cols-4 gap-2 bg-background/80 p-2 backdrop-blur-sm">
            <div className="rounded bg-muted px-2 py-1 text-center">
              <div className="text-xs text-muted-foreground">Score</div>
              <div className="text-lg font-bold">{gameState.score}</div>
            </div>
            <div className="rounded bg-muted px-2 py-1 text-center">
              <div className="text-xs text-muted-foreground">Level</div>
              <div className="text-lg font-bold">{gameState.level}</div>
            </div>
            <div className="rounded bg-muted px-2 py-1 text-center">
              <div className="text-xs text-muted-foreground">Lines</div>
              <div className="text-lg font-bold">{gameState.lines}</div>
            </div>
            <div className="rounded bg-muted px-2 py-1 text-center">
              <div className="text-xs text-muted-foreground">Time</div>
              <div className="text-lg font-bold">
                {Math.floor(gameState.timeLeft / 60)}:
                {(gameState.timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
