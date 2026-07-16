import quranMeta from '../data/quran/arabic/meta.json';

export const TOTAL_SURAHS = 114;

export const getQuranSections = () => {
  const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;
  return [
    { id: 'lost', name: 'Lost Verses', path: `${base}/quran/0`, index: 0 },
    ...quranMeta.map(s => ({
      id: `surah-${s.id}`,
      name: `${s.id}. ${s.transliteration}`,
      path: `${base}/quran/${s.id}`,
      index: s.id
    })),
    { id: 'abrogated', name: 'Abrogated Verses', path: `${base}/quran/-1`, index: -1 }
  ];
};

export const QURAN_TABS_CONFIG = [
  { id: 'debunking-miracles', labelPrefix: 'Debunking Miracles' },
  { id: 'scientific-errors', labelPrefix: 'Scientific Errors' },
  { id: 'contradictions', labelPrefix: 'Contradictions' },
  { id: 'christian-footnotes', labelPrefix: 'Christian Footnotes' },
  { id: 'islamic-commentaries', labelPrefix: 'Islamic Commentaries' },
  { id: 'videos', labelPrefix: 'Videos' },
  { id: 'manuscripts', labelPrefix: 'Manuscripts' },
];

export const DEFAULT_QURAN_TAB_ORDER = QURAN_TABS_CONFIG.map(t => t.id);

/**
 * Sanitizes and migrates a user's saved tab order array from localStorage.
 * Ensures all current valid tab IDs exist exactly once, removes obsolete IDs,
 * and preserves user sorting preferences.
 */
export function sanitizeTabOrder(savedOrder, defaultOrder = DEFAULT_QURAN_TAB_ORDER) {
  if (!Array.isArray(savedOrder)) return [...defaultOrder];
  const validSet = new Set(defaultOrder);
  const result = savedOrder.filter(id => validSet.has(id));
  defaultOrder.forEach(id => {
    if (!result.includes(id)) {
      // Prepend debunking-miracles if missing for backwards compatibility, otherwise append
      if (id === 'debunking-miracles') {
        result.unshift(id);
      } else {
        result.push(id);
      }
    }
  });
  return result;
}

