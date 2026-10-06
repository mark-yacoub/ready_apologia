/**
 * Isomorphic text utilities for the Sahih Hadith Explorer.
 * Used at build time (hadithLoader.js) and in React islands.
 */

const SUFFIX_LETTERS = 'abcdefghijklmnopqrstuvwxyz';

/**
 * Converts corpus numbering to Sunnah.com canonical numbering.
 * - Bukhari: identical to hadithnumber (e.g. 5134).
 * - Muslim: corpus `arabicnumber` "1422.01" → "1422a", "1417" → "1417".
 */
export function toSunnahNumber(collection, hadithnumber, arabicnumber) {
  if (collection !== 'muslim') return String(hadithnumber);
  const raw = arabicnumber === undefined || arabicnumber === null || arabicnumber === ''
    ? String(hadithnumber)
    : String(arabicnumber);
  const [whole, frac] = raw.split('.');
  if (!frac) return whole;
  const n = parseInt(frac, 10);
  if (!n || n > SUFFIX_LETTERS.length) return whole;
  return `${whole}${SUFFIX_LETTERS[n - 1]}`;
}

export function toHadithSlug(collection, sunnahNum) {
  return `${collection}-${String(sunnahNum).replace(/\./g, '-')}`;
}

export function getSunnahUrl(collection, sunnahNum) {
  return `https://sunnah.com/${collection}:${sunnahNum}`;
}

/**
 * Dataset references inside annotation prose. Shared by scripts/import_hadith.js (which ships the
 * full text of every referenced hadith) and hadithLoader.js (which links them), so both always agree.
 *   - INLINE_HADITH_REF: backticked  `muslim:3479`
 *   - BARE_HADITH_REF:   bare        "cf. bukhari:5133", "(bukhari:371, bukhari:2235)"
 *                        — but not inside URLs, link text "[…]", link targets "](…)" or backticks.
 */
