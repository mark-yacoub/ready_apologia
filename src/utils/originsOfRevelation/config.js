/**
 * Structure and routing config for /discover/origins-of-revelation.
 *
 * Nothing reader-facing lives here except reference labels derived from source names (book names,
 * collection names, work titles). Every heading, label and sentence is in `content.js` (owned by the
 * copy writer). This file holds ids, alias anchors, routes, the required LABELS, the host policy and
 * the reference → chip-label rules, so the model can turn a data reference such as `bible/rev/1/17`
 * into "Revelation 1:17" with a working link.
 */

import { BASE } from '../hadithReliability/config.js';

export { BASE };

/** Public URL of the article. A public URL: never change it without a redirect. */
export const ARTICLE_PATH = '/discover/origins-of-revelation';
export const BASE_PATH = `${BASE}${ARTICLE_PATH}`;
export const CATALOG_SLUG = 'origins-of-revelation';
export const OG_IMAGE = `${BASE}/media/demonic_revelation/cover.jpg`;
/** Production origin, used for absolute URLs (JSON-LD citations) when Astro.site is not available. */
export const SITE_URL = 'https://readyapologia.com';
/** First published 2026-08-20 (git history of the page); rebuilt 2026-10. */
export const DATE_PUBLISHED = '2026-08-20';
export const DATE_MODIFIED = '2026-10-26';
export const LAYOUT_TITLE_SUFFIX = ' | Ready Apologia';

/** Repo paths of the read-only inputs (src/data is owned by the data engine; never edit it from here). */
export const DATA_FILE = 'src/data/discover/islam/scripture/demonic_revelation.json';
export const CATALOG_FILE = 'src/data/discoverCatalog.json';

/** Page anchors. */
export const TOP_ID = 'top';
export const GLANCE_ID = 'at-a-glance';
export const SOURCES_ID = 'sources';

/**
 * Section order (strongest first: the two undisputed Ṣaḥīḥ accounts of how revelation came lead;
 * the New Testament's test of a spirit is the method and comes last) and the old ids that must keep
 * landing on each section (shared links from the previous page). content.js SECTIONS must match.
 * Sections with a `dataItemId` are the numbered accounts; the last one is not counted.
 */
export const SECTION_ORDER = ['hira', 'what-they-saw', 'sihr', 'quran-22-52', 'after-hira', 'testing-spirits'];
export const OLD_IDS = {
  'initial-encounter': 'hira',
  'physiological-manifestations': 'what-they-saw',
  'vulnerability-to-black-magic': 'sihr',
  'interception-of-revelation': 'quran-22-52',
  'suicidal-despair': 'after-hira',
  'biblical-mandate': 'testing-spirits',
};

/** The three quote groups of a data item (items[i].comparatives[0][group]) and their anchor tags. */
export const DATA_GROUPS = ['islamic_quotes', 'biblical_parallels', 'biblical_expectations'];
export const GROUP_TAG = { islamic_quotes: 'isl', biblical_parallels: 'par', biblical_expectations: 'exp' };

/** Source-list groups, in display order (labels in content.js LABELS.sourcesGroups). */
export const SOURCE_GROUPS = ['quran', 'hadith', 'sira', 'classical', 'bible'];

/**
 * LABELS the page cannot render without (a missing one would leave an empty control or heading).
 * `{n}` / `{refs}` / `{ref}` placeholders are filled by the model; an unknown placeholder fails.
 */
export const REQUIRED_LABELS = [
  'glance', 'navAria', 'back', 'copyLink', 'copied', 'copyFailed', 'backToTop', 'coldContext', 'emphasisNote',
  'sideBySide', 'sourcesWhat', 'classical', 'evaluation', 'deeper', 'moreParallels', 'repeatNote',
  'sources', 'sourcesNav', 'closingHeading', 'verifyAria', 'internalHadith',
];
export const REQUIRED_LABEL_GROUPS = { sourcesGroups: SOURCE_GROUPS };

/** Data book ids that are not site book ids. */
export const BOOK_ID_FIX = { rev: 'rv' };

/** Hadith collections cited on the page (Sunnah.com slugs). */
export const COLLECTIONS = {
  bukhari: 'Ṣaḥīḥ al-Bukhārī',
  muslim: 'Ṣaḥīḥ Muslim',
};

/**
 * Hadiths that also have an annotated permalink on this site (checked against the hadith explorer's
 * pages; the audit checks each one exists in dist). The chip sits beside the Sunnah.com chip.
 */
