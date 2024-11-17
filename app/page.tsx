import { Metadata } from 'next'
import { GameLayout } from '@/components/game-layout'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
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
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GameLayout config={DEFAULT_CONFIG} />
      </main>
      <SiteFooter />
    </div>
  )
}
