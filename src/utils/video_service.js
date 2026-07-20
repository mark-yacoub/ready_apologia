import { getScriptureVerseTextById } from './scripture_service.js';
import { loadEnglishData } from './quran_loader.js';
import booksMeta from '../data/books_meta.json';
import { mapMtToLxx } from './scripture_mapper.js';

// Pre-build O(1) dictionary for book names to avoid O(N) lookup on every parse
const bookMetaMap = new Map();
if (booksMeta && booksMeta.nt) {
  booksMeta.nt.forEach(b => bookMetaMap.set(b.id, b.name));
}
if (booksMeta && booksMeta.ot) {
  booksMeta.ot.forEach(b => bookMetaMap.set(b.id, b.name));
}

function formatBookIdToName(id) {
  if (!id) return '';
  const bookCode = id.split('_')[0];
  return bookMetaMap.get(bookCode) || bookCode.toUpperCase();
}

// Pre-allocated object avoids recreating this dictionary in O(N) rendering loops
const CODEX_MAPPINGS = {
  ibnmasud: { name: "Abdullah bin Masud Codex", path: "/quran/codex/abdullah-bin-masud" },
  ubayy: { name: "Ubayy bin Kab Codex", path: "/quran/codex/ubayy-bin-kab" },
  aisha: { name: "Aisha Codex", path: "/quran/codex/aisha" },
  abumusa: { name: "Abu Musa al-Ashari Codex", path: "/quran/codex/abu-musa-al-ashari" },
  ibnumar: { name: "Abdullah bin Umar Codex", path: "/quran/codex/abdullah-bin-umar" },
  satanic: { name: "The Satanic Verses", path: "/quran/0" },
  sanaa: { name: "Sana'a Palimpsest", path: "/quran/0" },
  fatima: { name: "Mushaf Fatima", path: "/quran/0" },
  khalifa: { name: "Rashad Khalifa's Code", path: "/quran/0" },
  ali: { name: "Codex of Ali", path: "/quran/0" },
  "12thimam": { name: "12th Imam Codex", path: "/quran/0" },
  hafsa: { name: "Hafsa bint Umar Codex", path: "/quran/0" },
  khuzaymahibnthabit: { name: "Khuzaimah's Verse", path: "/quran/0" },
  khuzaimah: { name: "Khuzaimah's Verse", path: "/quran/0" },
  abualansari: { name: "Abu Al-Ansari's Verse", path: "/quran/0" },
  variantcodices: { name: "Variant Codices", path: "/quran/0" },
  companions: { name: "Companion Codices", path: "/quran/0" },
  muhammad: { name: "Muhammad's Forgotten Verses", path: "/quran/0" }
};

/**
 * Resolves a comma-separated string of generic verses into UI DTOs
 */
function resolveVerseString(verseStr, base, quranEnglishData) {
  const parts = verseStr.split('_');
  
  if (parts.length === 2 && parts[1] === '0') {
    // Handling for competing codices / lost verses mappings
    const codex = CODEX_MAPPINGS[parts[0]];
    if (codex) {
      return {
        label: codex.name,
        link: `${base}${codex.path}`,
        text: "Apologetics arguments referring to competing historical codices and missing verses from the Uthmanic canon."
      };
    }
  }

  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    // Quran format (e.g. 10_94)
    const surah = parts[0];
    const ayah = parts[1];
    const targetTextObj = quranEnglishData[`${surah}:${ayah}`];
    const text = targetTextObj ? targetTextObj.text : '';
    return {
      label: `Surah ${surah}:${ayah}`,
      link: `${base}/quran/${surah}#${ayah}`,
      text: text
    };
  } else if (parts.length === 3) {
    // Bible format (e.g. mk_9_31)
    let text = getScriptureVerseTextById(verseStr);
    let book = parts[0];
    let chap = parts[1];
    let verse = parts[2];
    
    // Check if OT for LXX mapping
    const isOt = booksMeta.ot.some((b) => b.id === book);
    let linkPath = `${book}/${chap}#${verse}`;
    let displayChap = chap;
    let displayVerse = verse;
    
    if (isOt) {
      const lxxMap = mapMtToLxx(book, chap, verse);
      if (lxxMap) {
        linkPath = `${lxxMap.book}/${lxxMap.chapter}#${lxxMap.verse}`;
        displayChap = lxxMap.chapter;
        displayVerse = String(lxxMap.verse);
      }
    }
    
    return {
      label: `${formatBookIdToName(verseStr)} ${displayChap}:${displayVerse}`,
      link: `${base}/bible/${linkPath}`,
      text: text
    };
  }
  return null;
}

