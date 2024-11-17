import { Metadata } from 'next'
import { GameLayout } from '@/components/game-layout'
import { DEFAULT_CONFIG } from '@/constants/game'

export const metadata: Metadata = {
  title: 'Block Blitz - Modern Puzzle Game',
  description: 'A modern take on classic block-falling puzzle games',
  keywords: ['puzzle game', 'block game', 'tetris-like', 'web game'],
  authors: [{ name: 'Your Name' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' }
  ]
}

export default function GamePage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <GameLayout config={DEFAULT_CONFIG} />
    </div>
  )
}
