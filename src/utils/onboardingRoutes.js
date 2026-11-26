/**
 * Routes where the "tap any verse" Quick Guide tip applies: the Bible chapter reader
 * (/bible/<book>/<chapter>) and the Qur'an surah reader (/quran/<n>, n >= 1).
 * Verse detail tabs, /quran/0 (Lost Verses) and hubs are excluded. The optional base
 * prefix is ignored because only the tail of the path is matched.
 */
const BIBLE_CHAPTER_READER = /(?:^|\/)bible\/[^/]+\/\d+\/?$/i;
const QURAN_SURAH_READER = /(?:^|\/)quran\/[1-9]\d*\/?$/i;

export function isVerseReaderPath(pathname) {
  if (typeof pathname !== 'string') return false;
  const path = pathname.split(/[?#]/)[0];
  return BIBLE_CHAPTER_READER.test(path) || QURAN_SURAH_READER.test(path);
}
