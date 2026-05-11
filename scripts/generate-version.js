import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Prefer CI-provided version (e.g. git SHA) when available; fall back to build timestamp.
const version = process.env.APP_VERSION || String(Date.now())

const publicDir = join(__dirname, '..', 'public')
const versionPath = join(publicDir, 'version.json')

try {
  mkdirSync(publicDir, { recursive: true })
} catch {
  // Directory already exists, ignore
}

writeFileSync(versionPath, JSON.stringify({ version }) + '\n', 'utf-8')
console.log(`✓ version.json generated: ${version}`)
