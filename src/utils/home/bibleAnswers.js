/**
 * Bible answers for the homepage: answered alleged contradictions and verse video answers,
 * with the video library split between Bible and Qurʾān verses.
 *
 * Verse-id conventions match `path_generator.js`: a verse gets a `/contradictions` tab when it
 * appears as `verse1` or `verse2` in `contradictions`, and a `/videos` tab when it has a row in
 * `short_per_verse`. The Bible/Qurʾān split uses the shared predicates in `verseIdSql.js`.
 */
import { query } from '../../db.js';
import { quranVerseIdSql, bibleVerseIdSql } from '../verseIdSql.js';

/** Every numeric Bible-answers property required on `HomeStats`. */
export const BIBLE_ANSWERS_KEYS = Object.freeze([
  'bibleAnswersCount',
  'bibleAnswersVersesCount',
  'bibleVideosCount',
  'bibleVideoVersesCount',
  'quranVideosCount',
]);

const scalar = (sql, params = {}) => Number(query(sql, params)[0]?.c);

/** @returns {Record<string, number>} */
export function computeBibleAnswersCounts() {
  return {
    bibleAnswersCount: scalar('SELECT COUNT(*) AS c FROM contradictions'),
    bibleAnswersVersesCount: scalar(
      "SELECT COUNT(*) AS c FROM (SELECT verse1 AS v FROM contradictions UNION SELECT verse2 FROM contradictions) WHERE v IS NOT NULL AND v != ''"
    ),
    bibleVideosCount: scalar(
      `SELECT COUNT(DISTINCT video_id) AS c FROM short_per_verse WHERE ${bibleVerseIdSql()}`
    ),
    bibleVideoVersesCount: scalar(
      `SELECT COUNT(DISTINCT verse_id) AS c FROM short_per_verse WHERE ${bibleVerseIdSql()} AND verse_id != 'gospels'`
    ),
    quranVideosCount: scalar(
      `SELECT COUNT(DISTINCT video_id) AS c FROM short_per_verse WHERE ${quranVerseIdSql()}`
    ),
  };
}

const TAB_CHECKS = {
  contradictions: 'SELECT COUNT(*) AS c FROM contradictions WHERE verse1 = :id OR verse2 = :id',
  videos: 'SELECT COUNT(*) AS c FROM short_per_verse WHERE verse_id = :id',
};

/**
 * Fails the build when a hand-picked homepage link points at a verse tab that would not be
 * generated (the verse lost its data), instead of shipping a dead chip.
 *
 * @param {{ contradictions?: string[], videos?: string[] }} tabs verse ids per tab, e.g. `mt_27_5`
 */
export function requireVerseTabs({ contradictions = [], videos = [] }) {
  const missing = [
    ...contradictions.filter((id) => !(scalar(TAB_CHECKS.contradictions, { id }) > 0)).map((id) => `${id}/contradictions`),
    ...videos.filter((id) => !(scalar(TAB_CHECKS.videos, { id }) > 0)).map((id) => `${id}/videos`),
  ];
  if (missing.length > 0) {
    throw new Error(`[homeStats] Homepage links point at verse tabs with no data: ${missing.join(', ')}`);
  }
}
