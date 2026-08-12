/**
 * Registers the service worker that makes the tools usable offline.
 *
 * Deliberately does *not* call skipWaiting / auto-reload: `versionCheck.ts`
 * already owns the update story (poll /version.json, show a banner, reload on
 * the next route change). A worker that swapped assets under a running page
 * would race that, and could drop whatever the user had typed into an editor.
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Service worker registration failed:', error)
    })
  })
}
