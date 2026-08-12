import { describe, expect, it } from 'vitest'
import {
  analyseJson,
  calculateJsonStats,
  detectFields,
  extractFields,
  sortObjectKeys,
  type JsonValue,
} from './jsonAnalysis'

describe('calculateJsonStats', () => {
  it('counts keys, objects and arrays', () => {
    const stats = calculateJsonStats('{"a":1,"b":{"c":2}}')
    expect(stats.keys).toBe(3)
    expect(stats.objects).toBe(2)
    expect(stats.arrays).toBe(0)
  })

  it('does not count array indices as keys', () => {
    expect(calculateJsonStats('{"items":[1,2,3]}').keys).toBe(1)
  })

  it('counts arrays including nested ones', () => {
    const stats = calculateJsonStats('{"a":[[1],[2]]}')
    expect(stats.arrays).toBe(3)
  })

  it('reports a flat object as depth 1', () => {
    expect(calculateJsonStats('{"a":1}').depth).toBe(1)
    expect(calculateJsonStats('{"a":{"b":1}}').depth).toBe(2)
    expect(calculateJsonStats('{"a":{"b":{"c":1}}}').depth).toBe(3)
  })

  it('reports byte size even for invalid JSON', () => {
    const stats = calculateJsonStats('{oops')
    expect(stats.size).toBe(5)
    expect(stats.keys).toBe(0)
  })

  it('measures size in bytes, not characters', () => {
    // "é" is two bytes in UTF-8.
    expect(calculateJsonStats('"é"').size).toBe(4)
  })
})

describe('detectFields', () => {
  it('returns sorted dotted paths', () => {
    expect(detectFields({ b: 1, a: { c: 2 } } as JsonValue)).toEqual(['a', 'a.c', 'b'])
  })

  it('describes an array by its first element', () => {
    expect(detectFields({ items: [{ id: 1, name: 'x' }] } as JsonValue)).toEqual([
      'items',
      'items.id',
      'items.name',
    ])
  })

  it('handles empty arrays and scalars', () => {
    expect(detectFields({ a: [], b: 1 } as JsonValue)).toEqual(['a', 'b'])
    expect(detectFields(42 as JsonValue)).toEqual([])
  })
})

describe('sortObjectKeys', () => {
  it('sorts keys recursively', () => {
    const sorted = sortObjectKeys({ b: 1, a: { d: 2, c: 3 } } as JsonValue)
    expect(JSON.stringify(sorted)).toBe('{"a":{"c":3,"d":2},"b":1}')
  })

  it('sorts inside array elements without reordering the array', () => {
    const sorted = sortObjectKeys([{ b: 1, a: 2 }] as JsonValue)
    expect(JSON.stringify(sorted)).toBe('[{"a":2,"b":1}]')
  })
})

describe('extractFields', () => {
  const doc = { id: 1, name: 'x', meta: { a: 1, b: 2 } } as JsonValue

  it('keeps only the selected top-level fields', () => {
    expect(extractFields(doc, ['id'])).toEqual({ id: 1 })
  })

  it('keeps a nested selection', () => {
    expect(extractFields(doc, ['meta.a'])).toEqual({ meta: { a: 1 } })
  })

  it('takes the whole subtree when a parent is selected', () => {
    // Selecting `meta` alongside `meta.a` must not prune `meta.b`.
    expect(extractFields(doc, ['meta', 'meta.a'])).toEqual({ meta: { a: 1, b: 2 } })
  })

  it('maps over arrays', () => {
    const list = { items: [{ id: 1, drop: 0 }, { id: 2, drop: 0 }] } as JsonValue
    expect(extractFields(list, ['items.id'])).toEqual({ items: [{ id: 1 }, { id: 2 }] })
  })

  it('ignores paths that are not present', () => {
    expect(extractFields(doc, ['missing'])).toEqual({})
  })
})

describe('analyseJson', () => {
  it('returns an empty result for blank input', () => {
    const result = analyseJson('   ')
    expect(result).toMatchObject({ parsed: null, formatted: '', error: null, fields: [] })
  })

  it('formats and describes valid JSON', () => {
    const result = analyseJson('{"b":1,"a":2}')
    expect(result.error).toBeNull()
    expect(result.formatted).toBe('{\n  "b": 1,\n  "a": 2\n}')
    expect(result.fields).toEqual(['a', 'b'])
  })

  it('reports a parse error without throwing', () => {
    const result = analyseJson('{"a":}')
    expect(result.error).toBeTruthy()
    expect(result.parsed).toBeNull()
    expect(result.formatted).toBe('')
    expect(result.stats.size).toBeGreaterThan(0)
  })
})
