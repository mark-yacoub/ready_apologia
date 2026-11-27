/**
 * Scripture Versification Mapping Engine (LXX2012 <-> MT / English).
 *
 * Backed by the empirically derived, bijection-verified lookup table in
 * src/utils/versification/lxx2012_mt.json (regenerated via
 * `node scripts/gen_versification_map.mjs`).
 *
 * Semantics:
 * - Paired verses (1-to-1 bijection between ESV/MT and Brenton LXX2012):
 *   - `hasLxxEquivalent(b, c, v)` === true, `hasMtEquivalent(b, lc, lv)` === true
 *   - `mapMtToLxx(b, c, v)` returns `{ book, chapter, verse }` (strings) existing in LXX2012
 *   - `mapLxxToMt(b, lc, lv)` returns `{ book, chapter, verse }` (strings) and round-trips exactly
 * - Unmapped MT verses (genuine LXX omissions, merged verses, or out-of-range refs):
 *   - `hasLxxEquivalent(b, c, v)` === false
 *   - `mapMtToLxx(b, c, v)` returns the identity `{ book, chapter, verse }` so callers never receive null
 * - Unmapped LXX verses (LXX-only additions like Ps 151 / Dan 13-14, split tails, or non-existent refs):
 *   - `hasMtEquivalent(b, c, v)` === false
 *   - `mapLxxToMt(b, c, v)` returns the identity `{ book, chapter, verse }`
 * - Deuterocanonical books (Tobit, Judith, Baruch, 1-4 Maccabees, Wisdom, Sirach, etc.):
 *   - `isDeuterocanonical(b)` === true, `hasMtEquivalent(...)` === false
 *   - `hasLxxEquivalent(b, c, v)` === true iff the verse exists in LXX2012 (identity numbering)
 * - New Testament books:
 *   - Always identity; both `hasLxxEquivalent` and `hasMtEquivalent` return true.
 */

import table from './versification/lxx2012_mt.json' with { type: 'json' };
import booksMeta from '../data/books_meta.json' with { type: 'json' };

const POSITIVE_INT = /^[1-9]\d*$/;

const NT_BOOKS = new Set((booksMeta.nt || []).map(b => b.id));
const CANONICAL_OT_BOOKS = new Set(table.canonicalOtBooks || []);
const DEUTEROCANON_BOOKS = new Set(table.deuterocanonBooks || []);

function parseRanges(rangeList) {
  return (rangeList || []).map(r => {
    const parts = r.split('..');
    const lo = Number(parts[0]);
    const hi = parts.length > 1 ? Number(parts[1]) : lo;
    return [lo, hi];
  });
}

function buildVerseIndex(chaptersObj) {
  const byBook = new Map();
  for (const [book, chMap] of Object.entries(chaptersObj || {})) {
    const byCh = new Map();
    for (const [ch, ranges] of Object.entries(chMap)) {
      byCh.set(ch, parseRanges(ranges));
    }
    byBook.set(book, byCh);
  }
  return byBook;
}

function indexHasVerse(index, book, chapter, verse) {
  if (!POSITIVE_INT.test(chapter) || !POSITIVE_INT.test(verse)) return false;
  const ranges = index.get(book)?.get(chapter);
  if (!ranges) return false;
  const vNum = Number(verse);
  for (const [lo, hi] of ranges) {
    if (vNum >= lo && vNum <= hi) return true;
  }
  return false;
}

const LXX_INDEX = buildVerseIndex(table.lxxVerses);
const MT_INDEX = buildVerseIndex(table.mtVerses);

const MT_TO_LXX = new Map();
const LXX_TO_MT = new Map();
for (const [book, mapping] of Object.entries(table.mtToLxx || {})) {
  const fwd = new Map();
  const rev = new Map();
  for (const [mtKey, lxxKey] of Object.entries(mapping)) {
    fwd.set(mtKey, lxxKey);
    rev.set(lxxKey, mtKey);
  }
  MT_TO_LXX.set(book, fwd);
  LXX_TO_MT.set(book, rev);
}

