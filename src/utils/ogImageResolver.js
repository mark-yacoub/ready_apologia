import { query } from '../db.js';
import { SCAN_DIRS, scanOgImage } from './cdn_config.js';
import { mapLxxToMt } from './scripture_mapper.js';

/**
 * Open Graph image for Scripture pages: the earliest manuscript scan of the page's
 * verse, as a small social-preview variant (see OG_PREVIEW in cdn_config.js).
 *
 * Lookup order (first match wins; "earliest" = lowest manuscripts_meta*.earliest_date):
 *   verse page   -> the verse
 *   chapter page -> verse 1, else any verse of the chapter
 * Old Testament routes use LXX numbering; each lookup also accepts the MT-numbered
 * row of the same verse (see mapLxxToMt and JETSKI.md "LXX vs MT").
 *
 * Returns `{ url, width, height, type }`, or undefined when the page has no scan
 * (Layout.astro then uses the default image).
 */

const CORPORA = Object.freeze({
  nt: { table: 'manuscript_per_verse', meta: 'manuscripts_meta', dir: SCAN_DIRS.nt },
  ot: { table: 'manuscript_per_verse_ot', meta: 'manuscripts_meta_ot', dir: SCAN_DIRS.ot },
  quran: { table: 'manuscript_per_verse_quran', meta: 'manuscripts_meta_quran', dir: SCAN_DIRS.quran },
});

/** LIKE pattern matching ids that start with `prefix` (`_` and `%` in ids are literal, not wildcards). */
export const likePrefix = (prefix) => `${prefix.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

/** A lookup step: a WHERE clause on `m` (the per-verse table) plus its parameters. */
const verseIs = (verseId) => ({ where: 'm.verse_id = :verseId', params: { verseId } });
const verseStartsWith = (prefix) => ({
  where: "m.verse_id LIKE :pattern ESCAPE '\\'",
  params: { pattern: likePrefix(prefix) },
});
const otVerseIs = (lxxId, mtId) => ({
  where: "(m.verse_id = :lxxId AND m.v11n_type = 'LXX') OR (m.verse_id = :mtId AND m.v11n_type = 'MT')",
  params: { lxxId, mtId },
});
const otVerseStartsWith = (lxxPrefix, mtPrefix) => ({
  where:
    "(m.verse_id LIKE :lxxPattern ESCAPE '\\' AND m.v11n_type = 'LXX') OR " +
    "(m.verse_id LIKE :mtPattern ESCAPE '\\' AND m.v11n_type = 'MT')",
  params: { lxxPattern: likePrefix(lxxPrefix), mtPattern: likePrefix(mtPrefix) },
});

/** Earliest scan matching `step`, or undefined. */
const earliestScan = (corpus, { where, params }) => {
  const [row] = query(
    `SELECT m.ms_id, m.image_name
     FROM ${corpus.table} m
     JOIN ${corpus.meta} mm ON m.ms_id = mm.ms_id
     WHERE ${where}
     ORDER BY mm.earliest_date ASC
     LIMIT 1`,
    params
  );
  return row?.image_name ? row : undefined;
};

/** Preview of the first step that finds a scan. */
const firstScanPreview = (corpus, steps) => {
  for (const step of steps) {
    const row = earliestScan(corpus, step);
    if (row) return scanOgImage(corpus.dir, row.ms_id, row.image_name);
  }
  return undefined;
};

/** Memoises per page key: ~77,000 SSG pages share far fewer distinct lookups. */
const memoise = (fn) => {
  const cache = new Map();
  return (key, ...args) => {
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
};

/** Lookup steps for a Bible page, LXX-numbered for the OT. */
const bibleSteps = (book, chapter, verse, isNT) => {
  if (isNT) {
    return verse
      ? [verseIs(`${book}_${chapter}_${verse}`)]
      : [verseIs(`${book}_${chapter}_1`), verseStartsWith(`${book}_${chapter}_`)];
  }
  const mt = mapLxxToMt(book, chapter, verse || '1');
  const lxxId = `${book}_${chapter}_${verse || '1'}`;
  const mtId = `${mt.book}_${mt.chapter}_${mt.verse}`;
  return verse
    ? [otVerseIs(lxxId, mtId)]
    : [otVerseIs(lxxId, mtId), otVerseStartsWith(`${book}_${chapter}_`, `${mt.book}_${mt.chapter}_`)];
};

const bibleOgImage = memoise((book, chapter, verse, isNT) => {
  try {
    return firstScanPreview(isNT ? CORPORA.nt : CORPORA.ot, bibleSteps(book, chapter, verse, isNT));
  } catch (e) {
    // A versification gap must not fail the build; the page falls back to the default image.
    console.warn(`[ogImage] ${book} ${chapter}:${verse || '-'}: ${e.message}`);
    return undefined;
  }
});

const quranOgImage = memoise((surah, ayah) =>
  firstScanPreview(
    CORPORA.quran,
    ayah ? [verseIs(`${surah}:${ayah}`)] : [verseIs(`${surah}:1`), verseStartsWith(`${surah}:`)]
  )
);

/** Open Graph image for a Bible chapter (`verse` empty) or verse page. */
export const getBibleOgImage = (book, chapter, verse, isNT) => {
  if (!book || !chapter) return undefined;
  const v = verse ? String(verse) : '';
  return bibleOgImage(`${book}_${chapter}_${v}_${Boolean(isNT)}`, book, String(chapter), v, Boolean(isNT));
};

/** Open Graph image for a Qurʾān surah (`ayah` empty) or ayah page. */
export const getQuranOgImage = (surah, ayah) => {
  if (!surah) return undefined;
  const a = ayah ? String(ayah) : '';
  return quranOgImage(`${surah}_${a}`, String(surah), a);
};
