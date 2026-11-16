/**
 * Banned words for our own voice on /discover/quran-preservation (playbook §2.3 & §2.10).
 * Shared by the unit test (config copy) and scripts/test_quran_preservation.mjs (rendered HTML).
 *   BODY      — never in our copy (body, labels, headings).
 *   HEADLINE  — additionally never in titles, headings, labels or SEO.
 */
import { PLAYBOOK_BODY, PLAYBOOK_HEADLINE, PLAYBOOK_META, combinePatterns } from '../discover/playbookTone.js';

export const BODY = combinePatterns(PLAYBOOK_BODY, PLAYBOOK_META, /\bsurviv\w*\b/i);
export const HEADLINE = PLAYBOOK_HEADLINE;
