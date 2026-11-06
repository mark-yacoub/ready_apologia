/**
 * Guard: client code must change the URL only through src/utils/url_history.js.
 *
 * Astro's ClientRouter ignores Back/Forward to any history entry whose state is null, so a raw
 * history.pushState/replaceState (or a location.hash assignment, which creates a null-state entry)
 * makes Back change the URL without rendering the page. See url_history.js for the helpers.
 *
 * Usage: node scripts/test_history_api.mjs   (npm run test:history)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src');
const allowed = path.join(srcDir, 'utils', 'url_history.js');
const exts = new Set(['.js', '.mjs', '.jsx', '.ts', '.tsx', '.astro']);
const banned = [
  { re: /\bhistory\s*\.\s*(?:push|replace)State\s*\(/, why: 'raw history.pushState/replaceState — use replaceUrl()/pushHash()' },
  { re: /\blocation\s*\.\s*hash\s*=(?!=)/, why: 'location.hash assignment creates a null-state entry — use pushHash()' },
];

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (exts.has(path.extname(e.name))) yield p;
  }
}

const failures = [];
for (const file of walk(srcDir)) {
  if (file === allowed) continue;
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (/^\s*(?:\/\/|\*)/.test(line)) return; // comments
    for (const { re, why } of banned) {
      if (re.test(line)) failures.push(`${path.relative(root, file)}:${i + 1}: ${why}\n    ${line.trim()}`);
    }
  });
}

if (failures.length) {
  console.error(`✗ ${failures.length} unsafe URL update(s):\n${failures.join('\n')}`);
  process.exit(1);
}
console.log('✓ all client URL updates go through src/utils/url_history.js');
