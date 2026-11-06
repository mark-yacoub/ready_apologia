/**
 * Reader-facing copy, SEO metadata, and presentation constants for
 * /evidence/quran_sources ("Primary Sources of the Quran").
 * Voice: neutral researcher laying down facts (docs/article_and_ux_playbook.md §2).
 */

export const BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '');

export const SEO_EVIDENCE = {
  title: 'Primary Sources of the Quran: Stories, Phrases & Practices',
  description:
    'Compare {totalItems} Quranic stories, distinct verbal formulas, and ritual laws side by side with earlier Rabbinic, apocryphal, Syriac, Zoroastrian, and Arabian primary texts.',
  keywords:
    'sources of the quran, pre-islamic sources, quran and talmud, quran apocrypha, islamic rituals origins, quran parallels',
};

export function resolveEvidenceSeo({ totalItems = 0 } = {}) {
  const itemsStr = Number(totalItems).toLocaleString('en-US');
  return {
    title: SEO_EVIDENCE.title,
    description: SEO_EVIDENCE.description.replace('{totalItems}', itemsStr),
    keywords: SEO_EVIDENCE.keywords,
  };
}

export const UI_COPY = {
  breadcrumbRoot: 'Ready Apologia',
  breadcrumbEvidence: 'Apologetics Evidence',
  breadcrumbShort: 'Evidence',
  pageHeading: 'Primary Sources of the Quran',
  intro: {
    beforeRefs:
      'Muslims hold that the Qurʾān was revealed directly from God rather than drawn from earlier writings or surrounding customs; the text itself responds to contemporaries who called its narratives “tales of the ancients” (',
    ref255Label: '25:5',
    ref255Path: '/quran/25/5/tafsir/tabari',
    betweenRefs: ') taught by a human teacher (',
    ref16103Label: '16:103',
    ref16103Path: '/quran/16/103/tafsir/tabari',
    afterRefs: '). ',
    sentence2:
      'Below, specific Quranic narratives, multi-clause verbal parallels, and ritual ordinances are placed side by side with earlier Rabbinic, apocryphal, Syriac, Zoroastrian, and pre-Islamic Arabian primary texts, ordered strongest-first.',
  },
  statStrip: '{totalItems} curated parallels · {totalCitations} primary-source citations · {totalVerses} verses',
  categoryNavLabel: 'Parallel categories',
  traditionFilterLabel: 'Filter by source tradition',
  allTraditionsChip: 'All traditions',
  categorySummary: '{cards} curated parallels · ordered strongest-first',
  filteredSummary: '{cards} parallels in {tradition}',
  quranColumnLabel: 'Qurʾān',
  openReaderLabel: 'Open in reader →',
  arabicSummary: 'Original Arabic',
  readFullPassage: 'Read full passage',
  collapsePassage: 'Show less',
  originalTextSummary: 'Original text ({lang})',
  discussionSummary: 'Traditional explanation & the primary text',
  traditionalViewLabel: 'Traditional view',
  primaryComparisonLabel: 'Comparing with the primary text',
  verifyBible: 'Read in our Bible reader →',
  verifyTafsir: 'Read in our Tafsir reader →',
  verifyExternal: 'Verify at {hostname} ↗',
  showMoreButton: 'Show 20 more',
  loadingMore: 'Loading parallels…',
  loadError: 'Could not load parallels for this view.',
  retryButton: 'Retry',
  showingCount: 'Showing {shown} of {total} parallels',
};

export function formatStatStrip({ totalItems = 0, totalCitations = 0, totalVerses = 0 } = {}) {
  return UI_COPY.statStrip
    .replace('{totalItems}', Number(totalItems).toLocaleString('en-US'))
    .replace('{totalCitations}', Number(totalCitations).toLocaleString('en-US'))
    .replace('{totalVerses}', Number(totalVerses).toLocaleString('en-US'));
}

export function extractHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'source';
  }
}
