import { getScriptureVerseTextById } from './scripture_service.js';
import { loadEnglishData } from './quran_loader.js';
import booksMeta from '../data/books_meta.json';
import { mapMtToLxx } from './scripture_mapper.js';
import { getBibleUrl, getQuranUrl } from './urlFactory.js';

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
  ibnumar: { name: "Abdullah bin Umar Codex", path: "/quran/0" },
  satanic: { name: "The Satanic Verses", path: "/quran/0" },
  sanaa: { name: "Sana'a Palimpsest", path: "/quran/0" },
  fatima: { name: "Mushaf Fatima", path: "/quran/0" },
  khalifa: { name: "Rashad Khalifa's Code", path: "/quran/0" },
  ali: { name: "Codex of Ali", path: "/quran/codex/ali-bin-abi-talib" },
  "12thimam": { name: "12th Imam Codex", path: "/quran/0" },
  hafsa: { name: "Hafsa bint Umar Codex", path: "/quran/codex/hafsa" },
  khuzaymahibnthabit: { name: "Khuzaimah's Verse", path: "/quran/0" },
  khuzaimah: { name: "Khuzaimah's Verse", path: "/quran/0" },
  abualansari: { name: "Abu Al-Ansari's Verse", path: "/quran/0" },
  variantcodices: { name: "Variant Codices", path: "/quran/0" },
  companions: { name: "Companion Codices", path: "/quran/0" },
  muhammad: { name: "Muhammad's Forgotten Verses", path: "/quran/0" }
};

function resolveVerseString(verseStr, base, quranEnglishData) {
  if (verseStr === 'gospels') {
    return {
      label: 'The Gospels',
      link: `${base}/bible/gospels/videos`,
      text: 'Overview and textual reliability of the four canonical Gospels (Matthew, Mark, Luke, John).'
    };
  }

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
      link: getQuranUrl({ surah, ayah, base }),
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
    let targetBook = book;
    let displayChap = chap;
    let displayVerse = verse;

    if (isOt) {
      const lxxMap = mapMtToLxx(book, chap, verse);
      if (lxxMap) {
        targetBook = lxxMap.book;
        displayChap = lxxMap.chapter;
        displayVerse = String(lxxMap.verse);
      }
    }

    return {
      label: `${formatBookIdToName(verseStr)} ${displayChap}:${displayVerse}`,
      link: getBibleUrl({ book: targetBook, chapter: displayChap, verse: displayVerse, base }),
      text: text
    };
  }
  return null;
}

const TIER_1 = new Set(['copticorthodoxanswers', 'ancientfaithministries', 'jonathanpageauclips']);
const TIER_2 = new Set(['inspiringphilosophy', 'capturingchristianity', 'testifyapologetics', 'weshuff']);
const TIER_3 = new Set(['davidwood', 'cirainternational', 'crossexamined', 'redpenlogic', 'givemeananswer', 'mikewinger', 'livingwaters', 'apologeticsroadshow', 'oneforisrael']);
const TIER_4 = new Set(['shamounian', 'towardsjesus', 'godlogic', 'godlogic2.0', 'godlogicapologetics']);
const TIER_5 = new Set(['apologiastudios', 'vocabmalone']);

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
  if (!channelId && !apologistName) return 6;

  const cId = channelId ? channelId.toLowerCase().replace(/^@/, '') : '';
  const aName = apologistName ? apologistName.toLowerCase() : '';

  // Robust case-insensitive checking
  if (TIER_1.has(cId) || TIER_1.has(aName)) return 1;
  if (TIER_2.has(cId) || TIER_2.has(aName)) return 2;
  if (TIER_3.has(cId) || TIER_3.has(aName)) return 3;
  if (TIER_4.has(cId) || TIER_4.has(aName)) return 4;
  if (TIER_5.has(cId) || TIER_5.has(aName)) return 5;

  return 6;
}

function getPassageCount(v) {
  if (typeof v.total_passages === 'number' && v.total_passages > 0) {
    return v.total_passages;
  }
  if (v.raw_verses_display) {
    const p = v.raw_verses_display.split(',').map(s => s.trim()).filter(Boolean);
    if (p.length > 0) return p.length;
  }
  return v.resolvedVerses ? v.resolvedVerses.length : 1;
}

