import { useMemo } from 'react'

export const EDITOR_HEIGHT_MIN = 400
export const EDITOR_HEIGHT_MAX = 700

/** Label row + gap above Monaco inside a two-column editor grid */
export const EDITOR_GRID_CHROME_PX = 40

export function getMonacoPaneHeight(gridHeight: number): number {
  return Math.max(200, gridHeight - EDITOR_GRID_CHROME_PX)
}

const DEFAULT_LINE_HEIGHT_PX = 19
const DEFAULT_PADDING_PX = 16
const DEFAULT_CHARS_PER_LINE = 88

export type AdaptiveEditorHeightOptions = {
  wordWrap?: boolean
  lineHeightPx?: number
  paddingPx?: number
  charsPerLine?: number
}

function estimateLineCount(text: string, wordWrap: boolean, charsPerLine: number): number {
  if (!text) return 1
  const physicalLines = text.split('\n')
  if (!wordWrap) {
    return Math.max(1, physicalLines.length)
  }
  return physicalLines.reduce(
    (total, line) => total + Math.max(1, Math.ceil(line.length / charsPerLine)),
    0,
  )
}

export function computeAdaptiveEditorHeight(
  texts: string[],
  options: AdaptiveEditorHeightOptions = {},
): number {
  const wordWrap = options.wordWrap ?? true
  const lineHeightPx = options.lineHeightPx ?? DEFAULT_LINE_HEIGHT_PX
  const paddingPx = options.paddingPx ?? DEFAULT_PADDING_PX
  const charsPerLine = options.charsPerLine ?? DEFAULT_CHARS_PER_LINE

  const lines = Math.max(1, ...texts.map((text) => estimateLineCount(text, wordWrap, charsPerLine)))
  const contentHeight = paddingPx + lines * lineHeightPx
  return Math.min(EDITOR_HEIGHT_MAX, Math.max(EDITOR_HEIGHT_MIN, contentHeight))
}

export function useAdaptiveEditorHeight(
  ...texts: string[]
): number {
  return useMemo(() => computeAdaptiveEditorHeight(texts), texts)
}

export function useAdaptiveEditorHeightWithOptions(
  texts: string[],
  options: AdaptiveEditorHeightOptions,
): number {
  return useMemo(
    () => computeAdaptiveEditorHeight(texts, options),
    [...texts, options.wordWrap, options.lineHeightPx, options.paddingPx, options.charsPerLine],
  )
}
