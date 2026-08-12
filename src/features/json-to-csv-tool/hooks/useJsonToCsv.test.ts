import { describe, expect, it } from 'vitest'
import { escapeCSVValue } from './useJsonToCsv'

describe('escapeCSVValue', () => {
  it('leaves plain values untouched', () => {
    expect(escapeCSVValue('hello', ',')).toBe('hello')
    expect(escapeCSVValue(42, ',')).toBe('42')
    expect(escapeCSVValue(true, ',')).toBe('true')
  })

  it('renders null and undefined as empty', () => {
    expect(escapeCSVValue(null, ',')).toBe('')
    expect(escapeCSVValue(undefined, ',')).toBe('')
  })

  it('quotes values containing the delimiter', () => {
    expect(escapeCSVValue('a,b', ',')).toBe('"a,b"')
    expect(escapeCSVValue('a;b', ';')).toBe('"a;b"')
  })

  it('does not quote a character that is not the active delimiter', () => {
    expect(escapeCSVValue('a;b', ',')).toBe('a;b')
  })

  it('doubles embedded quotes and wraps the value', () => {
    expect(escapeCSVValue('say "hi"', ',')).toBe('"say ""hi"""')
  })

  it('quotes values containing newlines', () => {
    expect(escapeCSVValue('line1\nline2', ',')).toBe('"line1\nline2"')
    expect(escapeCSVValue('line1\r\nline2', ',')).toBe('"line1\r\nline2"')
  })

  it('serialises objects as JSON, quoted because JSON contains quotes', () => {
    expect(escapeCSVValue({ a: 1 }, ';')).toBe('"{""a"":1}"')
    expect(escapeCSVValue({ a: 1, b: 2 }, ',')).toBe('"{""a"":1,""b"":2}"')
  })

  it('serialises a quote-free array without wrapping it', () => {
    expect(escapeCSVValue([1, 2], ';')).toBe('[1,2]')
  })

  it('quotes an array once the delimiter appears in it', () => {
    expect(escapeCSVValue([1, 2], ',')).toBe('"[1,2]"')
  })
})
