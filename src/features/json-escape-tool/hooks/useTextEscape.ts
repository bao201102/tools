import { useCallback, useMemo, useState } from 'react'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useDebouncedValue } from '../../../lib/useDebouncedValue'
import {
  countEscapeableChars,
  escapePlainText,
  ESCAPE_EXAMPLE_INPUT,
  type EscapeStats,
  type EscapeTextOptions,
} from '../utils/textEscape'

function computeEscapeState(input: string, options: EscapeTextOptions) {
  if (!input) {
    return { output: '', stats: null as EscapeStats | null }
  }
  return {
    output: escapePlainText(input, options),
    stats: countEscapeableChars(input),
  }
}

function initialEscapeOptions(): EscapeTextOptions {
  return { wrapInQuotes: true, escapeUnicode: false }
}

function initialState() {
  const options = initialEscapeOptions()
  const { output, stats } = computeEscapeState(ESCAPE_EXAMPLE_INPUT, options)
  return {
    input: ESCAPE_EXAMPLE_INPUT,
    output,
    stats,
    wrapInQuotes: options.wrapInQuotes,
    escapeUnicode: options.escapeUnicode,
  }
}

const INITIAL_ESCAPE_STATE = initialState()

export function useTextEscape() {
  const [input, setInput] = useLocalStorageState('json-escape:input', INITIAL_ESCAPE_STATE.input)
  const [wrapInQuotes, setWrapInQuotes] = useLocalStorageState('json-escape:wrapInQuotes', INITIAL_ESCAPE_STATE.wrapInQuotes)
  const [escapeUnicode, setEscapeUnicode] = useLocalStorageState('json-escape:escapeUnicode', INITIAL_ESCAPE_STATE.escapeUnicode)
  const debouncedInput = useDebouncedValue(input)

  // The Escape button skips the debounce. Storing the value it was pressed on
  // (rather than a flag) means the next keystroke makes it stale on its own,
  // and the live preview takes over again — no effect needed to reset it.
  const [escapedNow, setEscapedNow] = useState<string | null>(null)
  const source = escapedNow === input ? input : debouncedInput

  const { output, stats } = useMemo(
    () => computeEscapeState(source, { wrapInQuotes, escapeUnicode }),
    [source, wrapInQuotes, escapeUnicode],
  )

  const escape = useCallback(() => {
    setEscapedNow(input)
  }, [input])

  const clear = useCallback(() => {
    setInput('')
  }, [setInput])

  return {
    input,
    setInput,
    output,
    wrapInQuotes,
    setWrapInQuotes,
    escapeUnicode,
    setEscapeUnicode,
    stats,
    escape,
    clear,
  }
}
