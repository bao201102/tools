import { useCallback, useRef, useState } from 'react'
import { escapedPayloadToStructuredJson, formattedJsonToEscapedPayload } from '../utils/jsonStringEscape'

export type EscapeActivePane = 'escaped' | 'formatted'

/** Prefix shown in derived pane when conversion fails. */
export const ERROR_PANEL_PREFIX = 'Error:\n'

export function useJsonEscape() {
  const [escaped, setEscapedState] = useState('')
  const [formatted, setFormattedState] = useState('')
  const activePaneRef = useRef<EscapeActivePane>('escaped')
  const suppressEscaped = useRef(false)
  const suppressFormatted = useRef(false)

  const setActivePane = useCallback((pane: EscapeActivePane) => {
    activePaneRef.current = pane
  }, [])

  const pushDerivedEscaped = useCallback((value: string) => {
    suppressEscaped.current = true
    setEscapedState(value)
    queueMicrotask(() => {
      suppressEscaped.current = false
    })
  }, [])

  const pushDerivedFormatted = useCallback((value: string) => {
    suppressFormatted.current = true
    setFormattedState(value)
    queueMicrotask(() => {
      suppressFormatted.current = false
    })
  }, [])

  /** Update formatted pane while user edits escaped text. */
  const propagateFromEscaped = useCallback(
    (value: string) => {
      if (value.trim() === '') {
        pushDerivedFormatted('')
        return
      }
      const result = escapedPayloadToStructuredJson(value)
      if (result.ok) {
        pushDerivedFormatted(result.json === '' ? '' : result.json)
      } else {
        pushDerivedFormatted(`${ERROR_PANEL_PREFIX}${result.message}`)
      }
    },
    [pushDerivedFormatted],
  )

  /** Update escaped pane while user edits formatted JSON. */
  const propagateFromFormatted = useCallback(
    (value: string) => {
      if (value.trim() === '') {
        pushDerivedEscaped('')
        return
      }
      const result = formattedJsonToEscapedPayload(value)
      if (result.ok) {
        pushDerivedEscaped(result.payload === '' ? '' : result.payload)
      } else {
        pushDerivedEscaped(`${ERROR_PANEL_PREFIX}${result.message}`)
      }
    },
    [pushDerivedEscaped],
  )

  const setEscapedFromUser = useCallback(
    (value: string) => {
      if (suppressEscaped.current) return
      if (activePaneRef.current !== 'escaped') return
      setEscapedState(value)
      propagateFromEscaped(value)
    },
    [propagateFromEscaped],
  )

  const setFormattedFromUser = useCallback(
    (value: string) => {
      if (suppressFormatted.current) return
      if (activePaneRef.current !== 'formatted') return
      setFormattedState(value)
      propagateFromFormatted(value)
    },
    [propagateFromFormatted],
  )

  const clear = useCallback(() => {
    setEscapedState('')
    setFormattedState('')
  }, [])

  const swap = useCallback(() => {
    const prevE = escaped
    const prevF = formatted

    suppressEscaped.current = true
    suppressFormatted.current = true

    setEscapedState(prevF)
    setFormattedState(prevE)

    queueMicrotask(() => {
      suppressEscaped.current = false
      suppressFormatted.current = false
      if (activePaneRef.current === 'escaped') {
        propagateFromEscaped(prevF)
      } else {
        propagateFromFormatted(prevE)
      }
    })
  }, [escaped, formatted, propagateFromEscaped, propagateFromFormatted])

  return {
    escaped,
    formatted,
    setActivePane,
    setEscapedFromUser,
    setFormattedFromUser,
    clear,
    swap,
  }
}
