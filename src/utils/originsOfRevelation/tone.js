/**
 * Tone vocabulary for /discover/origins-of-revelation (docs/article_and_ux_playbook.md §2.3), shared
 * by the unit test (copy in content.js) and the built-HTML audit (scripts/test_origins_of_revelation.mjs).
 * Applies to OUR voice only: quotations (Qurʾān, tafsir, hadith, Bible, sīra, quoted words in “…”)
 * are exempt and must be stripped before matching. Never "fix" a hit by regex: rewrite the sentence.
 */

import { PLAYBOOK_BODY, PLAYBOOK_HEADLINE, PLAYBOOK_META, combinePatterns } from '../discover/playbookTone.js';

/** Banned in our own voice anywhere on the page (playbook §2.3 & §2.10 + article gotcha words). */
export const BANNED = combinePatterns(PLAYBOOK_BODY, PLAYBOOK_META, /\b(refut\w*|fatal|inescapable)\b|100\s?%/i);

/** Also banned in titles, headings, labels, nav and SEO (playbook §2.3 headline list). */
export const HEADLINE_BANNED = PLAYBOOK_HEADLINE;

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
