import { query } from '../db.js';
import { R2_BASE_URL } from './cdn_config.js';
import { mapLxxToMt } from './scripture_mapper.js';

export const getBibleOgImage = (book, chapter, verse, isNT) => {
  let ogImage = undefined;
  
  if (isNT) {
    let whereClause = "m.verse_id LIKE :pattern";
    let pattern = verse ? `${book}_${chapter}_${verse}` : `${book}_${chapter}_%`;
    
    const ms = query(`
      SELECT m.ms_id, m.image_name
      FROM manuscript_per_verse m
      JOIN manuscripts_meta mm ON m.ms_id = mm.ms_id
      WHERE ${whereClause}
      ORDER BY mm.earliest_date ASC
      LIMIT 1
    `, { pattern });
    
    if (ms.length > 0 && ms[0].image_name) {
      ogImage = `${R2_BASE_URL}/images/${ms[0].ms_id}/${encodeURIComponent(ms[0].image_name)}`;
    }
  } else {
    try {
      let v11IdPattern = verse ? `${book}_${chapter}_${verse}` : `${book}_${chapter}_%`;
      let params = { lxxPattern: v11IdPattern };
      
      let whereClause = "(m.verse_id LIKE :lxxPattern AND m.v11n_type = 'LXX')";
      
      // If we have an exact verse, we can map it directly.
      // If we are searching a chapter wildcard, we should also wildcard the MT equivalent.
      // The easiest way for a chapter wildcard is just the MT book & chapter.
      if (verse) {
        const mtMapping = mapLxxToMt(book, chapter, verse);
        const mtId = `${mtMapping.book}_${mtMapping.chapter}_${mtMapping.verse}`;
        whereClause += " OR (m.verse_id = :mtPattern AND m.v11n_type = 'MT')";
        params.mtPattern = mtId;
      } else {
        // Fallback: If mapLxxToMt supports passing just book and chapter, or we just map 1 to get the MT book.
        const mtMapping = mapLxxToMt(book, chapter, '1');
        const mtPattern = `${mtMapping.book}_${mtMapping.chapter}_%`;
        whereClause += " OR (m.verse_id LIKE :mtPattern AND m.v11n_type = 'MT')";
        params.mtPattern = mtPattern;
      }

      const msOt = query(`
        SELECT m.ms_id, m.image_name
        FROM manuscript_per_verse_ot m
        JOIN manuscripts_meta_ot mm ON m.ms_id = mm.ms_id
        WHERE ${whereClause}
        ORDER BY mm.earliest_date ASC
        LIMIT 1
      `, params);
      
      if (msOt.length > 0 && msOt[0].image_name) {
        ogImage = `${R2_BASE_URL}/ot_images/${msOt[0].ms_id}/${encodeURIComponent(msOt[0].image_name)}`;
      }
    } catch(e) {}
  }
  return ogImage;
};

export const getQuranOgImage = (surah, ayah) => {
  let ogImage = undefined;
  const pattern = ayah ? `S${surah}_${ayah}` : `S${surah}_%`;
  const ms = query(`
    SELECT m.ms_id, m.image_name
    FROM manuscript_per_verse_quran m
    JOIN manuscripts_meta_quran mm ON m.ms_id = mm.ms_id
    WHERE m.verse_id LIKE :pattern
    ORDER BY mm.earliest_date ASC
    LIMIT 1
  `, { pattern });
  
  if (ms.length > 0 && ms[0].image_name) {
    ogImage = `${R2_BASE_URL}/quran/${ms[0].ms_id}/${encodeURIComponent(ms[0].image_name)}`;
  }
  return ogImage;
};
