// Resolves the human-readable supporting-verse labels stored in
// verse_video_responses.supporting_verses ("John 14:28", "Psalm 110:1",
// "1 Corinthians 15:3-8", "Surah 4:157", "Quran 2:91") into links.
// Pure module (no DB / JSON imports) so it can be unit-tested with plain node.
import { getBibleUrl, getQuranUrl } from '../urlFactory.js';
import { mapMtToLxx } from '../scripture_mapper.js';

const QURAN_PREFIX = /^(?:quran|qur'an|qurʾan|qurʾān|qur’an|surah|sura)\s+(\d{1,3}):(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?$/i;
const BIBLE_REF = /^(.+?)\s+(\d{1,3}):(\d{1,3})(?:\s*[-–]\s*(?:\d{1,3}:)?(\d{1,3}))?$/;
// Chapter-only references ("John 14", "Ezekiel 40-48", "Surah 33") link to the chapter reader.
const QURAN_CHAPTER = /^(?:quran|qur'an|qurʾan|qurʾān|qur’an|surah|sura)\s+(\d{1,3})(?:\s*[-–]\s*\d{1,3})?$/i;
const BIBLE_CHAPTER = /^(.+?)\s+(\d{1,3})(?:\s*[-–]\s*\d{1,3})?$/;

// Common English spellings that differ from books_meta display names.
const EXTRA_ALIASES = {
  psalm: 'ps',
  'song of songs': 'sg',
  'song of solomon': 'sg',
  canticles: 'sg',
  revelations: 'rv',
  'revelation of john': 'rv',
  qoheleth: 'eccl',
  'wisdom': 'ws',
  ecclesiasticus: 'sir',
};

export function normalizeBookName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[.'’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Builds a normalized-name -> { id, isOt } index from books_meta.json. */
export function buildBookIndex(booksMeta) {
  const index = new Map();
  for (const b of booksMeta?.ot || []) index.set(normalizeBookName(b.name), { id: b.id, isOt: true });
  for (const b of booksMeta?.nt || []) index.set(normalizeBookName(b.name), { id: b.id, isOt: false });
  const otIds = new Set((booksMeta?.ot || []).map((b) => b.id));
  for (const [alias, id] of Object.entries(EXTRA_ALIASES)) {
    if (!index.has(alias)) index.set(alias, { id, isOt: otIds.has(id) });
  }
  return index;
}

/**
 * @returns {{ label: string, id: string|null, href: string|null }}
 *   id is the DB verse id of the first verse (MT numbering for the OT), or null when unresolved.
 */
export function resolveSupportingLabel(rawLabel, bookIndex, base = '') {
  const label = String(rawLabel || '').replace(/\s+/g, ' ').trim();
  const unresolved = { label, id: null, href: null };
  if (!label) return unresolved;

  const q = label.match(QURAN_PREFIX);
  if (q) {
    const [, surah, ayah] = q;
    const s = Number(surah);
    if (s < 1 || s > 114) return unresolved;
    return { label, id: `${s}_${Number(ayah)}`, href: getQuranUrl({ surah: s, ayah: Number(ayah), base }) };
  }

  const qc = label.match(QURAN_CHAPTER);
  if (qc) {
    const s = Number(qc[1]);
    if (s < 1 || s > 114) return unresolved;
    return { label, id: null, href: getQuranUrl({ surah: s, base }) };
  }

  const m = label.match(BIBLE_REF);
  if (!m) {
    // Hadith citations etc. stay plain text: collections use mixed numbering schemes.
    const c = label.match(BIBLE_CHAPTER);
    const chapterBook = c && bookIndex.get(normalizeBookName(c[1]));
    if (!chapterBook) return unresolved;
    let chapter = Number(c[2]);
    if (chapterBook.isOt) chapter = Number(mapMtToLxx(chapterBook.id, chapter, 1).chapter);
    return { label, id: null, href: getBibleUrl({ book: chapterBook.id, chapter, base }) };
  }
  const [, bookName, chapter, verse] = m;
  const book = bookIndex.get(normalizeBookName(bookName));
  if (!book) return unresolved;
  return {
    label,
    id: `${book.id}_${Number(chapter)}_${Number(verse)}`,
    // Labels use standard English (MT) numbering; the OT reader is LXX-numbered.
    href: getBibleUrl({ book: book.id, chapter: Number(chapter), verse: Number(verse), base, isMt: book.isOt }),
  };
}

/**
 * Shapes a verse_video_responses row for the UI.
 * Returns null unless the row is `ready` and has prose.
 */
export function buildVerseResponseView(row, { verseId, bookIndex, base = '' }) {
  if (!row || row.status !== 'ready' || typeof row.response !== 'string') return null;
  const paragraphs = row.response.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return null;

  let labels = [];
  try {
    const parsed = JSON.parse(row.supporting_verses || '[]');
    if (Array.isArray(parsed)) labels = parsed.filter((x) => typeof x === 'string');
  } catch {
    labels = [];
  }

  const seen = new Set();
  const supporting = [];
  for (const raw of labels) {
    const ref = resolveSupportingLabel(raw, bookIndex, base);
    if (!ref.label || ref.id === verseId) continue; // skip the verse being viewed
    const key = ref.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    supporting.push(ref);
  }

  return { paragraphs, supporting, copyText: paragraphs.join('\n\n') };
}