const MT_ONLY = new Map();
for (const [book, list] of Object.entries(table.mtOnly || {})) {
  MT_ONLY.set(book, new Set(list));
}

const LXX_ONLY = new Map();
for (const [book, list] of Object.entries(table.lxxOnly || {})) {
  LXX_ONLY.set(book, new Set(list));
}

function normBook(book) {
  return String(book || '').toLowerCase();
}

function normNum(n) {
  return String(n ?? '');
}

/**
 * True when `book` is one of the LXX deuterocanonical books (present in the LXX2012
 * reader with no separate Hebrew MT / ESV versification).
 */
export function isDeuterocanonical(book) {
  return DEUTEROCANON_BOOKS.has(normBook(book));
}

/**
 * True when MT/English verse `(book, chapter, verse)` has a 1-to-1 equivalent verse
 * in the site's LXX2012 reader (or is an NT / valid deuterocanonical verse).
 */
export function hasLxxEquivalent(book, chapter, verse) {
  const b = normBook(book);
  const c = normNum(chapter);
  const v = normNum(verse);

  if (NT_BOOKS.has(b)) return POSITIVE_INT.test(c) && POSITIVE_INT.test(v);
  if (DEUTEROCANON_BOOKS.has(b)) return indexHasVerse(LXX_INDEX, b, c, v);
  if (!CANONICAL_OT_BOOKS.has(b)) return false;

  if (!indexHasVerse(MT_INDEX, b, c, v)) return false;
  return !MT_ONLY.get(b)?.has(`${c}:${v}`);
}

/**
 * True when LXX2012 reader verse `(book, chapter, verse)` has a 1-to-1 equivalent
 * verse in standard MT/English (ESV) numbering (or is an NT verse).
 * Returns false for deuterocanonical books, LXX-only additions (Ps 151, Dan 13-14),
 * split verse tails, and verse coordinates not present in LXX2012.
 */
export function hasMtEquivalent(book, chapter, verse) {
  const b = normBook(book);
  const c = normNum(chapter);
  const v = normNum(verse);

  if (NT_BOOKS.has(b)) return POSITIVE_INT.test(c) && POSITIVE_INT.test(v);
  if (!CANONICAL_OT_BOOKS.has(b)) return false;

  if (!indexHasVerse(LXX_INDEX, b, c, v)) return false;
  return !LXX_ONLY.get(b)?.has(`${c}:${v}`);
}

/**
 * Converts standard Hebrew/English (MT) chapter-verse numbers to Greek (LXX2012) numbers.
 * Returns `{ book, chapter, verse }` with lowercase book and string chapter/verse.
 * When `hasLxxEquivalent(book, chapter, verse)` is false, returns the identity.
 */
export function mapMtToLxx(book, chapter, verse) {
  const b = normBook(book);
  const c = normNum(chapter);
  const v = normNum(verse);

  if (CANONICAL_OT_BOOKS.has(b)) {
    const mapped = MT_TO_LXX.get(b)?.get(`${c}:${v}`);
    if (mapped) {
      const idx = mapped.indexOf(':');
      return { book: b, chapter: mapped.slice(0, idx), verse: mapped.slice(idx + 1) };
    }
  }

  return { book: b, chapter: c, verse: v };
}

/**
 * Converts Greek (LXX2012) chapter-verse numbers to standard Hebrew/English (MT) numbers.
 * Returns `{ book, chapter, verse }` with lowercase book and string chapter/verse.
 * When `hasMtEquivalent(book, chapter, verse)` is false, returns the identity.
 */
export function mapLxxToMt(book, chapter, verse) {
  const b = normBook(book);
  const c = normNum(chapter);
  const v = normNum(verse);

  if (CANONICAL_OT_BOOKS.has(b)) {
    const mapped = LXX_TO_MT.get(b)?.get(`${c}:${v}`);
    if (mapped) {
      const idx = mapped.indexOf(':');
      return { book: b, chapter: mapped.slice(0, idx), verse: mapped.slice(idx + 1) };
    }
  }

  return { book: b, chapter: c, verse: v };
}

