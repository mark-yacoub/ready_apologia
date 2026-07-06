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
