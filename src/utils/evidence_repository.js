import { query } from "../db.js";

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
export function getEvidenceCounts(verseId, mtId, checkId, isNT) {
  const msCount = isNT
    ? query("SELECT COUNT(DISTINCT image_name) as count FROM manuscript_per_verse WHERE verse_id = :verseId", { verseId })[0].count
    : query("SELECT COUNT(DISTINCT image_name) as count FROM manuscript_per_verse_ot WHERE (verse_id = :lxxId AND v11n_type = 'LXX') OR (verse_id = :mtId AND v11n_type = 'MT')", { lxxId: verseId, mtId })[0].count;

  const ctCount = query("SELECT COUNT(DISTINCT title) as count FROM contradictions WHERE verse1 = :checkId OR verse2 = :checkId", { checkId })[0].count;
  const apCount = query("SELECT COUNT(DISTINCT title) as count FROM apologetics WHERE verse = :checkId", { checkId })[0].count;
  const vdCount = query("SELECT COUNT(DISTINCT video_id) as count FROM short_per_verse WHERE verse_id = :checkId", { checkId })[0].count;

  return { msCount, ctCount, apCount, vdCount };
}

// --- Data Fetching ---
export function getFormattedManuscriptsByVerseId(verseId, mtId, isNT) {
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
       OR (m.verse_id = :mtId AND m.v11n_type = 'MT')
    ORDER BY mm.earliest_date ASC
  `, { lxxId: verseId, mtId });

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

export function getContradictionsByVerseId(checkId) {
  const sql = `
    SELECT c.*, m.name as meta_name, m.url as meta_url, m.copyright as meta_copyright,
           pw.name as work_name, pw.url as work_url,
           pf.id as father_id, pf.name as father_name, pf.year as father_year, pf.icon as father_icon,
           ${buildSortBySource('c')}
    FROM contradictions c
    LEFT JOIN apologetics_meta m ON c.src = m.id
    LEFT JOIN patristics_works pw ON c.src = pw.id
    LEFT JOIN patristics_fathers pf ON pw.father_id = pf.id
    WHERE c.verse1 = :checkId OR c.verse2 = :checkId
    GROUP BY c.title
    ORDER BY sort_order ASC, pf.year ASC
  `;
  return query(sql, { checkId });
}

export function getApologeticsByVerseId(checkId) {
  const sql = `
    SELECT a.*, m.name as meta_name, m.url as meta_url, m.copyright as meta_copyright,
           pw.name as work_name, pw.url as work_url,
           pf.id as father_id, pf.name as father_name, pf.year as father_year, pf.icon as father_icon,
           ${buildSortBySource('a')}
    FROM apologetics a
    LEFT JOIN apologetics_meta m ON a.src = m.id
    LEFT JOIN patristics_works pw ON a.src = pw.id
    LEFT JOIN patristics_fathers pf ON pw.father_id = pf.id
    WHERE a.verse = :checkId
    GROUP BY a.title
    ORDER BY sort_order ASC, pf.year ASC
  `;
  return query(sql, { checkId });
}

export function getRawVideosByVerseId(checkId) {
  return query(`
    SELECT sm.*
    FROM short_per_verse spv
    JOIN shorts_metadata sm ON spv.video_id = sm.video_id
    WHERE spv.verse_id = :checkId
  `, { checkId });
}