export const INLINE_HADITH_REF = /`((?:bukhari|muslim):[\d.]+)`/g;
export const BARE_HADITH_REF = /(?<![\w/:\[`])(?<!\]\()((?:bukhari|muslim):\d+(?:\.\d+)?)(?![\w\]])/g;

/** All dataset keys referenced in a piece of annotation prose (duplicates possible). */
export function extractHadithRefs(text) {
  const s = String(text || '');
  return [...s.matchAll(INLINE_HADITH_REF), ...s.matchAll(BARE_HADITH_REF)].map(m => m[1]);
}

/** Collections cited in prose but not part of this dataset: Sunnah.com slug → display name. */
export const OTHER_COLLECTIONS = { abudawud: 'Abu Dawud', tirmidhi: 'Tirmidhi', nasai: "Nasa'i", ibnmajah: 'Ibn Majah' };
/** `abudawud:2061` or bare tirmidhi:1428 (slugs as in OTHER_COLLECTIONS; same URL guards as BARE_HADITH_REF). */
export const OTHER_COLLECTION_REF = /`?(?<![\w/:\[])(abudawud|tirmidhi|nasai|ibnmajah):(\d+[a-z]?)(?![\w\]])`?/g;

/**
 * Inline `code` spans in annotation prose; authors use them to quote Arabic or a transliteration.
 * Both delimiters must sit at word edges, so the ASCII ʿayn of Muhsin Khan's English
 * (`Umar, Mu`adh, Jami` at-Tirmidhi) is never mistaken for one.
 */
export const CODE_SPAN = /(?<![\p{L}\p{M}\p{N}_`])`(?=\S)([^`\n]*?\S)`(?![\p{L}\p{M}\p{N}_`])/gu;
export const ARABIC_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Tashkeel, Quranic annotation marks, tatweel, and bidi/zero-width controls.
const AR_STRIP = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u200B-\u200F\u202A-\u202E\u2066-\u2069]/;
// 1:1 letter folds (so the index map stays aligned).
const AR_FOLD = { 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ى': 'ي', 'ة': 'ه', 'ؤ': 'و', 'ئ': 'ي' };
const PUNCT = /[.,;:!?"'“”‘’«»()\[\]،؛؟\-–—]/;

/**
 * Normalizes text while keeping a map from each normalized char index back to the original index.
 * @returns {{ out: string, map: number[] }}
 */
export function normalizeWithMap(str, { arabic = false, stripPunct = false } = {}) {
  let out = '';
  const map = [];
  let prevSpace = true;
  for (let i = 0; i < str.length; i++) {
    let ch = str[i];
    if (arabic && AR_STRIP.test(ch)) continue;
    if (stripPunct && PUNCT.test(ch)) ch = ' ';
    if (/\s/.test(ch)) {
      if (prevSpace) continue;
      out += ' ';
      map.push(i);
      prevSpace = true;
      continue;
    }
    if (arabic && AR_FOLD[ch]) ch = AR_FOLD[ch];
    out += arabic ? ch : ch.toLowerCase();
    map.push(i);
    prevSpace = false;
  }
  if (out.endsWith(' ')) {
    out = out.slice(0, -1);
    map.pop();
  }
  return { out, map };
}

/**
 * Finds `needle` inside `haystack`, first exactly, then via normalization.
 * Optional [from, to] window restricts the search (original indices).
 * @returns {[number, number] | null} original-index range [start, end)
 */
export function findRange(haystack, needle, { arabic = false, from = 0, to } = {}) {
  if (!haystack || !needle) return null;
  const end = to === undefined ? haystack.length : to;
  const exact = haystack.indexOf(needle, from);
  if (exact >= 0 && exact + needle.length <= end) return [exact, exact + needle.length];

  for (const stripPunct of [false, true]) {
    const H = normalizeWithMap(haystack, { arabic, stripPunct });
    const N = normalizeWithMap(needle, { arabic, stripPunct }).out;
    if (!N) continue;
    let startNorm = 0;
    while (startNorm < H.map.length && H.map[startNorm] < from) startNorm++;
    const j = H.out.indexOf(N, startNorm);
    if (j < 0) continue;
    const s = H.map[j];
    const e = H.map[j + N.length - 1] + 1;
    if (e <= end) return [s, e];
  }
  return null;
}

/** Context fringe around a range, trimmed to word boundaries. */
export function getFringe(text, range, size = 160) {
  if (!range) return { before: '', after: '' };
  const [s, e] = range;
  let before = text.slice(Math.max(0, s - size), s);
  let after = text.slice(e, e + size);
  if (s - size > 0) before = before.replace(/^\S*\s/, '');
  if (e + size < text.length) after = after.replace(/\s\S*$/, '');
  return { before: before.trimStart(), after: after.trimEnd() };
}

/**
 * Splits a translation-issue phrase on ellipses ("a ... b") into spans.
 */
export function splitPhrase(phrase = '') {
  return String(phrase).split(/\s*(?:\.\.\.|…)\s*/).map(s => s.trim()).filter(Boolean);
}

/**
 * True when a translation issue's published rendering means "not translated at all"
 * (empty, or a literal "[omitted]" placeholder from the data pipeline).
 */
export function isOmittedRendering(published) {
  const p = String(published ?? '').trim();
  return !p || /^\[?\s*omitted\s*\]?$/i.test(p);
}

/**
 * Builds render segments for a text with overlapping annotation ranges.
 * Range kinds:
 *   - 'mark'  → highlighted excerpt
 *   - 'term'  → Arabic sanitized term underline
 *   - 'del'   → struck published wording; `literal` is emitted as an insertion at range end
 *   - 'ins'   → zero-width insertion (omissions): start === end, `literal` inserted there
 * @returns {Array<{ text?: string, ins?: string, omission?: boolean, mark: boolean, term: boolean, del: boolean }>}
 */
export function buildSegments(text, ranges = []) {
  const valid = ranges.filter(r => r && r.start >= 0 && r.end <= text.length && r.start <= r.end);
  const points = new Set([0, text.length]);
  for (const r of valid) { points.add(r.start); points.add(r.end); }
  const sorted = [...points].sort((a, b) => a - b);
  const segments = [];
  const flagsAt = (a, b) => ({
    mark: valid.some(r => r.kind === 'mark' && r.start <= a && b <= r.end),
    term: valid.some(r => r.kind === 'term' && r.start <= a && b <= r.end),
    del: valid.some(r => r.kind === 'del' && r.start <= a && b <= r.end),
  });

  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    // Insertions that land at this point (end of a 'del' or a zero-width 'ins').
    for (const r of valid) {
      if ((r.kind === 'del' || r.kind === 'ins') && r.end === p && r.literal) {
        const inMark = valid.some(m => m.kind === 'mark' && m.start < p && p <= m.end);
        segments.push({ ins: r.literal, omission: r.kind === 'ins', mark: inMark, term: false, del: false });
      }
    }
    const next = sorted[i + 1];
    if (next === undefined || next === p) continue;
    segments.push({ text: text.slice(p, next), ...flagsAt(p, next) });
  }
  return segments;
}
