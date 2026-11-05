/**
 * Tone vocabulary for /discover/islamic-dilemma (docs/article_and_ux_playbook.md §2.3), shared by the
 * unit test (copy in content.js / overrides.js) and the built-HTML audit (scripts/test_islamic_dilemma.mjs).
 * Applies to OUR voice only: quotations (Qurʾān, tafsir, hadith, Bible, quoted words in "…") are
 * exempt and must be stripped before matching. Never "fix" a hit by regex: rewrite the sentence.
 */

/** Banned in our own voice anywhere on the page, plus this page's old verdict vocabulary. */
export const BANNED = /\b(really|actually|yet|only|even|admit(?:s|ted|ting)?|blunder\w*|errors|wrong|failed|edited out|blanked out|waived|survive[sd]?|guessing|myths?|exposed|debunk\w*|supposedly|polemic\w*|leap of faith|refut\w*|fatal|self-destruct\w*|inescapable|islam is false)\b|100\s?%/i;

/** Also banned in titles, headings, labels, nav and SEO ("dilemma" is allowed only in the eyebrow search name). */
export const HEADLINE_BANNED = /\b(contradictions?|conflicting|problematic|under scrutiny|absurd|self-serving|defects|conceded|misogyny|dilemma)\b/i;

/** Removes quoted words ("…", “…”, ‘…’) and markdown link targets from a string of our copy. */
export const unquote = s => String(s).replace(/"[^"]*"|“[^”]*”|‘[^’]*’/g, ' ').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
