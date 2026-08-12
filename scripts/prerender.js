import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DIST = join(__dirname, '..', 'dist')
const SEO_FILE = join(__dirname, '..', 'src', 'config', 'seo.json')

/**
 * Emits one static HTML file per route, each with its own title, description,
 * canonical and social tags baked into <head>.
 *
 * The app is a client-rendered SPA, so before this step every URL returned the
 * same shell: crawlers and link unfurlers saw identical metadata for all 20
 * tools. This does not prerender the *body* — the markup is still the SPA shell
 * — it only fixes the head, which is what search results and link previews read.
 *
 * nginx resolves /json via `try_files $uri $uri/` → dist/json/index.html.
 */

const seo = JSON.parse(readFileSync(SEO_FILE, 'utf-8'))
const shell = readFileSync(join(DIST, 'index.html'), 'utf-8')

const escapeAttr = (s) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function titleFor(route) {
  return route.path === '/' ? route.title : `${route.title} — ${seo.siteName}`
}

function headTagsFor(route) {
  const title = titleFor(route)
  const url = `${seo.baseUrl}${route.path}`
  const image = `${seo.baseUrl}${seo.image}`

  return [
    `<title>${escapeAttr(title)}</title>`,
    `<meta name="description" content="${escapeAttr(route.description)}" />`,
    `<link rel="canonical" href="${escapeAttr(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeAttr(seo.siteName)}" />`,
    `<meta property="og:locale" content="${escapeAttr(seo.locale)}" />`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:description" content="${escapeAttr(route.description)}" />`,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    `<meta property="og:image" content="${escapeAttr(image)}" />`,
    `<meta name="twitter:card" content="${escapeAttr(seo.twitterCard)}" />`,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(route.description)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(image)}" />`,
  ].join('\n    ')
}

function buildHtml(route) {
  let html = shell

  // Drop the placeholder tags Vite copied from index.html so we do not emit
  // two <title> or two descriptions.
  html = html.replace(/\s*<title>[\s\S]*?<\/title>/i, '')
  html = html.replace(/\s*<meta\s+name="description"[\s\S]*?\/>/i, '')

  return html.replace('</head>', `  ${headTagsFor(route)}\n  </head>`)
}

let written = 0
for (const route of seo.routes) {
  const html = buildHtml(route)

  if (route.path === '/') {
    writeFileSync(join(DIST, 'index.html'), html, 'utf-8')
  } else {
    const dir = join(DIST, route.path.replace(/^\//, ''))
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), html, 'utf-8')
  }
  written++
}

console.log(`✓ Prerendered ${written} route(s) with per-page metadata`)
