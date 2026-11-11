/**
 * Structure, routing, and host policy for /discover/extrabiblical-evidence-for-jesus.
 *
 * All reader-facing prose lives in `content.js` and `overrides.js`. This file holds canonical paths,
 * section ordering, legacy anchor mappings (preserving all 5 theme IDs and all 52 `#evidence-<id>`
 * slugs from `src/data/extrabiblical-evidence-for-jesus.json`), repository groupings, and the
 * external-host allowlist.
 */

import { BASE } from '../hadithReliability/config.js';

export { BASE };

/** Public URL of the article. Never change without a redirect. */
export const ARTICLE_PATH = '/discover/extrabiblical-evidence-for-jesus';
export const BASE_PATH = `${BASE}${ARTICLE_PATH}`;
export const CATALOG_SLUG = 'extrabiblical-evidence-for-jesus';
export const OG_IMAGE = `${BASE}/media/extrabiblical_evidence/cover.jpg`;
export const SITE_URL = 'https://readyapologia.com';
export const DATE_PUBLISHED = '2026-07-29';
export const DATE_MODIFIED = '2026-11-06';
export const LAYOUT_TITLE_SUFFIX = ' | Ready Apologia';

/** Read-only repository data paths (owned by data_collection; never modified here). */
export const DATA_FILE = 'src/data/extrabiblical-evidence-for-jesus.json';
export const CATALOG_FILE = 'src/data/discoverCatalog.json';
export const EXPECTED_DATA_SHA256 =
  'aa3d0855ee11ffa88b54e457070343fd677db9adcf864d60ecbeeb434228b9f4';

/** Top-level page anchors. */
export const TOP_ID = 'top';
export const GLANCE_ID = 'at-a-glance';
export const SOURCES_ID = 'sources';

/**
 * Six sections: five numbered primary categories (`isItem: true`, matching the 5 At-a-Glance rows)
 * followed by one unnumbered methodological appendix (`corroborative-and-disputed`, rendered with
 * the scale icon).
 */
export const SECTION_ORDER = [
  'roman-records',
  'josephus',
  'pagan-critics',
  'rabbinic-sources',
  'archaeology',
  'corroborative-and-disputed',
];

/**
 * Legacy theme IDs from `extrabiblical-evidence-for-jesus.json` that do not match a new section ID
 * directly (`archaeology` is already Section 5's ID, so all 5 legacy theme IDs resolve cleanly).
 */
export const LEGACY_THEME_ALIASES = {
  crucifixion: 'roman-records',
  resurrection: 'roman-records',
  'historical-jesus': 'josephus',
  'early-christology': 'pagan-critics',
};

/** Expected counts enforced by model.js, unit tests, and the built-HTML static audit. */
export const EXPECTED_COUNTS = {
  rawEntries: 62,
  uniqueEvidenceIds: 52,
  uniqueThemeIds: 5,
  deduplicatedCards: 40,
  literaryAuthors: 16,
  archaeologyFinds: 10,
  numberedSections: 5,
};

/** Bibliography groups in `#sources`, in display order. */
export const SOURCE_GROUPS = [
  'roman_greek',
  'rabbinic',
  'archaeology',
  'patristic',
  'scripture',
];

/** Required UI labels in `content.js`. */
export const REQUIRED_LABELS = [
  'glance',
  'navAria',
  'back',
  'copyLink',
  'copied',
  'copyFailed',
  'backToTop',
  'sideBySide',
  'sourcesWhat',
  'classical',
  'evaluation',
  'deeper',
  'sources',
  'sourcesNav',
  'closingHeading',
  'verifyAria',
  'findingTag',
];
export const REQUIRED_LABEL_GROUPS = { sourcesGroups: SOURCE_GROUPS };

/**
 * Bible books included in the fast sliced preview build (`preview.sh`), with canonical display names.
 * Restricting `/bible/<book>/<ch>#<v>` links to these books guarantees 100% live clickability in
 * both sliced preview builds and full production builds.
 */
export const BIBLE_BOOKS = {
  mt: 'Matthew',
  mk: 'Mark',
  lk: 'Luke',
  jn: 'John',
  acts: 'Acts',
  rom: 'Romans',
  '1cor': '1 Corinthians',
  phil: 'Philippians',
  col: 'Colossians',
  '1tm': '1 Timothy',
  '2pt': '2 Peter',
  '1jn': '1 John',
  rv: 'Revelation',
  is: 'Isaiah',
  ps: 'Psalms',
  nm: 'Numbers',
};

/** Internal non-scripture routes permitted in prose and cross-reference chips (`group: null` omits them from primary-source bibliography). */
export const INTERNAL_ROUTES = new Set([
  '/discover',
  '/discover/divinity-timeline',
  '/discover/trustworthiness-of-the-bible',
  '/evidence/divinity_of_christ',
  '/evidence/nt_authors',
]);

/**
 * Curated external primary-source and academic hosts (`https://` only).
 * Wikipedia, BibleGateway, come-and-hear.com, and polemical blogs are excluded; any unlisted host
 * throws at build time.
 */
export const HOSTS = {
  'www.perseus.tufts.edu': 'roman_greek',
  'penelope.uchicago.edu': 'roman_greek',
  'classics.mit.edu': 'roman_greek',
  'www.attalus.org': 'roman_greek',
  'www.tertullian.org': 'roman_greek',
  'archive.org': 'roman_greek',
  'www.sefaria.org': 'rabbinic',
  'www.ascsa.edu.gr': 'archaeology',
  'openalex.org': 'archaeology',
  'www.livius.org': 'archaeology',
  'doi.org': 'archaeology',
  'www.newadvent.org': 'patristic',
  'www.ccel.org': 'patristic',
  'www.earlychristianwritings.com': 'patristic',
  'www.kerux.com': 'patristic',
};

// ---- routes (every internal href includes BASE) -------------------------------------------------
export const discoverHref = () => `${BASE}/discover`;
export const tafsirHref = (surah, ayah, scholar = 'tabari') => `${BASE}/quran/${surah}/${ayah}/tafsir/${scholar}`;
export const bibleHref = (book, ch, v) => `${BASE}/bible/${book}/${ch}${v ? `#${v}` : ''}`;

/** Site-relative path ('/bible/…') -> BASE-aware href. Protocol-relative ('//host') paths are refused. */
export function sitePath(p) {
  if (/^\/\//.test(p) || /^\/\\/.test(p)) {
    throw new Error(`[extrabiblicalEvidence] protocol-relative link "${p}" is not allowed`);
  }
  return p.startsWith('/') ? `${BASE}${p}` : p;
}
