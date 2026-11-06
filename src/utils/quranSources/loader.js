/**
 * Build-time loader for the v3 "Primary Sources of the Quran" verse drawer tab.
 * Reads the deduplicated per-surah files written by scripts/import_quran_sources.js.
 * Memoised per surah for fast SSG builds.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  CATEGORY_BY_KEY,
  TRADITION_BY_KEY,
  verifyLabelFor,
  distinctWorkSubtitle,
  langCodeFor,
  dirForLang,
} from './contract.js';

// Resolved from the project root (Astro and the node scripts both run there). Not import.meta.url:
// this module is bundled into dist/chunks at build time, which would move the relative base and
// silently resolve to a non-existent dist/data/... directory (0 drawer pages, 0 badges).
const DIR = path.join(process.cwd(), 'src/data/quran/sources');
let indexCache = null;
const surahCache = new Map();

export function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return fallback;
    }
    throw new Error(`Failed to read JSON file "${file}": ${err?.message || err}`, {
      cause: err,
    });
  }
}

export function loadQuranSourcesIndex() {
  if (!indexCache) {
    const indexPath = path.join(DIR, 'index.json');
    indexCache = readJson(indexPath, null);
    if (!indexCache) {
      console.warn(
        `[quranSources] ${indexPath} not found; Primary Sources badges and drawer pages are disabled. ` +
          'Run `npm run import:quran-sources`.'
      );
      indexCache = { verseCounts: {}, categories: [] };
    }
  }
  return indexCache;
}

/** Set of "s:a" verse ids that have at least one curated v3 parallel. */
export function getQuranSourcesVerseSet() {
  return new Set(Object.keys(loadQuranSourcesIndex().verseCounts || {}));
}

export function getQuranSourcesCount(verseId) {
  return loadQuranSourcesIndex().verseCounts?.[verseId] || 0;
}

function loadSurah(surah) {
  const key = String(surah);
  if (!surahCache.has(key)) {
    surahCache.set(
      key,
      readJson(path.join(DIR, `surah_${key}.json`), { entries: {}, verses: {} })
    );
  }
  return surahCache.get(key);
}

/**
 * View model for one verse in the drawer tab (/quran/[surah]/[ayah]/sources).
 * @param {string} verseId "s:a"
 * @param {string} base import.meta.env.BASE_URL without trailing slash ('' for root)
 */
export function getQuranSourcesForVerse(verseId, base = '') {
  const [surah] = String(verseId || '').split(':');
  const surahData = loadSurah(surah);
  const entryIds = surahData?.verses?.[verseId];
  const entriesById = surahData?.entries || {};

  if (!Array.isArray(entryIds) || entryIds.length === 0) {
    return { entries: [], total: 0, sampleTitles: [] };
  }

  let total = 0;
  const sampleTitlesSet = new Set();

  const entries = entryIds
    .map((id) => entriesById[id])
    .filter(Boolean)
    .map((entry) => {
      const cat = CATEGORY_BY_KEY[entry.cat] || {
        key: entry.cat,
        slug: entry.cat,
        badge: 'Primary Parallel',
        label: 'Primary Sources',
      };
      const sources = (entry.sources || []).map((s) => {
        total += 1;
        if (s.title) sampleTitlesSet.add(s.title);
        const trad = TRADITION_BY_KEY[s.t];
        const langCode = s.langCode || langCodeFor(s.lang);
        return {
          ...s,
          workSub: s.workSub ?? distinctWorkSubtitle(s.title, s.ref),
          langCode,
          dir: s.dir || dirForLang(langCode),
          traditionLabel: trad ? trad.short : s.t,
          href: s.external ? s.href : `${base}${s.href}`,
          verifyLabel: s.verifyLabel || verifyLabelFor(s),
        };
      });

      return {
        ...entry,
        categoryBadge: cat.badge,
        categorySlug: cat.slug,
        categoryLabel: cat.label,
        isRange: entry.startAyah !== entry.endAyah,
        sources,
      };
    });

  return {
    entries,
    total,
    sampleTitles: [...sampleTitlesSet].slice(0, 3),
  };
}
