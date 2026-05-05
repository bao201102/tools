/** Plain object `{}` produced by JSON.parse (not arrays, primitives). */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false
  if (Array.isArray(value)) return false
  return Object.getPrototypeOf(value) === Object.prototype
}

/** Only JSON arrays or plain objects `{}`. */
function isStructuralRoot(value: unknown): value is Record<string, unknown> | unknown[] {
  return Array.isArray(value) || isPlainObject(value)
}

function decodeJsonEscapeSequences(input: string): string {
  let out = ''
  let i = 0
  while (i < input.length) {
    const ch = input[i]
    if (ch !== '\\') {
      out += ch
      i += 1
      continue
    }
    i += 1
    if (i >= input.length) {
      out += '\\'
      break
    }
    const esc = input[i]
    switch (esc) {
      case '"':
        out += '"'
        i += 1
        break
      case '\\':
        out += '\\'
        i += 1
        break
      case '/':
        out += '/'
        i += 1
        break
      case 'b':
        out += '\b'
        i += 1
        break
      case 'f':
        out += '\f'
        i += 1
        break
      case 'n':
        out += '\n'
        i += 1
        break
      case 'r':
        out += '\r'
        i += 1
        break
      case 't':
        out += '\t'
        i += 1
        break
      case 'u': {
        const hex = input.slice(i + 1, i + 5)
        if (/^[a-fA-F0-9]{4}$/.test(hex)) {
          out += String.fromCharCode(Number.parseInt(hex, 16))
          i += 5
        } else {
          out += '\\u'
          i += 1
        }
        break
      }
      default:
        out += esc
        i += 1
        break
    }
  }
  return out
}

/**
 * Peel one JSON string layer wrapped in ASCII double-quotes (`"..."`),
 * returning the decoded inner string via JSON.parse semantics.
 */
function unwrapOuterQuotedString(candidate: string): string | null {
  const t = candidate.trim()
  if (t.length < 2) return null
  if (!(t.startsWith('"') && t.endsWith('"'))) return null
  try {
    const inner = JSON.parse(t)
    if (typeof inner === 'string') return inner
    return null
  } catch {
    return null
  }
}

function unwrapOneCandidateLayer(candidate: string): string | null {
  const peeled = unwrapOuterQuotedString(candidate)
  if (peeled !== null) return peeled

  const decoded = decodeJsonEscapeSequences(candidate)
  if (decoded !== candidate) return decoded
  return null
}

function describeParseReject(value: unknown): string {
  if (value === null) return 'Expected a JSON object or array at the root, got null.'
  return `Expected a JSON object or array at the root, got ${typeof value}.`
}

export function escapedPayloadToStructuredJson(
  raw: string,
): { ok: true; json: string } | { ok: false; message: string } {
  let candidate = raw.trim()
  if (candidate === '') return { ok: true, json: '' }

  let lastParseErrorMessage =
    'Could not parse the escaped payload as JSON — check quotes and escapes.'

  for (let step = 0; step < 5; step++) {
    try {
      const parsed = JSON.parse(candidate)

      if (isStructuralRoot(parsed)) {
        return { ok: true, json: JSON.stringify(parsed, null, 2) }
      }

      if (typeof parsed === 'string') {
        candidate = parsed
        continue
      }

      return { ok: false, message: describeParseReject(parsed) }
    } catch (err) {
      lastParseErrorMessage =
        err instanceof Error ? err.message : lastParseErrorMessage

      const next = unwrapOneCandidateLayer(candidate)
      if (next === null || next === candidate) {
        break
      }
      candidate = next
    }
  }

  try {
    const parsed = JSON.parse(candidate)
    if (isStructuralRoot(parsed)) {
      return { ok: true, json: JSON.stringify(parsed, null, 2) }
    }
    return { ok: false, message: describeParseReject(parsed) }
  } catch {
    return { ok: false, message: lastParseErrorMessage }
  }
}

/** Minify structural JSON root, then escape `\` and `"` for embedding in strings (e.g. C#). */
export function formattedJsonToEscapedPayload(
  raw: string,
): { ok: true; payload: string } | { ok: false; message: string } {
  const initial = raw.trim()
  if (initial === '') return { ok: true, payload: '' }

  try {
    const parsed = JSON.parse(initial)
    if (!isStructuralRoot(parsed)) {
      return { ok: false, message: describeParseReject(parsed) }
    }
    const compact = JSON.stringify(parsed)
    const escaped = compact
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
    return { ok: true, payload: escaped }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Could not parse the JSON input.',
    }
  }
}
