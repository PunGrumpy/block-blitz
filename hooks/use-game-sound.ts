import { useCallback, useRef, useEffect } from 'react'

interface SoundOptions {
  enabled: boolean
  volume: number
  effects: boolean
}

const SOUND_EFFECTS = {
  move: { frequency: 220, duration: 0.05 }, // A3, short duration
  rotate: { frequency: 330, duration: 0.08 }, // E4, short duration
  drop: { frequency: 440, duration: 0.15 }, // A4, medium duration
  clear: { frequency: 880, duration: 0.2 }, // A5, medium duration
  gameOver: { frequency: 110, duration: 0.5 } // A2, long duration
}

// Minimum volume threshold to avoid Web Audio API errors
const MIN_VOLUME = 0.0001

export function useGameSound(options: SoundOptions) {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }
      document.removeEventListener('click', initAudioContext)
      document.removeEventListener('keydown', initAudioContext)
    }

    document.addEventListener('click', initAudioContext)
    document.addEventListener('keydown', initAudioContext)

    return () => {
      document.removeEventListener('click', initAudioContext)
      document.removeEventListener('keydown', initAudioContext)
      audioContextRef.current?.close()
    }
  }, [])

  const playTone = useCallback(
    (type: keyof typeof SOUND_EFFECTS) => {
      if (!options.enabled || !options.effects || !audioContextRef.current)
        return

      const ctx = audioContextRef.current
      const { frequency, duration } = SOUND_EFFECTS[type]

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      oscillator.frequency.value = frequency

      // Calculate volume with minimum threshold
      const normalizedVolume = Math.max(
        MIN_VOLUME,
        (options.volume / 100) * 0.2
      )
      gainNode.gain.setValueAtTime(normalizedVolume, ctx.currentTime)

      oscillator.start()
      // Ensure final volume is above minimum threshold
      const finalVolume = Math.max(MIN_VOLUME, normalizedVolume * 0.01)
      gainNode.gain.exponentialRampToValueAtTime(
        finalVolume,
        ctx.currentTime + duration
      )

      setTimeout(() => {
        oscillator.stop()
        oscillator.disconnect()
        gainNode.disconnect()
      }, duration * 1000)
    },
    [options.enabled, options.effects, options.volume]
  )

  return {
    playMove: () => playTone('move'),
    playRotate: () => playTone('rotate'),
    playDrop: () => playTone('drop'),
    playClear: () => playTone('clear'),
    playGameOver: () => playTone('gameOver')
  }
}
