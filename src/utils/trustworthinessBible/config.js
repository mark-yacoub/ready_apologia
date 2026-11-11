/**
 * Structure, routing, host policy, and legacy anchor map for /discover/trustworthiness-of-the-bible.
 *
 * All reader-facing analytical copy lives in content.js and overrides.js. This module holds stable
 * route builders, allowed external scholarly hosts, verified data.db manuscript coordinates, and the
 * complete inventory of legacy DOM IDs that must remain resolvable without JavaScript.
 */

import { BASE } from '../hadithReliability/config.js';
import { R2_BASE_URL } from '../cdn_config.js';

export { BASE, R2_BASE_URL };

export const ARTICLE_PATH = '/discover/trustworthiness-of-the-bible';
export const BASE_PATH = `${BASE}${ARTICLE_PATH}`;
export const CATALOG_SLUG = 'trustworthiness-of-the-bible';
export const OG_IMAGE = `${BASE}/media/trustworthiness_bible/cover.jpg`;
export const SITE_URL = 'https://readyapologia.com';
export const DATE_PUBLISHED = '2026-08-20';
export const DATE_MODIFIED = '2026-11-09';
export const LAYOUT_TITLE_SUFFIX = ' | Ready Apologia';

export const DATA_FILE = 'src/data/trustworthiness-of-the-bible.json';
export const CATALOG_FILE = 'src/data/discoverCatalog.json';
export const EXPECTED_DATA_SHA256 =
  'f3e288003842a646949f13e6e5ee9b06ce354378a6842e5696b0007e9cde17d1';

export const TOP_ID = 'top';
export const GLANCE_ID = 'at-a-glance';
export const SOURCES_ID = 'sources';

export const SECTION_ORDER = [
  'section-stage1',
  'section-stage2',
  'section-stage3',
  'section-stage4',
];

/** Top-level legacy hash aliases mapped to their canonical section or container IDs. */
export const OLD_IDS = {
  'stage-filter-nav': 'top',
  'overview': 'at-a-glance',
  'section-overview': 'at-a-glance',
  'stage1': 'section-stage1',
  'stage2': 'section-stage2',
  'stage3': 'section-stage3',
  'stage4': 'section-stage4',
  'manuscripts-section-title': 'stage1-biblical-manuscripts',
  'variants-section-title': 'stage1-textual-variants',
  'bracketed-passages': 'stage1-textual-variants',
  'histogram-section-title': 'stage1-classical-comparison',
  'archaeology-heading': 'stage2-archaeology-nt',
  'historians-heading': 'stage2-secular-historians',
  'simon-group': 'stage3-onomastics',
  'mary-group': 'stage3-onomastics',
  'rare-group': 'stage3-onomastics',
  'gospels': 'patristic-total-quotations',
  'acts': 'patristic-total-quotations',
  'pauline': 'patristic-total-quotations',
  'general': 'patristic-total-quotations',
  'revelation': 'patristic-total-quotations',
  'other': 'patristic-total-quotations',
  'liar': 'verdict-cs-lewis-trilemma',
  'lunatic': 'verdict-cs-lewis-trilemma',
  'lord': 'verdict-cs-lewis-trilemma',
};

/** All 12 raw JSON theme IDs in trustworthiness-of-the-bible.json (locked for data contract). */
export const EXPECTED_THEME_IDS = [
  'stage1-classical-comparison',
  'stage1-biblical-manuscripts',
  'stage1-textual-variants',
  'stage2-archaeology-nt',
  'stage2-secular-historians',
  'stage2-archaeology-ot',
  'stage3-onomastics',
  'stage3-undesigned-coincidences',
  'stage3-criterion-of-embarrassment',
  'stage4-patristic-quotations',
  'stage4-canon-history',
  'stage4-verdict',
];

/** Source-list groups in display order (labels defined in content.js LABELS.sourcesGroups). */
export const SOURCE_GROUPS = ['manuscripts', 'museums', 'classical', 'scripture'];

