'use client'

import { Crown, HelpCircle, Pause, PlayIcon, Timer } from 'lucide-react'
import * as React from 'react'

import { GameBoard } from '@/components/game-board'
import { GameOverDialog } from '@/components/game-over-dialog'
import { GamePauseDialog } from '@/components/game-pause-dialog'
import { GameSettings } from '@/components/game-settings'
import { HelpDialog } from '@/components/help-dialog'
import { NextPiecePreview } from '@/components/next-piece-preview'
import { TouchControls } from '@/components/touch-controls'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useGameSound } from '@/hooks/use-game-sound'
import { useGameState } from '@/hooks/use-game-state'
import { useKeyboard } from '@/hooks/use-keyboard'
import { useMediaQuery } from '@/hooks/use-media-query'
import { GameConfig } from '@/types/game'

interface GameLayoutProps {
  config: GameConfig
}

export function GameLayout({ config }: GameLayoutProps) {
  const [isHelpOpen, setIsHelpOpen] = React.useState(false)
  const [settings, setSettings] = React.useState({
    audio: {
      enabled: true,
      volume: 70,
      effects: true
    },
    display: {
      showGhost: true,
      showGrid: true,
      particles: true
    }
  })

  const { state, actions } = useGameState(config)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const prevLinesRef = React.useRef(state.lines)

  const sounds = useGameSound({
    enabled: settings.audio.enabled,
    volume: settings.audio.volume,
    effects: settings.audio.effects
  })

  // Create wrapped actions that play sounds
  const gameActions = React.useMemo(
    () => ({
      moveLeft: () => {
        sounds.playMove()
        actions.moveLeft()
      },
      moveRight: () => {
        sounds.playMove()
        actions.moveRight()
      },
      moveDown: () => {
        sounds.playMove()
        actions.moveDown()
      },
      rotate: () => {
        sounds.playRotate()
        actions.rotate()
      },
      hardDrop: () => {
        sounds.playDrop()
        actions.hardDrop()
      },
      togglePause: actions.togglePause,
      reset: actions.reset
    }),
    [actions, sounds]
  )

  // Handle sounds for game events
  React.useEffect(() => {
    if (state.lines > prevLinesRef.current) {
      sounds.playClear()
    }
    prevLinesRef.current = state.lines
  }, [state.lines, sounds])

  React.useEffect(() => {
    if (state.isGameOver) {
      sounds.playGameOver()
    }
  }, [state.isGameOver, sounds])

  useKeyboard(gameActions, {
    repeatDelay: 200,
    repeatInterval: 50,
    enabled: !state.isGameOver && !state.isPaused
  })

  return (
    <div className="mx-auto flex max-w-screen-xl flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      <header className="flex h-[8vh] items-center border-b border-border">
        <div className="flex flex-1 items-center justify-between">
          <h1 className="font-mono text-xl font-bold">Block Blitz</h1>
          <div className="flex items-center gap-4">
            <div className="font-mono">
              Score: {state.score.toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="h-8">
                <Timer className="mr-2 size-4" />
                {Math.floor(state.timeLeft / 60)}:
                {String(Math.floor(state.timeLeft % 60)).padStart(2, '0')}
              </Button>
              <Button variant="ghost" className="h-8">
                <Crown className="mr-2 size-4" />
                Level {state.level}
              </Button>
              <GameSettings
                settings={settings}
                onSettingsChange={setSettings}
              />
              <Button
                variant="ghost"
                onClick={() => setIsHelpOpen(true)}
                size="icon"
              >
                <HelpCircle className="size-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={gameActions.togglePause}
                size="icon"
              >
                {state.isPaused ? (
                  <PlayIcon className="size-4" />
                ) : (
                  <Pause className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="flex h-[92vh] items-center justify-center gap-20 p-6">
        {/* Game Board */}
        <div className="aspect-[1/2] h-full max-h-[92vh]">
          <Card className="relative h-full bg-background p-4">
            <GameBoard
              state={state}
              showGhost={settings.display.showGhost}
              showGrid={settings.display.showGrid}
              showParticles={settings.display.particles}
              className="h-full"
            />

            {(state.isPaused || state.isGameOver) && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="text-center">
                  <h2 className="mb-2 text-3xl font-bold">
                    {state.isGameOver ? 'Game Over' : 'Paused'}
                  </h2>
                  <p className="text-muted-foreground">
                    {state.isGameOver
                      ? `Final Score: ${state.score}`
                      : 'Press P to resume'}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Side Panel */}
        <div className="flex h-full w-72 flex-col gap-4">
          {/* Next Piece Preview */}
          <Card className="p-4">
            <h2 className="mb-2 font-mono font-medium">Next Piece</h2>
            <div className="h-56">
              <NextPiecePreview piece={state.nextPiece} cellSize={50} />
            </div>
          </Card>

          {/* Statistics */}
          <Card className="p-4">
            <h2 className="mb-2 font-mono font-medium">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Score</div>
                <div className="font-mono text-lg">
                  {state.score.toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Lines</div>
                <div className="font-mono text-lg">{state.lines}</div>
              </div>
            </div>
          </Card>

          {/* Controls */}
          <Card className="flex-1 p-4">
            <h2 className="mb-2 font-mono font-medium">Controls</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Move Left</span>
                <div className="flex space-x-1">
                  <kbd className="rounded border px-2 font-mono">←</kbd>
                  <span>or</span>
                  <kbd className="rounded border px-2 font-mono">A</kbd>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Move Right</span>
                <div className="flex space-x-1">
                  <kbd className="rounded border px-2 font-mono">→</kbd>
                  <span>or</span>
                  <kbd className="rounded border px-2 font-mono">D</kbd>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rotate</span>
                <div className="flex space-x-1">
                  <kbd className="rounded border px-2 font-mono">↑</kbd>
                  <span>or</span>
                  <kbd className="rounded border px-2 font-mono">W</kbd>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Soft Drop</span>
                <div className="flex space-x-1">
                  <kbd className="rounded border px-2 font-mono">↓</kbd>
                  <span>or</span>
                  <kbd className="rounded border px-2 font-mono">S</kbd>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hard Drop</span>
                <kbd className="rounded border px-2 font-mono">Space</kbd>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile Controls */}
      {isMobile && (
        <TouchControls
          onMoveLeft={gameActions.moveLeft}
          onMoveRight={gameActions.moveRight}
          onMoveDown={gameActions.moveDown}
          onRotate={gameActions.rotate}
          onHardDrop={gameActions.hardDrop}
          disabled={state.isPaused || state.isGameOver}
          className="bottom-0"
        />
      )}

      {/* Dialogs */}
      <HelpDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />
      <GamePauseDialog
        isOpen={state.isPaused && !state.isGameOver}
        onResume={gameActions.togglePause}
        onRestart={gameActions.reset}
      />
      <GameOverDialog
        isOpen={state.isGameOver}
        score={state.score}
        level={state.level}
        lines={state.lines}
        timeLeft={state.timeLeft}
        targetScore={config.targetScore}
        onRestart={gameActions.reset}
      />
    </div>
  )
}
