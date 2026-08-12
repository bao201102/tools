import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import seo from '../config/seo.json'

/**
 * seo.json is the single source for the sitemap, the prerendered <head> tags
 * and the runtime head updates. If it drifts from the router, pages silently
 * ship with the wrong metadata — so the drift is a test failure.
 */
function routerPaths(): string[] {
  const source = readFileSync(join(process.cwd(), 'src', 'App.tsx'), 'utf-8')
  const paths = ['/']
  for (const match of source.matchAll(/<Route\s+path="([^"]+)"/g)) {
    if (match[1] !== '*') paths.push(`/${match[1]}`)
  }
  return paths
}

describe('seo config', () => {
  const paths = seo.routes.map((r) => r.path)

  it('covers every route declared in App.tsx', () => {
    expect([...paths].sort()).toEqual([...routerPaths()].sort())
  })

  it('has no duplicate paths', () => {
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('never includes the catch-all route', () => {
    expect(paths).not.toContain('/*')
  })

  it('gives every route a unique title and description', () => {
    const titles = seo.routes.map((r) => r.title)
    const descriptions = seo.routes.map((r) => r.description)
    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(descriptions).size).toBe(descriptions.length)
  })

  it('keeps descriptions within the length search engines display', () => {
    for (const route of seo.routes) {
      expect(route.description.length, `${route.path} description`).toBeGreaterThanOrEqual(70)
      expect(route.description.length, `${route.path} description`).toBeLessThanOrEqual(320)
    }
  })

  it('keeps titles short enough not to be truncated', () => {
    for (const route of seo.routes) {
      expect(route.title.length, `${route.path} title`).toBeLessThanOrEqual(60)
    }
  })

  it('uses an absolute https base url with no trailing slash', () => {
    expect(seo.baseUrl).toMatch(/^https:\/\//)
    expect(seo.baseUrl.endsWith('/')).toBe(false)
  })

  it('points every path at a root-relative url', () => {
    for (const route of seo.routes) {
      expect(route.path.startsWith('/'), `${route.path}`).toBe(true)
    }
  })
})
