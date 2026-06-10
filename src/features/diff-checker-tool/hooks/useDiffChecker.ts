import { useCallback, useEffect, useState } from 'react'

export function useDiffChecker() {
  const [renderSideBySide, setRenderSideBySide] = useState(() => {
    // Default to inline on mobile screens
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  })

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
    setRenderSideBySide((prev) => !prev)
  }, [])

  return {
    renderSideBySide,
    toggleView,
  }
}

