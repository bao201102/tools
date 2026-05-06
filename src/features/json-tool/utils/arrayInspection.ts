export type PlainObjectRecord = Record<string, unknown>

export function isPlainObject(value: unknown): value is PlainObjectRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export type ArrayOfObjectsInspection = {
  itemCount: number
  keys: string[]
}

/** Non-empty arrays of plain objects only; `[]` and mixed arrays return `null`. */
export function inspectArrayOfObjects(parsed: unknown): ArrayOfObjectsInspection | null {
  if (!Array.isArray(parsed) || parsed.length === 0) return null
  if (!parsed.every(isPlainObject)) return null
  const keysSet = new Set<string>()
  for (const obj of parsed) {
    for (const k of Object.keys(obj)) keysSet.add(k)
  }
  return {
    itemCount: parsed.length,
    keys: [...keysSet].sort((a, b) => a.localeCompare(b)),
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
