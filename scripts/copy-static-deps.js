import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeModulesDir = path.join(__dirname, '../node_modules');
const publicDir = path.join(__dirname, '../public');

// Helper to recursively copy directories
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  // Copy Monaco Editor min/vs to public/monaco/vs
  const monacoSrc = path.join(nodeModulesDir, 'monaco-editor/min/vs');
  const monacoDest = path.join(publicDir, 'monaco/vs');
  if (fs.existsSync(monacoSrc)) {
    console.log('Copying Monaco Editor assets...');
    copyDir(monacoSrc, monacoDest);
    console.log('Monaco Editor assets copied successfully.');
  } else {
    console.error(`Monaco Editor assets not found at: ${monacoSrc}`);
  }

  // Copy Mermaid minified build to public/mermaid/mermaid.min.js
  const mermaidSrc = path.join(nodeModulesDir, 'mermaid/dist/mermaid.min.js');
  const mermaidDestDir = path.join(publicDir, 'mermaid');
  const mermaidDest = path.join(mermaidDestDir, 'mermaid.min.js');
  if (fs.existsSync(mermaidSrc)) {
    console.log('Copying Mermaid assets...');
    fs.mkdirSync(mermaidDestDir, { recursive: true });
    fs.copyFileSync(mermaidSrc, mermaidDest);
    console.log('Mermaid assets copied successfully.');
  } else {
    console.error(`Mermaid assets not found at: ${mermaidSrc}`);
  }
} catch (error) {
  console.error('Error copying static dependencies:', error);
  process.exit(1);
}
