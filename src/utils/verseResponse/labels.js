// Resolves the human-readable supporting-verse labels stored in
// verse_video_responses.supporting_verses into links, and shapes a DB row for the UI.
//
// Supported label formats (tried in order, first match wins):
//   Quran verse     "Surah 4:157", "Quran 53:19-20"
//   Quran chapter   "Surah 33"
//   Bible verse     "John 14:28", "Psalm 110:1", "1 Corinthians 15:3-8", "Isaiah 52:13-53:12"
//   Bible chapter   "John 14", "Ezekiel 40-48"
// Anything else (hadith citations, apocrypha, out-of-range numbers) stays a plain label:
// hadith collections use mixed numbering schemes, so a guessed link could point at the wrong report.
//
// Pure module (no DB / JSON imports) so it can be unit-tested with plain node.
import { getBibleUrl, getQuranUrl } from '../urlFactory.js';
import { hasLxxEquivalent, mapMtChapterToLxx, mapMtToLxx } from '../scripture_mapper.js';

const QURAN_NAME = String.raw`(?:quran|qur'an|qur’an|qurʾan|qurʾān|surah|sura)`;
const NUM = String.raw`(\d{1,3})`;
const RANGE_TAIL = String.raw`(?:\s*[-–]\s*(?:\d{1,3}:)?\d{1,3})?`;

const QURAN_VERSE = new RegExp(String.raw`^${QURAN_NAME}\s+${NUM}:${NUM}${RANGE_TAIL}$`, 'i');
const QURAN_CHAPTER = new RegExp(String.raw`^${QURAN_NAME}\s+${NUM}${RANGE_TAIL}$`, 'i');
const BIBLE_VERSE = new RegExp(String.raw`^(.+?)\s+${NUM}:${NUM}${RANGE_TAIL}$`);
const BIBLE_CHAPTER = new RegExp(String.raw`^(.+?)\s+${NUM}${RANGE_TAIL}$`);

