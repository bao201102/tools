/**
 * Pure analysis behind the JSON tool.
 *
 * Kept out of the component so the whole result can be derived with `useMemo`
 * during render instead of being pushed into a dozen pieces of state from an
 * effect — and so it can be tested without mounting anything.
 */

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export type JsonStats = {
  size: number
  keys: number
  depth: number
  objects: number
  arrays: number
}

export const EMPTY_STATS: JsonStats = { size: 0, keys: 0, depth: 0, objects: 0, arrays: 0 }

function isJsonObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function countKeys(value: JsonValue): number {
  if (Array.isArray(value)) return value.reduce<number>((n, item) => n + countKeys(item), 0)
  if (!isJsonObject(value)) return 0

  return Object.values(value).reduce<number>((n, item) => n + 1 + countKeys(item), 0)
}

/** Nesting levels: a flat object is depth 1, a scalar is depth 0. */
function countDepth(value: JsonValue): number {
  if (typeof value !== 'object' || value === null) return 0

  const children = Array.isArray(value) ? value : Object.values(value)
  return 1 + children.reduce<number>((max, item) => Math.max(max, countDepth(item)), 0)
}

type TypeCounts = { objects: number; arrays: number }

function countTypes(value: JsonValue): TypeCounts {
  const isArray = Array.isArray(value)
  if (!isArray && !isJsonObject(value)) return { objects: 0, arrays: 0 }

  const children: JsonValue[] = isArray ? value : Object.values(value)
  const total: TypeCounts = { objects: isArray ? 0 : 1, arrays: isArray ? 1 : 0 }

  for (const child of children) {
    const counts = countTypes(child)
    total.objects += counts.objects
    total.arrays += counts.arrays
  }

  return total
}

export function calculateJsonStats(json: string): JsonStats {
  try {
    const parsed = JSON.parse(json) as JsonValue
    const { objects, arrays } = countTypes(parsed)

    return {
      size: new Blob([json]).size,
      keys: countKeys(parsed),
      depth: countDepth(parsed),
      objects,
      arrays,
    }
  } catch {
    return { ...EMPTY_STATS, size: new Blob([json]).size }
  }
}

/**
 * Collect the dotted paths present in the document. Arrays are described by
 * their first element, so `items[0].id` and `items[7].id` both surface as
 * `items.id` — the field picker works on shape, not on individual indices.
 */
export function detectFields(value: JsonValue): string[] {
  const fields = new Set<string>()

  const walk = (node: JsonValue, prefix = '') => {
    if (Array.isArray(node)) {
      if (node.length > 0) walk(node[0], prefix)
      return
    }
    if (!isJsonObject(node)) return

    for (const [key, child] of Object.entries(node)) {
      const path = prefix ? `${prefix}.${key}` : key
      fields.add(path)
      walk(child, path)
    }
  }

  walk(value)
  return Array.from(fields).sort()
}

export function sortObjectKeys(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sortObjectKeys)
  if (!isJsonObject(value)) return value

  return Object.keys(value)
    .sort()
    .reduce<{ [key: string]: JsonValue }>((result, key) => {
      result[key] = sortObjectKeys(value[key])
      return result
    }, {})
}

/** A path tree: `true` marks a leaf to take wholesale. */
type PathTree = { [key: string]: PathTree | true }

function buildPathTree(paths: string[]): PathTree {
  const tree: PathTree = {}

  for (const path of paths) {
    const parts = path.split('.')
    let node = tree

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        if (!node[part]) node[part] = true
        return
      }
      if (node[part] === true || !node[part]) node[part] = {}
      node = node[part] as PathTree
    })
  }

  return tree
}

function pick(value: JsonValue, tree: PathTree | true): JsonValue {
  if (value === null || value === undefined) return value
  if (tree === true) return value

  if (Array.isArray(value)) return value.map((item) => pick(item, tree))

  if (isJsonObject(value)) {
    const result: { [key: string]: JsonValue } = {}
    for (const key of Object.keys(tree)) {
      if (value[key] !== undefined) result[key] = pick(value[key], tree[key])
    }
    return result
  }

  return value
}

/** Reduce the document to just the selected paths, keeping the original shape. */
export function extractFields(value: JsonValue, selected: Iterable<string>): JsonValue {
  const paths = Array.from(selected)

  // Drop paths already covered by a selected ancestor, or the ancestor's
  // subtree would be pruned to only the explicitly-listed descendants.
  const topLevel = paths.filter(
    (path) => !paths.some((other) => other !== path && path.startsWith(other + '.')),
  )

  return pick(value, buildPathTree(topLevel))
}

export type JsonAnalysis = {
  parsed: JsonValue | null
  formatted: string
  error: string | null
  stats: JsonStats
  fields: string[]
}

export function analyseJson(input: string): JsonAnalysis {
  if (!input.trim()) {
    return { parsed: null, formatted: '', error: null, stats: EMPTY_STATS, fields: [] }
  }

  try {
    const parsed = JSON.parse(input) as JsonValue
    const formatted = JSON.stringify(parsed, null, 2)

    return {
      parsed,
      formatted,
      error: null,
      stats: calculateJsonStats(formatted),
      fields: detectFields(parsed),
    }
  } catch (err) {
    return {
      parsed: null,
      formatted: '',
      error: err instanceof Error ? err.message : 'Invalid JSON',
      stats: { ...EMPTY_STATS, size: new Blob([input]).size },
      fields: [],
    }
  }
}
