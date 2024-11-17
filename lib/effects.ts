interface ParticleEffect {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  color: string
  size: number
}

export class LinesClearedEffect {
  private particles: ParticleEffect[] = []

  createParticles(row: number, cellSize: number, width: number) {
    const particlesPerRow = 10
    for (let i = 0; i < particlesPerRow; i++) {
      this.particles.push({
        x: (i * width) / particlesPerRow,
        y: row * cellSize,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        alpha: 1,
        color: '#ffffff',
        size: Math.random() * 4 + 2
      })
    }
  }

  update() {
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.alpha -= 0.02
      return particle.alpha > 0
    })
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(particle => {
      ctx.save()
      ctx.globalAlpha = particle.alpha
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })
  }

  hasParticles(): boolean {
    return this.particles.length > 0
  }
}
