/**
 * Presentation config for /discover/muhammad-and-slavery (hub + 3 sub-pages, static, stateless).
 *
 * What lives here: paths, analytics params (unchanged from the old pages), the reading order
 * (SECTIONS per page, answer order, hub rows), the override layer for the read-only dataset
 * (ITEM_MUTATIONS, REPORT_NOTES, FAQ_LINK_FIXES, QUOTE_FIXES, EXTRA_TEXTS) and UI labels.
 * What does NOT live here: reader-facing copy for items, sections, the hub and SEO. That is in
 * `copy/{hadith,quran,answers}.json` (the single source of truth; schema: validate.js; references are
 * structured keys such as "bukhari:4234", "quran:4:24", "tabari:4:24"), assembled below as COPY. The
 * model (model.js) checks every copy string: shape, verbatim quotes, banned words, stale keys, counts.
 */

import { MUHAMMAD_SLAVERY_PATH, MUHAMMAD_SLAVERY_PAGES } from '../routes.js';
import { QUOTE_FIXES } from './quoteFixes.js';
import { EXTRA_TEXTS } from './extraTexts.js';
import { REF_MAP, COMBINED } from './refs.js';
import HADITH_COPY from './copy/hadith.json' with { type: 'json' };
import QURAN_COPY from './copy/quran.json' with { type: 'json' };
import ANSWERS_COPY from './copy/answers.json' with { type: 'json' };

export { QUOTE_FIXES, EXTRA_TEXTS, REF_MAP, COMBINED };

/** Site base ('' at the root). Every internal href goes through BASE so a non-root BASE_URL works. */
export const BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '');
export const BASE_PATH = `${BASE}${MUHAMMAD_SLAVERY_PATH}`;
export const PAGE_PATHS = Object.fromEntries(Object.entries(MUHAMMAD_SLAVERY_PAGES).map(([k, p]) => [k, `${BASE_PATH}${p}`]));
export const OG_IMAGE = `${BASE}/media/slavery/cover.jpg`;
export const CATALOG_SLUG = 'muhammad-and-slavery';
export const DATE_PUBLISHED = '2026-10-24';
/** Bump with every copy or content change (JSON-LD dateModified). */
export const DATE_MODIFIED = '2026-11-04';

/** RouteAnalytics: event name and params kept exactly as on the old pages (no dashboard change). */
export const ANALYTICS_EVENT = 'discover_article_view';
export const ANALYTICS = {
  hub: { article_slug: 'muhammad-and-slavery' },
  hadith: { article_slug: 'muhammad-and-slavery-prophets-practice' },
  quran: { article_slug: 'muhammad-and-slavery-quranic-witness' },
  answers: { article_slug: 'muhammad-and-slavery-counter-apologetics' },
};

// ---------------------------------------------------------------------------------------------
// Reading order (ia_r1_response.md, final). Ids: ids.js. Question/dek copy: copy/*.json.
// ---------------------------------------------------------------------------------------------

/** Hadith page sections, strongest first. `legacy` = old `#cat-N` anchor (1:1 with categories). */
export const HADITH_SECTIONS = [
  { id: 'owned', legacy: ['cat-1'], items: ['midam', 'prophets-slave-woman', 'rabah', 'anjasha', 'right-hand-touch', 'household-slaves', 'karkara'] },
  { id: 'bought-and-sold', legacy: ['cat-2'], items: ['mudabbar-sold', 'two-slaves-for-one', 'safiyya-seven-heads', 'captives-exchanged', 'abu-tayba'] },
  { id: 'freeing-stopped', legacy: ['cat-6'], items: ['six-slaves-lots', 'maymuna'] },
  { id: 'captive-women', legacy: ['cat-5'], items: ['azl-captives', 'awtas-4-24'] },
  { id: 'married-captives', legacy: ['cat-3'], items: ['safiyya-veil', 'safiyya', 'juwayriyya'] },
  { id: 'captives', legacy: ['cat-4'], items: ['banu-qurayza', 'fatima-servant', 'ali-khums', 'hawazin-captives', 'captives-ghulul'] },
  { id: 'in-law', legacy: ['cat-7'], items: ['ghurra', 'slave-woman-sold', 'runaway-slave', 'walad-lil-firash', 'booty-share', 'ransom-returned', 'where-is-allah', 'kaffara', 'master-duties', 'barira'] },
];

