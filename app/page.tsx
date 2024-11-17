'use client'

import * as React from 'react'

import { GameBoard } from '@/components/game-board'
import { GameLayout } from '@/components/game-layout'
import { GamePauseDialog } from '@/components/game-pause-dialog'
import { GameSettings } from '@/components/game-settings'
import { GameStatusBar } from '@/components/game-status-bar'
import { HelpDialog } from '@/components/help-dialog'
import { NextPiecePreview } from '@/components/next-piece-preview'
import { TouchControls } from '@/components/touch-controls'
import { useGameState } from '@/hooks/use-game-state'
import { useKeyboard } from '@/hooks/use-keyboard'
import { useMediaQuery } from '@/hooks/use-media-query'

const GAME_CONFIG = {
  boardWidth: 10,
  boardHeight: 20,
  initialLevel: 1,
  timeLimit: 180, // 3 minutes
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

  // Handle keyboard controls - allow pause key even when paused
  useKeyboard(actions, {
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
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1fr,auto]">
        <div className="space-y-4">
          <GameStatusBar
            state={state}
            targetScore={GAME_CONFIG.targetScore}
            onPause={actions.togglePause}
            onReset={actions.reset}
          />

          <div className="flex justify-center">
            <GameBoard
              state={state}
              showGhost={settings.display.showGhost}
              className="max-w-full"
            />
          </div>
        </div>

        <div className="hidden w-[300px] space-y-4 lg:block">
          <NextPiecePreview piece={state.nextPiece} />
          <GameSettings settings={settings} onSettingsChange={setSettings} />
        </div>
      </div>

      {isMobile && (
        <TouchControls
          onMoveLeft={actions.moveLeft}
          onMoveRight={actions.moveRight}
          onMoveDown={actions.moveDown}
          onRotate={actions.rotate}
          onHardDrop={actions.hardDrop}
          disabled={state.isPaused || state.isGameOver}
        />
      )}

      <HelpDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />

      {/* Pause Dialog */}
      <GamePauseDialog
        isOpen={state.isPaused && !state.isGameOver}
        onResume={actions.togglePause}
        onRestart={actions.reset}
      />
    </GameLayout>
  )
}
