import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '../src');

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
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace standard page container paddings
  if (content.includes('p-6 lg:p-8')) {
    content = content.replace(/p-6 lg:p-8/g, 'p-4 sm:p-6 lg:p-8');
    changed = true;
  }

  // Replace markdown specific container padding
  if (content.includes('p-6 pb-20 lg:p-8 lg:pb-28')) {
    content = content.replace(/p-6 pb-20 lg:p-8 lg:pb-28/g, 'p-4 pb-20 sm:p-6 lg:p-8 lg:pb-28');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Optimized padding in: ${path.relative(srcDir, file)}`);
    modifiedCount++;
  }
});

console.log(`Successfully optimized padding in ${modifiedCount} files.`);