/** Qurʾān page sections (exactly the 16 dataset passages; the page never adds passages). */
export const QURAN_SECTIONS = [
  // Audience pass (owner round 3): 4:3, the verse every Muslim knows, moves to slot 2 after the strongest item.
  { id: 'women', items: ['verse-4-24', 'verse-4-3', 'verse-23-5-6', 'verse-70-29-30', 'verse-33-50', 'verse-33-52', 'verse-4-25'] },
  { id: 'parables', items: ['verse-16-75', 'verse-16-71', 'verse-30-28'] },
  { id: 'household', items: ['verse-24-32', 'verse-24-58', 'verse-24-31', 'verse-33-55'] },
  { id: 'freeing', items: ['verse-24-33', 'verse-4-36'] },
];

/** Answers page: one flat list, in this order (IA R1 P1-2). */
// Audience pass (owner round 3): who-was-enslaved (Bukhārī/Muslim) before captive-wives (rests on later sources).
export const ANSWER_ORDER = ['gradual-abolition', 'captives-without-marriage', 'prophet-owned-slaves', 'servants-or-slaves', 'who-was-enslaved', 'captive-wives', 'freeing-slaves', 'equal-rights', 'classical-law'];

/** Items that are one event told in many reports ("One story, told in N reports"; FC A §2, FC B §1). */
export const ONE_STORY = ['midam', 'anjasha', 'mudabbar-sold', 'safiyya-veil', 'hawazin-captives', 'ghurra', 'ransom-returned', 'barira'];

/** Label key for an item's "related reports" group, per item id (default LABELS.relatedReports). */
export const RELATED_LABEL = {};

/** Hub "Start here": rendered with its full showcase (≥3 witness cards, IA R1 P0-2). */
export const START_HERE = 'verse-4-24';

/** Cross-links between the pages (labels come from the target's title). */
export const CROSS_LINKS = {
  'awtas-4-24': ['verse-4-24'],
  'azl-captives': ['verse-4-24'],
  'verse-4-24': ['awtas-4-24', 'azl-captives'],
  'verse-33-50': ['safiyya', 'juwayriyya', 'safiyya-veil'],
  'safiyya-seven-heads': ['safiyya', 'safiyya-veil'],
  'safiyya-veil': ['safiyya-seven-heads', 'verse-33-50'],
  'safiyya': ['safiyya-veil', 'safiyya-seven-heads'],
  'juwayriyya': ['verse-33-50'],
  'kaffara': ['freeing-slaves'],
  'verse-24-33': ['freeing-slaves'],
  'verse-4-25': ['equal-rights'],
  'six-slaves-lots': ['gradual-abolition'],
  'mudabbar-sold': ['gradual-abolition'],
  'maymuna': ['gradual-abolition'],
  'household-slaves': ['prophet-owned-slaves'],
};

/** Range passages: the verify chips go to the āya that carries "what your right hands own" (IA R1 P2-2). */
export const VERSE_CHIP_AYAH = { 'verse-23-5-6': '23:6', 'verse-70-29-30': '70:30' };

// ---------------------------------------------------------------------------------------------
// Override layer for the read-only dataset (every entry is listed in data_proposals.md).
// ---------------------------------------------------------------------------------------------

/**
 * Report membership changes, applied AFTER ids are resolved on the raw data (IA R1 P1-3).
 *   move  a dataset report from one item to another (position 'first' | 'last')
 *   add   a verified text that is not in the dataset (EXTRA_TEXTS key) to an item
 */
export const ITEM_MUTATIONS = [
  { op: 'move', ref: 'Sahih al-Bukhari 4213', from: 'safiyya', to: 'safiyya-veil', position: 'first', reason: 'The veil test ("If the Prophet makes her observe the veil…") is in 4213, not in 5387 (FC A 2.0).' },
  { op: 'move', ref: 'Sahih al-Bukhari 5085', from: 'safiyya', to: 'safiyya-veil', position: 'last', reason: 'Same veil-test report as 4213 (FC A §2 duplicates).' },
  { op: 'move', ref: 'Sahih al-Bukhari 5159', from: 'safiyya', to: 'safiyya-veil', position: 'last', reason: 'Same veil-test report as 4213 (FC A §2 duplicates).' },
  { op: 'move', ref: 'Sahih al-Bukhari 5387', from: 'safiyya-veil', to: 'safiyya', position: 'last', reason: '5387 is the wedding-banquet (ḥays) report and has no veil test (FC A 2.0).' },
  { op: 'add', extra: 'muslim:1755', to: 'captives-exchanged', position: 'first', reason: 'The only report that shows a captive woman exchanged for Muslim prisoners (FC A 1.3; IA R1 decision ii).' },
  { op: 'add', extra: 'bukhari:2141', to: 'mudabbar-sold', position: 'last', reason: '"Who will buy this slave from me?" (FC A 1.1).' },
  { op: 'add', extra: 'bukhari:2102', to: 'abu-tayba', position: 'last', reason: 'Names Abū Ṭayba; "ordered his masters to reduce his tax" (FC A 1.4).' },
  { op: 'add', extra: 'bukhari:2541', to: 'juwayriyya', position: 'first', reason: 'Bukhārī parallel of Muslim 1730a (FC A 2.2).' },
  { op: 'add', extra: 'muslim:1768a', to: 'banu-qurayza', position: 'last', reason: 'Muslim wording: "capture their women and children" (FC Q §5).' },
];

