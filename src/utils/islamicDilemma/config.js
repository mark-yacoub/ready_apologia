/**
 * Structure and routing config for /discover/islamic-dilemma.
 *
 * Nothing reader-facing lives here except the SEO strings: every label, heading and sentence on the
 * page is in `content.js` (page-owned copy) or `overrides.js` (replacements for markdown-derived
 * text), so copy can be swapped without touching layout. This file holds ids, anchors, routes, the
 * verified manuscript whitelist and the passage list.
 */

import { BASE } from '../hadithReliability/config.js';

export { BASE };

/** Public URL of the article. A public URL: never change it without a redirect. */
export const ARTICLE_PATH = '/discover/islamic-dilemma';
export const BASE_PATH = `${BASE}${ARTICLE_PATH}`;
export const CATALOG_SLUG = 'islamic-dilemma';
export const OG_IMAGE = `${BASE}/media/islamic_dilemma/cover.jpg`;
export const DATE_PUBLISHED = '2026-10-22';

/**
 * SEO (phase2_copy.md r3 §1.1; plain ASCII, following hadithReliability/seo.js). Layout.astro
 * appends " | Ready Apologia" to the title. JETSKI rule 5: the user signs off on the title,
 * description and keywords before deploy (alternatives: "What Quran 5:47 Says About the Gospel",
 * "The Quran on the Torah and Gospel").
 */
export const SEO = {
  title: 'Quran 5:47 and the Gospel of Its Day',
  description:
    'Quran 5:47, 5:68 and 5:43 point Jews and Christians to the Torah and Gospel they had; New Testament copies dated before Islam record what the Gospel said.',
  keywords: 'quran 5:47, surah 5:47, injil, gospel in the quran, quran torah and gospel, tahrif, does the quran confirm the bible, tabari 5:47, ibn kathir 5:47, codex sinaiticus',
  /** Wikidata entities for Article.about (Q428 Quran, Q18813 New Testament). */
  about: [
    { '@type': 'Thing', name: 'Quran', sameAs: 'https://www.wikidata.org/wiki/Q428' },
    { '@type': 'Thing', name: 'New Testament', sameAs: 'https://www.wikidata.org/wiki/Q18813' },
  ],
};

/**
 * The six reader-question sections, in reading order (strongest first; design §3.3).
 * `alias` keeps the old `#stage-N` share links working (an empty anchor at the new home).
 * Nav labels and headings are in content.js under `sections[id]`.
 */
export const SECTIONS = [
  { id: 'quran', alias: 'stage-2' },
  { id: 'gospel-copies', alias: 'stage-4' },
  { id: 'on-jesus', alias: 'stage-5' },
  { id: 'text-history', alias: 'stage-3' },
  { id: 'answers', alias: 'stage-6' },
  { id: 'sources', alias: 'stage-7' },
];
/** `#stage-1` (the old "Core question") lands on the top of the page / at a glance. */
export const TOP_ALIAS = 'stage-1';
export const TOP_ID = 'top';
export const GLANCE_ID = 'at-a-glance';

/**
 * Gospel passages shown in §2, each with its manuscript scans (`manuscript_per_verse.verse_id`).
 * Topic labels and NASB text are in content.js under `passages[id]`.
 */
export const PASSAGES = [
  { id: 'jn-1-1', verseId: 'jn_1_1', book: 'jn', ch: 1, v: 1, ref: 'John 1:1' },
  { id: 'mk-15-39', verseId: 'mk_15_39', book: 'mk', ch: 15, v: 39, ref: 'Mark 15:39' },
  { id: 'mt-28-19', verseId: 'mt_28_19', book: 'mt', ch: 28, v: 19, ref: 'Matthew 28:19' },
  { id: '1cor-15-3', verseId: '1cor_15_3', book: '1cor', ch: 15, v: 3, ref: '1 Corinthians 15:3–4' },
];

/** Year of the first revelation: the cut-off for "copied before Islam". */
export const FIRST_REVELATION_CE = 610;

/**
 * Manuscripts counted as copied before 610, with the date range shown to readers.
 * Do NOT derive this from `manuscripts_meta.earliest_date`: Uncial 0211 is stored as 600 but
 * labelled "7th–9th century", and P66 is stored as 100 but labelled "mid 2nd to 3rd century".
 * A scan whose ms_id is missing here is never counted as pre-610 (the model reports it).
 * Ranges follow the phase-1 fact check (codex dates) and data.db `date_range_english` (papyri).
 */
export const PRE_610_MSS = {
  P46: 'late 2nd–early 3rd century',
  P66: 'mid 2nd–3rd century',
  P75: 'late 2nd–early 3rd century',
  P123: '4th century',
  '01': 'c. 330–360',
  '032': 'late 4th–5th century',
  '02': 'c. 400–440',
  '05': 'late 4th–5th century',
  '04': '5th century',
  '06': '5th–6th century',
  '022': '6th century',
  '042': '6th century',
};

// ---- routes (every internal href includes BASE) -------------------------------------------------
export const discoverHref = () => `${BASE}/discover`;
/** Qurʾān verse → this site's tafsir page (the playbook's single Qurʾān link target). */
export const tafsirHref = (surah, ayah, scholar = 'tabari') => `${BASE}/quran/${surah}/${ayah}/tafsir/${scholar}`;
export const bibleVerseHref = (book, ch, v) => `${BASE}/bible/${book}/${ch}#${v}`;
export const bibleMssHref = (book, ch, v) => `${BASE}/bible/${book}/${ch}/${v}/manuscripts`;
export const sitePath = path => `${BASE}${path}`;
