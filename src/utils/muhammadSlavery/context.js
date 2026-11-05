/**
 * Repo sources the model verifies against, from already-loaded inputs (no JSON imports, so plain
 * Node scripts and tests can use it): the Droge translation, the commentary map published by the
 * /quran/S/A/tafsir/* pages, the surah names, the /hadith/<c>/<n> pages that exist, and arabic.js.
 */
import { ARABIC } from './arabic.js';

export function buildContext({ droge, meta, commentaries, hadithModel }) {
  const tafsir = { ik: {}, tb: {} };
  for (const [key, list] of Object.entries(commentaries || {})) {
    for (const c of list || []) {
      if (!c.commentary) continue;
      if (c.id === 'ibn_kathir') tafsir.ik[key] = c.commentary;
      if (c.id === 'tabari') tafsir.tb[key] = c.commentary;
    }
  }
  const permalinks = new Set();
  for (const r of hadithModel?.records?.values?.() || []) if (r.permalink) permalinks.add(r.permalink.replace(/^.*?(\/hadith\/)/, '/hadith/'));
  return {
    droge: Object.fromEntries(Object.entries(droge || {}).map(([k, v]) => [k, v.text])),
    tafsir,
    surahNames: Object.fromEntries((meta || []).map(s => [s.id, s.transliteration])),
    permalinks,
    arabic: ARABIC,
  };
}
