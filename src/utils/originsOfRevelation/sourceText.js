/**
 * Reads the text a quotation claims to come from, out of a repo file (unit test and data tooling
 * only; never imported by the page). Paths resolve from the repo root, not the process cwd.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Repo root, from this file's location (not the process cwd). Tool/test use only. */
const repoRoot = () => path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

/**
 * Text at `sourceKey` in a repo file: scripture JSON → "C:V" or "C:V-W" (verses joined); any other
 * JSON → a top-level key or dotted path (all string leaves joined); otherwise the whole file.
 */
export function sourceText(sourceFile, sourceKey) {
  const raw = fs.readFileSync(path.join(repoRoot(), sourceFile), 'utf8');
  if (!/\.json$/.test(sourceFile) || !sourceKey) return raw;
  const obj = JSON.parse(raw);
  const v = String(sourceKey).match(/^(\d+):(\d+)(?:-(\d+))?$/);
  if (v && /src\/data\/scripture\//.test(sourceFile)) {
    const verses = obj[v[1]] || [];
    const out = [];
    for (let i = +v[2]; i <= +(v[3] || v[2]); i++) {
      const hit = verses.find(o => o && Object.prototype.hasOwnProperty.call(o, String(i)));
      if (!hit) throw new Error(`${sourceFile}: ${v[1]}:${i} not found`);
      out.push(hit[String(i)]);
    }
    return out.join(' ');
  }
  const leaves = x => (typeof x === 'string' ? [x] : x && typeof x === 'object' ? Object.values(x).flatMap(leaves) : []);
  const walk = (node, rest) => {
    if (!rest) return node;
    if (node && typeof node === 'object') {
      if (Object.prototype.hasOwnProperty.call(node, rest)) return node[rest];
      const parts = rest.split('.');
      for (let i = parts.length - 1; i >= 1; i--) {
        const k = parts.slice(0, i).join('.');
        if (Object.prototype.hasOwnProperty.call(node, k)) {
          const r = walk(node[k], parts.slice(i).join('.'));
          if (r !== undefined) return r;
        }
      }
    }
    return undefined;
  };
  const node = walk(obj, String(sourceKey));
  if (node === undefined) throw new Error(`${sourceFile}: key "${sourceKey}" not found`);
  return leaves(node).join(' ');
}
