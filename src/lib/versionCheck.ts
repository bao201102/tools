// Client-side version watcher: polls /version.json and exposes a pub/sub flag
// when a newer build is detected. Reloading is the consumer's responsibility
// (e.g. trigger on route change, or ask the user via UI) so that in-progress
// data on the current page is never lost silently.

const DEFAULT_POLL_INTERVAL_MS = 3 * 60 * 1000

let baselineVersion: string | null = null
let updateAvailable = false
let started = false
const listeners = new Set<() => void>()

async function fetchVersion(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { version?: unknown }
    return typeof data.version === 'string' ? data.version : null
  } catch {
    return null
  }
}

function notify() {
  for (const l of listeners) l()
}

async function check() {
  const v = await fetchVersion()
  if (v == null) return
  if (baselineVersion == null) {
    baselineVersion = v
    return
  }
  if (v !== baselineVersion && !updateAvailable) {
    updateAvailable = true
    notify()
  }
}

function onVisibilityChange() {
  // Browsers throttle timers in hidden tabs; re-check on return so we don't
  // miss a deploy that happened while the tab was backgrounded.
  if (document.visibilityState === 'visible') {
    void check()
  }
}

export function startVersionCheck(intervalMs: number = DEFAULT_POLL_INTERVAL_MS) {
  if (started) return
  started = true

  void check()
  window.setInterval(() => {
    void check()
  }, intervalMs)
  document.addEventListener('visibilitychange', onVisibilityChange)
}

export function isUpdateAvailable(): boolean {
  return updateAvailable
}

export function subscribeToUpdates(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function reloadForUpdate(): void {
  window.location.reload()
}
