export type AttributeStyle = 'newtonsoft' | 'systemTextJson'

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

function toPascalCase(value: string): string {
  const sanitized = value.replace(/[^a-zA-Z0-9]+/g, ' ').trim()
  if (!sanitized) return 'Value'
  const parts = sanitized.split(/\s+/)
  const merged = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
  if (/^[0-9]/.test(merged)) return `Value${merged}`
  return merged
}

function singularize(value: string): string {
  return value.endsWith('s') && value.length > 1 ? value.slice(0, -1) : value
}

function uniqueClassName(base: string, ctx: GeneratorContext): string {
  let candidate = toPascalCase(base)
  let index = 2
  while (ctx.usedClassNames.has(candidate)) {
    candidate = `${toPascalCase(base)}${index}`
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
    const propertyName = toPascalCase(rawName)
    const typeName = inferType(value, propertyName, ctx)
    classDef.properties.push({ rawName, propertyName, typeName })
  }
}

function attributeLine(rawName: string, style: AttributeStyle): string {
  if (style === 'newtonsoft') return `[JsonProperty("${rawName}")]`
  return `[JsonPropertyName("${rawName}")]`
}

function usingLine(style: AttributeStyle): string {
  if (style === 'newtonsoft') return 'using Newtonsoft.Json;'
  return 'using System.Text.Json.Serialization;'
}

export function generatePocoCode(input: string, rootClassName: string, style: AttributeStyle): string {
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    throw new Error('Invalid JSON')
  }

  if (!isPlainObject(parsed)) {
    throw new Error('Root JSON must be an object')
  }

  const rootName = toPascalCase(rootClassName || 'Root')
  const ctx: GeneratorContext = {
    classes: [],
    classesByName: new Map(),
    usedClassNames: new Set(),
  }

  ctx.usedClassNames.add(rootName)
  buildClassDefinition(parsed, rootName, ctx)

  const classBlocks = ctx.classes.map((classDef) => {
    const properties = classDef.properties
      .map(
        (prop) =>
          `    ${attributeLine(prop.rawName, style)}\n    public ${prop.typeName} ${prop.propertyName} { get; set; }`,
      )
      .join('\n\n')

    return `public class ${classDef.name}\n{\n${properties}\n}`
  })

  return `${usingLine(style)}\nusing System.Collections.Generic;\n\n${classBlocks.join('\n\n')}\n`
}
