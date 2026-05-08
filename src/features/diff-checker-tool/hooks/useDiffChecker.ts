import { useCallback, useState } from 'react'

export function useDiffChecker() {
  const [renderSideBySide, setRenderSideBySide] = useState(true)

  const toggleView = useCallback(() => {
    setRenderSideBySide((prev) => !prev)
  }, [])

  return {
    renderSideBySide,
    toggleView,
  }
}
