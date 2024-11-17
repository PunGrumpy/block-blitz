'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

interface GamePauseDialogProps {
  isOpen: boolean
  onResume: () => void
  onRestart: () => void
}

export function GamePauseDialog({
  isOpen,
  onResume,
  onRestart
}: GamePauseDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => onResume()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Game Paused</DialogTitle>
          <DialogDescription>
            Take a break! Your progress is saved.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-4">
          <Button onClick={onResume} variant="default">
            Resume Game
          </Button>
          <Button onClick={onRestart} variant="outline">
            Restart Game
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Press P to resume the game
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
