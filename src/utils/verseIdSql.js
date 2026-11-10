/**
 * SQL predicates that tell Qurʾān verse ids from Bible verse ids in `data.db`.
 *
 * Qurʾān ids are `S_A` (digits only, e.g. `2_255`). Bible ids are `book_C_V`
 * (e.g. `jn_1_1`), and numbered books start with a digit (`1co_13_4`, `1chr_1_10`),
 * so a bare `GLOB '[0-9]*_[0-9]*'` wrongly treats them as Qurʾān ids: in GLOB, `*`
 * matches any characters. The extra `NOT GLOB '*[^0-9_]*'` keeps only ids made of
 * digits and underscores.
 */

/** @param {string} [col] column holding the verse id */
export const quranVerseIdSql = (col = 'verse_id') =>
  `(${col} GLOB '[0-9]*_[0-9]*' AND ${col} NOT GLOB '*[^0-9_]*')`;

/** Bible verse ids, including the `gospels` overview id. @param {string} [col] */
export const bibleVerseIdSql = (col = 'verse_id') => `(NOT ${quranVerseIdSql(col)})`;
