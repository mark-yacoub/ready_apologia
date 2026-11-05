/**
 * Presentation config for `/discover/convenient-revelations` (reader-facing name: "12 Occasions of
 * Revelation"). The URL slug is kept for inbound links; the old name never appears in copy.
 *
 * Two layers:
 *   - `copy.js`: the article's copy, the in-repo source of truth for every reader-facing string — hub,
 *     chapters, labels, item copy, showcase specs, stage labels, summaries, cross-links, quote/ref fixes
 *     and source layout. Edit it directly; `model.js` validates every edit at build time.
 *   - this file: structure (ids, legacy anchors, chapter placement and reading order), the one
 *     mechanical quote fix the copy doesn't carry, UI fallbacks, and the merge of both layers.
 *
 * The dataset (`src/data/convenient-revelations.json`) supplies the quoted sources only; its own prose
 * (`title`, `the_claim`, `standard_apologetic_defense`, `the_devastating_counter`) is never read.
 */
import { GLOBAL as COPY_GLOBAL, ITEMS as COPY_ITEMS, QURAN_TEXT, DATASET_REFS } from './copy.js';
import { BASE } from '../hadithReliability/config.js';
import { CONVENIENT_REVELATIONS_PATH, MUHAMMAD_AND_SLAVERY_PATH } from '../routes.js';

/** Site base ('' at the root), shared with the other Discover articles. */
export { BASE };
/** Public URL slug (kept for inbound links and search equity; never shown as a name). */
export const ARTICLE_SLUG = 'convenient-revelations';
export const BASE_PATH = `${BASE}${CONVENIENT_REVELATIONS_PATH}`;
/** Analytics `article` param (unchanged so dashboards keep working). */
export const ANALYTICS_ARTICLE = 'convenient-revelations';
/**
 * Share image. `null` → Layout falls back to the site default.
 * OPEN QUESTION (user sign-off): `/media/convenient_revelations/cover.jpg` depicts the Prophet's face
 * and must not be rendered anywhere; a non-figurative replacement is pending (see data_proposals.md).
 */
export const OG_IMAGE = null;
export const DATE_PUBLISHED = '2026-10-24';
export const SITE_NAME = 'Ready Apologia';

const ASIDE_SLAVERY = {
  text: 'The wider record on captives and slavery in Bukhārī and Muslim:',
  linkLabel: 'Muḥammad and slavery',
  href: `${BASE}${MUHAMMAD_AND_SLAVERY_PATH}`,
};

/**
 * Structure per dataset theme: public anchor, legacy anchor (aliases `-claim/-defense/-counter` derive
 * from it), chapter and order within it (reading order), optional quiet cross-pointer. A theme must stay
 * in its pre-2026 chapter so `/<chapter>#<legacy-anchor>` links keep landing (pinned by the unit test).
 */
const STRUCTURE = {
  Theme_02_Marital_Rotation: { id: 'wives-turns-33-51', legacy: 'exemption-from-equal-marital-rotation', part: 'sexual-privileges', order: 1 },
  Theme_01_Marital_Limits: { id: 'four-wife-limit-33-50', legacy: 'exemption-from-the-four-wife-limit', part: 'sexual-privileges', order: 2 },
  Theme_03_Zaynab_Marriage: { id: 'zaynab-marriage-33-37', legacy: 'the-marriage-to-zaynab-abolishing-adoption', part: 'sexual-privileges', order: 3 },
  Theme_04_Safe_Harbor_Oaths: { id: 'forbidding-the-lawful-66-1', legacy: 'the-divine-loophole-for-oaths-maria-the-copt', part: 'evading-accountability', order: 1 },
  Theme_08_Aisha_Ifk: { id: 'accusation-and-witnesses-24', legacy: 'the-slander-of-aisha-the-loophole-of-the-4-witness-rule', part: 'evading-accountability', order: 2 },
  Theme_09_Fasting_Relaxations: { id: 'ramadan-nights-2-187', legacy: 'relaxing-fasting-rules-for-companions', part: 'evading-accountability', order: 3 },
  Theme_06_Etiquette_Interventions: { id: 'wedding-guests-33-53', legacy: 'dinner-etiquette-dismissing-guests', part: 'spoils-and-etiquette', order: 1 },
  Theme_07_Umar_Hijab: { id: 'umar-and-the-hijab-33-53', legacy: 'the-hijab-revelation-validating-umar', part: 'spoils-and-etiquette', order: 2 },
  Theme_05_Captives_of_War: { id: 'captives-of-awtas-4-24', legacy: 'permitting-married-female-captives-awtas', part: 'spoils-and-etiquette', order: 3, aside: ASIDE_SLAVERY },
  Theme_12_Wives_Demanding_Wealth: { id: 'wives-choice-33-28', legacy: 'silencing-the-wives-demands-for-wealth', part: 'wealth-and-power', order: 1 },
  Theme_10_War_Booty_and_Fay: { id: 'spoils-and-fay-8-1', legacy: 'absolute-control-of-war-booty-khums-fay', part: 'wealth-and-power', order: 2 },
  Theme_11_Slavery_and_Wealth: { id: 'captives-and-slaves-33-50', legacy: 'the-lucrative-trade-of-slavery', part: 'wealth-and-power', order: 3, aside: ASIDE_SLAVERY },
};

