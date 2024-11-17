import { useCallback, useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  rotation: number
  rotationSpeed: number
}

interface ConfettiExplosionProps {
  duration?: number
  particleCount?: number
  spread?: number
  colors?: string[]
}

export function ConfettiExplosion({
  duration = 2000,
  particleCount = 100,
  spread = 50,
  colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
}: ConfettiExplosionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const animationFrame = useRef<number>()
  const startTime = useRef<number>(0)

  const createParticle = useCallback(
    (x: number, y: number): Particle => {
      const angle = Math.random() * Math.PI * 2
      const velocity = Math.random() * spread
      return {
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 10, // Initial upward velocity
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      }
    },
    [spread, colors]
  )

  const initParticles = useCallback(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    particles.current = Array.from({ length: particleCount }, () =>
      createParticle(centerX, centerY)
    )
  }, [particleCount, createParticle])

  const animate = useCallback(
    (timestamp: number) => {
      if (!canvasRef.current) return
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      if (!startTime.current) {
        startTime.current = timestamp
      }

      const progress = timestamp - startTime.current

      if (progress > duration) {
        if (canvas.parentElement) {
          canvas.parentElement.removeChild(canvas)
        }
        return
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.current.forEach(particle => {
        // Apply gravity
        particle.vy += 0.5
        particle.x += particle.vx
        particle.y += particle.vy
        particle.rotation += particle.rotationSpeed

        // Draw particle
        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate((particle.rotation * Math.PI) / 180)
        ctx.fillStyle = particle.color
        ctx.fillRect(-4, -4, 8, 8)
        ctx.restore()
      })

      animationFrame.current = requestAnimationFrame(animate)
    },
    [duration]
  )

  useEffect(() => {
    if (!canvasRef.current) return

    // Set canvas size
    const updateCanvasSize = () => {
      if (!canvasRef.current) return
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // Initialize particles and start animation
    initParticles()
    animationFrame.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [initParticles, animate])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  )
}