// Common English spellings that differ from books_meta display names.
const EXTRA_BOOK_ALIASES = {
  psalm: 'ps',
  'song of songs': 'sg',
  'song of solomon': 'sg',
  canticles: 'sg',
  revelations: 'rv',
  'revelation of john': 'rv',
  qoheleth: 'eccl',
  wisdom: 'ws',
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

/**
 * Builds the lookup tables the resolver needs.
 * @param {object} booksMeta  src/data/books_meta.json ({ ot: [...], nt: [...] }; `chapters` is the reader's count)
 * @param {Array}  quranMeta  src/data/quran/arabic/meta.json ([{ id, total_verses }])
 * @param {{ anchorForMt?: (id: string) => ({ book, chapter, verse? } | null) }} [opts] where an
 *   MT-numbered verse lives in the reader (verseRouting.readerAnchorForMt on the site)
 */
export function buildRefIndex(booksMeta, quranMeta = [], { anchorForMt = null } = {}) {
  const books = new Map();
  const byId = new Map();
  const add = (b, isOt) => {
    const entry = { id: b.id, isOt, chapters: Number(b.chapters) || 0 };
    books.set(normalizeBookName(b.name), entry);
    byId.set(b.id, entry);
  };
  (booksMeta?.ot || []).forEach((b) => add(b, true));
  (booksMeta?.nt || []).forEach((b) => add(b, false));
  for (const [alias, id] of Object.entries(EXTRA_BOOK_ALIASES)) {
    if (!books.has(alias) && byId.has(id)) books.set(alias, byId.get(id));
  }

  const ayahCounts = new Map((quranMeta || []).map((s) => [Number(s.id), Number(s.total_verses)]));
  return { books, ayahCounts, anchorForMt };
}

const plain = (label) => ({ label, id: null, href: null });

function parseQuranVerse(label, { ayahCounts }, base) {
  const m = label.match(QURAN_VERSE);
  if (!m) return null;
  const surah = Number(m[1]);
  const ayah = Number(m[2]);
  if (!(ayah >= 1 && ayah <= (ayahCounts.get(surah) || 0))) return plain(label);
  return { label, id: `${surah}_${ayah}`, href: getQuranUrl({ surah, ayah, base }) };
}

function parseQuranChapter(label, { ayahCounts }, base) {
  const m = label.match(QURAN_CHAPTER);
  if (!m) return null;
  const surah = Number(m[1]);
  if (!ayahCounts.has(surah)) return plain(label);
  return { label, id: null, href: getQuranUrl({ surah, base }) };
}

// Labels use standard English (MT) numbering; the OT reader is LXX-numbered.
function toReaderNumbering(book, chapter, verse) {
  if (!book.isOt) return { chapter, verse, hasVerse: true };
  if (hasLxxEquivalent(book.id, chapter, verse)) {
    const mapped = mapMtToLxx(book.id, chapter, verse);
    return { chapter: Number(mapped.chapter), verse: Number(mapped.verse), hasVerse: true };
  }
  return { chapter: Number(mapMtChapterToLxx(book.id, chapter)), verse: undefined, hasVerse: false };
}

const chapterInRange = (book, chapter) => chapter >= 1 && chapter <= book.chapters;

function parseBibleVerse(label, { books, anchorForMt }, base) {
  const m = label.match(BIBLE_VERSE);
  if (!m) return null;
  const book = books.get(normalizeBookName(m[1]));
  if (!book) return plain(label);
  const chapter = Number(m[2]);
  const verse = Number(m[3]);
  const reader = toReaderNumbering(book, chapter, verse);
  if (verse < 1 || !chapterInRange(book, reader.chapter)) return plain(label);
  const id = `${book.id}_${chapter}_${verse}`; // DB verse ids use MT numbering
  // The site passes verseRouting.readerAnchorForMt (server-only) so links land where the verse
  // pages put the verse; without it (unit tests) fall back to the mapper.
  const anchor = anchorForMt?.(id);
  const href = anchor
    ? getBibleUrl({ book: anchor.book, chapter: anchor.chapter, verse: anchor.verse, base })
    : getBibleUrl({ book: book.id, chapter: reader.chapter, verse: reader.hasVerse ? reader.verse : undefined, base });
  return { label, id, href };
}

function parseBibleChapter(label, { books }, base) {
  const m = label.match(BIBLE_CHAPTER);
  if (!m) return null;
  const book = books.get(normalizeBookName(m[1]));
  if (!book) return plain(label);
  const chapter = book.isOt ? Number(mapMtChapterToLxx(book.id, Number(m[2]))) : Number(m[2]);
  if (!chapterInRange(book, chapter)) return plain(label);
  return { label, id: null, href: getBibleUrl({ book: book.id, chapter, base }) };
}

const PARSERS = [parseQuranVerse, parseQuranChapter, parseBibleVerse, parseBibleChapter];

/**
 * @returns {{ label: string, id: string|null, href: string|null }}
 *   id: DB verse id of the first verse cited (null for chapters / unresolved); href: null when unresolved.
 */
export function resolveSupportingLabel(rawLabel, refIndex, base = '') {
  const label = String(rawLabel || '').replace(/\s+/g, ' ').trim();
  if (!label) return plain(label);
  for (const parse of PARSERS) {
    const ref = parse(label, refIndex, base);
    if (ref) return ref;
  }
  return plain(label);
}

function parseLabelList(json) {
  try {
    const parsed = JSON.parse(json || '[]');
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Shapes a verse_video_responses row for the UI.
 * Returns null unless the row is `ready` and has prose.
 * @returns {{ paragraphs: string[], supporting: {label:string,id:string|null,href:string|null}[] } | null}
 */
export function buildVerseResponseView(row, { verseId, refIndex, base = '' }) {
  if (!row || row.status !== 'ready' || typeof row.response !== 'string') return null;
  const paragraphs = row.response.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return null;

  const seen = new Set();
  const supporting = [];
  for (const raw of parseLabelList(row.supporting_verses)) {
    const ref = resolveSupportingLabel(raw, refIndex, base);
    if (!ref.label || ref.id === verseId) continue; // skip the verse being viewed
    const key = ref.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    supporting.push(ref);
  }
  return { paragraphs, supporting };
}
