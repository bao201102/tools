import { useEffect, useRef, useState } from 'react'

/** Matches the delay the JSON tool has used since it was hand-rolled there. */
export const DEFAULT_DEBOUNCE_MS = 250

/**
 * Trails `value` by `delayMs`, so expensive work keyed off it runs once the
 * user pauses rather than on every keystroke.
 *
 * The tools parse, convert and re-serialise their whole input on every change.
 * At a couple of MB that is hundreds of milliseconds of blocked main thread per
 * character typed; debouncing collapses a burst of edits into a single pass.
 *
 * An empty value is applied immediately — clearing the input should blank the
 * output at once instead of leaving stale results on screen for a beat.
 */
export function useDebouncedValue<T>(value: T, delayMs: number = DEFAULT_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isEmpty = value === '' || value == null

  useEffect(() => {
    if (isEmpty) return

    timerRef.current = setTimeout(() => setDebounced(value), delayMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, delayMs, isEmpty])

  // Resolved during render rather than by setting state from the effect: an
  // extra render pass just to blank the output would be visible as a flicker,
  // and cascading renders are what the effect is here to avoid.
  return isEmpty ? value : debounced
}
