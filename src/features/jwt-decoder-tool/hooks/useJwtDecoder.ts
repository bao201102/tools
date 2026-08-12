import { useCallback, useMemo } from 'react'
import { decodeJwt } from '../utils/jwtDecoder'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useDebouncedValue } from '../../../lib/useDebouncedValue'

export type JwtTokenInfo = {
  exp?: number
  iat?: number
  nbf?: number
  isExpired?: boolean
  expiresAt?: Date
  issuedAt?: Date
  notBefore?: Date
}

type JwtDecodeResult = {
  headerOutput: string
  payloadOutput: string
  error: string | null
  tokenInfo: JwtTokenInfo | null
}

const EMPTY: JwtDecodeResult = {
  headerOutput: '',
  payloadOutput: '',
  error: null,
  tokenInfo: null,
}

/** Pull the registered timing claims out of a decoded payload, ignoring anything malformed. */
function readTokenInfo(payload: string): JwtTokenInfo | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(payload)
  } catch {
    return null
  }

  if (typeof parsed !== 'object' || parsed === null) return null
  const claims = parsed as Record<string, unknown>
  const info: JwtTokenInfo = {}

  if (typeof claims.exp === 'number') {
    info.exp = claims.exp
    info.expiresAt = new Date(claims.exp * 1000)
    info.isExpired = Date.now() > claims.exp * 1000
  }
  if (typeof claims.iat === 'number') {
    info.iat = claims.iat
    info.issuedAt = new Date(claims.iat * 1000)
  }
  if (typeof claims.nbf === 'number') {
    info.nbf = claims.nbf
    info.notBefore = new Date(claims.nbf * 1000)
  }

  return Object.keys(info).length > 0 ? info : null
}

export function decodeToken(value: string): JwtDecodeResult {
  if (value.trim() === '') return EMPTY

  try {
    const decoded = decodeJwt(value)
    return {
      headerOutput: decoded.header,
      payloadOutput: decoded.payload,
      error: null,
      tokenInfo: readTokenInfo(decoded.payload),
    }
  } catch {
    return { ...EMPTY, error: 'Invalid JWT' }
  }
}

export function useJwtDecoder() {
  const [input, setInputState] = useLocalStorageState('jwt-decoder:input', '')
  const debouncedInput = useDebouncedValue(input)

  const { headerOutput, payloadOutput, error, tokenInfo } = useMemo(
    () => decodeToken(debouncedInput),
    [debouncedInput],
  )

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
