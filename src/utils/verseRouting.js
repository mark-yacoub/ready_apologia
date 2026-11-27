/**
 * Where Bible evidence lives on the site: the ONE place that decides which reader verse page an
 * evidence reference belongs to. Route generation (path_generator.js), the verse page, the chapter
 * reader's badges, video/verse-response links and the apologist pages all use it, so they agree.
 *
 * Evidence (contradictions, apologetics, videos, manuscript rows tagged 'MT') uses MT/English
 * numbering; reader pages use LXX2012 numbering for the OT (see scripture_mapper.js).
 *
 * For an OT reference `book_c_v` (MT numbering):
 *   1. It has an LXX equivalent            -> the mapped LXX verse (Jonah 1:17 -> jon_2_1).
 *   2. The LXX lacks it and the reader has
 *      no verse with that number           -> its own page under the MT number (prv_22_6).
 *   3. The LXX lacks it but the reader uses
 *      that number for another verse        -> the page of its host verse (mtOnlyHostVerse: the
 *                                              neighbouring verse the LXX folds it into, e.g.
 *                                              1 Sam 13:1 -> the page of MT 13:2 = LXX 13:1).
 * NT and deuterocanonical references are identical in both numberings.
 * Server-side only (reads the reader text via scripture_service).
 */
import booksMeta from '../data/books_meta.json' with { type: 'json' };
import { hasLxxEquivalent, hasMtEquivalent, isDeuterocanonical, listMtOnlyVerses, mapLxxToMt, mapMtToLxx, mtOnlyHostVerse } from './scripture_mapper.js';
import { readerHasVerse } from './scripture_service.js';

const OT_BOOKS = new Set(booksMeta.ot.map(b => b.id));
const id = (r) => `${r.book}_${r.chapter}_${r.verse}`;
const split = (verseId) => {
  const parts = String(verseId || '').split('_');
  return parts.length === 3 ? { book: parts[0], chapter: parts[1], verse: parts[2] } : null;
};

/** True for references that need MT -> LXX handling (canonical OT books). */
function isCanonicalOt(book) {
  return OT_BOOKS.has(book) && !isDeuterocanonical(book);
}

/**
 * Reader route id (`book_c_v`, reader numbering) for an evidence reference, or null if it can't
 * be placed (malformed, or an OT chapter with no paired verse at all).
 * @param {string} verseId evidence id in MT/English numbering (e.g. 'jon_1_17')
 */
export function readerRouteForMt(verseId) {
  const r = split(verseId);
  if (!r) return null;
  if (!isCanonicalOt(r.book)) return id(r);
  if (hasLxxEquivalent(r.book, r.chapter, r.verse)) return id(mapMtToLxx(r.book, r.chapter, r.verse));
  if (!readerHasVerse(r.book, r.chapter, r.verse)) return id(r);
  const host = mtOnlyHostVerse(r.book, r.chapter, r.verse);
  return host ? id(mapMtToLxx(host.book, host.chapter, host.verse)) : null;
}

/**
 * Chapter-reader link target for an evidence reference: `{ book, chapter, verse }` where `verse`
 * is set only when the reader has that verse (so `#verse` anchors always exist).
 */
export function readerAnchorForMt(verseId) {
  const route = split(readerRouteForMt(verseId));
  if (!route) return null;
  return { ...route, verse: readerHasVerse(route.book, route.chapter, route.verse) ? route.verse : undefined };
}

let hostedIndex = null;
/** reader route id -> MT ids placed there by rule 3 (built once). */
function hosted() {
  if (hostedIndex) return hostedIndex;
  hostedIndex = new Map();
  for (const r of listMtOnlyVerses()) {
    if (!readerHasVerse(r.book, r.chapter, r.verse)) continue; // rule 2: own page
    const route = readerRouteForMt(id(r));
    if (!route) continue;
    if (!hostedIndex.has(route)) hostedIndex.set(route, []);
    hostedIndex.get(route).push(id(r));
  }
  return hostedIndex;
}

/**
 * The MT/English evidence ids whose evidence belongs on a reader verse page (inverse of
 * readerRouteForMt): its paired MT verse, the MT id itself for rule-2 pages, and any rule-3
 * verses hosted here. NT/deuterocanonical pages return their own id.
 * @param {string} readerVerseId route id in reader numbering (e.g. 'jon_2_1')
 */
export function mtIdsForReaderRoute(readerVerseId) {
  const r = split(readerVerseId);
  if (!r) return [];
  if (!isCanonicalOt(r.book)) return [id(r)];
  const ids = [];
  if (hasMtEquivalent(r.book, r.chapter, r.verse)) ids.push(id(mapLxxToMt(r.book, r.chapter, r.verse)));
  else if (!readerHasVerse(r.book, r.chapter, r.verse)) ids.push(id(r)); // rule-2 page
  ids.push(...(hosted().get(id(r)) || []));
  return ids;
}
