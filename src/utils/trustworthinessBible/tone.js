/**
 * Scholarly tone and voice guards for /discover/trustworthiness-of-the-bible
 * (docs/article_and_ux_playbook.md §2.3 + christian_articles_rigour_playbook.md §1 + Board #5).
 *
 * Applies strictly to OUR analytical voice: primary-source scripture quotations, historical
 * excerpts, and verbatim scholarly citations enclosed in “…” or "..." are stripped before
 * testing. Never "fix" a hit by regex replacement; rewrite the sentence in formal third-person
 * academic prose (matching Oxford Classical Dictionary / Bruce M. Metzger).
 */

/**
 * Words banned anywhere in our own voice:
 *   - Playbook §2.3 rhetoric & gotcha words (really, actually, yet, only, even, admit*, blunder*,
 *     errors, wrong, failed, survive*, guessing, myth*, exposed, debunk*, supposedly, polemic*,
 *     leap of faith, refut*, fatal, inescapable, undeniable, shatter*, devastating, ironclad,
 *     miraculous*, conspiracy, 100%, smoking gun, whitewash*, demolish*, apologist*)
 *   - Board #5 unnamed strawmen (skeptic*, sceptic*, critics claim/say/argue/allege/assert/object/
 *     dismiss/insist/contend/suggest, modern critics, detractors, dawah)
 *   - Board #5 first-person apologetic / conversational pronouns (we, us, our, ours, ourselves,
 *     you, your, yours, let's)
 */
export const BANNED = new RegExp(
  [
    '\\b(?:' + [
      'really', 'actually', 'yet', 'only', 'even',
      'admit(?:s|ted|ting)?', 'blunder\\w*', 'errors', 'wrong', 'failed',
      'edited out', 'blanked out', 'waived',
      'survive[sd]?', 'surviving', 'guessing', 'myths?', 'exposed',
      'debunk\\w*', 'supposedly', 'polemic\\w*', 'leap of faith', 'refut\\w*',
      'fatal', 'inescapable', 'undeniabl[ey]', 'shatter\\w*', 'devastating\\w*',
      'ironclad', 'miraculous\\w*', 'conspirac(?:y|ies)',
      'smoking gun', 'silver bullet', 'caught red-handed',
      'whitewash\\w*', 'demolish\\w*', 'excuse[sd]?', 'apologists?',
      'skeptics?', 'skeptical\\w*', 'sceptics?', 'sceptical\\w*',
      'detractors?', 'dawah', 'modern critics',
      'we', 'us', 'our', 'ours', 'ourselves',
      'you', 'your', 'yours', 'yourself',
    ].join('|') + ')\\b',
    "\\b(?:we're|we've|we'll|you'll|you're|you've|let's)\\b",
    '\\bcritics\\s+(?:claim|say|argue|allege|assert|object|dismiss|insist|contend|suggest|maintain)\\b',
    '100\\s?%',
  ].join('|'),
  'i',
);

/** Also banned in titles, headings, labels, navigation chips, summary labels, and SEO metadata. */
export const HEADLINE_BANNED = /\b(contradictions?|conflicting|problematic|under scrutiny|absurd|self-serving|defects|conceded|misogyny|myth|refuting|debunking|verdict|trilemma|skeptics?|sceptics?|critics)\b/i;

/**
 * Legacy slogans, raw LLM prompts, broken DB codes, and pop-apologist references from the previous
 * React-island version that must never appear in rendered prose.
 */
export const OLD_VOCAB_BANNED = /\b(command to llm|1pt 0 0|mt 0 0|other nt references|99\.5%\s+textual\s+purity|wes huff|stage\s+[1-4]:)\b/i;

/** Strips markdown link URLs and verbatim quoted spans (“…”, "…", ‘…’) so only our voice is tested. */
export const unquote = s => String(s || '')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/“[^”]*”|"[^"]*"|‘[^’]*’/g, ' ');

/** Returns the first banned match in a string of our voice, or null when clean. */
export function toneHit(text, { headline = false } = {}) {
  const s = unquote(text);
  const m = s.match(BANNED) || s.match(OLD_VOCAB_BANNED) || (headline ? s.match(HEADLINE_BANNED) : null);
  return m ? m[0] : null;
}
