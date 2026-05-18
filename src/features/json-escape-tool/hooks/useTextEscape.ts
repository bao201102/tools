import { useCallback, useState } from 'react'
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
  const [input, setInput] = useState(INITIAL_ESCAPE_STATE.input)
  const [output, setOutput] = useState(INITIAL_ESCAPE_STATE.output)
  const [wrapInQuotes, setWrapInQuotes] = useState(INITIAL_ESCAPE_STATE.wrapInQuotes)
  const [escapeUnicode, setEscapeUnicode] = useState(INITIAL_ESCAPE_STATE.escapeUnicode)
  const [stats, setStats] = useState<EscapeStats | null>(INITIAL_ESCAPE_STATE.stats)

  const escape = useCallback(() => {
    const options = { wrapInQuotes, escapeUnicode }
    const { output: nextOutput, stats: nextStats } = computeEscapeState(input, options)
    setOutput(nextOutput)
    setStats(nextStats)
  }, [input, wrapInQuotes, escapeUnicode])

  const clear = useCallback(() => {
    setInput('')
    setOutput('')
    setStats(null)
  }, [])

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
