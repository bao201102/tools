import { useCallback, useEffect, useState } from 'react'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'

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
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mode, setModeState] = useLocalStorageState<Mode>('encoder:mode', 'base64')
  const [direction, setDirectionState] = useLocalStorageState<Direction>('encoder:direction', 'encode')

  const applyProcessing = useCallback((nextInput: string, nextMode: Mode, nextDirection: Direction) => {
    const result = processValue(nextInput, nextMode, nextDirection)
    setOutput(result.output)
    setError(result.error)
  }, [])

  useEffect(() => {
    applyProcessing(input, mode, direction)
  }, [input, mode, direction, applyProcessing])

  const clear = useCallback(() => {
    setInputState('')
    setOutput('')
    setError(null)
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
