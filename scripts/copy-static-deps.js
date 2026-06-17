import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeModulesDir = path.join(__dirname, '../node_modules');
const publicDir = path.join(__dirname, '../public');

// Helper to compare and copy a single file if changed
function copyFileIfChanged(src, dest) {
  if (fs.existsSync(dest)) {
    const srcStat = fs.statSync(src);
    const destStat = fs.statSync(dest);

    // Compare size first for fast check
    if (srcStat.size === destStat.size) {
      // Compare content if size is the same
      const srcBuf = fs.readFileSync(src);
      const destBuf = fs.readFileSync(dest);
      if (srcBuf.equals(destBuf)) {
        return false; // Unchanged, skip copying
      }
    }
  }

  fs.copyFileSync(src, dest);
  return true; // Copied (changed or new)
}

// Helper to recursively sync directories (copy new/changed, delete deleted)
function syncDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  const srcEntries = fs.readdirSync(src, { withFileTypes: true });
  const srcNames = new Set(srcEntries.map(e => e.name));

  let copiedCount = 0;

  for (const entry of srcEntries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copiedCount += syncDir(srcPath, destPath);
    } else {
      if (copyFileIfChanged(srcPath, destPath)) {
        copiedCount++;
      }
    }
  }

  // Clean up any files/folders in dest that are no longer in src
  if (fs.existsSync(dest)) {
    const destEntries = fs.readdirSync(dest, { withFileTypes: true });
    for (const entry of destEntries) {
      if (!srcNames.has(entry.name)) {
        const destPath = path.join(dest, entry.name);
        fs.rmSync(destPath, { recursive: true, force: true });
        console.log(`Removed outdated asset: ${path.relative(publicDir, destPath)}`);
      }
    }
  }

  return copiedCount;
}

try {
  // Copy Monaco Editor min/vs to public/monaco/vs
  const monacoSrc = path.join(nodeModulesDir, 'monaco-editor/min/vs');
  const monacoDest = path.join(publicDir, 'monaco/vs');
  if (fs.existsSync(monacoSrc)) {
    console.log('Syncing Monaco Editor assets...');
    const copiedCount = syncDir(monacoSrc, monacoDest);
    if (copiedCount > 0) {
      console.log(`Monaco Editor assets updated (${copiedCount} file(s) copied/updated).`);
    } else {
      console.log('Monaco Editor assets are up to date.');
    }
  } else {
    console.error(`Monaco Editor assets not found at: ${monacoSrc}`);
  }

  // Copy Mermaid minified build to public/mermaid/mermaid.min.js
  const mermaidSrc = path.join(nodeModulesDir, 'mermaid/dist/mermaid.min.js');
  const mermaidDestDir = path.join(publicDir, 'mermaid');
  const mermaidDest = path.join(mermaidDestDir, 'mermaid.min.js');
  if (fs.existsSync(mermaidSrc)) {
    console.log('Syncing Mermaid assets...');
    fs.mkdirSync(mermaidDestDir, { recursive: true });
    const copied = copyFileIfChanged(mermaidSrc, mermaidDest);
    if (copied) {
      console.log('Mermaid assets updated.');
    } else {
      console.log('Mermaid assets are up to date.');
    }

    // Clean up other files in mermaidDestDir if any
    const mermaidEntries = fs.readdirSync(mermaidDestDir);
    for (const file of mermaidEntries) {
      if (file !== 'mermaid.min.js') {
        const extraPath = path.join(mermaidDestDir, file);
        fs.rmSync(extraPath, { recursive: true, force: true });
        console.log(`Removed outdated asset: ${path.relative(publicDir, extraPath)}`);
      }
    }
  } else {
    console.error(`Mermaid assets not found at: ${mermaidSrc}`);
  }
} catch (error) {
  console.error('Error copying static dependencies:', error);
  process.exit(1);
}
