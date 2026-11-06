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
  /**
   * Intro paragraph as ordered segments: plain strings, or `{ label, path }` links to a verse's
   * commentary page. Rendered in order with no extra spacing, so each string carries its own spaces.
   */
  intro: [
    'Muslims hold that the Qurʾān was revealed directly from God rather than drawn from earlier writings or surrounding customs; the text itself records hearers who called its narratives “tales of the ancients” (',
    { label: '25:5', path: '/quran/25/5/tafsir/tabari' },
    ') taught by a human teacher (',
    { label: '16:103', path: '/quran/16/103/tafsir/tabari' },
    '). Texts of that kind can still be read, and below, Quranic narratives, multi-clause verbal parallels and ritual ordinances are placed side by side with earlier Rabbinic, apocryphal, Syriac, Zoroastrian and pre-Islamic Arabian primary texts. ',
    // Echoes the 25:5 "tales": the texts' own communities never held them as Scripture.
    'Many of them were never held as Scripture by the communities that kept them: rabbinic sayings, apocryphal tales of Jesus’ childhood, a Syriac legend of Alexander.',
  ],
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
