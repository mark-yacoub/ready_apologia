/**
 * Voice guards for this article (playbook §2.3 + cuj_ia.md §G), shared by `model.test.mjs` (config
 * copy) and `scripts/test_convenient_revelations.mjs` (built HTML, our voice only: verbatim quotes are
 * marked `data-v` and excluded).
 */

import { PLAYBOOK_BODY, PLAYBOOK_HEADLINE, PLAYBOOK_META, combinePatterns } from '../discover/playbookTone.js';

/** Never in our own voice (body or headings). */
export const OWN_VOICE = combinePatterns(PLAYBOOK_BODY, PLAYBOOK_META);

/** Additionally banned in titles, headings, labels, captions, stage labels and SEO. */
export const HEADLINE = combinePatterns(
  PLAYBOOK_HEADLINE,
  /\b(convenient|privileges?|evading|loopholes?|shield|firewall|patch|silencing|consolidation|monopoly|lucrative|apolog(?:y|ies|etic\w*)|unfiltered|devastating|reality|truth|harass\w*|boast\w*|weaponi[sz]\w*|undeniable)\b/i,
);

/** Strings from the old page that must not survive anywhere reader-facing. */
export const OLD_STRINGS = /convenient revelations|standard apology|unfiltered truth|reveal the reality|verified sunni orthodoxy|examine the defense/i;
