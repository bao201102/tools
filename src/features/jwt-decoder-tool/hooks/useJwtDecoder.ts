import { useCallback, useEffect, useState } from 'react'
import { decodeJwt } from '../utils/jwtDecoder'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'

export function useJwtDecoder() {
  const [input, setInputState] = useLocalStorageState('jwt-decoder:input', '')
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

  useEffect(() => {
    applyDecode(input)
  }, [input, applyDecode])

  const clear = useCallback(() => {
    setInputState('')
  }, [setInputState])

  return {
    input,
    setInput: setInputState,
    headerOutput,
    payloadOutput,
    error,
    clear,
  }
}
