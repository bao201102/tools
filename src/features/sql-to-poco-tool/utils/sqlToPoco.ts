type ParsedColumn = {
  rawName: string
  propertyName: string
  csharpType: string
}

const TYPE_MAP: Array<{ pattern: RegExp; csharp: string }> = [
  { pattern: /^(bigint|bigserial)$/i, csharp: 'long' },
  { pattern: /^(int|integer|serial)$/i, csharp: 'int' },
  { pattern: /^(smallint|smallserial)$/i, csharp: 'short' },
  { pattern: /^(tinyint)$/i, csharp: 'byte' },
  { pattern: /^(bit|boolean|bool)$/i, csharp: 'bool' },
  { pattern: /^(decimal|numeric|money|smallmoney)$/i, csharp: 'decimal' },
  { pattern: /^(float|double precision)$/i, csharp: 'double' },
  { pattern: /^(real)$/i, csharp: 'float' },
  { pattern: /^(date|datetime|datetime2|smalldatetime|timestamp|timestamp without time zone|timestamp with time zone)$/i, csharp: 'DateTime' },
  { pattern: /^(time|time without time zone|time with time zone)$/i, csharp: 'TimeSpan' },
  { pattern: /^(uniqueidentifier|uuid)$/i, csharp: 'Guid' },
  { pattern: /^(char|nchar|varchar|nvarchar|text|ntext|citext|character varying|character)$/i, csharp: 'string' },
  { pattern: /^(binary|varbinary|bytea|image)$/i, csharp: 'byte[]' },
]

function stripSqlComments(input: string): string {
  const withoutBlock = input.replace(/\/\*[\s\S]*?\*\//g, '')
  return withoutBlock.replace(/--.*$/gm, '')
}

function splitTableIdentifier(raw: string): { schema?: string; table: string } {
  const parts = raw
    .split('.')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/^\[|\]$/g, '').replace(/^"|"$/g, '').replace(/^`|`$/g, ''))
  if (parts.length === 0) {
    return { table: 'Table' }
  }
  if (parts.length === 1) {
    return { table: parts[0] }
  }
  return { schema: parts[parts.length - 2], table: parts[parts.length - 1] }
}

function findMatchingParen(text: string, openIndex: number): number {
  let depth = 0
  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i]
    if (ch === '(') depth += 1
    if (ch === ')') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

function splitTopLevelByComma(text: string): string[] {
  const parts: string[] = []
  let start = 0
  let depth = 0
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (ch === '(') depth += 1
    if (ch === ')') depth = Math.max(0, depth - 1)
    if (ch === ',' && depth === 0) {
      parts.push(text.slice(start, i).trim())
      start = i + 1
    }
  }
  const tail = text.slice(start).trim()
  if (tail) parts.push(tail)
  return parts
}

function normalizeInnerWhitespace(text: string): string {
  return text
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function toPascalCase(value: string): string {
  const normalized = value
    .replace(/^\[|\]$/g, '')
    .replace(/^"|"$/g, '')
    .replace(/^`|`$/g, '')
    .trim()
  if (!normalized) return 'Value'
  const parts = normalized.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean)
  const merged = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('')
  if (!merged) return 'Value'
  return /^[0-9]/.test(merged) ? `_${merged}` : merged
}

