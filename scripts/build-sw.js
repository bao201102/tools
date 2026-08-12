import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DIST = join(__dirname, '..', 'dist')
const TEMPLATE = join(__dirname, 'sw-template.js')

/**
 * Stamps the build version into the service worker so every deploy gets its own
 * cache namespace and the previous one is evicted on activate.
 *
 * The worker lives outside public/ on purpose: an unstamped copy served in dev
 * would register against a literal "__BUILD_VERSION__" cache.
 */
const { version } = JSON.parse(readFileSync(join(DIST, 'version.json'), 'utf-8'))
const source = readFileSync(TEMPLATE, 'utf-8').replace(/__BUILD_VERSION__/g, version)

writeFileSync(join(DIST, 'sw.js'), source, 'utf-8')

console.log(`✓ Service worker written to dist/sw.js (cache version ${version})`)
