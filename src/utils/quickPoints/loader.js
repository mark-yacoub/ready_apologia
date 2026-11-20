/**
 * Build-time loader and schema validator for Quick Points (`src/utils/quickPoints/<slug>.json`).
 *
 * Works both inside Astro/Vite builds (via eager `import.meta.glob`) and under plain Node ESM
 * (`node --test`, via `node:fs` fallback relative to this module).
 *
 * Rules:
 *   - Missing file for `slug` -> returns `null` (no toggle rendered on the page).
 *   - Present file -> validates full shape and throws a single aggregated Error if invalid.
 *   - Renders ONLY `groups` (never `needsReview`).
 *   - Optional point `role`: `"lead" | "support" | "caveat"` (absent = `"support"`).
 *     Within each category, `lead` and `support` rows stay in data order first, followed by
 *     `caveat` rows in data order at the end of that category, with continuous numbering `n = 1..N`.
 *   - `href` and `path` include `BASE` (`import.meta.env.BASE_URL` without trailing slash).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '');
export const ALLOWED_ROLES = new Set(['lead', 'support', 'caveat']);

let globModules = null;
try {
  globModules = import.meta.glob('./*.json', { eager: true });
} catch {
  // Plain Node ESM (no Vite transform): fall back to fs below.
}

let rawBySlugCache = null;

function getRawBySlug() {
  if (rawBySlugCache) return rawBySlugCache;
  const map = new Map();
  if (globModules !== null) {
    for (const [relPath, mod] of Object.entries(globModules)) {
      const m = relPath.match(/^\.\/([^/]+)\.json$/);
      if (m) map.set(m[1], mod?.default ?? mod);
    }
  } else {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    if (fs.existsSync(dir)) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
        const fileSlug = entry.name.slice(0, -5);
        const fullPath = path.join(dir, entry.name);
        map.set(fileSlug, JSON.parse(fs.readFileSync(fullPath, 'utf8')));
      }
    }
  }
  rawBySlugCache = map;
  return map;
}

function normalizeBase(base) {
  if (!base || base === '/') return '';
  return String(base).replace(/\/$/, '');
}

function normalizePath(p) {
  if (!p || p === '/') return '/';
  return p.replace(/\/$/, '');
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

  if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
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
        const pLoc = `${gLoc}.points[${pi}]`;
        if (!pt || typeof pt !== 'object' || Array.isArray(pt)) {
          problems.push(`${pLoc} must be an object`);
          return;
        }

        const id = typeof pt.id === 'string' ? pt.id.trim() : '';
        if (!id) {
          problems.push(`${pLoc}.id must be a non-empty string`);
        } else if (/[\s#]/.test(id)) {
          problems.push(`${pLoc}.id "${id}" must not contain whitespace or "#"`);
        } else if (seenIds.has(id)) {
          problems.push(`${pLoc}.id "${id}" is duplicated`);
        } else {
          seenIds.add(id);
        }

        const statement = typeof pt.statement === 'string' ? pt.statement.trim() : '';
        if (!statement) {
          problems.push(`${pLoc} (${id || 'unnamed'}): statement must be a non-empty string`);
        }

        let role = 'support';
        if (pt.role !== undefined) {
          if (typeof pt.role !== 'string' || !ALLOWED_ROLES.has(pt.role)) {
            problems.push(
              `${pLoc} (${id || 'unnamed'}): role ${JSON.stringify(pt.role)} must be "lead", "support", or "caveat"`,
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
            `${pLoc} (${id || 'unnamed'}): target ${JSON.stringify(pt.target)} must start with "${expectedPrefix}"`,
          );
          return;
        }

        const hashParts = target.split('#');
        if (hashParts.length > 2) {
          problems.push(`${pLoc} (${id || 'unnamed'}): target "${target}" contains multiple "#" characters`);
          return;
        }
        if (hashParts.length === 2 && !hashParts[1]) {
          problems.push(`${pLoc} (${id || 'unnamed'}): target "${target}" has an empty "#hash"`);
          return;
        }

        const rawPath = normalizePath(hashParts[0]);
        const hash = hashParts[1] ?? '';
        const resolvedPath = `${base}${rawPath}`;
        const href = hash ? `${resolvedPath}#${hash}` : resolvedPath;

        const prepared = {
          id,
          statement,
          role,
          href,
          path: resolvedPath,
          hash,
        };

        if (role === 'caveat') {
          caveatPoints.push(prepared);
        } else {
          mainPoints.push(prepared);
        }
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

const resolvedCache = new Map();

/**
 * Memoised Quick Points view-model loader. Returns `null` when no `<slug>.json` exists.
 *
 * @param {string} slug
 * @param {{ base?: string }} [options]
 */
export function loadQuickPoints(slug, options = {}) {
  if (!slug || typeof slug !== 'string') return null;
  const base = normalizeBase(options.base ?? BASE);
  const cacheKey = `${base}::${slug}`;
  if (resolvedCache.has(cacheKey)) return resolvedCache.get(cacheKey);

  const rawMap = getRawBySlug();
  if (!rawMap.has(slug)) {
    resolvedCache.set(cacheKey, null);
    return null;
  }

  const parsed = validateQuickPoints(rawMap.get(slug), slug, { base });
  resolvedCache.set(cacheKey, parsed);
  return parsed;
}

export function clearQuickPointsCache() {
  resolvedCache.clear();
  rawBySlugCache = null;
}
