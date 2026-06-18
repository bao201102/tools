import { useCallback, useEffect, useRef, useState } from 'react'

export type CopyState = 'idle' | 'copied' | 'failed'

/**
 * Clipboard copy with transient feedback state.
 *
 * Returns a `copy(text)` callback and a `state` that flips to 'copied' (or
 * 'failed') for `resetDelay` ms before returning to 'idle'. Centralises the
 * copy + setTimeout + reset pattern that was duplicated across tool editors.
 */
export function useCopyToClipboard(resetDelay = 2000) {
  const [state, setState] = useState<CopyState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const copy = useCallback(
    async (text: string) => {
      if (!text) return false
      if (timerRef.current) clearTimeout(timerRef.current)
      try {
        await navigator.clipboard.writeText(text)
        setState('copied')
        timerRef.current = setTimeout(() => setState('idle'), resetDelay)
        return true
      } catch {
        setState('failed')
        timerRef.current = setTimeout(() => setState('idle'), resetDelay)
        return false
      }
    },
    [resetDelay]
  )

  return { state, copy }
}
