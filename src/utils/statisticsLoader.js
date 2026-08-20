/**
 * @typedef {Object} ScriptureRef
 * @property {string} [bookId]
 * @property {number} [chapter]
 * @property {number} [verse]
 * @property {number} [surah]
 * @property {number} [ayah]
 * @property {string} label
 * @property {string} url
 */

/**
 * @typedef {Object} LeaderboardItem
 * @property {number} rank
 * @property {string} verseId
 * @property {string} title
 * @property {string} metricValue
 * @property {string} url
 * @property {string|null} text
 * @property {string} badgeType
 * @property {string} [sectionTitle]
 * @property {string} [preview]
 * @property {string[]} [labels]
 */

/**
 * @typedef {Object} OldestManuscriptItem
 * @property {number} rank
 * @property {string} msId
 * @property {string} name
 * @property {string} date
 * @property {string} testament
 * @property {string} firstVerseTitle
 * @property {string} url
 * @property {string|null} text
 * @property {string} metricValue
 */

/**
 * @typedef {Object} QuranManuscriptErrorItem
 * @property {number} rank
 * @property {string} msId
 * @property {string} name
 * @property {string} date
 * @property {string} metricValue
 * @property {string} summary
 * @property {string} firstVerseTitle
 * @property {string} url
 * @property {string|null} text
 */

/**
 * @typedef {Object} BibleStatisticsResult
 * @property {LeaderboardItem[]} topVideos
 * @property {LeaderboardItem[]} topDefended
 * @property {LeaderboardItem[]} topPatristics
 * @property {LeaderboardItem[]} topContradictions
 * @property {LeaderboardItem[]} topManuscriptVerses
 * @property {OldestManuscriptItem[]} oldestManuscripts
 */

/**
 * @typedef {Object} QuranStatisticsResult
 * @property {LeaderboardItem[]} topVideos
 * @property {LeaderboardItem[]} topTabari
 * @property {LeaderboardItem[]} topKathir
 * @property {LeaderboardItem[]} topFootnotes
 * @property {LeaderboardItem[]} topLabels
 * @property {LeaderboardItem[]} topManuscriptVerses
 * @property {QuranManuscriptErrorItem[]} topMistakeManuscripts
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { getBibleUrl, getQuranUrl } from './urlFactory.js';

const dbPath = path.join(process.cwd(), 'data.db');
let db = null;
try {
  db = new DatabaseSync(dbPath);
} catch (e) {
  console.warn("⚠️ [statisticsLoader] Database not initialized.", e);
}

// 1. Book metadata lookup
const booksMetaPath = path.join(process.cwd(), 'src/data/books_meta.json');
let booksMeta = { ot: [], nt: [] };
try {
  booksMeta = JSON.parse(fs.readFileSync(booksMetaPath, 'utf8'));
} catch (e) {
  console.error("Failed to load books_meta.json", e);
}
const allBooks = [...(booksMeta.ot || []), ...(booksMeta.nt || [])];
const bookNameMap = Object.fromEntries(allBooks.map(b => [b.id, b.name]));

// Quran Surah names lookup
const surahMetaPath = path.join(process.cwd(), 'src/data/quran/arabic/meta.json');
let surahNames = {};
try {
  const meta = JSON.parse(fs.readFileSync(surahMetaPath, 'utf8'));
  const surahs = meta.surahs || meta;
  if (Array.isArray(surahs)) {
    surahs.forEach(s => {
      surahNames[s.index || s.number] = s.transliteration || s.name_en || s.name || `Surah ${s.index || s.number}`;
    });
  }
} catch (e) {
  // fallback silently
}

// 2. In-memory file cache for scripture books to eliminate redundant disk I/O
const scriptureBookCache = new Map();

/**
 * Retrieves the scripture verse text for a given Bible verse from disk cache.
 * @param {string} bookId
 * @param {number} chapter
 * @param {number} verse
 * @returns {string|null}
 */
