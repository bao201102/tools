import { describe, expect, it } from 'vitest'
import { parseCSV, parseValue } from './useCsvToJson'

describe('parseCSV', () => {
  it('splits a simple table', () => {
    expect(parseCSV('a,b\n1,2', ',')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('keeps delimiters that appear inside quoted fields', () => {
    expect(parseCSV('name,note\nBob,"hello, world"', ',')).toEqual([
      ['name', 'note'],
      ['Bob', 'hello, world'],
    ])
  })

  it('unescapes doubled quotes', () => {
    expect(parseCSV('a\n"say ""hi"""', ',')).toEqual([['a'], ['say "hi"']])
  })

  it('keeps newlines that appear inside quoted fields', () => {
    expect(parseCSV('a,b\n"line1\nline2",x', ',')).toEqual([
      ['a', 'b'],
      ['line1\nline2', 'x'],
    ])
  })

  it('treats a quote in the middle of a field as literal data', () => {
    expect(parseCSV('size\n6" pipe', ',')).toEqual([['size'], ['6" pipe']])
  })

  it('skips blank lines instead of emitting empty records', () => {
    expect(parseCSV('a,b\n\n1,2', ',')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('skips a trailing newline', () => {
    expect(parseCSV('a,b\n1,2\n', ',')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('preserves rows that are genuinely empty fields', () => {
    expect(parseCSV('a,b\n,', ',')).toEqual([
      ['a', 'b'],
      ['', ''],
    ])
  })

  it('handles CRLF line endings', () => {
    expect(parseCSV('a,b\r\n1,2', ',')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('supports a tab delimiter', () => {
    expect(parseCSV('a\tb\n1\t2', '\t')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })
})

describe('parseValue', () => {
  it('coerces booleans and null', () => {
    expect(parseValue('true')).toBe(true)
    expect(parseValue('false')).toBe(false)
    expect(parseValue('null')).toBe(null)
  })

  it('coerces numbers', () => {
    expect(parseValue('42')).toBe(42)
    expect(parseValue('-3.5')).toBe(-3.5)
  })

  it('keeps leading-zero values as strings', () => {
    // Phone numbers and zip codes must not become numbers.
    expect(parseValue('0123')).toBe('0123')
    expect(parseValue('007')).toBe('007')
  })

  it('still parses a plain zero and decimals below one', () => {
    expect(parseValue('0')).toBe(0)
    expect(parseValue('0.5')).toBe(0.5)
  })

  it('leaves ordinary text alone', () => {
    expect(parseValue('hello')).toBe('hello')
    expect(parseValue('')).toBe('')
  })
})
