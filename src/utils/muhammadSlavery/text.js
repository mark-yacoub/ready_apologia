/**
 * Text and reference helpers for /discover/muhammad-and-slavery (pure, isomorphic).
 *
 *   displayText / th          how a source text is shown (no markdown asterisks, ʿayn, al-Ṭabarī's {verse} braces as
 *                             “quotes”, line-wrap hyphens joined, ﷺ in the Arabic face)
 *   ayn                       Muhsin Khan's ASCII backtick → ʿ (shared by source texts and our prose)
 *   nestQuotes                ASCII " inside our “…” shown as ‘…’ (display only, HTML-safe)
 *   cmpNorm / wordNorm        comparison forms; containsQuote = the build's "verbatim" rule
 *   parseRef                  structured reference keys used in the copy JSON (the only accepted form):
 *                               bukhari:4234  muslim:1456a  abudawud:1690  nasai:3959  ibnmajah:2516
 *                               quran:4:24  quran:58:3-4  tabari:4:24  tabari:4:24#7125  ibnkathir:33:50
 *   labelRefs                 human references in running prose ("Bukhārī 4234 and 6707", "(4:24)")
 *   quotedSpans               quotations in prose (curly or straight double quotes, ‘single’ quotations)
 */
import { tl } from '../hadithReliability/render.js';

export const sunnahUrl = (col, num) => `https://sunnah.com/${col}:${num}`;
export const fill = (tpl, vars) => String(tpl).replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));

const WORD_NUMS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
export const asNum = s => (/^\d+$/.test(s) ? Number(s) : WORD_NUMS[String(s).toLowerCase()]);

