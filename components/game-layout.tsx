'use client'

import * as React from 'react'
import { useMediaQuery } from '@/hooks/use-media-query'
import { GameBoard } from '@/components/game-board'
import { GameOverDialog } from '@/components/game-over-dialog'
import { GamePauseDialog } from '@/components/game-pause-dialog'
import { GameSettings } from '@/components/game-settings'
import { HelpDialog } from '@/components/help-dialog'
import { NextPiecePreview } from '@/components/next-piece-preview'
import { TouchControls } from '@/components/touch-controls'
import { GameStats } from '@/components/game-stats'
import { useGameSound } from '@/hooks/use-game-sound'
import { useGameState } from '@/hooks/use-game-state'
import { useKeyboard } from '@/hooks/use-keyboard'
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

  // Play sound when lines are cleared
  const prevLines = React.useRef(state.lines)
  React.useEffect(() => {
    if (state.lines > prevLines.current) {
      sounds.playClear()
    }
    prevLines.current = state.lines
  }, [state.lines, sounds])

  // Play game over sound
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
    <>
      <div className="container grid h-full gap-4 p-4 lg:grid-cols-[1fr,auto]">
        {/* Game Board Area */}
        <div className="relative flex items-center justify-center">
          <GameBoard
            state={state}
            showGhost={settings.display.showGhost}
            showGrid={settings.display.showGrid}
            showParticles={settings.display.particles}
            className="max-h-full"
          />

          {/* Game overlay states */}
          {(state.isPaused || state.isGameOver) && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm"
              role="alert"
            >
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
        </div>

        {/* Side Panel */}
        <div className="hidden w-48 space-y-2 lg:block">
          <NextPiecePreview piece={state.nextPiece} />
          <GameStats state={state} />
          <GameSettings settings={settings} onSettingsChange={setSettings} />
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
          className="absolute bottom-16"
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
    </>
  )
}
