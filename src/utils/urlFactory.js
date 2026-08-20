/**
 * Centralized L6 Canonical URL Factory for Ready Apologia.
 * Provides a single source of truth (SSOT) for all internal scripture routes,
 * evidence drawer tabs, and external scholarly citations.
 */

/**
 * Normalizes and extracts the application base path safely across
 * both build-time Astro SSG and client-side React islands.
 * @returns {string} Clean base path with no trailing slash (e.g. "" or "/ready_apologia")
 */
export function getBaseUrl() {
  const rawBase = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL
    ? import.meta.env.BASE_URL
    : '';
  return rawBase === '/' ? '' : rawBase.replace(/\/$/, '');
}

/**
 * Valid Bible evidence tab identifiers
 * @typedef {'manuscripts' | 'contradictions' | 'apologetics' | 'videos'} BibleTab
 */

/**
 * Builds a canonical Bible URL.
 * Invariant Rules:
 * - If tab is provided with verse: /bible/<book>/<chapter>/<verse>/<tab>
 * - If verse is provided without tab: /bible/<book>/<chapter>#<verse> (in-context reader)
 * - If chapter is provided: /bible/<book>/<chapter>
 * - Default: /bible/<book>/1
 *
 * @param {Object} options
 * @param {string} options.book - Book code (e.g. "jn", "mt", "ps")
 * @param {number|string} [options.chapter=1] - Chapter number
 * @param {number|string} [options.verse] - Verse number or range string (e.g. "1", "17-18")
 * @param {BibleTab} [options.tab] - Evidence drawer tab name
 * @param {string} [options.base] - Optional base path override
 * @returns {string} Canonical URL path
 */
export function getBibleUrl({ book, chapter = 1, verse, tab, base } = {}) {
  if (!book) return `${base !== undefined ? base : getBaseUrl()}/bible`;

  const basePath = base !== undefined ? base : getBaseUrl();
  const cleanBook = String(book).toLowerCase().trim();
  const cleanChapter = String(chapter).trim();

  // Extract first verse if given a range (e.g. "17-18" -> "17")
  let cleanVerse = '';
  if (verse !== undefined && verse !== null && String(verse).trim() !== '') {
    const match = String(verse).trim().match(/^\d+/);
    cleanVerse = match ? match[0] : String(verse).trim();
  }

  if (cleanVerse && tab) {
    return `${basePath}/bible/${cleanBook}/${cleanChapter}/${cleanVerse}/${tab}`;
  }

  if (cleanVerse) {
    return `${basePath}/bible/${cleanBook}/${cleanChapter}#${cleanVerse}`;
  }

  return `${basePath}/bible/${cleanBook}/${cleanChapter}`;
}

/**
 * Valid Quran evidence tab identifiers
 * @typedef {'manuscripts' | 'christian-footnotes' | 'contradictions' | 'scientific-errors' | 'debunking-miracles' | 'videos' | string} QuranTab
 */

/**
 * Builds a canonical Quran URL.
 * Invariant Rules:
 * - If tab is provided with ayah: /quran/<surah>/<ayah>/<tab>
 * - If ayah is provided without tab: /quran/<surah>#<ayah> (in-context reader)
 * - If surah is provided: /quran/<surah>
 * - Default: /quran
 *
 * @param {Object} options
 * @param {number|string} options.surah - Surah number (1-114)
 * @param {number|string} [options.ayah] - Ayah number or range string (e.g. "47", "157-158")
 * @param {QuranTab} [options.tab] - Evidence drawer tab name (e.g. "tafsir/tabari", "christian-footnotes")
 * @param {string} [options.base] - Optional base path override
 * @returns {string} Canonical URL path
 */
export function getQuranUrl({ surah, ayah, tab, base } = {}) {
  if (surah === undefined || surah === null || String(surah).trim() === '') {
    return `${base !== undefined ? base : getBaseUrl()}/quran`;
  }

  const basePath = base !== undefined ? base : getBaseUrl();
  const cleanSurah = String(surah).trim();

  // Extract first ayah if given a range (e.g. "157-158" -> "157")
  let cleanAyah = '';
  if (ayah !== undefined && ayah !== null && String(ayah).trim() !== '') {
    const match = String(ayah).trim().match(/^\d+/);
    cleanAyah = match ? match[0] : String(ayah).trim();
  }

  if (cleanAyah && tab) {
    return `${basePath}/quran/${cleanSurah}/${cleanAyah}/${tab}`;
  }

  if (cleanAyah) {
    return `${basePath}/quran/${cleanSurah}#${cleanAyah}`;
  }

  return `${basePath}/quran/${cleanSurah}`;
}

/**
 * Builds a canonical Hadith URL linking to sunnah.com.
 * @param {string} collection - Collection slug (e.g. "bukhari", "muslim", "abudawud", "nasai")
 * @param {string|number} referenceNumber - Hadith reference number (e.g. "5038", "788a", "4449")
 * @returns {string} External canonical URL
 */
export function getHadithUrl(collection, referenceNumber) {
  const cleanCol = String(collection).toLowerCase().trim();
  const cleanRef = String(referenceNumber).trim();
  return `https://sunnah.com/${cleanCol}:${cleanRef}`;
}
