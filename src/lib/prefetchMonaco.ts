import { loader } from '@monaco-editor/react'

// Monaco's core bundle is ~925 KB gzip and is served from /monaco/vs at runtime
// rather than being part of the app bundle. Without a prefetch, the download
// only starts when the user opens a tool page, leaving the editor blank for
// seconds on a cold cache. Warming it while the browser is idle moves that cost
// off the critical path — by the time a tool is opened, Monaco is already there.

let started = false

/** Begin loading Monaco in the background. Safe to call more than once. */
export function prefetchMonaco(): void {
  if (started) return
  started = true

  const run = () => {
    loader.init().catch(() => {
      // Prefetch is best-effort; the editor will load normally on demand.
      started = false
    })
  }

  const idle = window.requestIdleCallback as typeof window.requestIdleCallback | undefined
  if (idle) {
    idle(run, { timeout: 3000 })
  } else {
    window.setTimeout(run, 1500)
  }
}

/**
 * Prefetch only when the connection can afford it. Skips slow (2g/3g) links and
 * respects the browser's data-saver setting.
 */
export function prefetchMonacoWhenIdle(): void {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string }
    }
  ).connection

  if (connection?.saveData) return
  if (connection?.effectiveType && /(^|-)2g$|^slow-2g$|^3g$/.test(connection.effectiveType)) return

  prefetchMonaco()
}