export function computeDynamicCompositeScore(v, targetVerseId) {
  if (typeof v.composite_score === 'number') {
    return v.composite_score;
  }
  const rigor = v.rigor_score || 0;
  const rawV = v.raw_verses_display || '';
  const passages = rawV.split(',').map(s => s.trim()).filter(Boolean);
  const totalPassages = Math.max(1, passages.length);

  let targetIdx = -1;
  const tId = (targetVerseId || v.target_verse_id || v.verse_id || '').toLowerCase();
  if (tId) {
    for (let i = 0; i < passages.length; i++) {
      const pLower = passages[i].toLowerCase();
      const parts = tId.split('_');
      if (parts.length === 3) {
        const chapVerse = `${parts[1]}:${parts[2]}`;
        if (pLower.includes(chapVerse)) { targetIdx = i; break; }
      } else if (parts.length === 2 && !isNaN(parts[0])) {
        const surahAyah = `${parts[0]}:${parts[1]}`;
        if (pLower.includes(surahAyah)) { targetIdx = i; break; }
      } else if (pLower.includes(tId)) {
        targetIdx = i; break;
      }
    }
  }

  const isSolo = totalPassages === 1 && (targetIdx === 0 || targetIdx === -1);
  let posWt = 0.20;
  if (isSolo) posWt = 1.00;
  else if (targetIdx === 0) posWt = 0.85;
  else if (targetIdx === 1) posWt = 0.55;
  else if (targetIdx === 2) posWt = 0.35;
  else if (targetIdx === -1) posWt = 0.50;

  const conc = 1.0 / Math.sqrt(totalPassages);
  const titleLower = (v.title || '').toLowerCase();
  const summaryLower = (v.summary || '').toLowerCase();
  let inTitle = false;
  let inSummary = false;
  if (tId) {
    const parts = tId.split('_');
    if (parts.length === 3) {
      const chapVerse = `${parts[1]}:${parts[2]}`;
      inTitle = titleLower.includes(chapVerse);
      inSummary = summaryLower.includes(chapVerse);
    } else if (parts.length === 2 && !isNaN(parts[0])) {
      const surahAyah = `${parts[0]}:${parts[1]}`;
      inTitle = titleLower.includes(surahAyah);
      inSummary = summaryLower.includes(surahAyah);
    }
  }

  const titBonus = inTitle ? 0.15 : 0.0;
  const sumBonus = inSummary ? 0.15 : 0.0;
  const relevance = Math.min(1.0, 0.40 * posWt + 0.30 * conc + titBonus + sumBonus);
  const tier = getTierScore(v.channel_id, v.apologist_name);
  return (rigor / 10.0) * (0.35 + 0.65 * relevance) * 100.0 - (tier * 0.02);
}

export function sortVideos(videos, targetVerseId = null) {
  return videos.sort((a, b) => {
    // 1. Continuous Relevance x Rigor Composite Score (higher is better)
    const scoreA = computeDynamicCompositeScore(a, targetVerseId);
    const scoreB = computeDynamicCompositeScore(b, targetVerseId);
    if (Math.abs(scoreB - scoreA) >= 0.05) return scoreB - scoreA;

    // 2. Rigor Score (higher is better)
    const rigorA = a.rigor_score || 0;
    const rigorB = b.rigor_score || 0;
    if (rigorA !== rigorB) return rigorB - rigorA;

    // 3. Number of distinct passages (lower is better, eliminates range expansion penalty!)
    const passagesA = getPassageCount(a);
    const passagesB = getPassageCount(b);
    if (passagesA !== passagesB) return passagesA - passagesB;

    // 4. Tier (lower number is better rank)
    const tierA = getTierScore(a.channel_id, a.apologist_name);
    const tierB = getTierScore(b.channel_id, b.apologist_name);
    if (tierA !== tierB) return tierA - tierB;

    // 5. Topic matching (Jesus=1, General=2, Islam=3)
    const topicA = getTopicScore(a.summary);
    const topicB = getTopicScore(b.summary);
    if (topicA !== topicB) return topicA - topicB;

    // 6. Tie breaker: Title alphabetically
    const titleA = a.title || '';
    const titleB = b.title || '';
    return titleA.localeCompare(titleB);
  });
}

/**
 * Enhances raw video database objects with resolved verses structure
 * @param {Array} videos - Array of DB records from shorts_metadata
 * @param {String} base - The base URL scope (import.meta.env.BASE_URL)
 * @param {String} [targetVerseId] - Optional current verse ID being viewed
 * @returns {Array} - The enriched DTO arrays ready for the UI layer
 */
export function enrichVideosWithVerses(videos, base, targetVerseId = null) {
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

  return sortVideos(enriched, targetVerseId);
}
