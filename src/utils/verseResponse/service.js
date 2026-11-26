// Build-time loader for the per-verse spoken apologetic response synthesized
// from the verse's primary videos (table verse_video_responses in data.db).
import booksMeta from '../../data/books_meta.json' with { type: 'json' };
import quranMeta from '../../data/quran/arabic/meta.json';
import { query, queryRow } from '../../db.js';
import { buildRefIndex, buildVerseResponseView } from './labels.js';

const refIndex = buildRefIndex(booksMeta, quranMeta);
let tableExists = null;

function hasTable() {
  if (tableExists === null) {
    tableExists = query(
      "SELECT 1 AS ok FROM sqlite_master WHERE type = 'table' AND name = 'verse_video_responses'"
    ).length > 0;
  }
  return tableExists;
}

/**
 * @param {string} verseId DB verse id (Bible MT `jn_14_28`, Quran `4_157`).
 * @param {string} base Site base path ('' at root).
 * @returns {{ paragraphs: string[], supporting: {label:string,id:string|null,href:string|null}[] } | null}
 */
export function getVerseVideoResponse(verseId, base = '') {
  if (!verseId || !hasTable()) return null;
  const row = queryRow(
    `SELECT response, supporting_verses, status
       FROM verse_video_responses
      WHERE verse_id = :verseId AND status = 'ready'`,
    { verseId }
  );
  return buildVerseResponseView(row, { verseId, refIndex, base });
}
