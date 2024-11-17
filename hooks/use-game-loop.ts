import { useEffect, useRef } from 'react'

export function useGameLoop(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  draw: (ctx: CanvasRenderingContext2D) => void
) {
  const frameIdRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function gameLoop() {
      draw(ctx as CanvasRenderingContext2D)
      frameIdRef.current = requestAnimationFrame(gameLoop)
    }

    frameIdRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }
    }
  }, [canvasRef, draw])
}
