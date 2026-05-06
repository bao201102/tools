export type PlainObjectRecord = Record<string, unknown>

export function isPlainObject(value: unknown): value is PlainObjectRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export type ArrayOfObjectsInspection = {
  itemCount: number
  keys: string[]
}

/**
 * Walk the array from index 0 onward. For each object, take `Object.keys` in order and append keys
 * the first time they appear. No sorting — first object defines the top of the list; keys that
 * only appear in later objects are appended in encounter order.
 */
function collectUniqueKeysInOrder(items: PlainObjectRecord[]): string[] {
  const ordered: string[] = []
  const seen = new Set<string>()

  for (let i = 0; i < items.length; i++) {
    for (const k of Object.keys(items[i])) {
      if (seen.has(k)) continue
      seen.add(k)
      ordered.push(k)
    }
  }
  return ordered
}

/** Non-empty arrays of plain objects only; `[]` and mixed arrays return `null`. */
export function inspectArrayOfObjects(parsed: unknown): ArrayOfObjectsInspection | null {
  if (!Array.isArray(parsed) || parsed.length === 0) return null
  if (!parsed.every(isPlainObject)) return null
  const items = parsed as PlainObjectRecord[]
  return {
    itemCount: items.length,
    keys: collectUniqueKeysInOrder(items),
  }
}

function isAbsent(value: unknown): boolean {
  return value === undefined || value === null
}

function compareValues(a: unknown, b: unknown): number {
  if (Object.is(a, b)) return 0
  const aNum = typeof a === 'number' && !Number.isNaN(a)
  const bNum = typeof b === 'number' && !Number.isNaN(b)
  if (aNum && bNum) {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

/**
 * Comparator for sorting an array of objects by field.
 * Rows with a missing/null/undefined sort key sort after rows with values (asc or desc).
 */
export function compareForJsonSort(
  dir: 'asc' | 'desc',
  key: string,
  a: PlainObjectRecord,
  b: PlainObjectRecord,
): number {
  const va = a[key]
  const vb = b[key]
  const aAbsent = isAbsent(va)
  const bAbsent = isAbsent(vb)
  if (aAbsent && bAbsent) return 0
  if (aAbsent) return 1
  if (bAbsent) return -1
  const c = compareValues(va, vb)
  if (c === 0) return 0
  return dir === 'asc' ? c : -c
}

export function sortObjectArrayByKey(
  items: PlainObjectRecord[],
  key: string,
  dir: 'asc' | 'desc',
): PlainObjectRecord[] {
  const copy = [...items]
  copy.sort((a, b) => compareForJsonSort(dir, key, a, b))
  return copy
}