/** Muhsin Khan's ASCII ʿayn (Mid`am → Midʿam): one rule for source texts and our prose. */
export const ayn = s => String(s ?? '').replace(/`/g, 'ʿ');

/** Sunnah.com OCR line-wrap hyphens ("pledg- ed" → "pledged"): a hyphen + space between lowercase letters. */
const joinWraps = s => s.replace(/(\p{Ll})-\s+(\p{Ll})/gu, '$1$2');

/**
 * Display form of a source text: no markdown emphasis (`**bold**`, `*Mahr*`), ʿayn, al-Ṭabarī's `{verse}`
 * braces shown as “…”, line-wrap hyphens joined, one space after "Narrated X:". cmpNorm applies the same
 * transforms, so a quotation of the displayed text still matches the raw source.
 */
export function displayText(s) {
  return joinWraps(ayn(s)
    .replace(/\*+/g, '')
    .replace(/\{/g, '\u201c')
    .replace(/\}/g, '\u201d'))
    .replace(/([a-z)]):(?=[A-Z])/g, '$1: ')
    .replace(/:"\s+(?=\S)/g, ': "')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Plain string → safe HTML: transliteration marks fixed (hrv `tl`) and ﷺ set in the Arabic face (Literata has no glyph). */
export function th(text) {
  return tl(text).replace(/\uFDFA/g, '<span class="ms-saw">\uFDFA</span>');
}

/**
 * Nested quotations inside our “curly” quotes, display only: an ASCII double quote (raw or `&quot;`) that
 * sits inside a “…” span is shown as ‘ or ’ (opening after a space, an opening bracket or another opening
 * mark; closing otherwise), so a quoted source never renders as `…me?"”`. Works on HTML: tags and their
 * attributes are left alone. The verbatim checks run on the raw text (cmpNorm treats ‘’ and " alike).
 */
export function nestQuotes(html) {
  let depth = 0;
  let prev = ' ';
  return String(html ?? '').split(/(<[^>]*>)/).map(tok => {
    if (tok.startsWith('<')) return tok;
    let out = '';
    for (let i = 0; i < tok.length; i++) {
      const isEnt = tok.startsWith('&quot;', i);
      const ch = isEnt ? '"' : tok[i];
      if (ch === '\u201c') depth++;
      else if (ch === '\u201d') depth = Math.max(0, depth - 1);
      if (ch === '"' && depth > 0) {
        out += /[\s(\[:\u2014\u2013\u201c\u2018]/.test(prev) ? '\u2018' : '\u2019';
        prev = out[out.length - 1];
        if (isEnt) i += 5;
        continue;
      }
      out += isEnt ? '&quot;' : ch;
      prev = ch;
      if (isEnt) i += 5;
    }
    return out;
  }).join('');
}

/** Comparison form: quote marks (and {braces}) unified, spacing around quotes/colons ignored, asterisks, highlight marks and line-wrap hyphens removed. */
export function cmpNorm(s) {
  return joinWraps(String(s ?? ''))
    .replace(/\*+/g, '')
    .replace(/\[\[|\]\]/g, '')
    .replace(/[\u2018\u2019\u02bf\u02be`\u00b4]/g, "'")
    .replace(/[\u201c\u201d{}]/g, '"')
    .replace(/\.\.\./g, '…')
    .replace(/\s*([:"'])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Word form: letters and digits only (the fact-checkers' "word-identical" rule ignores punctuation). */
export function wordNorm(s) {
  return cmpNorm(s).replace(/…/g, ' … ').toLowerCase().replace(/[^\p{L}\p{N}…\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * True when every `…`-separated fragment of `quote` is a substring of `source`, in order: first with quote
 * marks and spacing normalised, then word for word (punctuation ignored, as in the fact-check). A quotation
 * may change the case of its first letter to fit the sentence; nothing else.
 */
export function containsQuote(source, quote) {
  return containsIn(cmpNorm(source), cmpNorm(quote)) || containsIn(` ${wordNorm(source)} `, wordNorm(quote), true);
}

function containsIn(hay, needle, words = false) {
  const frags = needle.split('…').map(f => f.trim().replace(/^[,;.]\s*|\s*[,;]$/g, '')).filter(Boolean).map(f => (words ? ` ${f} ` : f));
  if (!frags.length) return false;
  let at = 0;
  for (const f of frags) {
    const alt = f.charAt(0) === f.charAt(0).toLowerCase() ? f.charAt(0).toUpperCase() + f.slice(1) : f.charAt(0).toLowerCase() + f.slice(1);
    const i = [hay.indexOf(f, at), hay.indexOf(alt, at)].filter(x => x >= 0).sort((a, b) => a - b)[0] ?? -1;
    if (i < 0) return false;
    at = i + f.length;
  }
  return true;
}

export const HADITH_COLLECTIONS = ['bukhari', 'muslim', 'abudawud', 'nasai', 'ibnmajah', 'tirmidhi'];

/**
 * A structured reference key (the copy JSON's only reference form).
 * @returns {{kind:'hadith', col, num, key} | {kind:'quran', surah, ayah, ayahEnd, key} | {kind:'tafsir', who:'ik'|'tb', key, narration} | null}
 */
export function parseRef(input) {
  const s = String(input ?? '').trim();
  let m = s.match(/^(bukhari|muslim|abudawud|nasai|ibnmajah|tirmidhi):(\d+[a-z]?)$/);
  if (m) return { kind: 'hadith', col: m[1], num: m[2], key: `${m[1]}:${m[2]}` };
  m = s.match(/^quran:(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/);
  if (m) return { kind: 'quran', surah: Number(m[1]), ayah: Number(m[2]), ayahEnd: m[3] ? Number(m[3]) : null, key: `${m[1]}:${m[2]}` };
  m = s.match(/^(tabari|ibnkathir):(\d{1,3}:\d{1,3})(?:#(\d+))?$/);
  if (m) return { kind: 'tafsir', who: m[1] === 'ibnkathir' ? 'ik' : 'tb', key: m[2], narration: m[3] || null };
  return null;
}

/** Collection names as written in prose → collection id. */
const PROSE_COLLECTIONS = [
  ['bukhari', 'Bukh[āa]r[īi]'], ['muslim', 'Muslim'], ['abudawud', 'Ab[ūu] D[āa]w[ūu]d'],
  ['ibnmajah', 'Ibn M[āa]jah'], ['nasai', '(?:al-)?Nas[āa](?:ʾ|\')?[īi]'], ['tirmidhi', '(?:al-)?Tirmidh[īi]'],
];

/**
 * Human references in a stretch of prose → structured keys. Reads "Bukhārī 4234", "Bukhārī 4234 and 6707",
 * "Muslim 1456a, 1456b", "Qurʾān 4:24", "Ibn Kathīr on 4:24", "al-Ṭabarī on 33:59", and a bare "(4:24)".
 */
export function labelRefs(s) {
  const text = String(s ?? '');
  const out = [];
  for (const [col, name] of PROSE_COLLECTIONS) {
    const re = new RegExp(`\\b${name}\\s+(\\d+[a-z]?(?:\\s*(?:,|and|·|/|–)\\s*\\d+[a-z]?)*)`, 'g');
    for (const m of text.matchAll(re)) for (const n of m[1].split(/\s*(?:,|and|·|\/|–)\s*/)) out.push(`${col}:${n}`);
  }
  for (const m of text.matchAll(/\b(Ibn Kath[īi]r|al-[ṬT]abar[īi])(?:'s|’s)?\s+(?:on|at)\s+(\d{1,3}:\d{1,3})/gi)) out.push(`${/^ibn/i.test(m[1]) ? 'ibnkathir' : 'tabari'}:${m[2]}`);
  for (const m of text.matchAll(/\bQur(?:ʾ|'|’)?[āa]n\s+(\d{1,3}):(\d{1,3})(?:[–-](\d{1,3}))?/g)) out.push(`quran:${m[1]}:${m[2]}${m[3] ? `-${m[3]}` : ''}`);
  for (const m of text.matchAll(/\((\d{1,3}):(\d{1,3})(?:[–-](\d{1,3}))?\)/g)) out.push(`quran:${m[1]}:${m[2]}${m[3] ? `-${m[3]}` : ''}`);
  return [...new Set(out)];
}

/** Quotations in prose with their position: “…”, "…", and ‘…’ (an apostrophe is followed by a letter). */
export function quotedSpans(s, { min = 0 } = {}) {
  const out = [];
  for (const m of String(s ?? '').matchAll(/\u201c([^\u201d]+)\u201d|"([^"]+)"|\u2018([^\u2018]+?)\u2019(?![\p{L}])/gu)) {
    const text = m[1] ?? m[2] ?? m[3];
    if (text.length >= min) out.push({ text, start: m.index, end: m.index + m[0].length });
  }
  return out;
}
