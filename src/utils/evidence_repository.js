import { query } from "../db.js";

/**
 * `col IN (:p0, :p1, ...)` for one id or a list of ids (a verse page can collect evidence for
 * several MT ids; see verseRouting.mtIdsForReaderRoute). Empty list -> a clause matching nothing.
 */
function idsIn(col, ids, prefix) {
  const list = (Array.isArray(ids) ? ids : [ids]).filter(Boolean);
  if (!list.length) return { sql: '0', params: {} };
  const params = Object.fromEntries(list.map((v, i) => [`${prefix}${i}`, v]));
  return { sql: `${col} IN (${Object.keys(params).map(k => `:${k}`).join(', ')})`, params };
}

function buildSortBySource(tableAlias) {
  return `
    CASE
      WHEN ${tableAlias}.src = '' OR ${tableAlias}.src IS NULL THEN 0
      WHEN pf.id IS NOT NULL THEN 1
      WHEN ${tableAlias}.src = 'answering_islam' THEN 2
      WHEN ${tableAlias}.src = 'tektonics' THEN 3
      WHEN ${tableAlias}.src = 'apologetic_apologetics_press' THEN 4
      WHEN ${tableAlias}.src = 'apologetic_defending_inerrancy' THEN 5
      WHEN ${tableAlias}.src = 'carm' THEN 6
      WHEN ${tableAlias}.src = 'gotquestions' THEN 7
      WHEN ${tableAlias}.src = 'answersingenesis' THEN 8
      ELSE 9
    END as sort_order
  `;
}

// --- Counts Fetching ---
/**
 * @param {string} verseId reader verse id (LXX numbering for the OT)
 * @param {string|string[]} mtIds MT id(s) whose 'MT' manuscript rows belong on this page (OT)
 * @param {string|string[]} checkIds evidence id(s) for contradictions/apologetics/videos
 */
export function getEvidenceCounts(verseId, mtIds, checkIds, isNT) {
  const mt = idsIn('verse_id', mtIds, 'mt');
  const msCount = isNT
    ? query("SELECT COUNT(DISTINCT image_name) as count FROM manuscript_per_verse WHERE verse_id = :verseId", { verseId })[0].count
    : query(`SELECT COUNT(DISTINCT image_name) as count FROM manuscript_per_verse_ot WHERE (verse_id = :lxxId AND v11n_type = 'LXX') OR (${mt.sql} AND v11n_type = 'MT')`, { lxxId: verseId, ...mt.params })[0].count;

  const c1 = idsIn('verse1', checkIds, 'a'), c2 = idsIn('verse2', checkIds, 'a');
  const ctCount = query(`SELECT COUNT(DISTINCT title) as count FROM contradictions WHERE ${c1.sql} OR ${c2.sql}`, c1.params)[0].count;
  const ap = idsIn('verse', checkIds, 'a');
  const apCount = query(`SELECT COUNT(DISTINCT title) as count FROM apologetics WHERE ${ap.sql}`, ap.params)[0].count;
  const vd = idsIn('verse_id', checkIds, 'a');
  const vdCount = query(`SELECT COUNT(DISTINCT video_id) as count FROM short_per_verse WHERE ${vd.sql}`, vd.params)[0].count;

  return { msCount, ctCount, apCount, vdCount };
}

export function getFormattedManuscriptsByVerseId(verseId, mtIds, isNT) {
  const mt = idsIn('m.verse_id', mtIds, 'mt');
  const rawManuscripts = isNT ? query(`
    SELECT m.image_name, mm.*
    FROM manuscript_per_verse m
    LEFT JOIN manuscripts_meta mm ON m.ms_id = mm.ms_id
    WHERE m.verse_id = :verseId
    ORDER BY mm.earliest_date ASC
  `, { verseId }) : query(`
    SELECT m.image_name, mm.*
    FROM manuscript_per_verse_ot m
    LEFT JOIN manuscripts_meta_ot mm ON m.ms_id = mm.ms_id
    WHERE (m.verse_id = :lxxId AND m.v11n_type = 'LXX')
       OR (${mt.sql} AND m.v11n_type = 'MT')
    ORDER BY mm.earliest_date ASC
  `, { lxxId: verseId, ...mt.params });

  // Automatic Page/Scan Indexing (Prevents duplicates confusion for P66, etc.)
  const msCounts = {};
  rawManuscripts.forEach(ms => {
    if (ms.ms_id) {
      msCounts[ms.ms_id] = (msCounts[ms.ms_id] || 0) + 1;
    }
  });

  const msTracker = {};
  return rawManuscripts.map(ms => {
    const total = msCounts[ms.ms_id] || 0;
    let displayName = ms.name || ms.ms_id;

    if (total > 1) {
      msTracker[ms.ms_id] = (msTracker[ms.ms_id] || 0) + 1;
      displayName = `${ms.name || ms.ms_id} (Scan ${msTracker[ms.ms_id]})`;
    }

    return {
      ...ms,
      name: displayName
    };
  });
}

export function getContradictionsByVerseId(checkIds) {
  const c1 = idsIn('c.verse1', checkIds, 'a'), c2 = idsIn('c.verse2', checkIds, 'a');
  const sql = `
    SELECT c.*, m.name as meta_name, m.url as meta_url, m.copyright as meta_copyright,
           pw.name as work_name, pw.url as work_url,
           pf.id as father_id, pf.name as father_name, pf.year as father_year, pf.icon as father_icon,
           ${buildSortBySource('c')}
    FROM contradictions c
    LEFT JOIN apologetics_meta m ON c.src = m.id
    LEFT JOIN patristics_works pw ON c.src = pw.id
    LEFT JOIN patristics_fathers pf ON pw.father_id = pf.id
    WHERE ${c1.sql} OR ${c2.sql}
    GROUP BY c.title
    ORDER BY sort_order ASC, pf.year ASC
  `;
  return query(sql, c1.params);
}

export function getApologeticsByVerseId(checkIds) {
  const ap = idsIn('a.verse', checkIds, 'a');
  const sql = `
    SELECT a.*, m.name as meta_name, m.url as meta_url, m.copyright as meta_copyright,
           pw.name as work_name, pw.url as work_url,
           pf.id as father_id, pf.name as father_name, pf.year as father_year, pf.icon as father_icon,
           ${buildSortBySource('a')}
    FROM apologetics a
    LEFT JOIN apologetics_meta m ON a.src = m.id
    LEFT JOIN patristics_works pw ON a.src = pw.id
    LEFT JOIN patristics_fathers pf ON pw.father_id = pf.id
    WHERE ${ap.sql}
    GROUP BY a.title
    ORDER BY sort_order ASC, pf.year ASC
  `;
  return query(sql, ap.params);
}

export function getRawVideosByVerseId(checkIds) {
  const vd = idsIn('spv.verse_id', checkIds, 'a');
  return query(`
    SELECT sm.*, spv.verse_id as target_verse_id, spv.ref_order, spv.total_passages,
           spv.is_primary, spv.relevance_score, spv.composite_score
    FROM short_per_verse spv
    JOIN shorts_metadata sm ON spv.video_id = sm.video_id
    WHERE ${vd.sql}
    ORDER BY spv.composite_score DESC, sm.rigor_score DESC
  `, vd.params);
}
