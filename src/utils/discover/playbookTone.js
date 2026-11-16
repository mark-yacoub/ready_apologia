/**
 * Canonical Playbook voice & meta-tag ban patterns (`docs/article_and_ux_playbook.md` §2.3 & §2.10).
 *
 * Shared across all Discover article `tone.js` modules and site-wide HTML audits
 * (`scripts/test_seo_titles.mjs`, `scripts/test_hadith_reliability.mjs`) so banned vocabulary and
 * editorial/translation-provenance housekeeping tags stay enforced from a single source of truth.
 *
 * Notes:
 *   - `PLAYBOOK_BODY` keeps `survive[sd]?` (not `surviv\w*`) so legitimate manuscript phrases like
 *     "surviving Greek manuscripts" do not false-positive; articles that additionally ban `surviv\w*`
 *     compose it via `combinePatterns(PLAYBOOK_BODY, PLAYBOOK_META, /\bsurviv\w*\b/i)`.
 *   - `PLAYBOOK_META` deliberately does NOT ban `/translator['’]s/i`, which is used in legitimate
 *     philological notes on Sunnah.com parenthetical glosses (e.g. "is the translator's gloss").
 */

/** Canonical Playbook §2.3 body words — never in our own voice anywhere (body, labels, headings, SEO). */
export const PLAYBOOK_BODY =
  /\b(really|actually|yet|only|even|admit(?:s|ted|ting)?|blunder\w*|errors|wrong|failed|edited out|blanked out|waived|survive[sd]?|guessing|myths?|exposed?|debunk\w*|supposedly|polemic\w*|leap of faith)\b/i;

/** Canonical Playbook §2.3 headline words — additionally never in titles, headings, labels, nav or SEO. */
export const PLAYBOOK_HEADLINE =
  /\b(contradictions?|conflicting|problematic|under scrutiny|absurd\w*|self-serving|defects?|conceded|misogyn\w*)\b/i;

/** Canonical Playbook §2.10 meta / editorial-housekeeping / translation-provenance / UI-link-mechanics ban. */
export const PLAYBOOK_META =
  /\b(highlighting ours|emphasis (?:added|ours)|bold(?:ing)? (?:inside quotations )?is ours|italics ours|ai-(?:assisted|translated|generated)|machine-(?:generated|translated)|translation (?:this site uses|used on this site)|see the note on the linked|opens (?:(?:tafs[iī]r|al-ṭabari|ibn kath[iī]r|sunnah\.com|the (?:verse|bible|commentary|scanned|holding)|shamela|islamweb|quran\.ksu)\b|al-ṭabarī(?![a-z\u00c0-\u024f])))/i;

/** Combine multiple case-insensitive RegExp patterns into a single alternation RegExp. */
export function combinePatterns(...regexes) {
  return new RegExp(regexes.map(r => `(?:${r.source})`).join('|'), 'i');
}
