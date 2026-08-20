import { query } from '../db.js';
import { R2_BASE_URL } from './cdn_config.js';
import { mapLxxToMt } from './scripture_mapper.js';

// High-performance in-memory cache to eliminate redundant SQLite queries across 77,000+ SSG pages
const bibleOgCache = new Map();
const quranOgCache = new Map();

/**
 * Resolves the OpenGraph image for a Bible Chapter or Verse.
 * Rule:
 * 1. For a specific verse: First manuscript image of that exact verse.
 * 2. For a chapter: First manuscript image of the FIRST VERSE of that chapter (verse 1).
 *    Fallback to earliest extant verse in chapter if verse 1 is not mapped.
 */
export const getBibleOgImage = (book, chapter, verse, isNT) => {
  if (!book || !chapter) return undefined;
  
  const cacheKey = `${book}_${chapter}_${verse || ''}_${Boolean(isNT)}`;
  if (bibleOgCache.has(cacheKey)) {
    return bibleOgCache.get(cacheKey);
  }

  let result;
  
  if (isNT) {
    if (verse) {
      const ms = query(`
        SELECT m.ms_id, m.image_name
        FROM manuscript_per_verse m
        JOIN manuscripts_meta mm ON m.ms_id = mm.ms_id
        WHERE m.verse_id = :pattern
        ORDER BY mm.earliest_date ASC
        LIMIT 1
      `, { pattern: `${book}_${chapter}_${verse}` });
      
      if (ms.length > 0 && ms[0].image_name) {
        result = `${R2_BASE_URL}/images/${ms[0].ms_id}/${encodeURIComponent(ms[0].image_name)}`;
      }
    } else {
      // Chapter level: Try verse 1 first
      const msV1 = query(`
        SELECT m.ms_id, m.image_name
        FROM manuscript_per_verse m
        JOIN manuscripts_meta mm ON m.ms_id = mm.ms_id
        WHERE m.verse_id = :pattern
        ORDER BY mm.earliest_date ASC
        LIMIT 1
      `, { pattern: `${book}_${chapter}_1` });
      
      if (msV1.length > 0 && msV1[0].image_name) {
        result = `${R2_BASE_URL}/images/${msV1[0].ms_id}/${encodeURIComponent(msV1[0].image_name)}`;
      } else {
        // Fallback: earliest extant verse in chapter
        const msFallback = query(`
          SELECT m.ms_id, m.image_name
          FROM manuscript_per_verse m
          JOIN manuscripts_meta mm ON m.ms_id = mm.ms_id
          WHERE m.verse_id LIKE :pattern
          ORDER BY mm.earliest_date ASC
          LIMIT 1
        `, { pattern: `${book}_${chapter}_%` });
        
        if (msFallback.length > 0 && msFallback[0].image_name) {
          result = `${R2_BASE_URL}/images/${msFallback[0].ms_id}/${encodeURIComponent(msFallback[0].image_name)}`;
        }
      }
    }
  } else {
    // Old Testament (LXX & MT Versification Mapping)
    try {
      if (verse) {
        const mtMapping = mapLxxToMt(book, chapter, verse);
        const lxxId = `${book}_${chapter}_${verse}`;
        const mtId = `${mtMapping.book}_${mtMapping.chapter}_${mtMapping.verse}`;

        const msOt = query(`
          SELECT m.ms_id, m.image_name
          FROM manuscript_per_verse_ot m
          JOIN manuscripts_meta_ot mm ON m.ms_id = mm.ms_id
          WHERE (m.verse_id = :lxxId AND m.v11n_type = 'LXX')
             OR (m.verse_id = :mtId AND m.v11n_type = 'MT')
          ORDER BY mm.earliest_date ASC
          LIMIT 1
        `, { lxxId, mtId });
        
        if (msOt.length > 0 && msOt[0].image_name) {
          result = `${R2_BASE_URL}/ot_images/${msOt[0].ms_id}/${encodeURIComponent(msOt[0].image_name)}`;
        }
      } else {
        // Chapter level: Try verse 1 first
        const mtMapping1 = mapLxxToMt(book, chapter, '1');
        const lxxId1 = `${book}_${chapter}_1`;
        const mtId1 = `${mtMapping1.book}_${mtMapping1.chapter}_${mtMapping1.verse}`;

        const msOtV1 = query(`
          SELECT m.ms_id, m.image_name
          FROM manuscript_per_verse_ot m
          JOIN manuscripts_meta_ot mm ON m.ms_id = mm.ms_id
          WHERE (m.verse_id = :lxxId AND m.v11n_type = 'LXX')
             OR (m.verse_id = :mtId AND m.v11n_type = 'MT')
          ORDER BY mm.earliest_date ASC
          LIMIT 1
        `, { lxxId: lxxId1, mtId: mtId1 });
        
        if (msOtV1.length > 0 && msOtV1[0].image_name) {
          result = `${R2_BASE_URL}/ot_images/${msOtV1[0].ms_id}/${encodeURIComponent(msOtV1[0].image_name)}`;
        } else {
          // Fallback: Chapter wildcard
          const mtPattern = `${mtMapping1.book}_${mtMapping1.chapter}_%`;
          const lxxPattern = `${book}_${chapter}_%`;

          const msOtFallback = query(`
            SELECT m.ms_id, m.image_name
            FROM manuscript_per_verse_ot m
            JOIN manuscripts_meta_ot mm ON m.ms_id = mm.ms_id
            WHERE (m.verse_id LIKE :lxxPattern AND m.v11n_type = 'LXX')
               OR (m.verse_id LIKE :mtPattern AND m.v11n_type = 'MT')
            ORDER BY mm.earliest_date ASC
            LIMIT 1
          `, { lxxPattern, mtPattern });
          
          if (msOtFallback.length > 0 && msOtFallback[0].image_name) {
            result = `${R2_BASE_URL}/ot_images/${msOtFallback[0].ms_id}/${encodeURIComponent(msOtFallback[0].image_name)}`;
          }
        }
      }
    } catch(e) {}
  }

  bibleOgCache.set(cacheKey, result);
  return result;
};

