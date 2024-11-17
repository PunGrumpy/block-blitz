import { useEffect, useCallback, useRef } from 'react'

interface GameControls {
  moveLeft: () => void
  moveRight: () => void
  moveDown: () => void
  rotate: () => void
  hardDrop: () => void
  togglePause: () => void
}

type KeyMap = {
  [key: string]: keyof GameControls
}

const KEYMAP: KeyMap = {
  Space: 'hardDrop',
  ArrowLeft: 'moveLeft',
  ArrowRight: 'moveRight',
  ArrowDown: 'moveDown',
  ArrowUp: 'rotate',
  KeyA: 'moveLeft',
  KeyD: 'moveRight',
  KeyS: 'moveDown',
  KeyW: 'rotate',
  KeyP: 'togglePause'
}

// Keys that should repeat while held down
const REPEATABLE_ACTIONS = new Set(['moveLeft', 'moveRight', 'moveDown'])

export function useKeyboard(
  controls: GameControls,
  options = {
    repeatDelay: 200, // Initial delay before repeating
    repeatInterval: 50, // Interval between repeats
    enabled: true // Whether keyboard controls are enabled
  }
) {
  // Keep track of currently pressed keys
  const pressedKeys = useRef(new Set<string>())
  const repeatTimeouts = useRef(new Map<string, NodeJS.Timeout>())

  // Store controls in ref to avoid unnecessary effect triggers
  const controlsRef = useRef(controls)
  controlsRef.current = controls

  const clearRepeats = useCallback((key?: string) => {
    if (key) {
      const timeout = repeatTimeouts.current.get(key)
      if (timeout) {
        clearTimeout(timeout)
        repeatTimeouts.current.delete(key)
      }
    } else {
      repeatTimeouts.current.forEach(clearTimeout)
      repeatTimeouts.current.clear()
    }
  }, [])

  const startRepeat = useCallback(
    (key: string, action: keyof GameControls) => {
      if (!REPEATABLE_ACTIONS.has(action)) return

      const createTimeout = () => {
        return setTimeout(
          () => {
            if (pressedKeys.current.has(key)) {
              controlsRef.current[action]()
              const newTimeout = createTimeout()
              repeatTimeouts.current.set(key, newTimeout)
            }
          },
          repeatTimeouts.current.size === 0
            ? options.repeatDelay
            : options.repeatInterval
        )
      }

      const timeout = createTimeout()
      repeatTimeouts.current.set(key, timeout)
    },
    [options.repeatDelay, options.repeatInterval]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!options.enabled) return

      const key = event.code
      const action = KEYMAP[key]

      if (action && !pressedKeys.current.has(key)) {
        event.preventDefault()
        pressedKeys.current.add(key)
        controlsRef.current[action]()
        startRepeat(key, action)
      }
    },
    [options.enabled, startRepeat]
  )

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      const key = event.code
      if (KEYMAP[key]) {
        pressedKeys.current.delete(key)
        clearRepeats(key)
      }
    },
    [clearRepeats]
  )

  // Handle window blur to clear all pressed keys
  const handleBlur = useCallback(() => {
    pressedKeys.current.clear()
    clearRepeats()
  }, [clearRepeats])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
      clearRepeats()
    }
  }, [handleKeyDown, handleKeyUp, handleBlur, clearRepeats])

  // Cleanup on unmount or when enabled changes
  useEffect(() => {
    if (!options.enabled) {
      pressedKeys.current.clear()
      clearRepeats()
    }
  }, [options.enabled, clearRepeats])
}
