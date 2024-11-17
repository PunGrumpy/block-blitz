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
    return () => {
      clearAllIntervals()
    }
  }, [clearAllIntervals])

  const handleTouchStart = React.useCallback(
    (action: () => void, key: string) => {
      if (disabled) return

      clearInterval(key)
      buttonStates.current.set(key, true)
      action()

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
        'fixed inset-x-0 bottom-0 bg-background/80 backdrop-blur-sm md:hidden',
        className
      )}
    >
      <div className="container flex h-[20vh] items-center justify-between gap-4 p-4">
        {/* Movement controls */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="size-16 rounded-lg border"
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
            className="size-16 rounded-lg border"
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
          className="size-16 rounded-lg"
          onClick={onHardDrop}
          disabled={disabled}
          aria-label="Hard drop"
        >
          <ChevronDown className="size-8" />
        </Button>

        {/* Action controls */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="size-16 rounded-lg border"
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
            className="size-16 rounded-lg border"
            onClick={onRotate}
            disabled={disabled}
            aria-label="Rotate piece"
          >
            <RotateCcw className="size-8" />
          </Button>
        </div>
      </div>
    </div>
  )
}
