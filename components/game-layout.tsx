'use client'

import {
  Crown,
  Ghost,
  HelpCircle,
  Minimize2,
  Pause,
  PlayIcon,
  Shuffle,
  Timer,
  Zap
} from 'lucide-react'
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
import WelcomeScreen from '@/components/welcome-screen'
import { useGameSound } from '@/hooks/use-game-sound'
import { useGameState } from '@/hooks/use-game-state'
import { useKeyboard } from '@/hooks/use-keyboard'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { GameConfig } from '@/types/game'

interface DialogState {
  showWelcome: boolean
  isHelpOpen: boolean
  isSettingsOpen: boolean
  wasManuallyPaused: boolean
}

interface GameSettings {
  audio: {
    enabled: boolean
    volume: number
    effects: boolean
  }
  display: {
    showGhost: boolean
    showGrid: boolean
    particles: boolean
  }
}

const DEFAULT_SETTINGS: GameSettings = {
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
}

interface GameLayoutProps {
  config: GameConfig
}

export function GameLayout({ config }: GameLayoutProps) {
  // State Management
  const [dialogState, setDialogState] = React.useState<DialogState>({
    isHelpOpen: false,
    isSettingsOpen: false,
    wasManuallyPaused: false,
    showWelcome: true
  })
  const [settings, setSettings] = React.useState<GameSettings>(DEFAULT_SETTINGS)
  const { state, actions } = useGameState(config)

  // Responsive Layout Management
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
  const showTouchControls = isMobile || isTablet
  const isDesktop = !showTouchControls

  // Refs and States
  const prevLinesRef = React.useRef(state.lines)

  // Derived States
  const isAnyDialogOpen =
    dialogState.isHelpOpen ||
    dialogState.isSettingsOpen ||
    dialogState.showWelcome
  const canTogglePause = !isAnyDialogOpen && !state.isGameOver

  // Sound Management
  const sounds = useGameSound({
    enabled: settings.audio.enabled,
    volume: settings.audio.volume,
    effects: settings.audio.effects
  })

  // Dialog Handlers
  const handleDialogChange = React.useCallback(
    (dialog: keyof DialogState, isOpen: boolean) => {
      setDialogState(prev => {
        const newState = { ...prev, [dialog]: isOpen }
        const shouldResetPause =
          !isOpen &&
          !newState.isHelpOpen &&
          !newState.isSettingsOpen &&
          !prev.wasManuallyPaused
        return {
          ...newState,
          wasManuallyPaused: shouldResetPause ? false : prev.wasManuallyPaused
        }
      })
    },
    []
  )

  // Help Dialog Toggle
  const handleToggleHelp = React.useCallback(() => {
    handleDialogChange('isHelpOpen', !dialogState.isHelpOpen)
  }, [dialogState.isHelpOpen, handleDialogChange])

  // Start Game
  const handleStartGame = React.useCallback(() => {
    handleDialogChange('showWelcome', false)
    actions.reset()
  }, [actions, handleDialogChange])

  // Pause Management
  const handleTogglePause = React.useCallback(() => {
    if (canTogglePause) {
      setDialogState(prev => ({ ...prev, wasManuallyPaused: !state.isPaused }))
      actions.togglePause()
    }
  }, [canTogglePause, state.isPaused, actions])

  // Auto-pause effect
  React.useEffect(() => {
    if (isAnyDialogOpen && !state.isPaused && !state.isGameOver) {
      actions.togglePause()
    } else if (
      !isAnyDialogOpen &&
      state.isPaused &&
      !dialogState.wasManuallyPaused &&
      !state.isGameOver
    ) {
      actions.togglePause()
    }
  }, [
    isAnyDialogOpen,
    state.isPaused,
    state.isGameOver,
    dialogState.wasManuallyPaused,
    actions
  ])

  // Game Actions
  const gameActions = React.useMemo(() => {
    const createActionWithSound =
      (action: () => void, sound: () => void) => () => {
        if (!state.isPaused && !state.isGameOver) {
          sound()
          action()
        }
      }

    return {
      moveLeft: createActionWithSound(actions.moveLeft, sounds.playMove),
      moveRight: createActionWithSound(actions.moveRight, sounds.playMove),
      moveDown: createActionWithSound(actions.moveDown, sounds.playMove),
      rotate: createActionWithSound(actions.rotate, sounds.playRotate),
      hardDrop: createActionWithSound(actions.hardDrop, sounds.playDrop),
      toggleHelp: handleToggleHelp,
      togglePause: handleTogglePause,
      reset: () => {
        actions.reset()
        setDialogState({
          showWelcome: false,
          isHelpOpen: false,
          isSettingsOpen: false,
          wasManuallyPaused: false
        })
      }
    }
  }, [
    actions,
    sounds,
    state.isPaused,
    state.isGameOver,
    handleTogglePause,
    handleToggleHelp
  ])

  // Sound Effects
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

  // Keyboard Controls
  useKeyboard(gameActions, {
    repeatDelay: 200,
    repeatInterval: 50,
    enabled: !state.isGameOver
  })

  // Helper Functions
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
  }

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Welcome Screen */}
      <WelcomeScreen
        isOpen={dialogState.showWelcome && !state.isGameOver}
        onStart={handleStartGame}
      />

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
                aria-label={`Time left: ${formatTime(state.timeLeft)}`}
              >
                <Timer className="mr-1 size-4 sm:mr-2" />
                <span>{formatTime(state.timeLeft)}</span>
              </Button>

              <Button
                variant="ghost"
                className="hidden h-8 px-2 sm:flex sm:px-3"
                aria-label={`Level ${state.level}`}
              >
                <Crown className="mr-1 size-4 sm:mr-2" />
                <span>Level {state.level}</span>
              </Button>

              <GameSettings
                settings={settings}
                onSettingsChange={setSettings}
                open={dialogState.isSettingsOpen}
                onOpenChange={open =>
                  handleDialogChange('isSettingsOpen', open)
                }
              />

              <Button
                variant="ghost"
                onClick={() => handleDialogChange('isHelpOpen', true)}
                size="icon"
                className="size-8"
                disabled={state.isGameOver}
                aria-label="Help"
              >
                <HelpCircle className="size-4" />
              </Button>

              <Button
                variant="ghost"
                onClick={handleTogglePause}
                size="icon"
                className="size-8"
                disabled={!canTogglePause}
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
        <div
          className={cn(
            'relative size-full',
            showTouchControls ? 'max-h-[calc(82vh-12vh)]' : 'max-h-[92vh]',
            'max-w-screen-lg md:w-auto'
          )}
        >
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

        {/* Side Panel - Desktop Only */}
        {isDesktop && (
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

            <Card className="flex-1 space-y-4 p-4">
              <div>
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
              </div>
              <div>
                <h2 className="mb-2 font-mono font-medium">
                  Special Power-ups
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Color Bomb</span>
                    <div className="flex size-8 items-center justify-center rounded-md bg-red-500/20">
                      <Zap className="size-5 text-red-500" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Line Blast</span>
                    <div className="flex size-8 items-center justify-center rounded-md bg-yellow-500/20">
                      <Minimize2 className="size-5 text-yellow-500" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Freeze</span>
                    <div className="flex size-8 items-center justify-center rounded-md bg-blue-500/20">
                      <Timer className="size-5 text-blue-500" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ghost Block</span>
                    <div className="flex size-8 items-center justify-center rounded-md bg-green-500/20">
                      <Ghost className="size-5 text-green-500" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shuffle</span>
                    <div className="flex size-8 items-center justify-center rounded-md bg-purple-500/20">
                      <Shuffle className="size-5 text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Touch Controls */}
      {showTouchControls && (
        <TouchControls
          onMoveLeft={gameActions.moveLeft}
          onMoveRight={gameActions.moveRight}
          onMoveDown={gameActions.moveDown}
          onRotate={gameActions.rotate}
          onHardDrop={gameActions.hardDrop}
          disabled={state.isPaused || state.isGameOver || isAnyDialogOpen}
          className={cn(
            'fixed inset-x-0 bottom-0 z-50',
            'h-[12vh] max-h-20', // Fixed height for touch controls
            'bg-background/80 backdrop-blur-sm',
            'border-t border-border'
          )}
        />
      )}

      {/* Mobile/Tablet Stats Overlay */}
      {showTouchControls && (
        <div className="absolute left-4 top-[10vh] z-10 flex flex-row gap-2">
          <Card className="h-16 bg-background/80 p-2 backdrop-blur-sm">
            <div className="text-sm text-muted-foreground">Time</div>
            <div className="font-mono text-lg">
              {formatTime(state.timeLeft)}
            </div>
          </Card>
          <Card className="h-16 bg-background/80 p-2 backdrop-blur-sm">
            <div className="text-sm text-muted-foreground">Score</div>
            <div className="flex items-center justify-center font-mono text-lg">
              {state.score.toLocaleString()}
            </div>
          </Card>
          <Card className="h-16 bg-background/80 p-2 backdrop-blur-sm">
            <div className="text-sm text-muted-foreground">Level</div>
            <div className="flex items-center justify-center font-mono text-lg">
              {state.level}
            </div>
          </Card>
          <Card
            className={cn(
              'size-16 bg-background/80 p-2 backdrop-blur-sm',
              isTablet ? 'hidden sm:block' : 'block' // Hide on mobile, show on tablet
            )}
          >
            <div className="text-sm text-muted-foreground">Next</div>
            <div>
              <NextPiecePreview
                piece={state.nextPiece}
                cellSize={isTablet ? 14 : 12}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Dialogs */}
      <HelpDialog
        open={dialogState.isHelpOpen}
        onOpenChange={open => handleDialogChange('isHelpOpen', open)}
      />
      <GamePauseDialog
        isOpen={state.isPaused && !state.isGameOver && !isAnyDialogOpen}
        onResume={handleTogglePause}
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

      {/* Tutorial Hints for Touch Controls */}
      {showTouchControls}
    </div>
  )
}
