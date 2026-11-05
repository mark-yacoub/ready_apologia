/**
 * Tone vocabulary for /discover/origins-of-revelation (docs/article_and_ux_playbook.md §2.3), shared
 * by the unit test (copy in content.js) and the built-HTML audit (scripts/test_origins_of_revelation.mjs).
 * Applies to OUR voice only: quotations (Qurʾān, tafsir, hadith, Bible, sīra, quoted words in “…”)
 * are exempt and must be stripped before matching. Never "fix" a hit by regex: rewrite the sentence.
 */

/** Banned in our own voice anywhere on the page (playbook §2.3 body list + a few gotcha words). */
export const BANNED = /\b(really|actually|yet|only|even|admit(?:s|ted|ting)?|blunder\w*|errors|wrong|failed|edited out|blanked out|waived|survive[sd]?|guessing|myths?|exposed|debunk\w*|supposedly|polemic\w*|leap of faith|refut\w*|fatal|inescapable)\b|100\s?%/i;

/** Also banned in titles, headings, labels, nav and SEO (playbook §2.3 headline list). */
export const HEADLINE_BANNED = /\b(contradictions?|conflicting|problematic|under scrutiny|absurd|self-serving|defects|conceded|misogyny)\b/i;

/**
 * This page's old verdict vocabulary (labels and headings of the previous version that judged the person): never in our voice. "Satanic
 * Verses" may appear in quotations and SEO keywords only.
 */
export const VERDICT_BANNED = /\b(demonic parallel|diagnostic outcome|failing|mediumship|satanic verses|violence|suicidal ideation|physiological trances?|black magic|prophetic standard)\b/i;

/** Removes quoted words (“…”, "…", ‘…’) and markdown link targets from a string of our copy. */
export const unquote = s => String(s)
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/“[^”]*”|"[^"]*"|‘[^’]*’/g, ' ');

/** First banned hit in a string of our voice (null when clean). */
export function toneHit(text, { headline = false } = {}) {
  const s = unquote(text);
  const m = s.match(BANNED) || s.match(VERDICT_BANNED) || (headline ? s.match(HEADLINE_BANNED) : null);
  return m ? m[0] : null;
}
