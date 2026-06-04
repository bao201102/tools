import { useState, useCallback } from 'react'

export function useLocalStorageState<T>(
  key: string,
  initialValue: T | (() => T)
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const storageKey = `tools-app:${key}`

  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(storageKey)
      if (item !== null) {
        return JSON.parse(item) as T
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${storageKey}":`, error)
    }

    return initialValue instanceof Function ? initialValue() : initialValue
  })

  const setValue = useCallback((value: React.SetStateAction<T>) => {
    try {
      setState((currentValue) => {
        const newValue = value instanceof Function ? value(currentValue) : value
        window.localStorage.setItem(storageKey, JSON.stringify(newValue))
        return newValue
      })
    } catch (error) {
      console.warn(`Error setting localStorage key "${storageKey}":`, error)
    }
  }, [storageKey])

  return [state, setValue]
}
