import { describe, expect, it } from 'vitest'
import {
  computeAdaptiveEditorHeight,
  EDITOR_HEIGHT_MAX,
  EDITOR_HEIGHT_MIN,
  getMonacoPaneHeight,
} from './useAdaptiveEditorHeight'

describe('computeAdaptiveEditorHeight', () => {
  it('never returns less than the minimum height', () => {
    expect(computeAdaptiveEditorHeight([''])).toBe(EDITOR_HEIGHT_MIN)
    expect(computeAdaptiveEditorHeight(['one line'])).toBe(EDITOR_HEIGHT_MIN)
  })

  it('never returns more than the maximum height', () => {
    const long = Array.from({ length: 5000 }, (_, i) => `line ${i}`).join('\n')
    expect(computeAdaptiveEditorHeight([long])).toBe(EDITOR_HEIGHT_MAX)
  })

  it('grows with the line count between the bounds', () => {
    const short = computeAdaptiveEditorHeight([Array(25).fill('x').join('\n')])
    const longer = computeAdaptiveEditorHeight([Array(45).fill('x').join('\n')])
    expect(longer).toBeGreaterThan(short)
  })

  it('sizes to the tallest of several inputs', () => {
    const many = Array(40).fill('x').join('\n')
    expect(computeAdaptiveEditorHeight(['x', many])).toBe(computeAdaptiveEditorHeight([many]))
  })

  it('counts wrapped lines when word wrap is on', () => {
    const oneLongLine = 'x'.repeat(88 * 40)
    const wrapped = computeAdaptiveEditorHeight([oneLongLine], { wordWrap: true, charsPerLine: 88 })
    const unwrapped = computeAdaptiveEditorHeight([oneLongLine], { wordWrap: false })
    expect(wrapped).toBeGreaterThan(unwrapped)
  })
})

describe('getMonacoPaneHeight', () => {
  it('subtracts the label row', () => {
    expect(getMonacoPaneHeight(400)).toBe(360)
  })

  it('clamps to a usable minimum', () => {
    expect(getMonacoPaneHeight(0)).toBe(200)
    expect(getMonacoPaneHeight(-100)).toBe(200)
  })
})