export const REQUIRED_LABELS = [
  'glance', 'navAria', 'back', 'copyLink', 'copied', 'copyFailed', 'backToTop',
  'scanSummary', 'scanOpenFull', 'sources', 'sourcesNav', 'verifyAria', 'classicalLabel', 'evaluationLabel',
];
export const REQUIRED_LABEL_GROUPS = { sourcesGroups: SOURCE_GROUPS };

/**
 * Allowed external scholarly, museum, library, and primary-source domains, mapped to their
 * SourcesBlock repository category. Non-https or unlisted hosts fail buildModel().
 */
export const HOSTS = {
  'csntm.org': 'manuscripts',
  'www.csntm.org': 'manuscripts',
  'manuscripts.csntm.org': 'manuscripts',
  'codexsinaiticus.org': 'manuscripts',
  'www.codexsinaiticus.org': 'manuscripts',
  'digi.vatlib.it': 'manuscripts',
  'www.deadseascrolls.org.il': 'manuscripts',
  'quod.lib.umich.edu': 'manuscripts',
  'digitalcollections.manchester.ac.uk': 'manuscripts',
  'mss.readyapologia.com': 'manuscripts',
  'scriptaclassica.org': 'museums',
  'www.ascsa.edu.gr': 'museums',
  'cojs.org': 'museums',
  'www.museumofthebible.org': 'museums',
  'collections.louvre.fr': 'museums',
  'www.livius.org': 'museums',
  'livius.org': 'museums',
  'ccel.org': 'classical',
  'www.ccel.org': 'classical',
  'www.newadvent.org': 'classical',
  'newadvent.org': 'classical',
  'www.sefaria.org': 'classical',
  'sefaria.org': 'classical',
  'ar.wikisource.org': 'classical',
  'archive.org': 'classical',
};

/** Valid internal book codes from src/data/books_meta.json. */
export const VALID_BOOKS = new Set([
  'mt', 'mk', 'lk', 'jn', 'acts', 'rom', '1cor', '2cor', 'gal', 'eph', 'phil', 'col',
  '1thes', '2thes', '1tm', '2tm', 'ti', 'phlm', 'heb', 'jas', '1pt', '2pt', '1jn', '2jn', '3jn', 'jude', 'rv',
  'gn', 'ex', 'lv', 'nm', 'dt', 'jo', 'jgs', 'ru', '1sm', '2sm', '1kgs', '2kgs', '1chr', '2chr',
  '1esd', 'ezr', 'neh', 'tb', 'jdt', 'est', '1mc', '2mc', '3mc', '4mc', 'jb', 'ps', 'prman', 'prv',
  'eccl', 'sg', 'ws', 'sir', 'hos', 'am', 'mi', 'jl', 'ob', 'jon', 'na', 'hb', 'zep', 'hg', 'zec',
  'mal', 'is', 'jer', 'bar', 'lam', 'eoj', 'ez', 'dn', 'prazar',
]);

/**
 * Builds a URL-encoded Cloudflare R2 scan URL with zero unencoded spaces or parentheses.
 * NT manuscripts live under /images/<msId>/<folio>; OT manuscripts (B, 1QIsa-a, 11Q5) under /ot_images/.
 */
export function r2ScanUrl(corpus, msId, folio) {
  const dir = corpus === 'ot' ? 'ot_images' : 'images';
  const enc = s => encodeURIComponent(s).replace(/\(/g, '%28').replace(/\)/g, '%29');
  return `${R2_BASE_URL}/${dir}/${enc(msId)}/${enc(folio)}`;
}

// ---- routes (every internal href includes BASE) -------------------------------------------------
export const discoverHref = () => `${BASE}/discover`;
export const bibleHref = (book, ch, v) => `${BASE}/bible/${book}/${ch}${v ? `#${v}` : ''}`;
export const bibleMsHref = (book, ch, v) => `${BASE}/bible/${book}/${ch}/${v}/manuscripts`;
export const tafsirHref = (surah, ayah, scholar = 'tabari') => `${BASE}/quran/${surah}/${ayah}/tafsir/${scholar}`;

export function sitePath(p) {
  if (/^\/\//.test(p) || /^\/\\/.test(p)) {
    throw new Error(`[trustworthinessBible] protocol-relative link "${p}" is not allowed`);
  }
  return p.startsWith('/') ? `${BASE}${p}` : p;
}
