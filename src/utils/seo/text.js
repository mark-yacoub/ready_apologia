/**
 * Isomorphic text sanitization, clamping, and word-boundary fitting helpers for SEO metadata.
 * Pure JS (no node: imports) so client islands and server routes can share this module.
 */

/**
 * Plain-text sanitizer for SEO titles, meta descriptions, and Schema.org Question.name.
 * Strips HTML tags, unwraps Markdown bold/italic markers, and collapses whitespace.
 *
 * @param {string} str
 * @returns {string}
 */
export const sanitizeQuestionText = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/<[^>]*>?/gm, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // markdown links -> label
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
};

export const sanitizeHTML = (str) => sanitizeQuestionText(str);

/**
 * Trailing English stop words (prepositions, articles, conjunctions, auxiliaries,
 * relative pronouns) that must not dangle at the end of a truncated title before `…`.
 */
export const STOP_TAIL_RE = /\b(?:of|the|and|in|to|for|with|on|at|by|from|a|an|or|as|into|is|are|was|were|that|which)$/i;

/**
 * Fits a string into `maxLen` characters (inclusive of the trailing `…` ellipsis)
 * for SEO `<title>` tags without mid-word cuts or dangling stop words.
 *
 * Algorithm:
 * 1. Sanitize HTML/Markdown via {@link sanitizeQuestionText} and strip outer quotation
 *    marks (`"`, `'`, `“`, `”`, `‘`, `’`).
 * 2. Return `''` if empty or `maxLen <= 0`; return `clean` unchanged if `clean.length <= maxLen`.
 * 3. For tiny budgets (`maxLen <= 4`), hard-slice `clean.slice(0, maxLen)` without an ellipsis.
 * 4. Reserve 1 character for `…` (`budget = maxLen - 1`) and find the last space at or before `budget`:
 *    - Word-boundary cut: use `clean.slice(0, cut)` when `cut >= Math.min(8, Math.floor(budget * 0.45))`
 *      (prevents discarding more than ~55% of a short budget when a long word appears early).
 *    - Fallback: hard-slice `clean.slice(0, budget)` if no acceptable word boundary exists.
 * 5. Strip trailing punctuation/conjunction symbols (`[,;:\-–—&\s]+$`).
 * 6. Stop-word tail trimming: while the remaining multi-word phrase ends with a stop word matching
 *    {@link STOP_TAIL_RE} (`of`, `the`, `and`, `in`, `to`, `for`, `with`, etc.), drop the trailing
 *    word and any preceding punctuation so titles never end on a dangling preposition or article.
 * 7. Append `…` (U+2026), guaranteeing `result.length <= maxLen`.
 *
 * @example
 * fitText("The Deity of Christ in the Gospel of John", 28)
 * // => "The Deity of Christ…" (cuts at word boundary and trims trailing "in" + "the")
 *
 * @example
 * fitText('"Why Did Jesus Weep?"', 25)
 * // => "Why Did Jesus Weep?" (outer quotes stripped; fits within 25 chars without ellipsis)
 *
 * @param {string} text - Raw input text.
 * @param {number} maxLen - Maximum allowed character length (including `…`).
 * @returns {string} Fitted string of length `<= maxLen`.
 */
export const fitText = (text, maxLen) => {
  const clean = sanitizeQuestionText(text).replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim();
  if (!clean || maxLen <= 0) return '';
  if (clean.length <= maxLen) return clean;
  if (maxLen <= 4) return clean.slice(0, maxLen);
  const budget = maxLen - 1;
  const cut = clean.lastIndexOf(' ', budget);
  let base = cut >= Math.min(8, Math.floor(budget * 0.45)) ? clean.slice(0, cut) : clean.slice(0, budget);
  base = base.replace(/[,;:\-–—&\s]+$/, '');
  while (STOP_TAIL_RE.test(base) && base.includes(' ')) {
    base = base.slice(0, base.lastIndexOf(' ')).replace(/[,;:\-–—&\s]+$/, '');
  }
  return `${base}…`;
};

/**
 * Clamps a meta description to `maxLen` characters (default 158), preferring a full
 * sentence boundary (`". "` or `"? "` at index >= 95), otherwise cutting at the last
 * word boundary (`>= 80`) and appending `…`.
 *
 * @param {string} text
 * @param {number} [maxLen=158]
 * @returns {string}
 */
export const clampDescription = (text, maxLen = 158) => {
  const clean = sanitizeQuestionText(text);
  if (clean.length <= maxLen) return clean;
  const budget = maxLen - 1;
  const sentCut = Math.max(clean.lastIndexOf('. ', budget), clean.lastIndexOf('? ', budget));
  if (sentCut >= 95) return clean.slice(0, sentCut + 1);
  const wordCut = clean.lastIndexOf(' ', budget);
  const base = (wordCut >= 80 ? clean.slice(0, wordCut) : clean.slice(0, budget)).replace(/[,;:\-–—&\s]+$/, '');
  return `${base}…`;
};

/**
 * Cleans an apologetics or contradiction item title by stripping outer quotes and
 * leading verse reference prefixes (e.g. `"John 1:1 — "` or `"Luke 2:4: "`).
 *
 * @param {string} rawTitle
 * @param {string} [verseRef='']
 * @param {string} [otherRef='']
 * @returns {string}
 */
export const cleanItemTitle = (rawTitle, verseRef = '', otherRef = '') => {
  let t = sanitizeQuestionText(rawTitle).replace(/^["'“”]+|["'“”]+$/g, '').trim();
  if (verseRef) {
    const esc = verseRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    t = t.replace(new RegExp(`^${esc}\\s*[—–\\-:]\\s*`, 'i'), '');
  }
  if (otherRef) {
    const escOther = otherRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    t = t.replace(new RegExp(`^${escOther}\\s*[—–\\-:]\\s*`, 'i'), '');
  }
  return t.replace(/^["'“”]+|["'“”]+$/g, '').trim();
};

/**
 * Cleans a short video title by stripping a trailing `" | Channel/Creator"` suffix and outer quotes.
 *
 * @param {string} rawTitle
 * @returns {string}
 */
export const cleanVideoTitle = (rawTitle) =>
  sanitizeQuestionText(rawTitle)
    .replace(/\s*\|\s*[^|]+$/, '')
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .trim();

/**
 * Wraps a trailing title/topic in straight (`"..."`) or typographic (`“...”`) quotes,
 * ensuring terminal punctuation (`.`, `?`, or `!`) sits inside the closing quote.
 *
 * @param {string} text
 * @param {boolean} [smart=false]
 * @returns {string}
 */
export const quoteTail = (text, smart = false) => {
  const t = String(text || '').trim();
  if (!t) return '.';
  const hasEndPunct = /[.?!]$/.test(t);
  return smart
    ? `“${t}${hasEndPunct ? '' : '.'}”`
    : `"${t}${hasEndPunct ? '' : '.'}"`;
};

/**
 * Formats an array of strings as an Oxford-comma English list (`"A"`, `"A and B"`, `"A, B, and C"`).
 *
 * @param {string[]} items
 * @returns {string}
 */
export const formatList = (items) => {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};
