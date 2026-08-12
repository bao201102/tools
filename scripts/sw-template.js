/*
 * Service worker for NUB Portal.
 *
 * The tools already run entirely client-side, so the only thing standing
 * between the app and full offline use is the network fetch for its own
 * assets. The big one is Monaco: ~925 KB gzip pulled from /monaco/vs on every
 * cold visit. Caching it turns the second visit into an instant load.
 *
 * `__BUILD_VERSION__` is stamped in by scripts/build-sw.js at build time, so a
 * new deploy gets a fresh cache namespace and the old one is dropped.
 */

const VERSION = '__BUILD_VERSION__'
const SHELL_CACHE = `shell-${VERSION}`
const ASSET_CACHE = `assets-${VERSION}`
const VENDOR_CACHE = `vendor-${VERSION}`

const CURRENT_CACHES = new Set([SHELL_CACHE, ASSET_CACHE, VENDOR_CACHE])

/** Precached so the very first offline navigation has something to render. */
const SHELL_URLS = ['/', '/favicon.svg', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => {
        // A failed precache must not block installation — runtime caching
        // will fill the gaps on first use.
      }),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !CURRENT_CACHES.has(key)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

/** Hashed build output and immutable vendor files: serve from cache, fill on miss. */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const hit = await cache.match(request)
  if (hit) return hit

  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

/**
 * HTML: always try the network so a deploy is picked up immediately, and fall
 * back to the cached copy when offline.
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (error) {
    const hit = (await cache.match(request)) || (await cache.match('/'))
    if (hit) return hit
    throw error
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // The update poller must always see the real file, never a cached one.
  if (url.pathname === '/version.json') return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL_CACHE))
    return
  }

  if (url.pathname.startsWith('/monaco/') || url.pathname.startsWith('/mermaid/')) {
    event.respondWith(cacheFirst(request, VENDOR_CACHE))
    return
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request, ASSET_CACHE))
    return
  }
})
