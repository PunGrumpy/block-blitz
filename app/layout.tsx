import './globals.css'

import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import { ThemeProvider } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' }
  ]
}

export const metadata: Metadata = {
  metadataBase: new URL('https://blockblitz.pungrumpy.com/'),
  title: 'Block Blitz - Modern Puzzle Game',
  description: 'A modern take on classic block-falling puzzle games',
  keywords: ['puzzle game', 'block game', 'tetris-like', 'web game'],
  authors: [{ name: 'Noppakorn Kaewsalabnil' }, { name: 'PunGrumpy' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Block Blitz',
    title: 'Block Blitz - Modern Puzzle Game',
    description: 'A modern take on classic block-falling puzzle games',
    images: [
      {
        url: '/og-image.png',
        width: 800,
        height: 400,
        alt: 'Block Blitz - Modern Puzzle Game'
      }
    ]
  },
  twitter: {
    site: '@pungrumpy',
    creator: '@pungrumpy',
    card: 'summary_large_image',
    title: 'Block Blitz - Modern Puzzle Game',
    description: 'A modern take on classic block-falling puzzle games',
    images: [
      {
        url: '/twitter-card.png',
        width: 800,
        height: 400,
        alt: 'Block Blitz - Modern Puzzle Game'
      }
    ]
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          'min-h-screen scroll-smooth antialiased'
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main className="bg-background text-foreground">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