/**
 * How individual reports render (keyed by canonical ref). Nothing is dropped (IA R1 P0-1.2):
 *   chain    a chain note with no text of its own: a "Same report, another chain" chip, no quote
 *   group    'related': listed after the item's reports under the item's related label
 *   count    false: not counted in the item's "N reports" (title and per-collection counts use one set)
 * The reader-facing note shown above a report is copy: copy/hadith.json `reportNotes` (keyed the same).
 */
export const REPORT_NOTES = {
  'muslim:1730b': { kind: 'chain' },
  'muslim:1704b': { kind: 'chain' },
  'muslim:1763': { group: 'related' },
  'muslim:1074a': { group: 'related' },
  'muslim:1075a': { group: 'related' },
  'muslim:1075b': { group: 'related' },
  // One story told in 33 reports, plus two general sayings on walāʾ (FC B §1): shown as related, not counted.
  'bukhari:6756': { group: 'related', count: false },
  'bukhari:6760': { group: 'related', count: false },
};

/**
 * Link fixes for the citations in faqs[].answer_markdown (factcheck_quran_faq.md §3). Key: the dataset
 * URL, or "<faq_id>|<dataset URL>" when the right target depends on the answer. Value: the corrected
 * target `{ ref }` (canonical "collection:number") or `null` to drop a citation that does not
 * support the answer. In-book Muslim URLs that ARE in REF_MAP are converted automatically.
 */
export const FAQ_LINK_FIXES = {
  'https://sunnah.com/muslim/27/78': { ref: 'muslim:1668a', reason: 'Six slaves: the report is 27/82 (FC Q §3.1).' },
  'https://sunnah.com/muslim/32/64': { ref: 'muslim:1768a', reason: 'Qurayẓa: the report is 32/77 (FC Q §3.2).' },
  '3|https://sunnah.com/muslim/16/96': { ref: 'muslim:1365c', reason: '16/96 is ʿAbd al-Raḥmān\'s dowry; the manumission report is 16/99 (FC Q §3.3).' },
  '2|https://sunnah.com/muslim/16/99': { ref: 'muslim:1365e', reason: '"Seven heads" is 16/102 (FC Q §3.4).' },
  '3|https://sunnah.com/muslim/16/99': { ref: 'muslim:1365e', reason: '"Seven heads" is 16/102 (FC Q §3.4).' },
  '5|https://sunnah.com/muslim/16/99': { ref: 'muslim:1365e', reason: '"Seven heads" is 16/102 (FC Q §3.4).' },
  'https://sunnah.com/muslim/29/38': { ref: 'muslim:1703a', reason: 'The report is 29/48 (FC Q §3.5).' },
  'https://sunnah.com/muslim/1:217': { ref: 'muslim:115', reason: 'Malformed URL (FC Q §3.6).' },
  '5|https://sunnah.com/muslim/5:33': { ref: 'muslim:544a', reason: 'The carpenter report is 5/56 (FC Q §3.6).' },
  '7|https://sunnah.com/muslim/5/33': { ref: 'muslim:537a', reason: '"Where is Allah?" is 5/39 (FC Q §3.7).' },
  '7|https://sunnah.com/muslim/32/166': { ref: 'muslim:1812c', reason: 'The slave\'s booty share is 32/168 (FC Q §3.7).' },
  '3|https://sunnah.com/bukhari:5387': { ref: 'bukhari:4213', reason: 'The veil test is in 4213 (FC Q §3.8).' },
  '3|https://sunnah.com/bukhari:4201': { ref: 'bukhari:4213', reason: 'The veil test is in 4213 (FC Q §3.8).' },
  '9|https://sunnah.com/bukhari:5387': { ref: 'bukhari:4213', reason: 'The veil test is in 4213 (FC Q §3.8).' },
  '3|https://sunnah.com/bukhari:4200': { ref: 'bukhari:4211', reason: '4200 does not name the husband; 4211 does (FC Q §3.9).' },
  '3|https://sunnah.com/bukhari:2541': { ref: 'abudawud:3931', reason: 'The kitāba story is Abū Dāwūd 3931, not Bukhārī 2541 (FC Q §3.9).' },
  'https://sunnah.com/bukhari:7374': { ref: null, reason: 'Bukhārī 7374 is the Sūrat al-Ikhlāṣ hadith (FC Q §3.10).' },
  '4|https://sunnah.com/bukhari:7214': { ref: null, reason: 'Bukhārī 7214 concerns the pledge, not relations (FC Q §3.10).' },
};