const chapterMemo = new Map();

function majorityMappedChapter(index, book, chapter, hasEq, mapFn) {
  const b = normBook(book);
  const c = normNum(chapter);
  if (!CANONICAL_OT_BOOKS.has(b)) return c;
  const memoKey = `${index === MT_INDEX ? 'mt' : 'lxx'}:${b}:${c}`;
  if (chapterMemo.has(memoKey)) return chapterMemo.get(memoKey);
  const ranges = index.get(b)?.get(c);
  if (!ranges) return c;

  const counts = new Map();
  let first = null;
  for (const [lo, hi] of ranges) {
    for (let vn = lo; vn <= hi; vn++) {
      const v = String(vn);
      if (!hasEq(b, c, v)) continue;
      const targetCh = mapFn(b, c, v).chapter;
      if (first === null) first = targetCh;
      counts.set(targetCh, (counts.get(targetCh) || 0) + 1);
    }
  }
  let bestCh = c;
  if (counts.size) {
    bestCh = first;
    let bestCount = -1;
    for (const [ch, cnt] of counts) {
      if (cnt > bestCount) {
        bestCount = cnt;
        bestCh = ch;
      }
    }
  }
  chapterMemo.set(memoKey, bestCh);
  return bestCh;
}

/**
 * Resolves the primary LXX2012 chapter corresponding to an MT/English chapter
 * (handles chapters whose verse 1 is omitted or shifted across a chapter boundary,
 * such as MT Jeremiah 27 -> LXX 34, MT Genesis 37 -> LXX 37, MT 1 Kings 20 -> LXX 21).
 * Memoised per book/chapter (it is called for every page).
 */
export function mapMtChapterToLxx(book, chapter) {
  return majorityMappedChapter(MT_INDEX, book, chapter, hasLxxEquivalent, mapMtToLxx);
}

/**
 * Resolves the primary MT/English chapter corresponding to an LXX2012 chapter
 * (handles chapters whose verse 1 is absent, such as LXX Jeremiah 32 -> MT 25,
 * LXX Haggai 2 -> MT 2, LXX 1 Kings 20 -> MT 21). Memoised per book/chapter.
 */
export function mapLxxChapterToMt(book, chapter) {
  return majorityMappedChapter(LXX_INDEX, book, chapter, hasMtEquivalent, mapLxxToMt);
}

/** Every MT verse the LXX2012 reader lacks, as `{ book, chapter, verse }` (strings). */
export function listMtOnlyVerses() {
  const out = [];
  for (const [book, set] of MT_ONLY) {
    for (const key of set) {
      const [chapter, verse] = key.split(':');
      out.push({ book, chapter, verse });
    }
  }
  return out;
}

/**
 * For an MT verse the LXX lacks, the nearest MT verse in the same chapter that has an LXX
 * equivalent: the preceding one (the LXX usually folds an omitted verse into the verse before,
 * e.g. Gen 37:33 into 37:32), else the following one (e.g. 1 Sam 13:1 -> 13:2). Returns
 * `{ book, chapter, verse }` (MT numbering) or null when the chapter has no paired verse.
 */
export function mtOnlyHostVerse(book, chapter, verse) {
  const b = normBook(book);
  const c = normNum(chapter);
  const v = Number(verse);
  const ranges = MT_INDEX.get(b)?.get(c);
  if (!ranges || !Number.isInteger(v)) return null;
  const max = Math.max(...ranges.map(([, hi]) => hi));
  for (let vn = v - 1; vn >= 1; vn--) {
    if (hasLxxEquivalent(b, c, String(vn))) return { book: b, chapter: c, verse: String(vn) };
  }
  for (let vn = v + 1; vn <= max; vn++) {
    if (hasLxxEquivalent(b, c, String(vn))) return { book: b, chapter: c, verse: String(vn) };
  }
  return null;
}
