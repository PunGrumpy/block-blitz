import { useEffect, useCallback, useRef } from 'react'

interface GameControls {
  moveLeft: () => void
  moveRight: () => void
  moveDown: () => void
  rotate: () => void
  hardDrop: () => void
  togglePause: () => void
  toggleHelp: () => void
}

const KEYMAP: Record<string, keyof GameControls> = {
  Space: 'hardDrop',
  ArrowLeft: 'moveLeft',
  ArrowRight: 'moveRight',
  ArrowDown: 'moveDown',
  ArrowUp: 'rotate',
  KeyA: 'moveLeft',
  KeyD: 'moveRight',
  KeyS: 'moveDown',
  KeyW: 'rotate',
  KeyH: 'toggleHelp',
  KeyP: 'togglePause'
}

// Keys that should repeat while held down
const REPEATABLE_ACTIONS = new Set(['moveLeft', 'moveRight', 'moveDown'])

export function useKeyboard(
  controls: GameControls,
  options = {
    repeatDelay: 200,
    repeatInterval: 50,
    enabled: true
  }
) {
  const pressedKeys = useRef(new Set<string>())
  const repeatTimeouts = useRef(new Map<string, NodeJS.Timeout>())
  const controlsRef = useRef(controls)
  controlsRef.current = controls

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Skip if an input element is focused
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return
      }

      const key = event.code
      const action = KEYMAP[key]

      // Always allow pause action, regardless of enabled state
      if (action === 'togglePause' || (options.enabled && action)) {
        event.preventDefault()

        if (!pressedKeys.current.has(key)) {
          pressedKeys.current.add(key)
          controlsRef.current[action]()

          // Only start repeat for repeatable actions
          if (REPEATABLE_ACTIONS.has(action) && options.enabled) {
            const timeout = setTimeout(() => {
              const interval = setInterval(() => {
                if (pressedKeys.current.has(key)) {
                  controlsRef.current[action]()
                }
              }, options.repeatInterval)
              repeatTimeouts.current.set(
                key,
                interval as unknown as NodeJS.Timeout
              )
            }, options.repeatDelay)
            repeatTimeouts.current.set(key, timeout)
          }
        }
      }
    },
    [options.enabled, options.repeatDelay, options.repeatInterval]
  )

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.code
    if (KEYMAP[key]) {
      pressedKeys.current.delete(key)
      const timeout = repeatTimeouts.current.get(key)
      if (timeout) {
        clearTimeout(timeout)
        repeatTimeouts.current.delete(key)
      }
    }
  }, [])

  const handleBlur = useCallback(() => {
    pressedKeys.current.clear()
    repeatTimeouts.current.forEach(clearTimeout)
    repeatTimeouts.current.clear()
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
      handleBlur()
    }
  }, [handleKeyDown, handleKeyUp, handleBlur])

  // Cleanup when disabled
  useEffect(() => {
    if (!options.enabled) {
      handleBlur()
    }
  }, [options.enabled, handleBlur])
}
