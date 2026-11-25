/**
 * Isomorphic / Vite build-time loader & validator for Quick Points (`src/utils/quickPoints/<slug>.json`).
 *
 * Contains ZERO `node:*` imports so it can never pull `node:fs` into a client bundle.
 * Plain Node callers (`node --test`, audit scripts) import `./loader.node.js` instead.
 *
 * Rules:
 *   - Missing file for `slug` -> returns `null` (no toggle rendered on the page).
 *   - Present file -> validates full shape and throws a single aggregated Error if invalid.
 *   - Renders ONLY `groups` (never `needsReview`).
 *   - Optional `role`: `"lead" | "support" | "caveat"` (absent = `"support"`), caveats ordered last per category.
 *   - Optional `ref`: non-empty trimmed string (no `[` or `]`) or `null` / absent (`null`).
 *   - Emits canonical `pageKey` alongside `BASE`-prefixed `path` and `href`, with continuous `n = 1..N`.
 */

import { BASE, normalizeBase, toPageKey } from './paths.js';

export { BASE, toPageKey };
export const ALLOWED_ROLES = new Set(['lead', 'support', 'caveat']);

const SLUG_RE = /^[a-z0-9-]+$/;
const INVALID_ID_CHARS_RE = /[\s#]/;
const BRACKETS_RE = /[\[\]]/;

function parsePointRef(rawRef, pLoc, idLabel, problems) {
  if (rawRef === undefined || rawRef === null) return null;
  if (typeof rawRef !== 'string') {
    problems.push(`${pLoc} (${idLabel}): ref must be a string or null`);
    return null;
  }
  const trimmed = rawRef.trim();
  if (!trimmed) {
    problems.push(`${pLoc} (${idLabel}): ref must be a non-empty string or null`);
    return null;
  }
  if (BRACKETS_RE.test(trimmed)) {
    problems.push(`${pLoc} (${idLabel}): ref "${trimmed}" must not contain "[" or "]"`);
    return null;
  }
  return trimmed;
}

function validatePoint(pt, pLoc, { expectedPrefix, base, seenIds, problems }) {
  if (!pt || typeof pt !== 'object' || Array.isArray(pt)) {
    problems.push(`${pLoc} must be an object`);
    return null;
  }

  const id = typeof pt.id === 'string' ? pt.id.trim() : '';
  const idLabel = id || 'unnamed';
  if (!id) {
    problems.push(`${pLoc}.id must be a non-empty string`);
  } else if (INVALID_ID_CHARS_RE.test(id)) {
    problems.push(`${pLoc}.id "${id}" must not contain whitespace or "#"`);
  } else if (seenIds.has(id)) {
    problems.push(`${pLoc}.id "${id}" is duplicated`);
  } else {
    seenIds.add(id);
  }

  const statement = typeof pt.statement === 'string' ? pt.statement.trim() : '';
  if (!statement) {
    problems.push(`${pLoc} (${idLabel}): statement must be a non-empty string`);
  }

  const ref = parsePointRef(pt.ref, pLoc, idLabel, problems);

  let role = 'support';
  if (pt.role !== undefined) {
    if (typeof pt.role !== 'string' || !ALLOWED_ROLES.has(pt.role)) {
      problems.push(
        `${pLoc} (${idLabel}): role ${JSON.stringify(pt.role)} must be "lead", "support", or "caveat"`,
      );
    } else {
      role = pt.role;
    }
  }

  const target = typeof pt.target === 'string' ? pt.target.trim() : '';
  const hasValidPrefix =
    target === expectedPrefix ||
    target.startsWith(`${expectedPrefix}/`) ||
    target.startsWith(`${expectedPrefix}#`);

  if (!target || !hasValidPrefix) {
    problems.push(
      `${pLoc} (${idLabel}): target ${JSON.stringify(pt.target)} must start with "${expectedPrefix}"`,
    );
    return null;
  }

  const hashParts = target.split('#');
  if (hashParts.length > 2) {
    problems.push(`${pLoc} (${idLabel}): target "${target}" contains multiple "#" characters`);
    return null;
  }
  if (hashParts.length === 2 && !hashParts[1]) {
    problems.push(`${pLoc} (${idLabel}): target "${target}" has an empty "#hash"`);
    return null;
  }

  const pageKey = toPageKey(hashParts[0], '');
  const hash = hashParts[1] ?? '';
  const resolvedPath = `${base}${pageKey}`;
  const href = hash ? `${resolvedPath}#${hash}` : resolvedPath;

  return {
    id,
    statement,
    ref,
    role,
    href,
    path: resolvedPath,
    pageKey,
    hash,
  };
}

/**
 * Pure validator + transformer for a single article's Quick Points JSON payload.
 * Collects every validation problem and throws once listing them all.
 *
 * @param {unknown} raw
 * @param {string} slug
 * @param {{ base?: string }} [options]
 */
export function validateQuickPoints(raw, slug, options = {}) {
  const base = normalizeBase(options.base ?? BASE);
  const problems = [];

  if (!slug || typeof slug !== 'string' || !SLUG_RE.test(slug)) {
    throw new Error(`[quickPoints] invalid article slug: ${JSON.stringify(slug)}`);
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(`[quickPoints:${slug}] root must be a JSON object`);
  }

  if (typeof raw.article !== 'string' || raw.article !== slug) {
    problems.push(`article must equal "${slug}" (got ${JSON.stringify(raw.article)})`);
  }

  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!title) {
    problems.push('title must be a non-empty string');
  }

  if (!Array.isArray(raw.groups) || raw.groups.length === 0) {
    problems.push('groups must be a non-empty array');
  }

  const expectedPrefix = `/discover/${slug}`;
  const seenIds = new Set();
  const groups = [];
  let n = 0;

  if (Array.isArray(raw.groups)) {
    raw.groups.forEach((group, gi) => {
      const gLoc = `groups[${gi}]`;
      if (!group || typeof group !== 'object' || Array.isArray(group)) {
        problems.push(`${gLoc} must be an object`);
        return;
      }

      const category = typeof group.category === 'string' ? group.category.trim() : '';
      if (!category) {
        problems.push(`${gLoc}.category must be a non-empty string`);
      }

      if (!Array.isArray(group.points) || group.points.length === 0) {
        problems.push(`${gLoc}.points must be a non-empty array`);
        return;
      }

      const mainPoints = [];
      const caveatPoints = [];

      group.points.forEach((pt, pi) => {
        const prepared = validatePoint(pt, `${gLoc}.points[${pi}]`, {
          expectedPrefix,
          base,
          seenIds,
          problems,
        });
        if (!prepared) return;
        if (prepared.role === 'caveat') caveatPoints.push(prepared);
        else mainPoints.push(prepared);
      });

      const outPoints = [...mainPoints, ...caveatPoints].map((pt) => {
        n += 1;
        return { n, ...pt };
      });

      groups.push({ category, points: outPoints });
    });
  }

  if (problems.length > 0) {
    throw new Error(
      `[quickPoints:${slug}] ${problems.length} validation error(s):\n  - ${problems.join('\n  - ')}`,
    );
  }

  return {
    slug,
    title,
    total: n,
    groups,
  };
}

