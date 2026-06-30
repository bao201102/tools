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

/**
 * Re-indent already-valid JSON text with a 2-space indent while copying every
 * literal token (numbers, strings, `true`/`false`/`null`) **verbatim**.
 *
 * Unlike `JSON.parse` + `JSON.stringify`, this never routes numbers through the
 * JS number type, so source literals such as `0.0`, `290000.0`, or trailing
 * zeros are preserved exactly as written.
 *
 * The input is expected to be syntactically valid JSON (validate it separately
 * with `JSON.parse` first); this routine only adjusts insignificant whitespace.
 */
export function formatJsonPreservingNumbers(input: string): string {
  const INDENT = '  '
  let out = ''
  let depth = 0
  let i = 0
  const n = input.length

  const isWhitespace = (ch: string) =>
    ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r'

  while (i < n) {
    const ch = input[i]!

    // Copy string tokens (including escapes) verbatim.
    if (ch === '"') {
      out += ch
      i += 1
      while (i < n) {
        const c = input[i]!
        out += c
        if (c === '\\') {
          // Copy the escaped char too, then continue.
          if (i + 1 < n) out += input[i + 1]
          i += 2
          continue
        }
        i += 1
        if (c === '"') break
      }
      continue
    }

    if (ch === '{' || ch === '[') {
      const close = ch === '{' ? '}' : ']'
      let j = i + 1
      while (j < n && isWhitespace(input[j]!)) j += 1
      if (input[j] === close) {
        // Empty object/array stays on one line.
        out += ch + close
        i = j + 1
      } else {
        depth += 1
        out += ch + '\n' + INDENT.repeat(depth)
        i += 1
      }
      continue
    }

    if (ch === '}' || ch === ']') {
      depth -= 1
      out += '\n' + INDENT.repeat(depth) + ch
      i += 1
      continue
    }

    if (ch === ',') {
      out += ',\n' + INDENT.repeat(depth)
      i += 1
      continue
    }

    if (ch === ':') {
      out += ': '
      i += 1
      continue
    }

    if (isWhitespace(ch)) {
      // Drop insignificant whitespace; we emit our own.
      i += 1
      continue
    }

    // Number / true / false / null literal char — copy verbatim.
    out += ch
    i += 1
  }

  return out
}

/**
 * Convert a JSON payload whose quotes are *doubled* (`""`) — the form produced
 * by C# verbatim strings, SQL Server results, and Excel/CSV cells — into clean
 * structured JSON. The whole payload is usually wrapped in a single outer pair
 * of quotes too, e.g. `"{ ""key"": ""value"" }"`.
 *
 * The function is forgiving: already-clean JSON, outer-wrapped doubled JSON, and
 * unwrapped doubled JSON are all accepted. Number literals are preserved exactly
 * as written (e.g. `0.0` stays `0.0`).
 */
export function doubledQuotedPayloadToJson(
  raw: string,
): { ok: true; json: string } | { ok: false; message: string } {
  const trimmed = raw.trim()
  if (trimmed === '') return { ok: true, json: '' }

  // Candidate decodings, tried from least to most transformation so that
  // already-valid JSON (which may legitimately contain empty strings `""`) is
  // never corrupted by de-doubling.
  const candidates: string[] = [trimmed]

  const isOuterWrapped =
    trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')
  if (isOuterWrapped) {
    candidates.push(trimmed.slice(1, -1).replace(/""/g, '"'))
  }
  candidates.push(trimmed.replace(/""/g, '"'))

  let lastParseErrorMessage =
    'Could not parse the doubled-quote payload as JSON — check the quotes and try again.'

  for (const candidate of candidates) {
    try {
      // JSON.parse only validates; formatting runs on the raw text so number
      // literals keep their original form.
      const parsed = JSON.parse(candidate)
      if (isStructuralRoot(parsed)) {
        return { ok: true, json: formatJsonPreservingNumbers(candidate) }
      }
      // A bare JSON string layer (`"\"{...}\""` style) — peel it and retry.
      if (typeof parsed === 'string') {
        try {
          const inner = JSON.parse(parsed)
          if (isStructuralRoot(inner)) {
            return { ok: true, json: formatJsonPreservingNumbers(parsed) }
          }
        } catch {
          // fall through to the next candidate
        }
      }
    } catch (err) {
      lastParseErrorMessage =
        err instanceof Error ? err.message : lastParseErrorMessage
    }
  }

  return { ok: false, message: lastParseErrorMessage }
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