const TIER_1 = new Set(['mikewinger', 'inspiringphilosophy', 'givemeananswer', 'crossexamined', 'capturingchristianity', 'testifyapologetics', 'redpenlogic', 'copticorthodoxanswers']);
const TIER_2 = new Set(['apologiastudios', 'livingwaters', 'cirainternational', 'vocabmalone', 'davidwood', 'towardsjesus', '@towardsjesus']);
const TIER_3 = new Set(['shamounian', 'godlogic', 'godlogic2.0', '@godlogicapologetics']);

const JESUS_TOPICS_REGEX = /\b(trinity|deity|resurrection|jewish|jehovah|son of god|hebrew israelites?|mormons?)\b/i;
const ISLAM_TOPICS_REGEX = /\b(islam|muslim|quran|muhammad|allah|hadith|sura)\b/i;

function getTopicScore(summary) {
  if (!summary) return 2;
  
  // Rule: If it has Islamic terms, it's Islam -> Priority 3 (Lowest topic priority)
  if (ISLAM_TOPICS_REGEX.test(summary)) return 3;
  
  // Rule: If it has zero Islamic terms but has Jesus generic terms -> Priority 1
  if (JESUS_TOPICS_REGEX.test(summary)) return 1;
  
  return 2; // Priority 2 (General)
}

function getTierScore(channelId, apologistName) {
  if (!channelId && !apologistName) return 4;
  
  const cId = channelId ? channelId.toLowerCase() : '';
  const aName = apologistName ? apologistName.toLowerCase() : '';
  
  // Robust case-insensitive checking
  if (TIER_1.has(cId) || TIER_1.has(aName)) return 1;
  if (TIER_2.has(cId) || TIER_2.has(aName)) return 2;
  if (TIER_3.has(cId) || TIER_3.has(aName)) return 3;
  
  return 4;
}

export function sortVideos(videos) {
  return videos.sort((a, b) => {
    // 1. Rigor Score (higher is better)
    const rigorA = a.rigor_score || 0;
    const rigorB = b.rigor_score || 0;
    if (rigorA !== rigorB) return rigorB - rigorA;
    
    // 2. Number of verses mentioned (lower is better, assuming empty is 0 but shouldn't happen based on index)
    const versesA = a.resolvedVerses ? a.resolvedVerses.length : 0;
    const versesB = b.resolvedVerses ? b.resolvedVerses.length : 0;
    if (versesA !== versesB) return versesA - versesB;
    
    // 3. Tier (lower number is better rank)
    const tierA = getTierScore(a.channel_id, a.apologist_name);
    const tierB = getTierScore(b.channel_id, b.apologist_name);
    if (tierA !== tierB) return tierA - tierB;
    
    // 4. Topic matching (Jesus=1, General=2, Islam=3)
    const topicA = getTopicScore(a.summary);
    const topicB = getTopicScore(b.summary);
    if (topicA !== topicB) return topicA - topicB;
    
    // 5. Tie breaker: Title alphabetically
    const titleA = a.title || '';
    const titleB = b.title || '';
    return titleA.localeCompare(titleB);
  });
}

/**
 * Enhances raw video database objects with resolved verses structure
 * @param {Array} videos - Array of DB records from shorts_metadata
 * @param {String} base - The base URL scope (import.meta.env.BASE_URL)
 * @returns {Array} - The enriched DTO arrays ready for the UI layer
 */
export function enrichVideosWithVerses(videos, base) {
  if (!videos || !videos.length) return [];
  
  const quranEnglishData = loadEnglishData();

  const enriched = videos.map(video => {
    let resolvedVerses = [];
    if (video.verses) {
      // Robust split addressing delimiter missing spaces
      resolvedVerses = video.verses
        .split(',')
        .map(v => resolveVerseString(v.trim(), base, quranEnglishData))
        .filter(Boolean);
    }
    
    return {
      ...video,
      resolvedVerses
    };
  });
  
  return sortVideos(enriched);
}