function normalizeSqlType(typeText: string): string {
  return typeText
    .replace(/\([^)]+\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function mapSqlTypeToCSharp(sqlType: string): string {
  const normalized = normalizeSqlType(sqlType)
  for (const entry of TYPE_MAP) {
    if (entry.pattern.test(normalized)) return entry.csharp
  }
  return 'string'
}

function isTableConstraint(def: string): boolean {
  return /^(constraint|primary\s+key|foreign\s+key|unique|check|index)\b/i.test(def.trim())
}

function parseColumn(definition: string): ParsedColumn | null {
  const trimmed = normalizeInnerWhitespace(definition)
  if (!trimmed || isTableConstraint(trimmed)) return null

  const match = trimmed.match(/^(\[[^\]]+\]|"[^"]+"|`[^`]+`|[a-zA-Z_][a-zA-Z0-9_$]*)([\s\S]*)$/)
  if (!match) return null
  const rawName = match[1]
  const rest = normalizeInnerWhitespace(match[2] ?? '')
  if (!rest) return null

  const nullable = !/\bNOT\s+NULL\b/i.test(rest) && !/\bPRIMARY\s+KEY\b/i.test(rest)

  let cleaned = rest
    // Requested hard cleanup rules for SQL Server-style inline column constraints.
    .replace(/\bIDENTITY(?:\(\d+\s*,\s*\d+\))?\b/gi, '')
    .replace(/\bCONSTRAINT\s+\w+\s+PRIMARY\s+KEY\b/gi, '')
    .replace(/\bCONSTRAINT\s+\w+\s+DEFAULT\s+[^,]+/gi, '')
    .replace(/\bPRIMARY\s+KEY\b/gi, '')
    // Keep broader support for bracket/quoted constraint names and generic defaults.
    .replace(/\bCONSTRAINT\s+[\[\]"`a-zA-Z0-9_.]+\s+PRIMARY\s+KEY\b/gi, '')
    .replace(
      /\bCONSTRAINT\s+[\[\]"`a-zA-Z0-9_.]+\s+DEFAULT\s+(?:\([^)]*\)|N?'[^']*'|"[^"]*"|`[^`]*`|[^\s,]+)/gi,
      ' ',
    )
    // Remove standalone DEFAULT expressions when present inline.
    .replace(/\bDEFAULT\s+(?:\([^)]*\)|N?'[^']*'|"[^"]*"|`[^`]*`|[^\s,]+)/gi, ' ')
    // Remove remaining trailing keywords that are not part of SQL type name.
    .replace(/\b(?:NOT\s+NULL|NULL|UNIQUE|REFERENCES|CHECK|COLLATE|GENERATED|ALWAYS|BY|AS|STORED|VIRTUAL)\b.*/gi, ' ')

  cleaned = normalizeInnerWhitespace(cleaned)

  // After cleanup, this should be shape: "<type> [optional extras removed]"
  const typeMatch = cleaned.match(
    /^([a-zA-Z]+(?:\s+[a-zA-Z]+)?(?:\s*\([^)]+\))?)/i,
  )
  const sqlType = (typeMatch?.[1] ?? '').trim()
  if (!sqlType) return null
  let csharpType = mapSqlTypeToCSharp(sqlType)

  if (nullable && csharpType !== 'string' && csharpType !== 'byte[]' && !csharpType.endsWith('?')) {
    csharpType = `${csharpType}?`
  }

  return {
    rawName: rawName.replace(/^\[|\]$/g, '').replace(/^"|"$/g, '').replace(/^`|`$/g, ''),
    propertyName: toPascalCase(rawName),
    csharpType,
  }
}

function parseCreateTable(sqlInput: string): { tableName: string; columns: ParsedColumn[] } {
  const sql = stripSqlComments(sqlInput).trim()
  const tableMatch = sql.match(/create\s+table\s+(?:if\s+not\s+exists\s+)?([^\s(]+)\s*\(/i)
  if (!tableMatch) {
    throw new Error('Could not find a valid CREATE TABLE statement.')
  }

  const identifier = splitTableIdentifier(tableMatch[1])
  const tableName = toPascalCase(identifier.table)

  const openParen = sql.indexOf('(', tableMatch.index)
  if (openParen < 0) throw new Error('CREATE TABLE is missing column definitions.')
  const closeParen = findMatchingParen(sql, openParen)
  if (closeParen < 0) throw new Error('Could not parse CREATE TABLE column block.')

  const inside = normalizeInnerWhitespace(sql.slice(openParen + 1, closeParen))
  const parts = splitTopLevelByComma(inside)
  const columns = parts.map(parseColumn).filter((c): c is ParsedColumn => c !== null)
  if (columns.length === 0) {
    throw new Error('No columns were parsed from CREATE TABLE.')
  }

  return { tableName, columns }
}

export function generateSqlToPoco(sqlInput: string, classNameOverride: string): string {
  const trimmed = sqlInput.trim()
  if (!trimmed) return ''

  const parsed = parseCreateTable(trimmed)
  const className = toPascalCase(classNameOverride.trim() || parsed.tableName)
  const properties = parsed.columns
    .map((col) => `    public ${col.csharpType} ${col.propertyName} { get; set; }`)
    .join('\n')

  return `public class ${className}\n{\n${properties}\n}\n`
}
