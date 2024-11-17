import { cn } from '@/lib/utils'
import './globals.css'

import type { Metadata } from 'next'
import localFont from 'next/font/local'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})

export const metadata: Metadata = {
  title: 'Block Blitz - Modern Puzzle Game',
  description: 'A modern take on classic block-falling puzzle games',
  keywords: ['puzzle game', 'block game', 'tetris-like', 'web game'],
  authors: [{ name: 'Your Name' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' }
  ]
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth antialiased">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          'min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-background to-muted'
        )}
      >
        {children}
      </body>
    </html>
  )
}
