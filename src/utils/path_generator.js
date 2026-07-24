import { query } from '../db.js';
import booksMeta from '../data/books_meta.json';
import { mapMtToLxx } from './scripture_mapper.js';

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

export function getAllEvidenceVerseSets() {
  const msNt = query("SELECT DISTINCT verse_id FROM manuscript_per_verse").map(r => r.verse_id);
  const msOtRows = query("SELECT DISTINCT verse_id, v11n_type FROM manuscript_per_verse_ot");
  const msOt = msOtRows.map(r => {
    if (r.v11n_type === 'MT') {
      const p = parseVerseId(r.verse_id);
      if (p) {
        const mapped = mapMtToLxx(p.book, p.chapter, p.verse);
        return stringifyVerseId(mapped);
      }
    }
    return r.verse_id;
  });

  const ctRaw = query("SELECT DISTINCT verse1 as v FROM contradictions UNION SELECT DISTINCT verse2 FROM contradictions").map(r => r.v);
  const apRaw = query("SELECT DISTINCT verse FROM apologetics").map(r => r.verse);
  const vdRaw = query("SELECT DISTINCT verse_id FROM short_per_verse").map(r => r.verse_id);

  const mapToLxxIfOt = (id) => {
    const p = parseVerseId(id);
    if (!p) return null;
    if (booksMeta.ot.some(b => b.id === p.book)) {
      const m = mapMtToLxx(p.book, p.chapter, p.verse);
      return stringifyVerseId(m);
    }
    return id;
  };

  const ct = ctRaw.map(mapToLxxIfOt);
  const ap = apRaw.map(mapToLxxIfOt);
  const vd = vdRaw.map(mapToLxxIfOt);

  const msSet = new Set([...msNt, ...msOt].filter(Boolean));
  const ctSet = new Set(ct.filter(Boolean));
  const apSet = new Set(ap.filter(Boolean));
  const vdSet = new Set(vd.filter(Boolean));
  const allVerseIds = new Set([...msSet, ...ctSet, ...apSet, ...vdSet]);

  return { msSet, ctSet, apSet, vdSet, allVerseIds };
}
