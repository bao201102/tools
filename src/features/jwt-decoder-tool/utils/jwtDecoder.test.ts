import { describe, expect, it } from 'vitest'
import { decodeJwt } from './jwtDecoder'

/** base64url-encode a JSON value the way a JWT issuer would. */
function segment(value: unknown): string {
  return Buffer.from(JSON.stringify(value))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function token(header: unknown, payload: unknown): string {
  return `${segment(header)}.${segment(payload)}.signature`
}

describe('decodeJwt', () => {
  it('decodes header and payload', () => {
    const decoded = decodeJwt(token({ alg: 'HS256', typ: 'JWT' }, { sub: '123', name: 'Ada' }))

    expect(JSON.parse(decoded.header)).toEqual({ alg: 'HS256', typ: 'JWT' })
    expect(JSON.parse(decoded.payload)).toEqual({ sub: '123', name: 'Ada' })
  })

  it('handles base64url padding variants', () => {
    // A payload whose base64 needs padding stripped/restored.
    const decoded = decodeJwt(token({ alg: 'none' }, { a: 1 }))
    expect(JSON.parse(decoded.payload)).toEqual({ a: 1 })
  })

  it('decodes non-ASCII claims', () => {
    const decoded = decodeJwt(token({ alg: 'HS256' }, { name: 'Nguyễn Văn A' }))
    expect(JSON.parse(decoded.payload).name).toBe('Nguyễn Văn A')
  })

  it('rejects a token without three segments', () => {
    expect(() => decodeJwt('only.two')).toThrow()
  })

  it('rejects a token whose payload is not JSON', () => {
    expect(() => decodeJwt('aaaa.bbbb.cccc')).toThrow()
  })
})
