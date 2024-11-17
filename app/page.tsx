'use client'

import * as React from 'react'

import { GameBoard } from '@/components/game-board'
import { GameLayout } from '@/components/game-layout'
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

  // Handle keyboard controls
  useKeyboard(actions, {
    repeatDelay: 200,
    repeatInterval: 50,
    enabled: !state.isPaused && !state.isGameOver
  })

  // Play sound effects
  React.useEffect(() => {
    if (!settings.audio.enabled || !settings.audio.effects) return

    const audioContext = new AudioContext()

    function playTone(frequency: number, duration: number) {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      gainNode.gain.value = settings.audio.volume / 100

      oscillator.start()
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration
      )

      setTimeout(() => {
        oscillator.stop()
        oscillator.disconnect()
      }, duration * 1000)
    }

    return () => {
      audioContext.close()
    }
  }, [settings.audio])

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
        {/* Main Game Area */}
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

        {/* Side Panel */}
        <div className="hidden w-[300px] space-y-4 lg:block">
          <NextPiecePreview piece={state.nextPiece} />

          <GameSettings settings={settings} onSettingsChange={setSettings} />
        </div>
      </div>

      {/* Mobile Touch Controls */}
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

      {/* Help Dialog */}
      <HelpDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />
    </GameLayout>
  )
}