export function getBibleVerseText(bookId, chapter, verse) {
  try {
    if (!scriptureBookCache.has(bookId)) {
      const isNT = booksMeta.nt && booksMeta.nt.some(b => b.id === bookId);
      const folder = isNT ? 'nasb' : 'lxx2012';
      const filePath = path.join(process.cwd(), 'src/data/scripture', folder, `${bookId}.json`);
      if (!fs.existsSync(filePath)) {
        scriptureBookCache.set(bookId, null);
        return null;
      }
      scriptureBookCache.set(bookId, JSON.parse(fs.readFileSync(filePath, 'utf8')));
    }

    const bookData = scriptureBookCache.get(bookId);
    if (!bookData) return null;

    const chapVerses = bookData[String(chapter)];
    if (!chapVerses) return null;
    const verseObj = chapVerses[verse - 1];
    if (!verseObj) return null;
    return typeof verseObj === 'string' ? verseObj : Object.values(verseObj)[0];
  } catch (e) {
    return null;
  }
}

let drogeCache = null;

/**
 * Retrieves the English translation for a Quran ayah from Droge translation cache.
 * @param {number} surah
 * @param {number} ayah
 * @returns {string|null}
 */
export function getQuranVerseText(surah, ayah) {
  try {
    if (!drogeCache) {
      const filePath = path.join(process.cwd(), 'src/data/quran/english/droge_translation.json');
      if (fs.existsSync(filePath)) {
        drogeCache = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } else {
        drogeCache = {};
      }
    }
    const key = `${surah}:${ayah}`;
    return drogeCache[key]?.text || null;
  } catch (e) {
    return null;
  }
}

/**
 * Formats a raw database Bible verse ID into a structured object with UI label and URL.
 * @param {string} verseId e.g. "jn_1_1"
 * @returns {ScriptureRef}
 */
export function formatBibleRef(verseId) {
  const parts = verseId.split('_');
  if (parts.length === 3) {
    const bookName = bookNameMap[parts[0]] || parts[0];
    return {
      bookId: parts[0],
      chapter: parseInt(parts[1], 10),
      verse: parseInt(parts[2], 10),
      label: `${bookName} ${parts[1]}:${parts[2]}`,
      url: getBibleUrl({ book: parts[0], chapter: parts[1], verse: parts[2] })
    };
  }
  return {
    bookId: verseId,
    chapter: 1,
    verse: 1,
    label: verseId,
    url: getBibleUrl({ book: verseId, chapter: 1 })
  };
}

/**
 * Formats a raw Quran verse ID into a structured object with UI label and URL.
 * @param {string} verseId e.g. "4_157" or "4:157"
 * @returns {ScriptureRef}
 */
export function formatQuranRef(verseId) {
  const normalized = verseId.replace(':', '_');
  const parts = normalized.split('_');
  const surahNum = parseInt(parts[0], 10);
  const ayahNum = parseInt(parts[1], 10);
  const surahName = surahNames[surahNum] ? ` (${surahNames[surahNum]})` : '';
  return {
    surah: surahNum,
    ayah: ayahNum,
    label: `Surah ${surahNum}:${ayahNum}${surahName}`,
    url: getQuranUrl({ surah: surahNum, ayah: ayahNum })
  };
}

/**
 * Loads all Bible statistics and rankings at build time.
 * @returns {BibleStatisticsResult|null}
 */
