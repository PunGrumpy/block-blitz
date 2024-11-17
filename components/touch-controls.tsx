'use client'

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  RotateCcw
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TouchControlsProps {
  onMoveLeft: () => void
  onMoveRight: () => void
  onMoveDown: () => void
  onRotate: () => void
  onHardDrop: () => void
  className?: string
  disabled?: boolean
}

export function TouchControls({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onHardDrop,
  className,
  disabled = false
}: TouchControlsProps) {
  // Use refs for mutable state
  const buttonStates = React.useRef<Map<string, boolean>>(new Map())
  const intervalRefs = React.useRef<Map<string, number>>(new Map())

  const clearInterval = React.useCallback((key: string) => {
    const intervalId = intervalRefs.current.get(key)
    if (intervalId !== undefined) {
      window.clearInterval(intervalId)
      intervalRefs.current.delete(key)
    }
  }, [])

  const clearAllIntervals = React.useCallback(() => {
    intervalRefs.current.forEach(intervalId => {
      window.clearInterval(intervalId)
    })
    intervalRefs.current.clear()
  }, [])

  React.useEffect(() => {
    // Cleanup function now uses the callback ref that won't change
    return () => {
      clearAllIntervals()
    }
  }, [clearAllIntervals])

  const handleTouchStart = React.useCallback(
    (action: () => void, key: string) => {
      if (disabled) return

      // Clear any existing interval
      clearInterval(key)

      // Set initial state and perform action
      buttonStates.current.set(key, true)
      action()

      // Start new interval
      const intervalId = window.setInterval(() => {
        if (buttonStates.current.get(key)) {
          action()
        }
      }, 100)

      intervalRefs.current.set(key, intervalId)
    },
    [disabled, clearInterval]
  )

  const handleTouchEnd = React.useCallback(
    (key: string) => {
      buttonStates.current.set(key, false)
      clearInterval(key)
    },
    [clearInterval]
  )

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-4 md:hidden',
        className
      )}
    >
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* Movement controls group */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            className="size-16 rounded-full border-2"
            onTouchStart={() => handleTouchStart(onMoveLeft, 'left')}
            onTouchEnd={() => handleTouchEnd('left')}
            onTouchCancel={() => handleTouchEnd('left')}
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
            onTouchCancel={() => handleTouchEnd('right')}
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
            onTouchCancel={() => handleTouchEnd('down')}
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
        Game controls available. Use on-screen buttons to move and rotate
        pieces.
      </div>
    </div>
  )
}
