import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SEO_FILE = join(__dirname, '..', 'src', 'config', 'seo.json')
const APP_ROUTES_FILE = join(__dirname, '..', 'src', 'App.tsx')

/**
 * Routes are declared once in src/config/seo.json (shared with the runtime head
 * tags and the prerender step). App.tsx is still parsed, but only to verify the
 * two lists agree — a route added to the router without SEO copy is a silent
 * SEO hole, so the build fails loudly instead.
 */
function readSeoRoutes() {
  const seo = JSON.parse(readFileSync(SEO_FILE, 'utf-8'))
  if (!Array.isArray(seo.routes) || seo.routes.length === 0) {
    throw new Error(`No routes defined in ${SEO_FILE}`)
  }
  return seo
}

function readRouterPaths() {
  const source = readFileSync(APP_ROUTES_FILE, 'utf-8')
  const paths = ['/']

  for (const match of source.matchAll(/<Route\s+path="([^"]+)"/g)) {
    const segment = match[1]
    // The catch-all renders the 404 page; it is not a real URL and must never
    // reach the sitemap.
    if (segment === '*') continue
    paths.push(`/${segment}`)
  }

  if (paths.length === 1) {
    throw new Error(
      `No <Route path="..."> entries found in ${APP_ROUTES_FILE}. Check App.tsx or the parse pattern.`,
    )
  }

  return paths
}

function assertRoutesInSync(seoRoutes, routerPaths) {
  const seoPaths = new Set(seoRoutes.map((r) => r.path))
  const routerSet = new Set(routerPaths)

  const missingSeo = routerPaths.filter((p) => !seoPaths.has(p))
  const orphaned = [...seoPaths].filter((p) => !routerSet.has(p))

  if (missingSeo.length || orphaned.length) {
    const lines = ['src/config/seo.json is out of sync with src/App.tsx:']
    if (missingSeo.length) {
      lines.push(`  Routed but missing SEO copy: ${missingSeo.join(', ')}`)
    }
    if (orphaned.length) {
      lines.push(`  Has SEO copy but not routed: ${orphaned.join(', ')}`)
    }
    throw new Error(lines.join('\n'))
  }
}

function generateSitemap(baseUrl, routes, lastmod) {
  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

function writeSitemap() {
  const seo = readSeoRoutes()
  const routerPaths = readRouterPaths()
  assertRoutesInSync(seo.routes, routerPaths)

  const lastmod = new Date().toISOString().split('T')[0]
  const publicDir = join(__dirname, '..', 'public')
  const sitemapPath = join(publicDir, 'sitemap.xml')

  mkdirSync(publicDir, { recursive: true })
  writeFileSync(sitemapPath, generateSitemap(seo.baseUrl, seo.routes, lastmod), 'utf-8')

  console.log(`✓ Sitemap generated from ${SEO_FILE}`)
  console.log(`✓ Output: ${sitemapPath}`)
  console.log(`✓ Total routes: ${seo.routes.length} (catch-all excluded)`)
}

writeSitemap()
