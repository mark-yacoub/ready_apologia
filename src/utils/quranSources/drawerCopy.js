/**
 * Reader-facing copy for the v3 verse drawer "Primary Sources" tab.
 * Voice: researcher laying down facts (docs/article_and_ux_playbook.md §2). No verdict words.
 */
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export const DRAWER_COPY = {
  heading: (verseId) => `Earlier primary texts that parallel Qurʾān ${verseId}`,
  lead: (entryCount, totalSources) =>
    `${plural(entryCount, 'curated parallel connects', 'curated parallels connect')} this verse to ${plural(totalSources, 'earlier primary text', 'earlier primary texts')}, quoted verbatim and linked for verification.`,
  pericopeScope: (range) => `Qurʾān ${range}`,
  original: (lang) => `Original text${lang ? ` (${lang})` : ''}`,
  discussionSummary: 'Traditional explanation & the primary text',
  traditionalViewLabel: 'Traditional view',
  primaryComparisonLabel: 'Comparing with the primary text',
  browseCategory: (catLabel) => `Browse all ${catLabel} →`,
  browseHref: (base, catSlug = 'stories') => `${base}/evidence/quran_sources#${catSlug}`,
};

/** Draft SEO for /quran/[s]/[a]/sources — neutral researcher voice. */
export const SEO_DRAWER = {
  title: (s, a, firstSource = '') => {
    const clean = String(firstSource || '')
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (clean) {
      const full = `Quran ${s}:${a} & ${clean}: Earlier Primary Sources`;
      if (full.length <= 60) return full;
      const shorter = `Quran ${s}:${a} & ${clean}: Primary Sources`;
      if (shorter.length <= 60) return shorter;
      const prefix = `Quran ${s}:${a} & `;
      const suffix = `: Primary Sources`;
      const avail = 60 - prefix.length - suffix.length;
      if (avail >= 10) {
        const cut = clean.lastIndexOf(' ', avail - 1);
        const trimmed = (cut >= 8 ? clean.slice(0, cut) : clean.slice(0, avail - 1)).replace(/[,;:\-–—&\s]+$/, '');
        return `${prefix}${trimmed}…${suffix}`;
      }
    }
    return `Quran ${s}:${a}: Earlier Primary Sources & Parallels`;
  },
  description: (s, a, total, sampleTitles) =>
    `Compare Qurʾān ${s}:${a} side by side with ${total} earlier primary-source ${total === 1 ? 'passage' : 'passages'}${sampleTitles ? `, including ${sampleTitles}` : ''}, each linked for verification.`,
  keywords: (s, a) =>
    `quran ${s}:${a} primary sources, surah ${s} ayah ${a} parallels, pre-islamic sources of the quran`,
  faqQuestion: (s, a) => `What earlier primary texts parallel Qurʾān ${s}:${a}?`,
};
