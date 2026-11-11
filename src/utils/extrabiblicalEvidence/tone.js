/**
 * Tone and academic-register guards for /discover/extrabiblical-evidence-for-jesus
 * (docs/article_and_ux_playbook.md §2.3 + christian_articles_rigour_playbook.md Rule 1).
 *
 * Shared by unit tests (`model.test.mjs`) and the static HTML audit (`scripts/test_extrabiblical_evidence.mjs`).
 * Applies strictly to editorial voice: verbatim ancient quotations in `quote` / `quoteMd` / `textMd`
 * and words quoted inside curly quotation marks (“…”, ‘…’) are stripped prior to matching.
 */

/** Playbook §2.3 body list + combative/hyperbolic apologetic buzzwords banned in editorial voice. */
export const BANNED = /\b(really|actually|yet|only|even|admit(?:s|ted|ting)?|blunder\w*|errors?|wrong|failed|edited out|blanked out|waived|survive[sd]?|surviving|guessing|myths?|exposed|debunk\w*|supposedly|polemic\w*|leap of faith|refut\w*|fatal|inescapable|irrefutabl\w*|undeniabl\w*|astonishing\w*|explosive\w*|devastating\w*|shatter\w*|collaps\w*|demolish\w*|destroy\w*|impal\w*|smoking gun|whitewash\w*|fraud\w*|barbaric|horrific|excuses?|apologists?|stunning\w*)\b|100\s?%|proves beyond doubt|utterly reliable/i;

/** Playbook §2.3 headline list banned in titles, headings, labels, navigation chips, and SEO metadata. */
export const HEADLINE_BANNED = /\b(contradictions?|conflicting|problematic|under scrutiny|absurd|self-serving|defects|conceded|misogyny)\b/i;

/**
 * Academic Register Policy (christian_articles_rigour_playbook.md Rule 1):
 *   1. Zero unnamed strawmen ("skeptics claim…", "critics say…", "detractors…", "dawah…").
 *      Where a scholarly counter-hypothesis is tested, name the exact scholar, school, or text + date.
 *   2. Zero first-person plural apologetic pronouns ("we", "us", "our", "ours", "ourselves").
 */
export const REGISTER_BANNED = /\b(skeptics?|skeptical|sceptics?|sceptical|detractors?|naysayers?|dawah|we|us|our|ours|ourselves)\b|\bcritics\s+(?:claim\w*|say|said|argu\w*|alleg\w*|assert\w*|object\w*|dismiss\w*|insist\w*|doubt\w*|question\w*)\b|\bsome\s+(?:claim\w*|say|argu\w*|doubt\w*|dismiss\w*)\b/i;

/** Old page vocabulary that must not reappear in editorial prose or UI chrome. */
export const LEGACY_UI_BANNED = /\b(Extrabiblical Catalog|Historical Extrabiblical Evidence for Jesus|62 verified Ante-Nicene)\b/i;

/** Strips markdown link URLs and quoted substrings (“…”, "…", ‘…’) before checking editorial voice. */
export const unquote = s => String(s)
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/“[^”]*”|"[^"]*"|‘[^’]*’/g, ' ');

/** Returns the first banned match in a string of editorial prose (or `null` when clean). */
export function toneHit(text, { headline = false } = {}) {
  const s = unquote(text);
  const m =
    s.match(BANNED) ||
    s.match(REGISTER_BANNED) ||
    s.match(LEGACY_UI_BANNED) ||
    (headline ? s.match(HEADLINE_BANNED) : null);
  return m ? m[0] : null;
}
