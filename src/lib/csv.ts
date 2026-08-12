/**
 * Shared delimited-text parsing.
 *
 * The CSV-to-JSON and Excel-to-JSON tools each carried their own copy of this
 * parser, which had already drifted — a fix applied to one did not reach the
 * other. One implementation, one set of tests.
 */

/** Split delimited text into rows of raw string fields, following RFC 4180. */
export function parseDelimitedText(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped double quote
          field += '"'
          i++ // skip next quote
        } else {
          // Closing quote
          inQuotes = false
        }
      } else {
        field += char
      }
    } else {
      // A quote only opens a quoted field at the start of that field; anywhere
      // else it is literal data (e.g. the inches mark in `size,6" pipe`).
      if (char === '"' && field === '') {
        inQuotes = true
      } else if (char === delimiter) {
        row.push(field)
        field = ''
      } else if (char === '\r' || char === '\n') {
        row.push(field)
        field = ''
        // A bare newline leaves exactly one empty field behind — that is a
        // blank line, not a record.
        const isBlankLine = row.length === 1 && row[0] === ''
        if (!isBlankLine) {
          rows.push(row)
        }
        row = []
        if (char === '\r' && nextChar === '\n') {
          i++ // skip \n
        }
      } else {
        field += char
      }
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => r.length > 0)
}

/** Coerce a raw cell into the JSON scalar it most likely represents. */
export function parseCellValue(val: string): unknown {
  const trimmed = val.trim()
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed === 'null') return null
  if (trimmed === '') return ''

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    // Leading zeros usually mean an identifier — phone number, zip, part code —
    // and turning those into numbers loses data.
    if (trimmed.length > 1 && trimmed.startsWith('0') && !trimmed.startsWith('0.')) {
      return trimmed
    }
    const num = Number(trimmed)
    if (!isNaN(num)) return num
  }

  return val
}

/** Build objects from parsed rows, using the first row as keys. */
export function rowsToObjects(rows: string[][]): Record<string, unknown>[] {
  if (rows.length === 0) return []

  const headers = rows[0].map((h) => h.trim())

  return rows.slice(1).map((row) => {
    const obj: Record<string, unknown> = {}
    headers.forEach((header, index) => {
      // Unnamed columns are dropped rather than given a placeholder key.
      if (header) obj[header] = parseCellValue(index < row.length ? row[index] : '')
    })
    return obj
  })
}

/** Quote a value for CSV output when it contains the delimiter, quotes or newlines. */
export function escapeCsvValue(val: unknown, delimiter: string): string {
  if (val === null || val === undefined) return ''
  let str = typeof val === 'object' ? JSON.stringify(val) : String(val)

  const needsQuoting =
    str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')
  if (needsQuoting) {
    str = '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}
