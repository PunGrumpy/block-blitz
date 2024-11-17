'use client'

import { GameBoard } from '@/components/game-board'
import { GameControls } from '@/components/game-controls'
import { GameOverDialog } from '@/components/game-over-dialog'
import { GamePauseDialog } from '@/components/game-pause-dialog'
import { GameStats } from '@/components/game-stats'
import { NextPiecePreview } from '@/components/next-piece-preview'
import { Button } from '@/components/ui/button'
import { useGameState } from '@/hooks/use-game-state'
import { useKeyboard } from '@/hooks/use-keyboard'

const GAME_CONFIG = {
  boardWidth: 10,
  boardHeight: 20,
  initialLevel: 1,
  timeLimit: 180, // 3 minutes
  targetScore: 3000
}

export default function GamePage() {
  const { state, actions } = useGameState(GAME_CONFIG)

  useKeyboard(actions)

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[auto,400px]">
        <div className="flex flex-col items-center gap-8">
          <GameBoard state={state} />
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={actions.togglePause}
              disabled={state.isGameOver}
            >
              {state.isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button variant="default" onClick={actions.reset}>
              New Game
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <GameStats state={state} targetScore={GAME_CONFIG.targetScore} />
          <NextPiecePreview piece={state.nextPiece} />
          <GameControls />
        </div>
      </div>

      <GamePauseDialog
        isOpen={state.isPaused && !state.isGameOver}
        onResume={actions.togglePause}
        onRestart={actions.reset}
      />

      <GameOverDialog
        isOpen={state.isGameOver}
        state={state}
        targetScore={GAME_CONFIG.targetScore}
        onRestart={actions.reset}
      />
    </div>
  )
}
