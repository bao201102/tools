import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import seoConfig from '../config/seo.json'

export type RouteSeo = {
  path: string
  title: string
  description: string
  priority: string
  changefreq: string
}

export const SEO = seoConfig as {
  siteName: string
  baseUrl: string
  locale: string
  twitterCard: string
  image: string
  routes: RouteSeo[]
}

const byPath = new Map(SEO.routes.map((r) => [r.path, r]))

export function getRouteSeo(pathname: string): RouteSeo | undefined {
  return byPath.get(pathname === '' ? '/' : pathname.replace(/\/+$/, '') || '/')
}

/** Page title as rendered in <title> — the home route already carries the brand. */
export function formatTitle(route: RouteSeo): string {
  return route.path === '/' ? route.title : `${route.title} — ${SEO.siteName}`
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Keeps <head> in sync with the active route on client-side navigation.
 *
 * The static HTML shipped for each route already carries the correct tags (see
 * scripts/prerender.js) — this exists so the tags stay correct once the router
 * takes over and the user moves between tools without a page load.
 */
export function useRouteSeo(): void {
  const { pathname } = useLocation()

  useEffect(() => {
    const route = getRouteSeo(pathname)

    // Unknown path — the 404 view. Keep it out of the index rather than letting
    // it inherit whichever tool's tags were set last.
    if (!route) {
      document.title = `Page not found — ${SEO.siteName}`
      setMeta('meta[name="robots"]', 'name', 'robots', 'noindex, follow')
      return
    }

    document.head.querySelector('meta[name="robots"]')?.remove()

    const title = formatTitle(route)
    const url = `${SEO.baseUrl}${route.path}`

    document.title = title
    setMeta('meta[name="description"]', 'name', 'description', route.description)
    setCanonical(url)

    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', route.description)
    setMeta('meta[property="og:url"]', 'property', 'og:url', url)

    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', route.description)
  }, [pathname])
}
