import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '../src/features');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(srcDir);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Regex to find "const editorOptions = { ... }" and insert "fixedOverflowWidgets: true"
  const regex = /(const editorOptions = \{)([\s\S]*?)(\n\})/g;

  if (regex.test(content)) {
    content = content.replace(regex, (match, prefix, body, suffix) => {
      if (body.includes('fixedOverflowWidgets')) {
        return match;
      }
      changed = true;
      const trimmedBody = body.trimEnd();
      if (trimmedBody.endsWith(',')) {
        return `${prefix}${body}\n  fixedOverflowWidgets: true,${suffix}`;
      } else {
        return `${prefix}${body},\n  fixedOverflowWidgets: true,${suffix}`;
      }
    });
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${path.basename(file)}`);
  }
});
