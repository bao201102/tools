export const ESCAPE_EXAMPLE_INPUT =
  'Hello "World"\nThis is line 2\twith a tab\nAnd a backslash: C:\\Users\\Name'

export type EscapeStats = {
  quotes: number
  newlines: number
  tabs: number
  backslashes: number
}

export type EscapeTextOptions = {
  wrapInQuotes: boolean
  escapeUnicode: boolean
}

export function countEscapeableChars(input: string): EscapeStats {
  let quotes = 0
  let newlines = 0
  let tabs = 0
  let backslashes = 0

  for (const ch of input) {
    if (ch === '"') quotes++
    else if (ch === '\n') newlines++
    else if (ch === '\t') tabs++
    else if (ch === '\\') backslashes++
  }

  return { quotes, newlines, tabs, backslashes }
}

export function escapePlainText(input: string, options: EscapeTextOptions): string {
  let out = ''

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!

    switch (ch) {
      case '\\':
        out += '\\\\'
        break
      case '"':
        out += '\\"'
        break
      case '\n':
        out += '\\n'
        break
      case '\r':
        out += '\\r'
        break
      case '\t':
        out += '\\t'
        break
      case '\b':
        out += '\\b'
        break
      case '\f':
        out += '\\f'
        break
      default: {
        const code = ch.charCodeAt(0)
        if (options.escapeUnicode && code > 0x7f) {
          out += `\\u${code.toString(16).padStart(4, '0')}`
        } else {
          out += ch
        }
      }
    }
  }

  if (options.wrapInQuotes) {
    return `"${out}"`
  }

  return out
}
