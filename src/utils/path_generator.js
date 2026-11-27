import { query } from '../db.js';
import booksMeta from '../data/books_meta.json' with { type: 'json' };
import { readerRouteForMt } from './verseRouting.js';

/**
 * Parses a string ID into a scripture reference object.
 * Protects against malformed DB IDs by ensuring 3 parts exist.
 * @param {string} id - Database verse id (e.g. "ps_110_1")
 * @returns {object|null} { book, chapter, verse } or null if invalid
 */
export function parseVerseId(id) {
  if (!id) return null;
  const parts = id.split('_');
  if (parts.length >= 3) {
    return {
      book: parts[0],
      chapter: parts[1],
      verse: parts.slice(2).join('_')
    };
  }
  return null;
}

/**
 * stringifies a scripture reference object back to a DB ID
 */
export function stringifyVerseId(ref) {
  if (!ref) return null;
  return `${ref.book}_${ref.chapter}_${ref.verse}`;
}

const CHAPTER_COUNTS = new Map([...booksMeta.nt, ...booksMeta.ot].map(b => [b.id, b.chapters]));
const POSITIVE_INT = /^[1-9]\d*$/;

/**
 * True when a verse id can have a verse page: its book has a reader, its chapter is one of
 * that reader's chapters (`/bible/<book>/<chapter>` exists), and chapter and verse are
 * positive integers. This drops manuscript rows keyed to a book's title or ending
 * (`1cor_0_0`, `1cor_z_z`, `1cor_10_0`), books with no reader (`PrAzar_*`) and chapters
 * the reader doesn't have (LXX additions such as Daniel 13–14, mis-keyed rows such as
 * `1jn_10_30`). Their pages linked back to chapters that don't exist.
 * @param {string} id - verse id in reader (LXX for the OT) numbering
 */
export function hasReaderChapter(id) {
  const p = parseVerseId(id);
  if (!p || !POSITIVE_INT.test(p.chapter) || !POSITIVE_INT.test(p.verse)) return false;
  const chapters = CHAPTER_COUNTS.get(p.book);
  return chapters !== undefined && Number(p.chapter) <= chapters;
}

let evidenceSetsCache = null;

/**
 * Verse ids (reader numbering) that get each verse tab page. Memoised: the verse tab page
 * also uses it to only link to tabs that are built.
 */
export function getAllEvidenceVerseSets() {
  if (evidenceSetsCache) return evidenceSetsCache;
  const msNt = query("SELECT DISTINCT verse_id FROM manuscript_per_verse").map(r => r.verse_id);
  const msOtRows = query("SELECT DISTINCT verse_id, v11n_type FROM manuscript_per_verse_ot");
  const msOt = msOtRows.map(r => {
    if (r.v11n_type === 'MT') {
      return readerRouteForMt(r.verse_id);
    }
    return r.verse_id;
  });

  const ctRaw = query("SELECT DISTINCT verse1 as v FROM contradictions UNION SELECT DISTINCT verse2 FROM contradictions").map(r => r.v);
  const apRaw = query("SELECT DISTINCT verse FROM apologetics").map(r => r.verse);
  const vdRaw = query("SELECT DISTINCT verse_id FROM short_per_verse").map(r => r.verse_id);

  // Evidence ids are MT/English numbered; verseRouting decides which reader page each lands on.
  const ct = ctRaw.map(readerRouteForMt);
  const ap = apRaw.map(readerRouteForMt);
  const vd = vdRaw.map(readerRouteForMt);

  const keep = id => id && hasReaderChapter(id);
  const msSet = new Set([...msNt, ...msOt].filter(keep));
  const ctSet = new Set(ct.filter(keep));
  const apSet = new Set(ap.filter(keep));
  const vdSet = new Set(vd.filter(keep));
  const allVerseIds = new Set([...msSet, ...ctSet, ...apSet, ...vdSet]);

  evidenceSetsCache = { msSet, ctSet, apSet, vdSet, allVerseIds };
  return evidenceSetsCache;
}
