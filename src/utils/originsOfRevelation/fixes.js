/**
 * Data positions, the data lock and quote fixes for /discover/origins-of-revelation.
 *
 * The copy points at data quotes by position (`itemId / group / index`). Positions are not stable ids,
 * so every position is locked: `dataLock.js` records each one's reference and the SHA-256 of its
 * quote. Any data change (a reorder, a replaced or edited quote, a new or removed quote) fails the
 * build until someone re-reads the card copy for that position and re-locks with
 * `node scripts/origins_of_revelation_data.mjs --lock`. A misattributed quote can never ship silently.
 *
 * Quote fixes (`quoteFixes.js`, generated) replace a position's reference and/or quote at render time.
 * Each carries the exact current text (`oldReference`, `oldQuote`); a fix that no longer matches fails
 * (and says so when the data owner has already applied it upstream).
 */

import { createHash } from 'node:crypto';
import * as C from './config.js';
import { fail, refFromData, routeForSource } from './refs.js';

export const sha256 = s => createHash('sha256').update(String(s), 'utf8').digest('hex');
export const posKey = (itemId, group, index) => `${itemId}/${group}/${index}`;

const FIX_KEYS = new Set(['itemId', 'group', 'index', 'oldReference', 'newReference', 'oldQuote', 'newQuote', 'sourceFile', 'sourceKey', 'url', 'edits', 'priority', 'reason', 'note', 'displayLabel']);

/** Every quote position in the data (original text, before fixes). */
export function dataPositions(data) {
  const items = new Map();
  for (const it of data.items || []) {
    if (!Array.isArray(it.comparatives) || it.comparatives.length !== 1) fail(`data item "${it.id}" must have exactly one comparative (has ${it.comparatives?.length ?? 0})`);
    if (items.has(it.id)) fail(`duplicate data item id "${it.id}"`);
    items.set(it.id, it);
  }
  const positions = new Map();
  for (const [id, it] of items) {
    for (const g of C.DATA_GROUPS) {
      (it.comparatives[0][g] || []).forEach((q, index) => {
        positions.set(posKey(id, g, index), { itemId: id, group: g, index, reference: q.reference, quote: q.quote, fixed: null });
      });
    }
  }
  return { items, positions };
}

/** The lock for the current data (what `--lock` writes). */
export function makeLock(data) {
  const { positions } = dataPositions(data);
  return Object.fromEntries([...positions].map(([k, p]) => [k, { reference: p.reference, sha256: sha256(p.quote) }]));
}

/** Compares the data with the lock; returns a list of problems (empty = unchanged). */
export function lockProblems(positions, lock) {
  const out = [];
  for (const [k, p] of positions) {
    const l = lock[k];
    if (!l) { out.push(`${k}: new data quote (${p.reference})`); continue; }
    if (l.reference !== p.reference) out.push(`${k}: reference was ${l.reference}, is now ${p.reference}`);
    else if (l.sha256 !== sha256(p.quote)) out.push(`${k}: quote text changed (${p.reference})`);
  }
  for (const k of Object.keys(lock)) if (!positions.has(k)) out.push(`${k}: data quote removed (was ${lock[k].reference})`);
  return out;
}

/** A scripture / tafsir fix must link where its verified source is. */
function checkFixSource(f, k) {
  if (!f.sourceFile || f.sourceFile === 'external') return;
  const route = routeForSource(f.sourceFile, f.sourceKey);
  if (!route) return;
  const ref = refFromData(f.newReference, `quote fix ${k}`);
  if (route.href !== ref.href || route.label !== ref.label) fail(`quote fix ${k}: newReference ${f.newReference} (${ref.label}) disagrees with its source ${f.sourceFile} @ ${f.sourceKey} (${route.label})`);
}

/**
 * Locked positions with fixes applied.
 * @returns {{ items: Map, positions: Map<string, { itemId, group, index, reference, quote, fixed }> }}
 */
export function resolveData(data, fixes, lock) {
  const { items, positions } = dataPositions(data);
  if (lock) {
    const problems = lockProblems(positions, lock);
    if (problems.length) {
      fail(`the data changed since the copy was last reviewed:\n  - ${problems.join('\n  - ')}\n` +
        'Re-read the card copy (labels, notes, showcase excerpts) for these positions in content.js, then run `node scripts/origins_of_revelation_data.mjs --lock`.');
    }
  }
  const seen = new Set();
  for (const f of fixes) {
    const k = posKey(f.itemId, f.group, f.index);
    for (const key of Object.keys(f)) if (!FIX_KEYS.has(key)) fail(`quote fix ${k}: unknown field "${key}"`);
    const p = positions.get(k) || fail(`quote fix ${k} names a data position that does not exist`);
    if (seen.has(k)) fail(`two quote fixes for ${k}`);
    seen.add(k);
    const newRef = f.newReference ?? f.oldReference;
    const newQuote = f.newQuote ?? f.oldQuote;
    if (p.reference !== f.oldReference || p.quote !== f.oldQuote) {
      if (p.reference === newRef && p.quote === newQuote) fail(`quote fix ${k} is already applied in the data: remove it from the fix list and re-import`);
      fail(p.reference !== f.oldReference
        ? `stale quote fix ${k}: data reference is "${p.reference}", fix expects "${f.oldReference}"`
        : `stale quote fix ${k}: data quote no longer matches oldQuote (re-verify and re-import the fixes)`);
    }
    if (newRef === f.oldReference && newQuote === f.oldQuote && !f.displayLabel) fail(`quote fix ${k} changes nothing (no new reference, quote or display label)`);
    checkFixSource({ ...f, newReference: newRef }, k);
    p.reference = newRef;
    p.quote = newQuote;
    p.fixed = f;
  }
  return { items, positions };
}
