#!/usr/bin/env node
/**
 * Static internal-link audit of a built site (no network, no browser).
 *
 *   node scripts/test_internal_links.mjs [--dist dist] [--max-report 40] [--strict-anchors]
 *
 * Every same-origin href/src ("/…") in every built HTML page must resolve to a file in dist:
 *   /a/b → dist/a/b, dist/a/b.html or dist/a/b/index.html
 * Exits 1 when any target is missing. `#fragment`s on internal page links are checked against
 * the target page's id/name attributes and reported (they fail only with --strict-anchors),
 * except fragments a page handles in script (HASH_ROUTES) and UI state hashes (#play=N, #en…).
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : null; };
const DIST = path.resolve(arg('--dist') || 'dist');
const MAX_REPORT = Number(arg('--max-report')) || 40;
const STRICT_ANCHORS = process.argv.includes('--strict-anchors');

/** Pages whose `#hash` selects client-side state instead of scrolling to an element id. */
const HASH_ROUTES = {
  // QuranSourcesExplorer.jsx parseHashState: #<category>[/<tradition>]
  '/evidence/quran_sources': /^(?:stories|phrases|practices)(?:\/[\w-]+)?$/,
};
/** Hashes with UI meaning on any page (reel player, language toggle, text fragments). */
const UI_HASH = /^(?:play=\d+|en$|ar$|:~:)/;
const IGNORE_TARGET = [/^\/\//, /^\/cdn-cgi\//];

if (!existsSync(DIST)) {
  console.error(`dist not found: ${DIST} (build first, or pass --dist)`);
  process.exit(2);
}

const htmlFiles = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
})(DIST);

/**
 * Copy of a substring that doesn't share the page's HTML string. V8 substrings are slices of
 * their parent, so storing them as Map keys would keep every page's full HTML in memory.
 */
const detach = str => Buffer.from(str, 'utf8').toString('utf8');

const resolved = new Map();
function resolveTarget(pathname) {
  if (resolved.has(pathname)) return resolved.get(pathname);
  let p;
  try { p = decodeURIComponent(pathname); } catch { p = pathname; }
  const candidates = [path.join(DIST, p), path.join(DIST, `${p}.html`), path.join(DIST, p, 'index.html')];
  const hit = candidates.find(c => existsSync(c) && statSync(c).isFile()) || null;
  resolved.set(pathname, hit);
  return hit;
}

const brokenTargets = new Map();
const brokenAnchors = new Map();
const note = (map, key, from) => {
  const row = map.get(key) || { count: 0, examples: [] };
  row.count++;
  if (row.examples.length < 3) row.examples.push(from);
  map.set(key, row);
};

// Pass 1: resolve every target; queue fragment checks per target file. Pass 2 reads each
// target once (caching every page's ids at once needs >4 GB on the full 67k-page build).
/** @type {Map<string, Map<string, { pathname: string, count: number, examples: string[] }>>} */
const anchorChecks = new Map();
let refs = 0;
for (const file of htmlFiles) {
  const from = `/${path.relative(DIST, file)}`;
  for (const m of readFileSync(file, 'utf8').matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
    const raw = detach(m[1].replace(/&amp;/g, '&'));
    if (IGNORE_TARGET.some(r => r.test(raw))) continue;
    refs++;
    const hashAt = raw.indexOf('#');
    const pathAndQuery = hashAt > -1 ? raw.slice(0, hashAt) : raw;
    const frag = hashAt > -1 ? raw.slice(hashAt + 1) : '';
    const pathname = pathAndQuery.split('?')[0] || '/';
    const target = resolveTarget(pathname);
    if (!target) { note(brokenTargets, pathname, from); continue; }
    if (!frag || !target.endsWith('.html') || UI_HASH.test(frag)) continue;
    let fragDecoded;
    try { fragDecoded = decodeURIComponent(frag); } catch { fragDecoded = frag; }
    const route = pathname.replace(/\/(?:index\.html)?$/, '') || '/';
    if (HASH_ROUTES[route]?.test(fragDecoded)) continue;
    let byFrag = anchorChecks.get(target);
    if (!byFrag) anchorChecks.set(target, (byFrag = new Map()));
    const entry = byFrag.get(fragDecoded) || { pathname, count: 0, examples: [] };
    entry.count++;
    if (entry.examples.length < 3) entry.examples.push(from);
    byFrag.set(fragDecoded, entry);
  }
}

for (const [target, byFrag] of anchorChecks) {
  const ids = new Set();
  for (const m of readFileSync(target, 'utf8').matchAll(/\s(?:id|name)="([^"]+)"/g)) ids.add(m[1]);
  for (const [frag, e] of byFrag) {
    if (!ids.has(frag)) brokenAnchors.set(`${e.pathname}#${frag}`, { count: e.count, examples: e.examples });
  }
}

const report = (label, map) => {
  const rows = [...map.entries()].sort((a, b) => b[1].count - a[1].count);
  console.log(`${label}: ${rows.length} distinct (${rows.reduce((s, [, r]) => s + r.count, 0)} refs)`);
  for (const [t, r] of rows.slice(0, MAX_REPORT)) console.log(`  ${t}  x${r.count}  e.g. ${r.examples.join(', ')}`);
};
console.log(`Scanned ${htmlFiles.length} HTML files, ${refs} internal href/src references.`);
report('Broken internal targets', brokenTargets);
report(`Broken #anchors${STRICT_ANCHORS ? '' : ' (informational)'}`, brokenAnchors);
const failed = brokenTargets.size > 0 || (STRICT_ANCHORS && brokenAnchors.size > 0);
console.log(failed ? '\nFAIL' : '\nOK');
process.exit(failed ? 1 : 0);
