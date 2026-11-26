import discoverCatalog from '../data/discoverCatalog.json' with { type: 'json' };
import { EVIDENCE_TAXONOMY } from '../data/evidenceTaxonomy.js';

/**
 * Pure, deterministic route/prop -> section theme resolver for Layout.astro.
 *
 * Route lists are derived from the two existing taxonomies so a new Discover dossier or
 * evidence directory inherits its tradition's theme without a second hand-kept list:
 *   - `src/data/discoverCatalog.json` (`category`)
 *   - `src/data/evidenceTaxonomy.js` (`mainHeading`)
 * Unknown categories stay neutral rather than being guessed into a tradition.
 *
 * Returns one of:
 *   - 'christian' : Bible reader/detail, Christian evidence, Christian Discover dossiers
 *   - 'islamic'   : Qur'an reader/codices/variants, Hadith, Islamic evidence, Islamic Discover dossiers
 *   - 'neutral'   : Shared cross-tradition pages (Home, hubs, Statistics, Apologists, 404)
 */

/** Taxonomy group label -> theme. Labels not listed here resolve to neutral. */
export const TRADITION_BY_GROUP = Object.freeze({
  Christianity: 'christian',
  Islamics: 'islamic',
});

function discoverRoutes(theme) {
  return discoverCatalog
    .filter((item) => item?.slug && TRADITION_BY_GROUP[item.category] === theme)
    .map((item) => `/discover/${item.slug}`);
}

function evidenceRoutes(theme) {
  return EVIDENCE_TAXONOMY
    .filter((group) => TRADITION_BY_GROUP[group.mainHeading] === theme)
    .flatMap((group) => group.subHeadings.flatMap((sub) => sub.evidence))
    .map((id) => `/evidence/${id}`);
}

const ROUTE_PREFIXES = Object.freeze({
  islamic: ['/quran', '/hadith', ...evidenceRoutes('islamic'), ...discoverRoutes('islamic')],
  christian: ['/bible', ...evidenceRoutes('christian'), ...discoverRoutes('christian')],
});

const EXPLICIT_MAP = Object.freeze({
  christian: 'christian',
  bible: 'christian',
  islamic: 'islamic',
  quran: 'islamic',
  hadith: 'islamic',
  neutral: 'neutral',
});

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
  for (const theme of ['islamic', 'christian']) {
    if (ROUTE_PREFIXES[theme].some((prefix) => matchesPrefix(clean, prefix))) return theme;
  }
  return 'neutral';
}