export function loadBibleStatistics() {
  if (!db) return null;

  // 1. Top 10 Most Discussed Verses in Videos (Excluding generic 'gospels' overview)
  const topVideosRaw = db.prepare(`
    SELECT verse_id, count(*) as count 
    FROM short_per_verse 
    WHERE verse_id NOT GLOB '[0-9]*_[0-9]*' AND verse_id != 'gospels'
    GROUP BY verse_id 
    ORDER BY count DESC 
    LIMIT 10
  `).all();

  const topVideos = topVideosRaw.map((row, idx) => {
    const ref = formatBibleRef(row.verse_id);
    const text = getBibleVerseText(ref.bookId, ref.chapter, ref.verse);
    return {
      rank: idx + 1,
      verseId: row.verse_id,
      title: ref.label,
      metricValue: `${row.count} Videos`,
      url: getBibleUrl({ book: ref.bookId, chapter: ref.chapter, verse: ref.verse, tab: 'videos' }),
      text: text,
      badgeType: 'video'
    };
  });

  // 2. Top 10 Most Defended Verses (General Apologetics)
  const topDefendedRaw = db.prepare(`
    SELECT verse, count(*) as count 
    FROM apologetics 
    GROUP BY verse 
    ORDER BY count DESC 
    LIMIT 10
  `).all();

  const topDefended = topDefendedRaw.map((row, idx) => {
    const ref = formatBibleRef(row.verse);
    const text = getBibleVerseText(ref.bookId, ref.chapter, ref.verse);
    return {
      rank: idx + 1,
      verseId: row.verse,
      title: ref.label,
      metricValue: `${row.count} Defenses`,
      url: getBibleUrl({ book: ref.bookId, chapter: ref.chapter, verse: ref.verse, tab: 'apologetics' }),
      text: text,
      badgeType: 'apologetics'
    };
  });

  // 3. Top 10 Verses with Patristics Apologetics (Early Church Fathers)
  const topPatristicsRaw = db.prepare(`
    SELECT verse, count(*) as count 
    FROM apologetics 
    WHERE src IN (SELECT id FROM patristics_works) OR src LIKE 'na_%'
    GROUP BY verse 
    ORDER BY count DESC 
    LIMIT 10
  `).all();

  const topPatristics = topPatristicsRaw.map((row, idx) => {
    const ref = formatBibleRef(row.verse);
    const text = getBibleVerseText(ref.bookId, ref.chapter, ref.verse);
    return {
      rank: idx + 1,
      verseId: row.verse,
      title: ref.label,
      metricValue: `${row.count} Patristic Works`,
      url: getBibleUrl({ book: ref.bookId, chapter: ref.chapter, verse: ref.verse, tab: 'apologetics' }),
      text: text,
      badgeType: 'patristics'
    };
  });

  // 4. Top 10 Most Alleged Contradictions (Pairings unified across both columns)
  const topContradictionsRaw = db.prepare(`
    SELECT verse, count(*) as count 
    FROM (
      SELECT verse1 as verse FROM contradictions 
      UNION ALL 
      SELECT verse2 as verse FROM contradictions
    ) 
    GROUP BY verse 
    ORDER BY count DESC 
    LIMIT 10
  `).all();

  const topContradictions = topContradictionsRaw.map((row, idx) => {
    const ref = formatBibleRef(row.verse);
    const text = getBibleVerseText(ref.bookId, ref.chapter, ref.verse);
    return {
      rank: idx + 1,
      verseId: row.verse,
      title: ref.label,
      metricValue: `${row.count} Contradiction Pairings`,
      url: getBibleUrl({ book: ref.bookId, chapter: ref.chapter, verse: ref.verse, tab: 'contradictions' }),
      text: text,
      badgeType: 'contradictions'
    };
  });

  // 5. Top 10 Individual Verses by Ancient Manuscripts
  const topNTMssRaw = db.prepare(`
    SELECT verse_id, count(DISTINCT ms_id) as count 
    FROM manuscript_per_verse 
    GROUP BY verse_id 
    ORDER BY count DESC 
    LIMIT 10
  `).all();

  const topManuscriptVerses = topNTMssRaw.map((row, idx) => {
    const ref = formatBibleRef(row.verse_id);
    const text = getBibleVerseText(ref.bookId, ref.chapter, ref.verse);
    return {
      rank: idx + 1,
      verseId: row.verse_id,
      title: ref.label,
      metricValue: `${row.count} Ancient Manuscripts`,
      url: getBibleUrl({ book: ref.bookId, chapter: ref.chapter, verse: ref.verse, tab: 'manuscripts' }),
      text: text,
      badgeType: 'manuscript'
    };
  });

  // 6. Oldest Ancient Biblical Manuscripts (linking to first attested verse)
  const oldestOT = db.prepare(`
    SELECT ms_id, name, earliest_date, latest_date, date_range_english, language 
    FROM manuscripts_meta_ot 
    WHERE earliest_date IS NOT NULL 
    ORDER BY earliest_date ASC 
    LIMIT 6
  `).all();

  const oldestNT = db.prepare(`
    SELECT ms_id, name, earliest_date, latest_date, date_range_english, current_location 
    FROM manuscripts_meta 
    ORDER BY earliest_date ASC 
    LIMIT 6
  `).all();

  const oldestManuscripts = [];
  let mRank = 1;

  for (const ms of oldestOT) {
    const firstV = db.prepare('SELECT verse_id FROM manuscript_per_verse_ot WHERE ms_id = ? ORDER BY verse_id ASC LIMIT 1').get(ms.ms_id);
    if (firstV && firstV.verse_id) {
      const ref = formatBibleRef(firstV.verse_id);
      const text = getBibleVerseText(ref.bookId, ref.chapter, ref.verse);
      oldestManuscripts.push({
        rank: mRank++,
        msId: ms.ms_id,
        name: ms.name,
        date: ms.date_range_english,
        testament: 'Old Testament',
        firstVerseTitle: ref.label,
        url: getBibleUrl({ book: ref.bookId, chapter: ref.chapter, verse: ref.verse, tab: 'manuscripts' }),
        text: text,
        metricValue: ms.date_range_english
      });
    }
  }

  for (const ms of oldestNT) {
    const firstV = db.prepare('SELECT verse_id FROM manuscript_per_verse WHERE ms_id = ? ORDER BY verse_id ASC LIMIT 1').get(ms.ms_id);
    if (firstV && firstV.verse_id) {
      const ref = formatBibleRef(firstV.verse_id);
      const text = getBibleVerseText(ref.bookId, ref.chapter, ref.verse);
      oldestManuscripts.push({
        rank: mRank++,
        msId: ms.ms_id,
        name: ms.name,
        date: ms.date_range_english,
        testament: 'New Testament',
        firstVerseTitle: ref.label,
        url: getBibleUrl({ book: ref.bookId, chapter: ref.chapter, verse: ref.verse, tab: 'manuscripts' }),
        text: text,
        metricValue: ms.date_range_english
      });
    }
  }

  return {
    topVideos,
    topDefended,
    topPatristics,
    topContradictions,
    topManuscriptVerses,
    oldestManuscripts: oldestManuscripts.slice(0, 10)
  };
}