/**
 * Resolves the OpenGraph image for a Quran Surah or Ayah.
 * Rule:
 * 1. For a specific ayah: First manuscript image of that exact ayah (${surah}:${ayah}).
 * 2. For a surah: First manuscript image of the FIRST AYAH of that surah (${surah}:1).
 *    Fallback to earliest extant ayah in surah if ayah 1 is not mapped.
 */
export const getQuranOgImage = (surah, ayah) => {
  if (!surah) return undefined;

  const sNum = String(surah);
  const aNum = ayah ? String(ayah) : null;
  const cacheKey = `${sNum}_${aNum || ''}`;

  if (quranOgCache.has(cacheKey)) {
    return quranOgCache.get(cacheKey);
  }

  let result;

  if (aNum) {
    const ms = query(`
      SELECT m.ms_id, m.image_name
      FROM manuscript_per_verse_quran m
      JOIN manuscripts_meta_quran mm ON m.ms_id = mm.ms_id
      WHERE m.verse_id = :verseId
      ORDER BY mm.earliest_date ASC
      LIMIT 1
    `, { verseId: `${sNum}:${aNum}` });
    
    if (ms.length > 0 && ms[0].image_name) {
      result = `${R2_BASE_URL}/quran/${ms[0].ms_id}/${encodeURIComponent(ms[0].image_name)}`;
    }
  } else {
    // Surah level: Try Ayah 1 first
    const msV1 = query(`
      SELECT m.ms_id, m.image_name
      FROM manuscript_per_verse_quran m
      JOIN manuscripts_meta_quran mm ON m.ms_id = mm.ms_id
      WHERE m.verse_id = :verseId
      ORDER BY mm.earliest_date ASC
      LIMIT 1
    `, { verseId: `${sNum}:1` });
    
    if (msV1.length > 0 && msV1[0].image_name) {
      result = `${R2_BASE_URL}/quran/${msV1[0].ms_id}/${encodeURIComponent(msV1[0].image_name)}`;
    } else {
      // Fallback: Earliest extant ayah in surah
      const msFallback = query(`
        SELECT m.ms_id, m.image_name
        FROM manuscript_per_verse_quran m
        JOIN manuscripts_meta_quran mm ON m.ms_id = mm.ms_id
        WHERE m.verse_id LIKE :pattern
        ORDER BY mm.earliest_date ASC
        LIMIT 1
      `, { pattern: `${sNum}:%` });
      
      if (msFallback.length > 0 && msFallback[0].image_name) {
        result = `${R2_BASE_URL}/quran/${msFallback[0].ms_id}/${encodeURIComponent(msFallback[0].image_name)}`;
      }
    }
  }

  quranOgCache.set(cacheKey, result);
  return result;
};

