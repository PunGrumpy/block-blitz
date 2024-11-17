'use client'

import * as React from 'react'

import { GameBoard } from '@/components/game-board'
import { GameLayout } from '@/components/game-layout'
import { GamePauseDialog } from '@/components/game-pause-dialog'
import { GameSettings } from '@/components/game-settings'
import { HelpDialog } from '@/components/help-dialog'
import { NextPiecePreview } from '@/components/next-piece-preview'
import { TouchControls } from '@/components/touch-controls'
import { useGameSound } from '@/hooks/use-game-sound'
import { useGameState } from '@/hooks/use-game-state'
import { useKeyboard } from '@/hooks/use-keyboard'
import { useMediaQuery } from '@/hooks/use-media-query'

const GAME_CONFIG = {
  boardWidth: 10,
  boardHeight: 20,
  initialLevel: 1,
  timeLimit: 180,
  targetScore: 3000,
  speedCurve: {
    initial: 800,
    decrement: 50,
    minimum: 100
  }
}

export default function GamePage() {
  const [isHelpOpen, setIsHelpOpen] = React.useState(false)
  const [settings, setSettings] = React.useState({
    audio: {
      enabled: true,
      volume: 70,
      effects: true,
      music: true
    },
    display: {
      showGhost: true,
      showGrid: true,
      particles: true
    }
  })

  const { state, actions } = useGameState(GAME_CONFIG)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const sounds = useGameSound({
    enabled: settings.audio.enabled,
    volume: settings.audio.volume,
    effects: settings.audio.effects
  })

  // Create wrapped actions that play sounds
  const soundActions = {
    moveLeft: React.useCallback(() => {
      sounds.playMove()
      actions.moveLeft()
    }, [actions, sounds]),
    moveRight: React.useCallback(() => {
      sounds.playMove()
      actions.moveRight()
    }, [actions, sounds]),
    moveDown: React.useCallback(() => {
      sounds.playMove()
      actions.moveDown()
    }, [actions, sounds]),
    rotate: React.useCallback(() => {
      sounds.playRotate()
      actions.rotate()
    }, [actions, sounds]),
    hardDrop: React.useCallback(() => {
      sounds.playDrop()
      actions.hardDrop()
    }, [actions, sounds]),
    togglePause: actions.togglePause,
    reset: actions.reset
  }

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

  useKeyboard(soundActions, {
    repeatDelay: 200,
    repeatInterval: 50,
    enabled: !state.isGameOver
  })

  return (
    <GameLayout
      gameState={state}
      onToggleSound={() =>
        setSettings(prev => ({
          ...prev,
          audio: { ...prev.audio, enabled: !prev.audio.enabled }
        }))
      }
      isSoundEnabled={settings.audio.enabled}
      onShowHelp={() => setIsHelpOpen(true)}
    >
      <div className="grid h-full grid-cols-[1fr,auto] gap-4 p-2">
        {/* Game Board Area */}
        <div className="flex items-center justify-center">
          <GameBoard
            state={state}
            showGhost={settings.display.showGhost}
            className="max-h-full"
          />
        </div>

        {/* Side Panel */}
        <div className="hidden w-48 space-y-2 lg:block">
          <NextPiecePreview piece={state.nextPiece} />
          <GameSettings settings={settings} onSettingsChange={setSettings} />
        </div>
      </div>

      {/* Mobile Controls */}
      {isMobile && (
        <TouchControls
          onMoveLeft={soundActions.moveLeft}
          onMoveRight={soundActions.moveRight}
          onMoveDown={soundActions.moveDown}
          onRotate={soundActions.rotate}
          onHardDrop={soundActions.hardDrop}
          disabled={state.isPaused || state.isGameOver}
          className="absolute bottom-16"
        />
      )}

      {/* Dialogs */}
      <HelpDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />
      <GamePauseDialog
        isOpen={state.isPaused && !state.isGameOver}
        onResume={soundActions.togglePause}
        onRestart={soundActions.reset}
      />
    </GameLayout>
  )
}
