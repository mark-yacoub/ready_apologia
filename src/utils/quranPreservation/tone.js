/**
 * Banned words for our own voice on /discover/quran-preservation (playbook §2 rule 3).
 * Shared by the unit test (config copy) and scripts/test_quran_preservation.mjs (rendered HTML).
 *   BODY      — never in our copy (body, labels, headings).
 *   HEADLINE  — additionally never in titles, headings, labels or SEO.
 */
export const BODY = /\b(really|actually|yet|only|even|admit(?:s|ted|ting)?|blunders?|errors|wrong|failed|edited out|blanked out|waived|surviv\w*|guessing|myths?|exposed?|debunk\w*|supposedly|polemic\w*|leap of faith)\b/i;
export const HEADLINE = /\b(contradictions?|conflicting|problematic|under scrutiny|absurd\w*|self-serving|defects?|conceded|misogyn\w*)\b/i;
