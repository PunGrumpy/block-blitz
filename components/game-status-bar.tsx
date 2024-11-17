'use client';

import { Pause, Play, RefreshCw } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { GameState } from '@/types/game';

interface GameStatusBarProps {
  state: GameState;
  targetScore: number;
  onPause: () => void;
  onReset: () => void;
  className?: string;
}

export function GameStatusBar({
  state,
  targetScore,
  onPause,
  onReset,
  className,
}: GameStatusBarProps) {
  // Calculate progress percentage
  const progress = Math.min((state.score / targetScore) * 100, 100);
  
  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Determine time warning state
  const timeWarning = state.timeLeft <= 30 && !state.isPaused && !state.isGameOver;

  return (
    <div
      className={cn(
        "bg-muted/50 backdrop-blur-sm rounded-lg p-4 shadow-lg",
        className
      )}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {/* Score Section */}
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">Score</div>
          <div className="text-2xl font-bold tabular-nums">
            {state.score.toLocaleString()}
          </div>
          <Progress value={progress} className="h-1 mt-2" />
        </div>

        {/* Level Section */}
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">Level</div>
          <div className="text-2xl font-bold">
            {state.level}
            <Badge variant="secondary" className="ml-2 text-xs">
              {`${state.lines} lines`}
            </Badge>
          </div>
        </div>

        {/* Time Section */}
        <div className="relative">
          <div className="text-sm font-medium text-muted-foreground mb-1">Time</div>
          <div 
            className={cn(
              "text-2xl font-bold tabular-nums transition-colors",
              timeWarning && "text-red-500 animate-pulse"
            )}
          >
            {formatTime(state.timeLeft)}
          </div>
          {timeWarning && (
            <div className="text-xs text-red-500 absolute -bottom-1">
              Time running out!
            </div>
          )}
        </div>

        {/* Controls Section */}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPause}
            disabled={state.isGameOver}
            aria-label={state.isPaused ? "Resume game" : "Pause game"}
          >
            {state.isPaused ? (
              <Play className="size-4" />
            ) : (
              <Pause className="size-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onReset}
            aria-label="Reset game"
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      {/* Game Status Messages */}
      {(state.isPaused || state.isGameOver) && (
        <div
          className="text-center py-2 px-4 rounded-md bg-accent text-accent-foreground"
          role="status"
          aria-live="polite"
        >
          {state.isGameOver ? (
            <span>Game Over! Final Score: {state.score}</span>
          ) : (
            <span>Game Paused - Press P to resume</span>
          )}
        </div>
      )}

      {/* Screen Reader Only Info */}
      <div className="sr-only" aria-live="polite">
        {`Current score ${state.score} out of ${targetScore} target score. `}
        {`Level ${state.level} with ${state.lines} lines cleared. `}
        {`Time remaining: ${formatTime(state.timeLeft)}`}
      </div>
    </div>
  );
}