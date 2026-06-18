import { useCallback, useEffect, useState } from 'react'

const DIFF_VIEW_STORAGE_KEY = 'tools-app:diff-checker:renderSideBySide'

function readPersistedSideBySide(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const stored = window.localStorage.getItem(DIFF_VIEW_STORAGE_KEY)
    if (stored !== null) return JSON.parse(stored) as boolean
  } catch { /* ignore */ }
  // Default: side-by-side on desktop, inline on mobile
  return window.innerWidth >= 768
}

export function useDiffChecker() {
  const [renderSideBySide, setRenderSideBySide] = useState(readPersistedSideBySide)

  // Auto-switch to inline when viewport shrinks below md breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => {
      setRenderSideBySide(e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggleView = useCallback(() => {
    setRenderSideBySide((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(DIFF_VIEW_STORAGE_KEY, JSON.stringify(next))
      } catch { /* ignore */ }
      return next
    })
  }, [])

  return {
    renderSideBySide,
    toggleView,
  }
}