/** Collections the article may cite, with display names; non-Ṣaḥīḥayn citations always show their grade. */
export const COLLECTIONS = {
  bukhari: { label: 'Bukhārī', sahih: true },
  muslim: { label: 'Muslim', sahih: true },
  abudawud: { label: 'Abū Dāwūd', sahih: false },
  nasai: { label: 'Nasāʾī', sahih: false },
  ibnmajah: { label: 'Ibn Mājah', sahih: false },
  tirmidhi: { label: 'Tirmidhī', sahih: false },
};

/** Tafsir sources (repo commentary files, keyed like the repo: "4:24"). */
export const TAFSIR_SOURCES = {
  ik: { label: 'Ibn Kathīr', deathAh: 774, work: 'Tafsīr Ibn Kathīr', tab: 'tafsir/ibn_kathir', repoFile: 'src/data/quran/commentary/tafsir_ibn_kathir_catena.json' },
  tb: { label: 'al-Ṭabarī', deathAh: 310, work: 'Jāmiʿ al-Bayān', tab: 'tafsir/tabari', repoFile: 'src/data/quran/commentary/tafsir_tabari_english.json' },
};

// ---------------------------------------------------------------------------------------------
// UI labels (structure). Writers may override any key through copy/answers.json `labels`.
// ---------------------------------------------------------------------------------------------
const BASE_LABELS = {
  back: 'Discover',
  allParts: 'All parts',
  hub: 'Muhammad and slavery',
  onThisPage: 'On this page · {n}',
  copyLink: 'Copy link',
  copyItemLink: 'Copy link to this item',
  copied: 'Link copied',
  startHere: 'Start here',
  openStart: 'Open the passage',
  browseBySource: 'Browse by source',
  allInSection: 'All {n} in this section ({m} more)',
  accountOf: 'Account {n} of {total} · {section}',
  passageOf: 'Passage {n} of {total} · {section}',
  answerOf: 'Answer {n} of {total}',
  keyText: 'The key text',
  readAll: 'Read all {n} reports ({counts})',
  readAllOneStory: 'One story, told in {n} reports ({counts})',
  readOne: 'Read the full report ({counts})',
  countsBukhari: 'Bukhārī {n}',
  countsMuslim: 'Muslim {n}',
  sameChain: 'Same report, another chain',
  sameText: 'Same text under a second Sunnah.com number',
  relatedReports: 'Related reports',
  translatorNote: 'Brackets are the translator’s',
  arabicText: 'Arabic text',
  arabicSource: 'Arabic: Sunnah.com',
  openInternal: 'On this site',
  gradeChip: '{grade}',
  quranChipTabari: '{key} with al-Ṭabarī',
  quranChipIbnKathir: 'Ibn Kathīr on {key}',
  classical: 'The classical explanation',
  comparison: 'Comparing with the text',
  comparisonAnswers: 'Comparing with the texts',
  startTest: 'Testing the marriage reading',
  answerPanel: 'The answer many Muslims give',
  answerTextsLabel: 'The texts this answer cites',
  textsSay: 'The texts beside it',
  allCited: 'All texts cited in the original answer ({n})',
  theVerse: 'The verse',
  drogeNote: 'Droge’s translation',
  commentators: 'What the commentators say',
  relatedVerses: 'Related verses on freeing and captives',
  crossVerse: 'The verse: {ref}',
  crossAccount: 'The account: {title}',
  crossAnswer: 'The answer: {question}',
  related: 'See also',
  // Chip from a text card to the full item in this article (the chevron icon is the "›").
  toPassage: 'Full passage here',
  toAccount: 'Full account here',
  toAnswer: 'The answer here',
  toItemAria: '{label}: {title}',
  // Commentator caption under a tafsir excerpt: the commentator himself (name carries any rest of the
  // copy's attribution, e.g. "his own comment") or a narrator he records.
  tafsirSelf: 'd. {deathAh} AH, {work}, on {key}',
  tafsirVia: '{source} (d. {deathAh} AH), {work}, on {key}',
  next: 'Next',
  otherParts: 'Other parts of this article',
  highlightingOurs: 'Highlighting ours',
  sourcesUsed: 'Sources used in this article',
  answersList: 'The answers',
  navLabel: 'Article navigation',
  chipsLabel: 'Check the source',
  tabariTranslationNote: 'The English of al-Ṭabarī on this site is an AI-assisted translation of the Arabic (see the note on the linked commentary page).',
  showcase: {
    versions: 'The wordings side by side',
    number_fan: 'The numbers in the report',
    timeline: 'Step by step',
    witnesses: 'In their own words',
    confrontation: 'Side by side',
    facts: 'Key points',
  },
  badges: { bukhari: 'Bukhārī', muslim: 'Muslim', quran: 'Qurʾān', tafsir: 'Ibn Kathīr · al-Ṭabarī', answer: 'Answer' },
  pages: { hadith: 'In the hadith', quran: 'In the Qurʾān', answers: 'Common answers' },
  sources: {
    sunnah: '{n} reports on Sunnah.com',
    quran: '{n} Qurʾān passages with al-Ṭabarī',
    ibnKathir: '{n} with Ibn Kathīr',
    other: '{n} reports in Abū Dāwūd, al-Nasāʾī and Ibn Mājah, each with its grade',
  },
};