/** The four chapter slugs (public URLs: never change them without a redirect). Order comes from copy.js. */
const PART_SLUGS = ['sexual-privileges', 'evading-accountability', 'spoils-and-etiquette', 'wealth-and-power'];

/**
 * The one mechanical quote fix the copy doesn't carry (keyed `<theme>:<src>`; `find` must occur exactly
 * once). If copy.js ever adds a quote fix for the same source, the build fails instead of silently
 * picking one.
 */
const MECHANICAL_QUOTE_FIXES = {
  'Theme_05_Captives_of_War:7': [
    {
      field: 'english',
      find: ' *(Note: While Tabari emphasizes that they were permitted only after their waiting periods and separation by Islam, the narrations explicitly confirm the companions\' moral hesitation which necessitated the revelation.)*',
      replace: '',
      reason: 'An editorial note inside a quotation (playbook §2.5); data proposal.',
    },
  ],
};

/**
 * Secondary verify chip for every al-Ṭabarī reference: the site's English al-Ṭabarī is machine-generated,
 * so readers also get the Arabic text on KSU.
 */
export const TABARI_ARABIC_URL = (surah, ayah) => `https://quran.ksu.edu.sa/tafseer/tabary/sura${surah}-aya${ayah}.html`;

/** UI labels; copy.js `GLOBAL.labels` overrides them (aliases below). All are banned-word tested. */
const DEFAULT_LABELS = {
  hubCrumb: 'Discover',
  siteName: SITE_NAME,
  startHere: 'Start here',
  startHereRow: 'Start here',
  openStart: 'Read it in chapter 1',
  openChapter: 'Open chapter',
  itemsCount: '{n} items',
  allItems: 'All {n}',
  allItemsLong: 'All {n} on the hub',
  partOf: 'Part {n} of {total}',
  partWord: 'Part',
  ofWord: 'of',
  itemOf: '{n} of {total}',
  coldContext: 'Part {n} of {total} · {name}',
  chapterNav: 'Chapter navigation',
  chapterPager: 'Previous and next chapter',
  onThisPage: 'On this page',
  copyLink: 'Copy link',
  copyItemLink: 'Copy link to this item',
  copied: 'Link copied',
  copyFailed: 'Could not copy the link',
  provAddresses: 'Addresses the Prophet in',
  provScope: 'Scope in the Qurʾān',
  provOccasion: 'Occasion in',
  aboutQuestion: 'About this question',
  sources: 'What the sources say',
  moreSources: 'Show {n} more sources',
  classical: 'How classical scholars explain it',
  comparing: 'Comparing with the texts',
  readFull: 'Read the full text',
  showLess: 'Show less',
  next: 'Next',
  nextChapter: 'Next chapter',
  prevChapter: 'Previous chapter',
  lastChapter: 'That was the last chapter',
  backToAll: 'Back to all {n}',
  otherChapters: 'Other chapters',
  chapterSources: 'Sources cited in this chapter',
  sourcesUsed: 'Sources used in this article',
  summary: 'A summary of this report, not a quotation',
  noLink: 'No verified online copy is linked here',
  seeAlso: 'See also',
  verifyGroup: 'Check this source',
};

/** Showcase captions by type (an item's `showcase.caption` wins). */
const DEFAULT_SHOWCASE_LABELS = {
  confrontation: 'Two rules side by side',
  timeline: 'What happened, what was revealed',
  versions: 'Two reports of one occasion',
  number_fan: 'Shares of the spoils',
  facts: 'Key findings',
};

/** "Sources cited in this chapter" groups (by repository), in display order. */
export const SOURCE_GROUPS = [
  { kind: 'site', label: 'Qurʾān and tafsīr on this site', note: 'Opens the verse with Tafsīr al-Ṭabarī or Ibn Kathīr' },
  { kind: 'sunnah', label: 'Ḥadīth collections', note: 'Opens Sunnah.com' },
  { kind: 'classical', label: 'Tafsīr al-Ṭabarī in Arabic', note: 'Opens quran.ksu.edu.sa' },
  { kind: 'other', label: 'Other collections', note: '' },
];

/** Hub footer counts (derived from the data; labels only here). */
export const STAT_LABELS = {
  quran: 'Qurʾān passages',
  bukhari: 'Ṣaḥīḥ al-Bukhārī',
  muslim: 'Ṣaḥīḥ Muslim',
  otherHadith: 'from other ḥadīth collections ({names})',
  tabari: 'verses in Tafsīr al-Ṭabarī',
  ibnKathir: 'verses in Tafsīr Ibn Kathīr',
  otherWorks: 'in other works ({names})',
};

