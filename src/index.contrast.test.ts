import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Guards the colour tokens against WCAG 2.1 AA.
 *
 * The values are read straight out of index.css rather than duplicated here, so
 * changing a token without checking its contrast fails this test. Each text
 * token is checked against the *darkest* light surface / *lightest* dark
 * surface it can land on, not the best case.
 */

const css = readFileSync(join(process.cwd(), 'src', 'index.css'), 'utf-8')

const ROOT_BLOCK = css.slice(css.indexOf(':root {'), css.indexOf('.dark {'))
const DARK_BLOCK = css.slice(css.indexOf('.dark {'))

function lookup(name: string, block: string): string | null {
  const match = block.match(new RegExp(`--ds-color-${name}:\\s*(#[0-9a-fA-F]{6})`))
  return match ? match[1] : null
}

/** Mirrors the cascade: `.dark` only overrides some tokens, the rest fall through to `:root`. */
function token(name: string, scope: 'root' | 'dark'): string {
  const value =
    scope === 'dark' ? (lookup(name, DARK_BLOCK) ?? lookup(name, ROOT_BLOCK)) : lookup(name, ROOT_BLOCK)

  if (!value) throw new Error(`Token --ds-color-${name} not found`)
  return value
}

function relativeLuminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16)
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const AA_TEXT = 4.5
const AA_LARGE = 3

/*
 * surface-3 is the worst case in BOTH themes: it is the lightest surface behind
 * dark text and the lightest behind light text. surface-4 is defined but never
 * used as a background (nothing references `bg-surface-4`), so calibrating
 * against it would reject colours that no user can actually see.
 */
describe.each([
  { scope: 'root' as const, label: 'light', worstSurface: 'surface-3' },
  { scope: 'dark' as const, label: 'dark', worstSurface: 'surface-3' },
])('$label theme text tokens', ({ scope, worstSurface }) => {
  const background = token(worstSurface, scope)

  it.each(['ink', 'ink-muted', 'ink-subtle', 'ink-tertiary'])(
    '%s meets AA for body text on the worst-case surface',
    (name) => {
      const ratio = contrast(token(name, scope), background)
      expect(ratio, `${name} (${token(name, scope)}) on ${background}`).toBeGreaterThanOrEqual(
        AA_TEXT,
      )
    },
  )

  it('primary-text meets AA on surface-1', () => {
    const ratio = contrast(token('primary-text', scope), token('surface-1', scope))
    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('on-primary meets AA-large against the primary background', () => {
    // Button labels are 14px/500, so the large-text threshold is the honest bar
    // here; anything below 3:1 would be unreadable regardless.
    const ratio = contrast(token('on-primary', scope), token('primary', scope))
    expect(ratio).toBeGreaterThanOrEqual(AA_LARGE)
  })

  it('keeps a visible step between the ink levels', () => {
    const levels = ['ink', 'ink-muted', 'ink-subtle', 'ink-tertiary'].map((n) =>
      relativeLuminance(token(n, scope)),
    )
    const ascending = scope === 'root'
    for (let i = 1; i < levels.length; i++) {
      const step = ascending ? levels[i] - levels[i - 1] : levels[i - 1] - levels[i]
      expect(step, `step ${i}`).toBeGreaterThan(0)
    }
  })
})