const deepMerge = (a, b) => {
  if (!b) return a;
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = v && typeof v === 'object' && !Array.isArray(v) && a[k] && typeof a[k] === 'object' ? deepMerge(a[k], v) : v;
  return out;
};

export const LABELS = deepMerge(BASE_LABELS, ANSWERS_COPY.labels);
/** Label keys the copy may override (anything else in answers.json `labels` is a typo and fails the build). */
export const LABEL_KEYS = Object.keys(BASE_LABELS);

/** Hub sections (copy/answers.json hub.sections): rows shown, `more` in a closed <details>; the model checks every item is placed once. */
export const HUB_SECTIONS = Object.entries(ANSWERS_COPY.hub.sections).map(([id, x]) => ({ id, rows: x.rows, more: x.more }));

/**
 * All reader-facing copy, assembled from copy/{hadith,quran,answers}.json:
 *   raw                               the three JSON objects (validated by validate.js)
 *   pages.{hub,hadith,quran,answers}  seo {title, description}, h1, intro, sections {id: {question, dek}}, breadcrumb
 *   items[id]                         hadith items + verses (title, context, hook, takeaway, showcase, keyQuote, …)
 *   answers[id]                       question, context, answer, answerTexts, takeaway, showcase, texts, classical, comparison
 *   reportNotes, catalog, startHere, browse, sectionAll, sourcesFooter, otherParts, breadcrumbs
 */
export const COPY = {
  raw: { hadith: HADITH_COPY, quran: QURAN_COPY, answers: ANSWERS_COPY },
  pages: { hub: ANSWERS_COPY.hub, hadith: HADITH_COPY.page, quran: QURAN_COPY.page, answers: ANSWERS_COPY.page },
  items: { ...HADITH_COPY.items, ...QURAN_COPY.items },
  answers: ANSWERS_COPY.items,
  reportNotes: HADITH_COPY.reportNotes,
  catalog: ANSWERS_COPY.catalog,
  startHere: ANSWERS_COPY.hub.startHere,
  browse: ANSWERS_COPY.hub.browse,
  browseLabel: ANSWERS_COPY.hub.browseLabel,
  sectionAll: ANSWERS_COPY.hub.sectionAll,
  sourcesFooter: ANSWERS_COPY.hub.sourcesFooter,
  otherParts: ANSWERS_COPY.otherParts,
  breadcrumbs: ANSWERS_COPY.breadcrumbs,
};

export const CONFIG = {
  HADITH_SECTIONS, QURAN_SECTIONS, ANSWER_ORDER, HUB_SECTIONS, ONE_STORY, RELATED_LABEL, START_HERE, CROSS_LINKS, VERSE_CHIP_AYAH,
  ITEM_MUTATIONS, REPORT_NOTES, FAQ_LINK_FIXES, QUOTE_FIXES, EXTRA_TEXTS, REF_MAP, COMBINED, COLLECTIONS, TAFSIR_SOURCES,
  LABELS, LABEL_KEYS, COPY, PAGE_PATHS, BASE,
};
