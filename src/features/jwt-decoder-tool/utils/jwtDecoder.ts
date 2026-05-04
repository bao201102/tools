export type DecodedJwt = {
  header: string
  payload: string
}

function base64UrlToUtf8(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padding = (4 - (normalized.length % 4)) % 4
  const base64 = `${normalized}${'='.repeat(padding)}`
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function decodeJwt(token: string): DecodedJwt {
  const trimmed = token.trim()
  const parts = trimmed.split('.')

  if (parts.length < 2 || !parts[0] || !parts[1]) {
    throw new Error('Invalid JWT')
  }

  try {
    const headerText = base64UrlToUtf8(parts[0])
    const payloadText = base64UrlToUtf8(parts[1])
    const headerJson = JSON.parse(headerText)
    const payloadJson = JSON.parse(payloadText)

    return {
      header: JSON.stringify(headerJson, null, 2),
      payload: JSON.stringify(payloadJson, null, 2),
    }
  } catch {
    throw new Error('Invalid JWT')
  }
}
