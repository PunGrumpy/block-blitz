import { useCallback, useEffect, useState } from 'react'

/**
 * Custom hook for handling media queries in a React component.
 * Supports SSR by defaulting to false and handling hydration properly.
 *
 * @param query - The media query string to evaluate
 * @param defaultState - Optional default state to use during SSR (default: false)
 * @returns boolean indicating if the media query matches
 *
 * @example
 * // Check if screen is mobile sized
 * const isMobile = useMediaQuery('(max-width: 768px)');
 *
 * // Check if user prefers dark mode
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(
  query: string,
  defaultState: boolean = false
): boolean {
  // Initialize state with defaultState
  const [matches, setMatches] = useState(defaultState)

  // Track if component is mounted to handle SSR
  const [mounted, setMounted] = useState(false)

  // Memoize the match handler to prevent unnecessary re-renders
  const handleChange = useCallback(
    (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches(e.matches)
    },
    []
  )

  useEffect(() => {
    setMounted(true)

    // Create media query list
    const mediaQuery = window.matchMedia(query)

    // Set initial state
    setMatches(mediaQuery.matches)

    // Add listener using the newer API when available, fallback to older API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [query, handleChange])

  // Return defaultState if not mounted (during SSR)
  // This prevents hydration mismatch issues
  if (!mounted) {
    return defaultState
  }

  return matches
}

/**
 * Common media query breakpoints
 */
export const mediaQueries = {
  mobile: '(max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'
} as const

/**
 * Typed convenience hooks for common media queries
 */
export const useIsMobile = () => useMediaQuery(mediaQueries.mobile)
export const useIsTablet = () => useMediaQuery(mediaQueries.tablet)
export const useIsDesktop = () => useMediaQuery(mediaQueries.desktop)
export const useIsDarkMode = () => useMediaQuery(mediaQueries.darkMode)
export const usePrefersReducedMotion = () =>
  useMediaQuery(mediaQueries.reducedMotion)
export const useIsPortrait = () => useMediaQuery(mediaQueries.portrait)
export const useIsLandscape = () => useMediaQuery(mediaQueries.landscape)
export const useIsRetina = () => useMediaQuery(mediaQueries.retina)
