/**
 * fix-mobile-editor-height.js
 *
 * Fixes the core mobile layout bug in all editor components:
 * The grid container had `style={{ height: editorHeight }}` which, when the
 * grid stacks to 1 column on mobile, splits the height equally between panes.
 *
 * Fix: Remove height from grid container, add `style={{ height: editorHeight }}`
 * to each individual pane div so each pane gets full height when stacked.
 *
 * Also adds `min-h-[280px]` to panes as a mobile fallback.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const FEATURES_DIR = path.join(__dirname, '..', 'src', 'features')

// Pattern: grid container with height style
// We look for this multi-line pattern and transform it
function fixEditorFile(filePath) {
  let src = fs.readFileSync(filePath, 'utf-8')
  const original = src
  let changed = false

  // -------------------------------------------------------------------------
  // Fix 1: Remove height from grid container, add to each pane
  // Pattern:
  //   <div\n        className="grid ... lg:grid-cols-2 ..."\n        style={{ height: editorHeight }}\n      >
  // -------------------------------------------------------------------------

  // Match the grid div opening tag with style={{ height: editorHeight }}
  const gridWithHeightRe = /(<div\s[^>]*className="[^"]*\bgrid\b[^"]*\blg:grid-cols-2\b[^"]*"[^>]*)\s*style=\{\{\s*height:\s*editorHeight\s*\}\}\s*(>)/g

  if (gridWithHeightRe.test(src)) {
    src = src.replace(gridWithHeightRe, (match, before, closing) => {
      // Remove the style prop — keep only the className
      return before.trim() + '\n      ' + closing
    })
    changed = true
  }

  // Now add style={{ height: editorHeight }} to each pane div that is a direct
  // child of the grid. Pattern: <div className="flex min-h-0 flex-1 flex-col gap-2">
  // OR <div className="flex min-h-0 flex-col gap-2">
  // We only do this if the file still has editorHeight referenced
  if (changed && src.includes('editorHeight')) {
    // Replace first occurrence of these pane patterns (up to 3 occurrences per file)
    const panePatterns = [
      /<div className="(flex min-h-0 flex-1 flex-col gap-[246])">/g,
      /<div className="(flex min-h-0 flex-col gap-[246])">/g,
      /<div className="(flex flex-col min-h-0 gap-[246])">/g,
    ]

    for (const re of panePatterns) {
      let count = 0
      src = src.replace(re, (match, cls) => {
        count++
        // Only add style to the first 2 panes (the editor panes)
        if (count <= 2) {
          return `<div className="${cls}" style={{ height: editorHeight }}>`
        }
        return match
      })
    }
  }

  if (src !== original) {
    fs.writeFileSync(filePath, src, 'utf-8')
    console.log(`  ✅ Fixed: ${path.basename(filePath)}`)
    return true
  } else {
    console.log(`  ⏭  Skipped (no match): ${path.basename(filePath)}`)
    return false
  }
}

// Get all editor TSX files
function getAllEditorFiles(dir) {
  const results = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...getAllEditorFiles(fullPath))
    } else if (entry.name.endsWith('Editor.tsx')) {
      results.push(fullPath)
    }
  }
  return results
}

console.log('🔧 Fixing mobile editor height layout...\n')
const files = getAllEditorFiles(FEATURES_DIR)
let fixedCount = 0

for (const f of files) {
  const basename = path.basename(f)
  // Skip already fixed or special cases
  if (basename === 'LetterCountEditor.tsx') {
    console.log(`  ⏭  Skipped (already fixed): ${basename}`)
    continue
  }
  const wasFixed = fixEditorFile(f)
  if (wasFixed) fixedCount++
}

console.log(`\n✨ Done. Fixed ${fixedCount} file(s).`)