// ---- merge: copy.js over structure and fallbacks ------------------------------------------------

/** The copy module (model.js reads item copy and showcases from here). */
export const COPY = { GLOBAL: COPY_GLOBAL, ITEMS: COPY_ITEMS, QURAN_TEXT, DATASET_REFS };

/** copy.js label keys that differ from ours. Keys we don't render are dropped (not merged). */
const LABEL_ALIASES = { provenanceAddresses: 'provAddresses', provenanceScope: 'provScope', provenanceOccasion: 'provOccasion', provenanceExtra: 'provExtra', about: 'aboutQuestion', summaryOf: 'summary', sourcesInChapter: 'chapterSources' };
const RENDERED_LABELS = new Set([...Object.keys(DEFAULT_LABELS), 'articleName', 'footerNote', 'provExtra']);
export const LABELS = { ...DEFAULT_LABELS };
for (const [k, v] of Object.entries(COPY_GLOBAL.labels || {})) {
  const key = LABEL_ALIASES[k] || k;
  if (RENDERED_LABELS.has(key)) LABELS[key] = v;
}
if (COPY_GLOBAL.hub?.startHereLabel) LABELS.startHere = COPY_GLOBAL.hub.startHereLabel;
if (COPY_GLOBAL.hub?.footerLabel) LABELS.sourcesUsed = COPY_GLOBAL.hub.footerLabel;

export const SHOWCASE_LABELS = { ...DEFAULT_SHOWCASE_LABELS, ...(COPY_GLOBAL.showcaseCaptions || {}) };

/** Reader-facing name of the whole article (breadcrumbs, JSON-LD, chapter context line). */
export const ARTICLE_NAME = LABELS.articleName || '12 Occasions of Revelation';

const hub = COPY_GLOBAL.hub || {};
export const HUB = {
  h1: hub.h1 || '',
  intro: hub.intro || '',
  methodSummary: hub.methodNote?.summary || '',
  method: hub.methodNote?.body || '',
  footerNote: LABELS.footerNote || '',
  seo: { title: hub.seo?.title || '', description: hub.seo?.description || '', keywords: hub.seo?.keywords || null },
};

/**
 * The 4 chapters in reading order (`order` from copy.js; model.js validates 1..n). The context line is
 * derived (LABELS.coldContext) so it follows any reordering.
 */
export const PARTS = PART_SLUGS
  .map(slug => {
    const c = COPY_GLOBAL.parts?.[slug] || {};
    return {
      slug,
      order: c.order,
      label: c.label || '',
      question: c.question || '',
      h1: c.h1 || '',
      dek: c.dek || '',
      seo: { title: c.seo?.title || '', description: c.seo?.description || '', keywords: c.seo?.keywords || null },
    };
  })
  .sort((a, b) => a.order - b.order);

/** Structure + copy per theme (model.js validates both against the dataset). */
export const ITEMS = Object.fromEntries(Object.entries(STRUCTURE).map(([theme, st]) => [theme, { ...st, copy: COPY_ITEMS[theme] || null }]));
for (const theme of Object.keys(COPY_ITEMS)) if (!ITEMS[theme]) ITEMS[theme] = { copy: COPY_ITEMS[theme] }; // stale copy key → model throws

/** Reference fixes, keyed `<theme>:<src>`, from copy.js (`from` = the dataset reference they replace). */
export const REF_FIXES = {};
for (const [theme, it] of Object.entries(COPY_ITEMS)) {
  for (const r of it.refFixes || []) {
    const key = `${theme}:${r.src}`;
    REF_FIXES[key] = {
      from: r.from ?? DATASET_REFS[key],
      reason: r.reason,
      sourceUrl: r.sourceUrl,
      chips: [...(r.primary || []), ...(r.secondary || []).map(c => ({ ...c, secondary: true }))],
      primaryLabels: (r.primary || []).map(c => c.label),
    };
  }
}

/** Quote fixes, keyed `<theme>:<src>`, applied in order. A source fixed in both layers is a build error. */
export const QUOTE_FIXES = {};
export const FIX_CONFLICTS = [];
for (const [theme, it] of Object.entries(COPY_ITEMS)) for (const f of it.quoteFixes || []) (QUOTE_FIXES[`${theme}:${f.src}`] ||= []).push(f);
for (const [key, list] of Object.entries(MECHANICAL_QUOTE_FIXES)) {
  if (QUOTE_FIXES[key]) FIX_CONFLICTS.push(`QUOTE_FIXES.${key}: fixed both in copy.js and in config.js (keep one)`);
  else QUOTE_FIXES[key] = list;
}
