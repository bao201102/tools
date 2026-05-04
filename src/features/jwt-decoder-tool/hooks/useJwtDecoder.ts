import { useCallback, useState } from 'react'
import { decodeJwt } from '../utils/jwtDecoder'

export function useJwtDecoder() {
  const [input, setInputState] = useState('')
  const [headerOutput, setHeaderOutput] = useState('')
  const [payloadOutput, setPayloadOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const applyDecode = useCallback((value: string) => {
    if (value.trim() === '') {
      setHeaderOutput('')
      setPayloadOutput('')
      setError(null)
      return
    }

    try {
      const decoded = decodeJwt(value)
      setHeaderOutput(decoded.header)
      setPayloadOutput(decoded.payload)
      setError(null)
    } catch {
      setHeaderOutput('')
      setPayloadOutput('')
      setError('Invalid JWT')
    }
  }, [])

  const setInput = useCallback(
    (value: string) => {
      setInputState(value)
      applyDecode(value)
    },
    [applyDecode],
  )

  const clear = useCallback(() => {
    setInput('')
    setHeaderOutput('')
    setPayloadOutput('')
    setError(null)
  }, [])

  return {
    input,
    setInput,
    headerOutput,
    payloadOutput,
    error,
    clear,
  }
}
