import { useCallback, useEffect, useState } from 'react'
import { decodeJwt } from '../utils/jwtDecoder'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'

export type JwtTokenInfo = {
  exp?: number
  iat?: number
  nbf?: number
  isExpired?: boolean
  expiresAt?: Date
  issuedAt?: Date
  notBefore?: Date
}

export function useJwtDecoder() {
  const [input, setInputState] = useLocalStorageState('jwt-decoder:input', '')
  const [headerOutput, setHeaderOutput] = useState('')
  const [payloadOutput, setPayloadOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [tokenInfo, setTokenInfo] = useState<JwtTokenInfo | null>(null)

  const applyDecode = useCallback((value: string) => {
    if (value.trim() === '') {
      setHeaderOutput('')
      setPayloadOutput('')
      setError(null)
      setTokenInfo(null)
      return
    }

    try {
      const decoded = decodeJwt(value)
      setHeaderOutput(decoded.header)
      setPayloadOutput(decoded.payload)
      setError(null)

      // Extract token timing info from payload
      try {
        const parsed = JSON.parse(decoded.payload)
        const info: JwtTokenInfo = {}
        if (typeof parsed.exp === 'number') {
          info.exp = parsed.exp
          info.expiresAt = new Date(parsed.exp * 1000)
          info.isExpired = Date.now() > parsed.exp * 1000
        }
        if (typeof parsed.iat === 'number') {
          info.iat = parsed.iat
          info.issuedAt = new Date(parsed.iat * 1000)
        }
        if (typeof parsed.nbf === 'number') {
          info.nbf = parsed.nbf
          info.notBefore = new Date(parsed.nbf * 1000)
        }
        setTokenInfo(Object.keys(info).length > 0 ? info : null)
      } catch {
        setTokenInfo(null)
      }
    } catch {
      setHeaderOutput('')
      setPayloadOutput('')
      setError('Invalid JWT')
      setTokenInfo(null)
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
    tokenInfo,
    clear,
  }
}
