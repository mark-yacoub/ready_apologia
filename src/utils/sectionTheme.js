import discoverCatalog from '../data/discoverCatalog.json' with { type: 'json' };

/**
 * Pure, deterministic route/prop -> section theme resolver for Layout.astro.
 *
 * Discover article slugs are derived directly from `src/data/discoverCatalog.json`
 * so adding a new dossier automatically inherits its tradition's theme without drift.
 *
 * Returns one of:
 *   - 'christian' : Bible reader/detail, Christian evidence, apologists, Christian Discover dossiers
 *   - 'islamic'   : Qur'an reader/codices/variants, Hadith explorer, Islamic evidence, Islamic Discover dossiers
 *   - 'neutral'   : Shared cross-tradition hubs (Home, Discover index, Evidence index, Statistics, 404)
 */

const discoverIslamic = discoverCatalog
  .filter((item) => item?.category && item.category !== 'Christianity' && item.slug)
  .map((item) => `/discover/${item.slug}`);

const discoverChristian = discoverCatalog
  .filter((item) => item?.category === 'Christianity' && item.slug)
  .map((item) => `/discover/${item.slug}`);

const ISLAMIC_EXACT_OR_PREFIX = [
  '/quran',
  '/hadith',
  '/evidence/quran_sources',
  '/evidence/quranic_deficiencies',
  '/evidence/scientific_errors',
  ...discoverIslamic,
];

const CHRISTIAN_EXACT_OR_PREFIX = [
  '/bible',
  '/apologists',
  '/evidence/divinity_of_christ',
  '/evidence/divinity_of_the_holy_spirit',
  '/evidence/trinity',
  '/evidence/prophecies',
  '/evidence/nt_authors',
  ...discoverChristian,
];

const EXPLICIT_MAP = {
  christian: 'christian',
  bible: 'christian',
  islamic: 'islamic',
  quran: 'islamic',
  hadith: 'islamic',
  neutral: 'neutral',
};

function matchesPrefix(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function normalizePath(pathname, base = '') {
  let clean = typeof pathname === 'string' ? pathname.trim() : '/';
  if (base && base !== '/' && clean.startsWith(base)) {
    clean = clean.slice(base.length) || '/';
  }
  const qIdx = clean.search(/[?#]/);
  if (qIdx !== -1) clean = clean.slice(0, qIdx);
  if (!clean.startsWith('/')) clean = `/${clean}`;
  if (clean.length > 1 && clean.endsWith('/')) clean = clean.slice(0, -1);
  return clean.toLowerCase();
}

export function resolveSectionTheme(pathname, explicitTheme, base = '') {
  if (explicitTheme && typeof explicitTheme === 'string') {
    const mapped = EXPLICIT_MAP[explicitTheme.trim().toLowerCase()];
    if (mapped) return mapped;
  }

  const clean = normalizePath(pathname, base);
  if (ISLAMIC_EXACT_OR_PREFIX.some((prefix) => matchesPrefix(clean, prefix))) {
    return 'islamic';
  }
  if (CHRISTIAN_EXACT_OR_PREFIX.some((prefix) => matchesPrefix(clean, prefix))) {
    return 'christian';
  }
  return 'neutral';
}
