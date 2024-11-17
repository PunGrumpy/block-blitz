import { useCallback, useRef, useEffect } from 'react'

interface SoundOptions {
  enabled: boolean
  volume: number
  effects: boolean
}

// Sound frequencies for different game actions
const SOUND_EFFECTS = {
  move: { frequency: 220, duration: 0.05 }, // A3 note, very short
  rotate: { frequency: 330, duration: 0.08 }, // E4 note, short
  drop: { frequency: 440, duration: 0.15 }, // A4 note, medium
  clear: { frequency: 880, duration: 0.2 }, // A5 note, longer
  gameOver: { frequency: 110, duration: 0.5 } // A2 note, very long
}

export function useGameSound(options: SoundOptions) {
  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize AudioContext on first interaction
  useEffect(() => {
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }
      // Remove listener after first interaction
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

      // Configure oscillator
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      oscillator.frequency.value = frequency

      // Set volume
      const volume = options.volume / 100
      gainNode.gain.setValueAtTime(volume * 0.2, ctx.currentTime)

      // Start tone with attack
      oscillator.start()
      gainNode.gain.exponentialRampToValueAtTime(
        volume * 0.01,
        ctx.currentTime + duration
      )

      // Stop and cleanup
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
