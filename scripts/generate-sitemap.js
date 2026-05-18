import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BASE_URL = 'https://nub.io.vn'
const APP_ROUTES_FILE = join(__dirname, '..', 'src', 'App.tsx')

const DEFAULT_CHANGEFREQ = 'monthly'
const TOOL_PRIORITY = '0.8'
const HOME_PRIORITY = '1.0'

/**
 * Discover internal paths from src/App.tsx (<Route path="..." /> and index route).
 * Add a route in App.tsx only — sitemap picks it up on the next build.
 */
function discoverRoutesFromApp() {
  const source = readFileSync(APP_ROUTES_FILE, 'utf-8')
  const paths = []

  for (const match of source.matchAll(/<Route\s+path="([^"]+)"/g)) {
    paths.push(match[1])
  }

  if (paths.length === 0) {
    throw new Error(
      `No <Route path="..."> entries found in ${APP_ROUTES_FILE}. Check App.tsx or the parse pattern.`,
    )
  }

  return [
    { path: '/', priority: HOME_PRIORITY, changefreq: DEFAULT_CHANGEFREQ },
    ...paths.map((segment) => ({
      path: `/${segment}`,
      priority: TOOL_PRIORITY,
      changefreq: DEFAULT_CHANGEFREQ,
    })),
  ]
}

const lastmod = new Date().toISOString().split('T')[0]

function generateSitemap(routes) {
  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${BASE_URL}${route.path}</loc>
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
  const routes = discoverRoutesFromApp()
  const publicDir = join(__dirname, '..', 'public')
  const sitemapPath = join(publicDir, 'sitemap.xml')

  try {
    mkdirSync(publicDir, { recursive: true })
  } catch {
    // Directory already exists
  }

  writeFileSync(sitemapPath, generateSitemap(routes), 'utf-8')

  console.log(`✓ Sitemap generated from ${APP_ROUTES_FILE}`)
  console.log(`✓ Output: ${sitemapPath}`)
  console.log(`✓ Total routes: ${routes.length}`)
  console.log(`  ${routes.map((r) => r.path).join(', ')}`)
}

writeSitemap()
