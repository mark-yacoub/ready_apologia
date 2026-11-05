/**
 * Verbatim checks for /discover/origins-of-revelation quotations.
 *
 * Pure; runs inside the model (showcase and witness excerpts must appear in the quotation they cite)
 * and in the unit test / data tooling (quote fixes and EXTRA_QUOTES against `sourceText.js`).
 *
 * Matching is word-level and on word boundaries: emphasis, brackets, blockquote marks, punctuation,
 * quotation-mark style, ʿ/ʾ/backtick and case are ignored; each part between ellipses must appear as
 * whole words, in order.
 */

/** Word-level normalisation. */
export function normaliseWords(s) {
  return String(s)
    .replace(/\\'/g, "'")
    .replace(/^\s*>\s?/gm, '')
    .replace(/[*\[\]⌃]/g, '')
    .normalize('NFC')
    .replace(/[’‘ʼ`´'ʿʾ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Is `quote` verbatim in `source`? Each part between ellipses must appear as whole words, in order.
 * `edits` are declared word edits ("a b -> a c") applied to the source first, on word boundaries.
 * @returns {string|null} null when verbatim, else the first missing fragment
 */
export function verbatimProblem(quote, source, edits = []) {
  let src = ` ${normaliseWords(source)} `;
  for (const e of edits) {
    const [from, to] = String(e).split('->').map(x => normaliseWords(x));
    if (from && to) src = src.split(` ${from} `).join(` ${to} `);
  }
  let at = 0;
  for (const frag of String(quote).split(/\s*(?:\.\.\.|…)\s*/)) {
    const f = normaliseWords(frag);
    if (!f) continue; // punctuation-only fragment (e.g. a closing quote mark after "…")
    const i = src.indexOf(` ${f} `, at);
    if (i < 0) return frag.trim();
    at = i + f.length + 1;
  }
  return null;
}
