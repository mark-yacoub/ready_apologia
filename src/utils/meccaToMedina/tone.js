/**
 * Banned words for our own voice on /discover/from-mecca-to-medina (playbook §2 rule 3).
 * Shared by the unit test (config copy) and scripts/test_mecca_to_medina.mjs (rendered HTML).
 *   BODY      — never in our copy (body, labels, headings).
 *   HEADLINE  — additionally never in titles, headings, labels or SEO.
 * Quoted sources (inside curly double quotes) and Arabic are exempt: they are verbatim.
 */
import { PLAYBOOK_BODY, PLAYBOOK_HEADLINE, PLAYBOOK_META, combinePatterns } from '../discover/playbookTone.js';

export const BODY = combinePatterns(PLAYBOOK_BODY, PLAYBOOK_META, /\b(surviv\w*|dogmatic|universal conquest|consensus)\b/i);
export const HEADLINE = combinePatterns(PLAYBOOK_HEADLINE, /\b(verdict of history|aggressive|decapitat\w*|torture)\b/i);

/** Our voice only: drop Arabic spans, «…» Arabic quotes and anything in curly double quotes. */
export function ourVoice(text) {
  return String(text ?? '')
    .replace(/<span class="hrv-ar-inline"[^>]*>[\s\S]*?<\/span>/g, ' ')
    .replace(/«[^»]*»/g, ' ')
    .replace(/\u201c[^\u201d]*\u201d/g, ' ');
}