/**
 * Factory creating a memoised `loadQuickPoints` + `clearQuickPointsCache` pair over a raw map provider.
 * @param {() => Map<string, unknown>} readRawMap
 */
export function createQuickPointsLoader(readRawMap) {
  let rawMapCache = null;
  const resolvedCache = new Map();

  function loadQuickPoints(slug, options = {}) {
    if (!slug || typeof slug !== 'string') return null;
    const base = normalizeBase(options.base ?? BASE);
    const cacheKey = `${base}::${slug}`;
    if (resolvedCache.has(cacheKey)) return resolvedCache.get(cacheKey);

    if (!rawMapCache) rawMapCache = readRawMap();
    if (!rawMapCache.has(slug)) {
      resolvedCache.set(cacheKey, null);
      return null;
    }

    const parsed = validateQuickPoints(rawMapCache.get(slug), slug, { base });
    resolvedCache.set(cacheKey, parsed);
    return parsed;
  }

  function clearQuickPointsCache() {
    resolvedCache.clear();
    rawMapCache = null;
  }

  return { loadQuickPoints, clearQuickPointsCache };
}

const MATCHING_JSON_FILENAME_RE = /^\.\/([^/]+)\.json$/;

let viteGlobModules = null;
try {
  viteGlobModules = import.meta.glob('./*.json', { eager: true });
} catch {
  // Plain Node without Vite transform: use `./loader.node.js` when reading from disk under Node.
}

const { loadQuickPoints, clearQuickPointsCache } = createQuickPointsLoader(() => {
  const map = new Map();
  if (viteGlobModules) {
    for (const [relPath, mod] of Object.entries(viteGlobModules)) {
      const m = relPath.match(MATCHING_JSON_FILENAME_RE);
      if (m) map.set(m[1], mod?.default ?? mod);
    }
  }
  return map;
});

export { loadQuickPoints, clearQuickPointsCache };
