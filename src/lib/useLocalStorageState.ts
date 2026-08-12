import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Values larger than this are kept in memory but not persisted.
 *
 * Tool inputs are stored verbatim, so pasting a multi-megabyte document used to
 * write the whole thing to localStorage on every keystroke — a synchronous
 * serialise-and-write on the main thread, and a fast route to filling the
 * origin's quota. Restoring a document that big on the next visit is not worth
 * that cost.
 */
const MAX_PERSISTED_CHARS = 256 * 1024

const PREFIX = 'tools-app:'

function read<T>(storageKey: string, fallback: T | (() => T)): T {
  try {
    const item = window.localStorage.getItem(storageKey)
    if (item !== null) return JSON.parse(item) as T
  } catch (error) {
    console.warn(`Error reading localStorage key "${storageKey}":`, error)
  }
  return fallback instanceof Function ? fallback() : fallback
}

/**
 * `useState` that mirrors into localStorage.
 *
 * The write happens in an effect rather than inside the state updater: updaters
 * must be pure (React may call them twice, or during render), and a write that
 * throws there — quota exceeded being the realistic case — escapes any
 * try/catch around the setter and takes the render down with it.
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T | (() => T)
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const storageKey = `${PREFIX}${key}`

  const [state, setState] = useState<T>(() => read(storageKey, initialValue))

  // Skip the write on mount: the value just came out of storage.
  const hydratedRef = useRef(true)

  useEffect(() => {
    if (hydratedRef.current) {
      hydratedRef.current = false
      return
    }

    try {
      const serialised = JSON.stringify(state)
      if (serialised === undefined) return

      if (serialised.length > MAX_PERSISTED_CHARS) {
        window.localStorage.removeItem(storageKey)
        return
      }

      window.localStorage.setItem(storageKey, serialised)
    } catch (error) {
      // Quota exceeded or storage unavailable (private mode, blocked cookies).
      // The in-memory state is still correct, so the tool keeps working.
      console.warn(`Error writing localStorage key "${storageKey}":`, error)
    }
  }, [storageKey, state])

  const setValue = useCallback((value: React.SetStateAction<T>) => {
    setState(value)
  }, [])

  return [state, setValue]
}
