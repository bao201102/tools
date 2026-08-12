import { useCallback, useMemo } from 'react'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useDebouncedValue } from '../../../lib/useDebouncedValue'

type Mode = 'base64' | 'url'
type Direction = 'encode' | 'decode'

function toUtf8Base64(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function fromUtf8Base64(value: string): string {
  const binary = atob(value)
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function processValue(input: string, mode: Mode, direction: Direction): { output: string; error: string | null } {
  if (input === '') {
    return { output: '', error: null }
  }

  try {
    if (mode === 'base64' && direction === 'encode') {
      return { output: toUtf8Base64(input), error: null }
    }
    if (mode === 'base64' && direction === 'decode') {
      return { output: fromUtf8Base64(input), error: null }
    }
    if (mode === 'url' && direction === 'encode') {
      return { output: encodeURIComponent(input), error: null }
    }
    return { output: decodeURIComponent(input), error: null }
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Unable to process input',
    }
  }
}

export function useEncoder() {
  const [input, setInputState] = useLocalStorageState('encoder:input', '')
  const [mode, setModeState] = useLocalStorageState<Mode>('encoder:mode', 'base64')
  const [direction, setDirectionState] = useLocalStorageState<Direction>(
    'encoder:direction',
    'encode',
  )
  const debouncedInput = useDebouncedValue(input)

  const { output, error } = useMemo(
    () => processValue(debouncedInput, mode, direction),
    [debouncedInput, mode, direction],
  )

  const clear = useCallback(() => {
    setInputState('')
  }, [setInputState])

  const swap = useCallback(() => {
    const nextInput = output
    const nextDirection: Direction = direction === 'encode' ? 'decode' : 'encode'
    setInputState(nextInput)
    setDirectionState(nextDirection)
  }, [direction, output, setInputState, setDirectionState])

  return {
    input,
    output,
    error,
    mode,
    direction,
    setInput: setInputState,
    setMode: setModeState,
    setDirection: setDirectionState,
    clear,
    swap,
  }
}