export const INTERNAL_HADITH = new Set(['bukhari:3', 'bukhari:4953', 'bukhari:5765', 'bukhari:6982', 'muslim:160a', 'muslim:2114', 'muslim:2189a']);
export const hadithShortName = (collection, num) => `${collection === 'bukhari' ? 'Bukhārī' : 'Muslim'} ${num}`;

/**
 * Works cited by URL root (archive.org scans). A reference that starts with `root` (a page-anchored
 * URL from a quote fix included) gets this label and group. An unknown archive.org reference fails
 * the build, so a raw URL is never shown as a label.
 */
export const WORKS = [
  { root: 'https://archive.org/details/TheLifeOfMohammedGuillaume', label: 'Ibn Isḥāq, Sīra (tr. Guillaume)', group: 'sira' },
  { root: 'https://archive.org/details/GuillaumeATheLifeOfMuhammad', label: 'Ibn Isḥāq, Sīra (tr. Guillaume)', group: 'sira' },
  { root: 'https://archive.org/details/TheHistoryOfAlTabariVol.6MuhammadAtMecca', label: 'al-Ṭabarī, History, vol. 6', group: 'sira' },
  { root: 'https://archive.org/details/the-history-of-al-tabari-vol.-6-muhammad-at-mecca-by-tabari-w.-montgomery-watt-m', label: 'al-Ṭabarī, History, vol. 6', group: 'sira' },
];

/**
 * External hosts the page may link to, and the source-list group each one files under. Any other
 * host (or a non-https link) fails the build: add it here deliberately, with its group.
 */
export const HOSTS = {
  'sunnah.com': 'hadith',
  'quran.com': 'quran', // rewritten to this site's tafsir pages
  'archive.org': 'classical', // the sīra / history scans match WORKS first and file under 'sira'
  'islamweb.net': 'classical',
  'shamela.ws': 'classical',
  'ketabonline.com': 'classical',
  'dorar.net': 'classical',
  'al-maktaba.org': 'classical',
  'islamport.com': 'classical',
};

/**
 * Quotations verified by hand against a source outside the repo (sourceFile: 'external'). The unit
 * test fails on any external text not listed here, so a new one cannot slip in unreviewed.
 * Key: `fix:<itemId>/<group>/<index>` or `extra:<EXTRA_QUOTES key>`.
 */
export const EXTERNAL_VERIFIED = {
  'fix:physiological-manifestations/islamic_quotes/1': 'checked 2026-10-26 against Sunnah.com Muslim 2334 (fawazahmed0 eng-muslim 6060)',
  'fix:physiological-manifestations/islamic_quotes/5': 'checked 2026-10-26 against Sunnah.com Muslim 1180a (fawazahmed0 eng-muslim 2798)',
  'fix:suicidal-despair/islamic_quotes/2': 'checked 2026-10-26 against Guillaume p. 106 scan (archive.org GuillaumeATheLifeOfMuhammad)',
  'fix:initial-encounter/islamic_quotes/3': 'checked 2026-10-26 against Guillaume p. 106 scan (archive.org GuillaumeATheLifeOfMuhammad)',
  'extra:iyad-shifa-gharaniq': 'checked 2026-10-26 against Fatḥ al-Bārī 8:293 on IslamWeb',
  'extra:ibn-hajar-gharaniq-asl': 'checked 2026-10-26 against Fatḥ al-Bārī 8:293–294 on IslamWeb',
};

// ---- routes (every internal href includes BASE) -------------------------------------------------
export const discoverHref = () => `${BASE}/discover`;
export const tafsirHref = (surah, ayah, scholar = 'tabari') => `${BASE}/quran/${surah}/${ayah}/tafsir/${scholar}`;
export const bibleHref = (book, ch, v) => `${BASE}/bible/${book}/${ch}${v ? `#${v}` : ''}`;
export const hadithHref = (collection, num) => `${BASE}/hadith/${collection}/${num}`;
export const sunnahHref = (collection, num) => `https://sunnah.com/${collection}:${num}`;
/** Site-relative path ('/quran/…') → BASE-aware href. Protocol-relative ('//host') paths are refused. */
export function sitePath(p) {
  if (/^\/\//.test(p) || /^\/\\/.test(p)) throw new Error(`[originsOfRevelation] protocol-relative link "${p}" is not allowed`);
  return p.startsWith('/') ? `${BASE}${p}` : p;
}
