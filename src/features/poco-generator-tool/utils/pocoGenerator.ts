type ClassProperty = {
  rawName: string
  propertyName: string
  typeName: string
}

type ClassDef = {
  name: string
  properties: ClassProperty[]
}

type GeneratorContext = {
  classes: ClassDef[]
  classesByName: Map<string, ClassDef>
  usedClassNames: Set<string>
}

/** Simple identifier: one token, valid as a C# identifier (no separators like `-`, `.`, spaces). */
const SIMPLE_CSHARP_ID = /^[a-zA-Z_][a-zA-Z0-9_]*$/

function escapeForCSharpString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

/**
 * Add [JsonPropertyName] only when the JSON key can't be reflected as-is on the POCO member name.
 * — Key is not a simple C# identifier (e.g. contains `-`, `.`, unicode idiosyncrasies trimmed away), or
 * — Mapped property name differs from the raw JSON key (e.g. camelCase vs PascalCase, snake-case merge).
 */
function needsJsonPropertyName(rawName: string, propertyName: string): boolean {
  const trimmed = rawName.trim()
  if (!trimmed) return true
  if (!SIMPLE_CSHARP_ID.test(trimmed)) return true
  return trimmed !== propertyName
}

function anyPropertyNeedsAttribute(classes: ClassDef[]): boolean {
  for (const classDef of classes) {
    for (const prop of classDef.properties) {
      if (needsJsonPropertyName(prop.rawName, prop.propertyName)) return true
    }
  }
  return false
}

/**
 * Map a JSON property name to a C# member name.
 * Preserves acronym / mixed casing when the key is already a single identifier (e.g. CCServiceID).
 * For keys with separators (snake_case, kebab, spaces), merges segments with "first char upper, rest unchanged" each.
 */
function jsonKeyToCSharpIdentifier(rawName: string): string {
  const trimmed = rawName.trim()
  if (!trimmed) return 'Value'

  if (/^[0-9]/.test(trimmed)) {
    return `_${trimmed}`
  }

  if (SIMPLE_CSHARP_ID.test(trimmed)) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
  }

  const sanitized = trimmed.replace(/[^a-zA-Z0-9]+/g, ' ').trim()
  if (!sanitized) return 'Value'
  const parts = sanitized.split(/\s+/).filter(Boolean)
  const merged = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('')
  if (/^[0-9]/.test(merged)) return `Value${merged}`
  return merged
}

function singularize(value: string): string {
  return value.endsWith('s') && value.length > 1 ? value.slice(0, -1) : value
}

function uniqueClassName(base: string, ctx: GeneratorContext): string {
  let candidate = jsonKeyToCSharpIdentifier(base)
  let index = 2
  while (ctx.usedClassNames.has(candidate)) {
    candidate = `${jsonKeyToCSharpIdentifier(base)}${index}`
    index += 1
  }
  ctx.usedClassNames.add(candidate)
  return candidate
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function inferPrimitiveType(value: unknown): string {
  if (typeof value === 'string') return 'string'
  if (typeof value === 'boolean') return 'bool'
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return 'double'
    return Number.isInteger(value) ? (Math.abs(value) > 2147483647 ? 'long' : 'int') : 'double'
  }
  if (value === null) return 'object?'
  return 'object'
}

function mergeArrayTypes(typeNames: string[]): string {
  const unique = [...new Set(typeNames)]
  if (unique.length === 0) return 'object'
  if (unique.length === 1) return unique[0]
  if (unique.every((typeName) => ['int', 'long', 'double'].includes(typeName))) return 'double'
  return 'object'
}

function inferType(value: unknown, keyName: string, ctx: GeneratorContext): string {
  if (Array.isArray(value)) {
    const nonNullItems = value.filter((item) => item !== null)
    if (nonNullItems.length === 0) return 'List<object>'

    const itemTypes = nonNullItems.map((item) => {
      if (isPlainObject(item)) {
        const childName = uniqueClassName(singularize(keyName), ctx)
        buildClassDefinition(item, childName, ctx)
        return childName
      }
      return inferPrimitiveType(item)
    })

    return `List<${mergeArrayTypes(itemTypes)}>`
  }

  if (isPlainObject(value)) {
    const childName = uniqueClassName(keyName, ctx)
    buildClassDefinition(value, childName, ctx)
    return childName
  }

  return inferPrimitiveType(value)
}

function buildClassDefinition(source: Record<string, unknown>, className: string, ctx: GeneratorContext): void {
  if (ctx.classesByName.has(className)) return

  const classDef: ClassDef = { name: className, properties: [] }
  ctx.classesByName.set(className, classDef)
  ctx.classes.push(classDef)

  for (const [rawName, value] of Object.entries(source)) {
    const propertyName = jsonKeyToCSharpIdentifier(rawName)
    const typeName = inferType(value, propertyName, ctx)
    classDef.properties.push({ rawName, propertyName, typeName })
  }
}

function formatProperty(rawName: string, propertyName: string, typeName: string): string {
  const body = `public ${typeName} ${propertyName} { get; set; }`
  if (!needsJsonPropertyName(rawName, propertyName)) return `    ${body}`
  const keyLiteral = escapeForCSharpString(rawName)
  return `    [JsonPropertyName("${keyLiteral}")]\n    ${body}`
}

export function generatePocoCode(input: string, rootClassName: string): string {
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    throw new Error('Invalid JSON')
  }

  if (!isPlainObject(parsed)) {
    throw new Error('Root JSON must be an object')
  }

  const rootName = jsonKeyToCSharpIdentifier(rootClassName || 'Root')
  const ctx: GeneratorContext = {
    classes: [],
    classesByName: new Map(),
    usedClassNames: new Set(),
  }

  ctx.usedClassNames.add(rootName)
  buildClassDefinition(parsed, rootName, ctx)

  const serializationUsing = anyPropertyNeedsAttribute(ctx.classes)
    ? 'using System.Text.Json.Serialization;\n'
    : ''

  const classBlocks = ctx.classes.map((classDef) => {
    const properties = classDef.properties
      .map((prop) => formatProperty(prop.rawName, prop.propertyName, prop.typeName))
      .join('\n')

    return `public class ${classDef.name}\n{\n${properties}\n}`
  })

  return `${serializationUsing}using System.Collections.Generic;\n\n${classBlocks.join('\n\n')}\n`
}
