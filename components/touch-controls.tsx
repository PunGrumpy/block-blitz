'use client';

import { 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  ChevronDown,
  RotateCcw} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TouchControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  className?: string;
  disabled?: boolean;
}

export function TouchControls({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onHardDrop,
  className,
  disabled = false,
}: TouchControlsProps) {
  // Handle touch events with proper timing
  const buttonStates = React.useRef<{ [key: string]: boolean }>({});
  const intervalRefs = React.useRef<{ [key: string]: NodeJS.Timeout }>({});

  const handleTouchStart = React.useCallback((action: () => void, key: string) => {
    if (disabled) return;
    
    buttonStates.current[key] = true;
    action();

    // Start repeating action after initial delay
    intervalRefs.current[key] = setInterval(() => {
      if (buttonStates.current[key]) {
        action();
      }
    }, 100); // Repeat interval
  }, [disabled]);

  const handleTouchEnd = React.useCallback((key: string) => {
    buttonStates.current[key] = false;
    if (intervalRefs.current[key]) {
      clearInterval(intervalRefs.current[key]);
      delete intervalRefs.current[key];
    }
  }, []);

  // Cleanup intervals on unmount
  React.useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
    };
  }, []);

  return (
    <div className={cn("fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-background to-transparent md:hidden", className)}>
      <div className="container mx-auto flex justify-between items-center gap-4">
        {/* Movement controls group */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            className="size-16 rounded-full border-2"
            onTouchStart={() => handleTouchStart(onMoveLeft, 'left')}
            onTouchEnd={() => handleTouchEnd('left')}
            disabled={disabled}
            aria-label="Move left"
          >
            <ArrowLeft className="size-8" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="size-16 rounded-full border-2"
            onTouchStart={() => handleTouchStart(onMoveRight, 'right')}
            onTouchEnd={() => handleTouchEnd('right')}
            disabled={disabled}
            aria-label="Move right"
          >
            <ArrowRight className="size-8" />
          </Button>
        </div>

        {/* Hard drop button */}
        <Button
          variant="default"
          size="lg"
          className="size-16 rounded-full"
          onClick={onHardDrop}
          disabled={disabled}
          aria-label="Hard drop"
        >
          <ChevronDown className="size-8" />
        </Button>

        {/* Action controls group */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            className="size-16 rounded-full border-2"
            onTouchStart={() => handleTouchStart(onMoveDown, 'down')}
            onTouchEnd={() => handleTouchEnd('down')}
            disabled={disabled}
            aria-label="Move down"
          >
            <ArrowDown className="size-8" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="size-16 rounded-full border-2"
            onClick={onRotate}
            disabled={disabled}
            aria-label="Rotate piece"
          >
            <RotateCcw className="size-8" />
          </Button>
        </div>
      </div>

      {/* Haptic feedback for screen readers */}
      <div className="sr-only" aria-live="polite">
        Game controls available. Use on-screen buttons to move and rotate pieces.
      </div>
    </div>
  );
}