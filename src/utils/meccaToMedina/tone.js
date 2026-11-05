/**
 * Banned words for our own voice on /discover/from-mecca-to-medina (playbook §2 rule 3).
 * Shared by the unit test (config copy) and scripts/test_mecca_to_medina.mjs (rendered HTML).
 *   BODY      — never in our copy (body, labels, headings).
 *   HEADLINE  — additionally never in titles, headings, labels or SEO.
 * Quoted sources (inside curly double quotes) and Arabic are exempt: they are verbatim.
 */
export const BODY = /\b(really|actually|yet|only|even|admit(?:s|ted|ting)?|blunders?|errors|wrong|failed|edited out|blanked out|waived|surviv\w*|guessing|myths?|exposed?|debunk\w*|supposedly|polemic\w*|leap of faith|dogmatic|universal conquest|consensus)\b/i;
export const HEADLINE = /\b(contradictions?|conflicting|problematic|under scrutiny|absurd\w*|self-serving|defects?|conceded|misogyn\w*|verdict of history|aggressive|decapitat\w*|torture)\b/i;

/** Our voice only: drop Arabic spans, «…» Arabic quotes and anything in curly double quotes. */
export function ourVoice(text) {
  return String(text ?? '')
    .replace(/<span class="hrv-ar-inline"[^>]*>[\s\S]*?<\/span>/g, ' ')
    .replace(/«[^»]*»/g, ' ')
    .replace(/\u201c[^\u201d]*\u201d/g, ' ');
}