// Pre-compiled regex pattern for detecting manuscript error and variant keywords
const ERROR_PATTERN = /\b(?:rasm variant|scribal error|error|variant|typo|omitted|omission|deviation|confusion|substituted|spelled instead|instead of|erasure|correction|lacks|altered|inserted)\b/gi;

/**
 * Loads all Quran statistics and rankings at build time.
 * @returns {QuranStatisticsResult|null}
 */
export function loadQuranStatistics() {
  if (!db) return null;

  // 1. Top 10 Most Examined Quran Verses in Videos
  const topVideosRaw = db.prepare(`
    SELECT verse_id, count(*) as count 
    FROM short_per_verse 
    WHERE verse_id GLOB '[0-9]*_[0-9]*'
    GROUP BY verse_id 
    ORDER BY count DESC 
    LIMIT 10
  `).all();

  const topVideos = topVideosRaw.map((row, idx) => {
    const ref = formatQuranRef(row.verse_id);
    const text = getQuranVerseText(ref.surah, ref.ayah);
    return {
      rank: idx + 1,
      verseId: row.verse_id,
      title: ref.label,
      metricValue: `${row.count} Videos`,
      url: getQuranUrl({ surah: ref.surah, ayah: ref.ayah, tab: 'videos' }),
      text: text,
      badgeType: 'video'
    };
  });

  // 2. Top 10 Longest Commentaries by Tafsir al-Tabari
  let topTabari = [];
  try {
    const tabariPath = path.join(process.cwd(), 'src/data/quran/commentary/tafsir_tabari_english.json');
    if (fs.existsSync(tabariPath)) {
      const tabari = JSON.parse(fs.readFileSync(tabariPath, 'utf8'));
      const tabariList = [];
      for (const [verse, item] of Object.entries(tabari)) {
        const comm = item.commentary || '';
        const words = comm.split(/\s+/).filter(Boolean).length;
        tabariList.push({ verse, words, title: item.title, comm });
      }
      tabariList.sort((a, b) => b.words - a.words);
      topTabari = tabariList.slice(0, 10).map((item, idx) => {
        const ref = formatQuranRef(item.verse);
        const text = getQuranVerseText(ref.surah, ref.ayah);
        return {
          rank: idx + 1,
          verseId: item.verse,
          title: ref.label,
          metricValue: `${item.words.toLocaleString()} Words`,
          url: getQuranUrl({ surah: ref.surah, ayah: ref.ayah, tab: 'tafsir/tabari' }),
          text: text,
          sectionTitle: item.title,
          badgeType: 'tabari'
        };
      });
    }
  } catch (e) {
    console.error("Failed to load Tafsir al-Tabari", e);
  }

  // 3. Top 10 Longest Commentaries by Tafsir Ibn Kathir
  let topKathir = [];
  try {
    const kathirPath = path.join(process.cwd(), 'src/data/quran/commentary/tafsir_ibn_kathir_catena.json');
    if (fs.existsSync(kathirPath)) {
      const kathir = JSON.parse(fs.readFileSync(kathirPath, 'utf8'));
      const kathirList = [];
      for (const [verse, item] of Object.entries(kathir)) {
        const comm = item.commentary || '';
        const words = comm.split(/\s+/).filter(Boolean).length;
        kathirList.push({ verse, words, title: item.title, comm });
      }
      kathirList.sort((a, b) => b.words - a.words);
      topKathir = kathirList.slice(0, 10).map((item, idx) => {
        const ref = formatQuranRef(item.verse);
        const text = getQuranVerseText(ref.surah, ref.ayah);
        return {
          rank: idx + 1,
          verseId: item.verse,
          title: ref.label,
          metricValue: `${item.words.toLocaleString()} Words`,
          url: getQuranUrl({ surah: ref.surah, ayah: ref.ayah, tab: 'tafsir/ibn_kathir' }),
          text: text,
          sectionTitle: item.title,
          badgeType: 'kathir'
        };
      });
    }
  } catch (e) {
    console.error("Failed to load Tafsir Ibn Kathir", e);
  }

  // 4. Top 10 Longest Christian Footnotes / Annotations
  let topFootnotes = [];
  try {
    const nickelPath = path.join(process.cwd(), 'src/data/quran/commentary/nickel_annotations.json');
    if (fs.existsSync(nickelPath)) {
      const nickel = JSON.parse(fs.readFileSync(nickelPath, 'utf8'));
      const footnoteByVerse = {};
      for (const item of nickel) {
        const vid = item.hafs_verse_id;
        // Skip sūra header level zero verses (e.g. 16:0) and normalize to valid verse 1
        const normalizedVid = vid.endsWith(':0') ? vid.replace(':0', ':1') : vid;
        const content = item.content || '';
        if (!footnoteByVerse[normalizedVid]) {
          footnoteByVerse[normalizedVid] = { count: 0, totalLength: 0, contents: [] };
        }
        footnoteByVerse[normalizedVid].count++;
        footnoteByVerse[normalizedVid].totalLength += content.length;
        footnoteByVerse[normalizedVid].contents.push(content);
      }
      const sortedFootnotes = Object.entries(footnoteByVerse)
        .map(([verse, data]) => ({ verse, ...data }))
        .sort((a, b) => b.totalLength - a.totalLength);

      topFootnotes = sortedFootnotes.slice(0, 10).map((item, idx) => {
        const ref = formatQuranRef(item.verse);
        const text = getQuranVerseText(ref.surah, ref.ayah);
        return {
          rank: idx + 1,
          verseId: item.verse,
          title: ref.label,
          metricValue: `${item.totalLength.toLocaleString()} Chars (${item.count} Notes)`,
          url: getQuranUrl({ surah: ref.surah, ayah: ref.ayah, tab: 'christian-footnotes' }),
          text: text,
          preview: item.contents[0],
          badgeType: 'footnote'
        };
      });
    }
  } catch (e) {
    console.error("Failed to load Christian footnotes", e);
  }

  // 5. Top Quran Verses with Most Critical Deficiency Labels
  let topLabels = [];
  try {
    const labelsPath = path.join(process.cwd(), 'src/data/quran/verse_labels.json');
    if (fs.existsSync(labelsPath)) {
      const labelsData = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
      const labeledList = Object.entries(labelsData).map(([verse, labelObj]) => {
        const categories = Object.keys(labelObj);
        return {
          verse,
          labelCount: categories.length,
          labels: categories,
          details: labelObj
        };
      });
      labeledList.sort((a, b) => b.labelCount - a.labelCount);
      topLabels = labeledList.slice(0, 10).map((item, idx) => {
        const ref = formatQuranRef(item.verse);
        const text = getQuranVerseText(ref.surah, ref.ayah);
        return {
          rank: idx + 1,
          verseId: item.verse,
          title: ref.label,
          metricValue: `${item.labelCount} Deficiency Categories`,
          url: getQuranUrl({ surah: ref.surah, ayah: ref.ayah, tab: 'christian-footnotes' }),
          text: text,
          labels: item.labels,
          badgeType: 'critical'
        };
      });
    }
  } catch (e) {
    console.error("Failed to load verse labels", e);
  }

  // 6. Top 10 Quran Verses with Highest Manuscript Density
  const topQuranMssRaw = db.prepare(`
    SELECT verse_id, count(DISTINCT ms_id) as count 
    FROM manuscript_per_verse_quran 
    GROUP BY verse_id 
    ORDER BY count DESC 
    LIMIT 10
  `).all();

  const topManuscriptVerses = topQuranMssRaw.map((row, idx) => {
    const ref = formatQuranRef(row.verse_id);
    const text = getQuranVerseText(ref.surah, ref.ayah);
    return {
      rank: idx + 1,
      verseId: row.verse_id,
      title: ref.label,
      metricValue: `${row.count} Manuscripts`,
      url: getQuranUrl({ surah: ref.surah, ayah: ref.ayah, tab: 'manuscripts' }),
      text: text,
      badgeType: 'manuscript'
    };
  });

  // 7. Quran Manuscripts with Most Mistakes & Textual Alterations
  const mssRows = db.prepare(`
    SELECT ms_id, name, date_range_english, current_location, variants_and_typos, interesting_info 
    FROM manuscripts_meta_quran 
    WHERE variants_and_typos IS NOT NULL AND length(variants_and_typos) > 0
  `).all();

  const analyzedMss = mssRows.map(r => {
    const text = `${r.variants_and_typos} ${r.interesting_info || ''}`;
    const matches = text.match(ERROR_PATTERN);
    const score = matches ? matches.length : 0;
    const firstV = db.prepare('SELECT verse_id FROM manuscript_per_verse_quran WHERE ms_id = ? ORDER BY verse_id ASC LIMIT 1').get(r.ms_id);
    return {
      ms_id: r.ms_id,
      name: r.name,
      date: r.date_range_english,
      score,
      len: r.variants_and_typos.length,
      firstVerse: firstV?.verse_id,
      typosSummary: r.variants_and_typos
    };
  });

  analyzedMss.sort((a, b) => b.score - a.score || b.len - a.len);

  const topMistakeManuscripts = analyzedMss.slice(0, 8).map((ms, idx) => {
    const firstRef = ms.firstVerse ? formatQuranRef(ms.firstVerse) : null;
    const text = firstRef ? getQuranVerseText(firstRef.surah, firstRef.ayah) : null;
    return {
      rank: idx + 1,
      msId: ms.ms_id,
      name: ms.name,
      date: ms.date,
      metricValue: `${ms.score} Variant Indicators`,
      summary: ms.typosSummary,
      firstVerseTitle: firstRef ? firstRef.label : 'View Manuscript',
      url: firstRef ? getQuranUrl({ surah: firstRef.surah, ayah: firstRef.ayah, tab: 'manuscripts' }) : getQuranUrl(),
      text: text
    };
  });

  return {
    topVideos,
    topTabari,
    topKathir,
    topFootnotes,
    topLabels,
    topManuscriptVerses,
    topMistakeManuscripts
  };
}
