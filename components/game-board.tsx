'use client';

import React from 'react';

import { Card } from '@/components/ui/card';
import { useGameLoop } from '@/hooks/use-game-loop';
import { cn } from '@/lib/utils';
import { GamePiece,GameState } from '@/types/game';

interface GameBoardProps {
  state: GameState;
  cellSize?: number;
  showGhost?: boolean;
  className?: string;
}

export function GameBoard({
  state,
  cellSize = 30,
  showGhost = true,
  className,
}: GameBoardProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  // Find ghost piece position
  const getGhostPosition = React.useCallback(
    (piece: GamePiece): number => {
      let ghostY = piece.position.y;
      while (ghostY < state.board.length) {
        if (ghostY + 1 >= state.board.length) break;
        // Check collision at next position
        const hasCollision = piece.shape.some((row, y) =>
          row.some(
            (cell, x) =>
              cell &&
              state.board[ghostY + y + 1]?.[piece.position.x + x] !== null
          )
        );
        if (hasCollision) break;
        ghostY++;
      }
      return ghostY;
    },
    [state.board]
  );

  const drawBoard = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { board, currentPiece } = state;

      // Clear the canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Draw the grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
          ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
      }

      // Draw placed pieces with a subtle glow effect
      board.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            ctx.fillStyle = cell;
            ctx.shadowColor = cell;
            ctx.shadowBlur = 5;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.shadowBlur = 0;

            // Add highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(
              x * cellSize,
              y * cellSize,
              cellSize,
              cellSize * 0.3
            );
          }
        });
      });

      // Draw ghost piece
      if (showGhost && currentPiece && !state.isPaused && !state.isGameOver) {
        const ghostY = getGhostPosition(currentPiece);
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = currentPiece.color;
        currentPiece.shape.forEach((row, y) => {
          row.forEach((isSet, x) => {
            if (isSet) {
              ctx.fillRect(
                (currentPiece.position.x + x) * cellSize,
                (ghostY + y) * cellSize,
                cellSize,
                cellSize
              );
            }
          });
        });
        ctx.globalAlpha = 1;
      }

      // Draw current piece with glow effect
      if (currentPiece) {
        ctx.fillStyle = currentPiece.color;
        ctx.shadowColor = currentPiece.color;
        ctx.shadowBlur = 10;
        currentPiece.shape.forEach((row, y) => {
          row.forEach((isSet, x) => {
            if (isSet) {
              const pieceX = (currentPiece.position.x + x) * cellSize;
              const pieceY = (currentPiece.position.y + y) * cellSize;
              ctx.fillRect(pieceX, pieceY, cellSize, cellSize);

              // Add highlight
              ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
              ctx.fillRect(pieceX, pieceY, cellSize, cellSize * 0.3);
              ctx.fillStyle = currentPiece.color;
            }
          });
        });
        ctx.shadowBlur = 0;
      }
    },
    [state, cellSize, showGhost, getGhostPosition]
  );

  useGameLoop(canvasRef, drawBoard);

  // Handle resize
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Prevent SSR hydration mismatch
  }

  return (
    <Card
      className={cn("p-4 bg-gradient-to-b from-background to-muted", className)}
    >
      <canvas
        ref={canvasRef}
        width={state.board[0].length * cellSize}
        height={state.board.length * cellSize}
        className="border border-border rounded-lg"
        aria-label="Game Board"
        role="img"
      >
        Your browser does not support the canvas element.
      </canvas>
      <div className="sr-only" aria-live="polite">
        {state.isGameOver && "Game Over!"}
        {state.isPaused && "Game Paused"}
        {!state.isGameOver && !state.isPaused && `Current score: ${state.score}`}
      </div>
    </Card>
  );
}