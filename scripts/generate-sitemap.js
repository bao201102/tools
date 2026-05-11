import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Base URL for the sitemap
const BASE_URL = 'https://nub.io.vn'

// Internal routes - update this array when adding new tool pages
const routes = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  { path: '/json', priority: '0.8', changefreq: 'monthly' },
  { path: '/json-escape', priority: '0.8', changefreq: 'monthly' },
  { path: '/yaml', priority: '0.8', changefreq: 'monthly' },
  { path: '/csharp-proto', priority: '0.8', changefreq: 'monthly' },
  { path: '/csharp-proto-remove', priority: '0.8', changefreq: 'monthly' },
  { path: '/encoder', priority: '0.8', changefreq: 'monthly' },
  { path: '/diff-checker', priority: '0.8', changefreq: 'monthly' },
  { path: '/json-to-csharp', priority: '0.8', changefreq: 'monthly' },
  { path: '/sql-to-csharp', priority: '0.8', changefreq: 'monthly' },
  { path: '/jwt-decoder', priority: '0.8', changefreq: 'monthly' },
]

// Generate current date in ISO format for lastmod
const lastmod = new Date().toISOString().split('T')[0]

// Generate sitemap XML
function generateSitemap() {
  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

// Write sitemap to public directory
function writeSitemap() {
  const publicDir = join(__dirname, '..', 'public')
  const sitemapPath = join(publicDir, 'sitemap.xml')

  // Ensure public directory exists
  try {
    mkdirSync(publicDir, { recursive: true })
  } catch (err) {
    // Directory already exists, ignore
  }

  const sitemapContent = generateSitemap()
  writeFileSync(sitemapPath, sitemapContent, 'utf-8')

  console.log(`✓ Sitemap generated successfully at ${sitemapPath}`)
  console.log(`✓ Total routes: ${routes.length}`)
}

// Execute
writeSitemap()
