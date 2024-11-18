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
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
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

  // Game actions with sound effects
  const gameActions = React.useMemo(
    () => ({
      moveLeft: () => {
        if (!state.isPaused && !state.isGameOver) {
          sounds.playMove()
          actions.moveLeft()
        }
      },
      moveRight: () => {
        if (!state.isPaused && !state.isGameOver) {
          sounds.playMove()
          actions.moveRight()
        }
      },
      moveDown: () => {
        if (!state.isPaused && !state.isGameOver) {
          sounds.playMove()
          actions.moveDown()
        }
      },
      rotate: () => {
        if (!state.isPaused && !state.isGameOver) {
          sounds.playRotate()
          actions.rotate()
        }
      },
      hardDrop: () => {
        if (!state.isPaused && !state.isGameOver) {
          sounds.playDrop()
          actions.hardDrop()
        }
      },
      togglePause: () => {
        if (!isHelpOpen && !isSettingsOpen && !state.isGameOver) {
          actions.togglePause()
        }
      },
      reset: () => {
        actions.reset()
        setIsHelpOpen(false)
        setIsSettingsOpen(false)
      }
    }),
    [
      actions,
      sounds,
      state.isPaused,
      state.isGameOver,
      isHelpOpen,
      isSettingsOpen
    ]
  )

  // Handle game sounds
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

  // Keyboard controls
  useKeyboard(gameActions, {
    repeatDelay: 200,
    repeatInterval: 50,
    enabled: !isHelpOpen && !isSettingsOpen && !state.isGameOver
  })

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      <header className="flex h-[8vh] min-h-12 items-center border-b border-border px-4 md:px-6">
        <div className="flex w-full items-center justify-between gap-4">
          <h1 className="truncate font-mono text-lg font-bold sm:text-xl">
            Block Blitz
          </h1>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden font-mono sm:block">
              Score: {state.score.toLocaleString()}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                className="hidden h-8 px-2 sm:flex sm:px-3"
                aria-label={`Time left: ${Math.floor(state.timeLeft / 60)}:${String(Math.floor(state.timeLeft % 60)).padStart(2, '0')}`}
              >
                <Timer className="mr-1 size-4 sm:mr-2" />
                <span>
                  {Math.floor(state.timeLeft / 60)}:
                  {String(Math.floor(state.timeLeft % 60)).padStart(2, '0')}
                </span>
              </Button>

              <Button
                variant="ghost"
                className="h-8 px-2 sm:px-3"
                aria-label={`Level ${state.level}`}
              >
                <Crown className="mr-1 size-4 sm:mr-2" />
                <span className="hidden sm:inline">Level {state.level}</span>
              </Button>

              <GameSettings
                settings={settings}
                onSettingsChange={setSettings}
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
              />

              <Button
                variant="ghost"
                onClick={() => setIsHelpOpen(true)}
                size="icon"
                className="size-8"
                disabled={state.isGameOver}
                aria-label="Help"
              >
                <HelpCircle className="size-4" />
              </Button>

              <Button
                variant="ghost"
                onClick={gameActions.togglePause}
                size="icon"
                className="size-8"
                disabled={state.isGameOver || isHelpOpen || isSettingsOpen}
                aria-label={state.isPaused ? 'Resume game' : 'Pause game'}
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
      <div className="relative flex h-[92vh] w-full flex-1 items-center justify-center gap-4 overflow-hidden p-4 md:gap-8 lg:gap-12">
        {/* Game Board */}
        <div className="relative size-full max-h-[calc(82vh-12vh)] max-w-screen-lg md:max-h-[92vh] md:w-auto">
          <Card className="relative h-full bg-background p-2 sm:p-4">
            <GameBoard
              state={state}
              showGhost={settings.display.showGhost}
              showGrid={settings.display.showGrid}
              showParticles={settings.display.particles}
              className="h-full"
            />
          </Card>
        </div>

        {/* Side Panel - Desktop */}
        <div className="hidden h-full w-72 flex-col gap-4 lg:flex">
          <Card className="p-4">
            <h2 className="mb-2 font-mono font-medium">Next Piece</h2>
            <div className="h-40">
              <NextPiecePreview piece={state.nextPiece} cellSize={30} />
            </div>
          </Card>

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
          disabled={
            state.isPaused || state.isGameOver || isHelpOpen || isSettingsOpen
          }
          className="fixed inset-x-0 bottom-0 z-50"
        />
      )}

      {/* Mobile Stats Overlay */}
      {isMobile && (
        <div className="absolute left-4 top-[10vh] z-10 flex flex-row gap-2">
          <Card className="h-16 bg-background/80 p-2 backdrop-blur-sm">
            <div className="text-sm text-muted-foreground">Time</div>
            <div className="font-mono text-lg">
              {Math.floor(state.timeLeft / 60)}:
              {String(Math.floor(state.timeLeft % 60)).padStart(2, '0')}
            </div>
          </Card>
          <Card className="h-16 bg-background/80 p-2 backdrop-blur-sm">
            <div className="text-sm text-muted-foreground">Score</div>
            <div className="font-mono text-lg">
              {state.score.toLocaleString()}
            </div>
          </Card>
          <Card className="h-16 bg-background/80 p-2 backdrop-blur-sm">
            <div className="text-sm text-muted-foreground">Next</div>
            <div className="">
              <NextPiecePreview piece={state.nextPiece} cellSize={12} />
            </div>
          </Card>
        </div>
      )}

      {/* Dialogs */}
      <HelpDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />
      <GamePauseDialog
        isOpen={
          state.isPaused && !state.isGameOver && !isHelpOpen && !isSettingsOpen
        }
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
