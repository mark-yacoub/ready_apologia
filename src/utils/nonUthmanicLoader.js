import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadEnglishData } from './quran_loader.js';

export const GENERAL_VARIANT_IDS = [
  "variantcodices_0", "lostverses_0", "abumusa_0", "ibnumar_0",
  "satanic_0", "sanaa_0", "fatima_0", "khalifa_0",
  "12thimam_0", "khuzaymahibnthabit_0", "khuzaimah_0",
  "abualansari_0", "companions_0", "muhammad_0"
];

const COMPANION_VERSE_ID_MAP = {
  "Abdullah bin Masud": "ibnmasud_0",
  "Ubayy bin Kab": "ubayy_0",
  "Aisha": "aisha_0",
  "Abu Musa Al-Ashari": "abumusa_0",
  "Abu Musa al-Ashari": "abumusa_0",
  "Ibn Abbas": null,
  "Umar bin Al-Khattab": null,
  "Hafsa": "hafsa_0",
  "Ali bin Abi Talib": "ali_0",
  "Abu Ad-Darda": null,
  "Anas bin Malik": null,
  "Ibn Az-Zubair": null
};

export function companionToSlug(name) {
  if (!name) return '';
  return String(name).toLowerCase().replace(/['’]/g, '').replace(/\s+/g, '-');
}

/**
 * Sorts hadiths by collection (Bukhari first, then Muslim) and then by reference number.
 */
export function sortHadiths(a, b) {
  const refA = a.hadith_reference || a.source_reference || a.reference || '';
  const refB = b.hadith_reference || b.source_reference || b.reference || '';

  const isBukhariA = refA.toLowerCase().includes('bukhari');
  const isBukhariB = refB.toLowerCase().includes('bukhari');

  if (isBukhariA && !isBukhariB) return -1;
  if (!isBukhariA && isBukhariB) return 1;

  const numA = parseInt(refA.match(/\b\d+/)?.[0] || '0', 10);
  const numB = parseInt(refB.match(/\b\d+/)?.[0] || '0', 10);

  if (numA !== numB) {
    return numA - numB;
  }

  return refA.localeCompare(refB);
}

async function loadJsonSafely(filePath, fallback = []) {
  try {
    if (existsSync(filePath)) {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error(`[NonUthmanicLoader] Failed to load/parse JSON from ${filePath}`, e);
    if (process.env.NODE_ENV === 'production') {
      throw e;
    }
  }
  return fallback;
}

let masterVariantsPromise = null;
let masterVariantsMtime = 0;
let variantsBySurahPromise = null;
let surahMetaCachePromise = null;

async function getMasterVariants() {
  const masterVariantsPath = path.join(process.cwd(), 'src/data/quran/non_uthmanic/master_variants.json');
  try {
    const stat = await fs.stat(masterVariantsPath);
    if (stat.mtimeMs !== masterVariantsMtime) {
      masterVariantsMtime = stat.mtimeMs;
      masterVariantsPromise = loadJsonSafely(masterVariantsPath, []);
      variantsBySurahPromise = null;
    }
  } catch (e) {
    // ignore stat error
  }
  if (!masterVariantsPromise) {
    masterVariantsPromise = loadJsonSafely(masterVariantsPath, []);
  }
  return masterVariantsPromise;
}

async function getSurahMetaMap() {
  if (!surahMetaCachePromise) {
    surahMetaCachePromise = (async () => {
      const metaPath = path.join(process.cwd(), 'src/data/quran/arabic/meta.json');
      const metaList = await loadJsonSafely(metaPath, []);
      const map = {};
      if (Array.isArray(metaList)) {
        for (const item of metaList) {
          if (item && item.number) {
            map[String(item.number)] = item.transliteration || item.englishName || `Surah ${item.number}`;
          }
        }
      }
      return map;
    })();
  }
  return surahMetaCachePromise;
}

async function getSurahName(surahNum) {
  const surahStr = String(surahNum);
  if (surahStr === '113-114') return 'Al-Falaq & An-Nas (Surahs 113–114)';
  if (surahStr === 'unknown' || surahStr === '0') return 'Unindexed / Lost Quranic Passage';
  const metaMap = await getSurahMetaMap();
  if (metaMap[surahStr]) return metaMap[surahStr];
  const arabicFilePath = path.join(process.cwd(), 'src/data/quran/arabic/surahs', `${surahStr}.json`);
  if (existsSync(arabicFilePath)) {
    try {
      const parsed = JSON.parse(await fs.readFile(arabicFilePath, 'utf-8'));
      if (parsed.transliteration) {
        metaMap[surahStr] = parsed.transliteration;
        return parsed.transliteration;
      }
    } catch (e) {
      // ignore
    }
  }
  return `Surah ${surahStr}`;
}

/**
 * Merges two variant entries on the same verse when they share the exact same target reading
 * (e.g., 2:238 Aisha & Hafsa, 92:3 Ibn Masud & Abu Ad-Darda, 18:79/80 Ibn Abbas & Ubayy)
 * so that in-chapter Surah view shows 1 unified, non-redundant card per distinct reading.
 */
function mergeIdenticalVerseVariants(variants) {
  const mergedByReading = new Map();

  for (const v of variants) {
    const readingKey = `${(v.variant_target_english || '').trim().toLowerCase()}||${(v.variant_target_arabic || '').trim()}`;
    if (!mergedByReading.has(readingKey)) {
      const clone = {
        ...v,
        primary_companions: [v.companion],
        also_attributed_to: [...(v.also_attributed_to || [])],
        hadiths: [...(v.hadiths || [])],
        tafsir_sources: [...(v.tafsir_sources || [])]
      };
      mergedByReading.set(readingKey, clone);
    } else {
      const existing = mergedByReading.get(readingKey);
      if (!existing.primary_companions.includes(v.companion)) {
        existing.primary_companions.push(v.companion);
      }
      for (const other of (v.also_attributed_to || [])) {
        if (!existing.primary_companions.includes(other) && !existing.also_attributed_to.includes(other)) {
          existing.also_attributed_to.push(other);
        }
      }
      // Remove any primary_companions from also_attributed_to
      existing.also_attributed_to = existing.also_attributed_to.filter(
        c => !existing.primary_companions.includes(c)
      );

      // Merge hadiths without duplicates
      const seenHadithRefs = new Set(existing.hadiths.map(h => h.hadith_reference));
      for (const h of (v.hadiths || [])) {
        if (!seenHadithRefs.has(h.hadith_reference)) {
          existing.hadiths.push(h);
          seenHadithRefs.add(h.hadith_reference);
        }
      }

      // Merge tafsir_sources without dropping distinct excerpts for the same scholar
      const seenTafsirKeys = new Set(
        existing.tafsir_sources.map(t => `${t.scholar_id}::${(t.arabic_excerpt || '').trim()}`)
      );
      for (const t of (v.tafsir_sources || [])) {
        const tKey = `${t.scholar_id}::${(t.arabic_excerpt || '').trim()}`;
        if (!seenTafsirKeys.has(tKey)) {
          existing.tafsir_sources.push(t);
          seenTafsirKeys.add(tKey);
        }
      }

      // Update short_title when multiple primary companions share the exact same reading on a verse
      if (existing.primary_companions.length > 1) {
        const firstComp = existing.primary_companions[0];
        const joinedComps = existing.primary_companions.join(' & ');
        if (existing.short_title && existing.short_title.includes(`${firstComp}'s Codex Adds`)) {
          existing.short_title = existing.short_title.replace(`${firstComp}'s Codex Adds`, `${joinedComps} Add`);
        } else if (existing.short_title && existing.short_title.startsWith(`${firstComp} Adds`)) {
          existing.short_title = existing.short_title.replace(`${firstComp} Adds`, `${joinedComps} Add`);
        }
      }
    }
  }

  return Array.from(mergedByReading.values()).sort(
    (a, b) => (a.global_rank || 999) - (b.global_rank || 999)
  );
}

/**
 * Returns pre-grouped, deduplicated, and CUJ-sorted variants for a specific Surah in O(1) time after initial cache load.
 */
export async function getVariantsForSurah(surahNum) {
  const masterVariants = await getMasterVariants();
  if (!variantsBySurahPromise) {
    variantsBySurahPromise = (async () => {
      const cache = {};
      for (const entry of masterVariants) {
        const surahStr = String(entry.surah);
        if (!cache[surahStr]) {
          cache[surahStr] = {};
        }
        const ayahStr = String(entry.ayah);
        const surahName = await getSurahName(surahStr);
        const enriched = (entry.variants || []).map(v => ({
          ...v,
          surah: entry.surah,
          ayah: entry.ayah,
          surah_name: surahName,
          uthmanic_arabic: v.uthmanic_full_arabic || entry.uthmanic_arabic || '',
          uthmanic_english: v.uthmanic_full_english || entry.uthmanic_english || ''
        }));
        cache[surahStr][ayahStr] = mergeIdenticalVerseVariants(enriched);
      }
      return cache;
    })();
  }
  const cache = await variantsBySurahPromise;
  return cache[String(surahNum)] || {};
}

/**
 * Loads all 11 authentic Sahaba Companion profiles with variant statistics.
 */
export async function loadAllCompanions() {
  const companionsPath = path.join(process.cwd(), 'src/data/quran/non_uthmanic/companions.json');
  const companionsData = await loadJsonSafely(companionsPath, []);
  return companionsData
    .filter(c => c.name && c.name !== 'Unknown')
    .map(c => ({
      ...c,
      slug: c.id || companionToSlug(c.name),
      count: c.total_variants || 0
    }))
    .sort((a, b) => (b.total_variants || 0) - (a.total_variants || 0));
}

/**
 * Loads the top CUJ-ranked non-Uthmanic variants across the entire corpus for the Quran Evidence Hub.
 */
export async function loadTopNonUthmanicVariants(limit = 8) {
  const masterVariants = await getMasterVariants();
  const all = [];
  for (const entry of masterVariants) {
    const surahName = await getSurahName(entry.surah);
    const merged = mergeIdenticalVerseVariants(entry.variants || []);
    for (const v of merged) {
      if (typeof entry.surah === 'number' && entry.ayah > 0) {
        all.push({
          ...v,
          surah: entry.surah,
          ayah: entry.ayah,
          surah_name: surahName
        });
      }
    }
  }
  all.sort((a, b) => (a.global_rank || 999) - (b.global_rank || 999));
  return all.slice(0, limit);
}

/**
 * Loads the unified Lost Verses & Forgotten Surahs data for /quran/0,
 * powered 100% by the Red-Team vetted master_variants.json and companions.json.
 */
export async function loadLostVersesPageData() {
  const masterVariants = await getMasterVariants();
  const allCompanions = await loadAllCompanions();
  const lostPassages = [];
  const featuredVerseKeys = new Set(['2:238', '92:3', '18:79', '18:80', '26:214']);
  const featuredVerseVariants = [];
  let totalVariantsCount = 0;

  for (const entry of masterVariants) {
    totalVariantsCount += (entry.variants || []).length;
    const sStr = String(entry.surah);
    const aStr = String(entry.ayah);
    const isSpecial = sStr === 'unknown' || sStr === '113-114' || aStr === '0';

    if (isSpecial) {
      for (const v of (entry.variants || [])) {
        lostPassages.push({
          ...v,
          surah: entry.surah,
          ayah: entry.ayah,
          primary_companions: [v.companion]
        });
      }
    } else if (featuredVerseKeys.has(`${sStr}:${aStr}`)) {
      const surahName = await getSurahName(sStr);
      const merged = mergeIdenticalVerseVariants(entry.variants || []);
      for (const v of merged) {
        featuredVerseVariants.push({
          ...v,
          surah: entry.surah,
          ayah: entry.ayah,
          surah_name: surahName
        });
      }
    }
  }

  lostPassages.sort((a, b) => {
    const isBirA = a.id === 'codex-lost-bir-mauna-anas' ? 1 : 0;
    const isBirB = b.id === 'codex-lost-bir-mauna-anas' ? 1 : 0;
    if (isBirA !== isBirB) return isBirA - isBirB;
    return (a.global_rank || 999) - (b.global_rank || 999);
  });

  featuredVerseVariants.sort((a, b) => (a.global_rank || 999) - (b.global_rank || 999));

  return {
    lostPassages,
    featuredVerseVariants,
    allCompanions,
    totalVariantsCount
  };
}

/**
 * Legacy helper for QuranSpecial.astro ('lost' | 'abrogated').
 */
export const loadNonUthmanicData = async (type) => {
  const isLost = type === 'lost';
  const companionsData = await loadAllCompanions();
  const masterVariants = await getMasterVariants();

  const filteredVariantsByCompanion = {};

  masterVariants.forEach((entry) => {
    const isSurahLost = entry.surah === 'unknown' || entry.surah === '113-114' || entry.surah === 0 || entry.surah === '0';
    const isAyahLost = entry.ayah === 'unknown' || entry.ayah === 0 || entry.ayah === '0' || entry.ayah === null;

    const matchType = isLost ? (isSurahLost || isAyahLost) : true;

    if (matchType) {
      (entry.variants || []).forEach((v) => {
        const isAbrogated = v.is_abrogated_in_recitation === true;
        const keep = isLost ? !isAbrogated : isAbrogated;

        if (keep) {
          const companionName = v.companion || v.companion_codex;
          if (!filteredVariantsByCompanion[companionName]) {
            filteredVariantsByCompanion[companionName] = [];
          }
          filteredVariantsByCompanion[companionName].push({
            ...v,
            surah: entry.surah,
            ayah: entry.ayah
          });
        }
      });
    }
  });

  return companionsData.map((companion) => ({
    ...companion,
    virtues: companion.virtues || [],
    verse_id: COMPANION_VERSE_ID_MAP[companion.name] || null,
    variants: filteredVariantsByCompanion[companion.name] || []
  }));
};

/**
 * Loads the complete codex profile, virtues, and variants for a specific Companion.
 */
export async function loadCompanionCodex(companionName) {
  const companionsPath = path.join(process.cwd(), 'src/data/quran/non_uthmanic/companions.json');
  const companionsData = await loadJsonSafely(companionsPath, []);
  const targetSlug = companionToSlug(companionName);

  const companion = companionsData.find(
    c => c.name === companionName || c.id === targetSlug || companionToSlug(c.name) === targetSlug
  );

  if (!companion) {
    return null;
  }

  const fileName = companion.name.replace(/\s+/g, '_').replace(/'/g, '') + '.json';
  const filePath = path.join(process.cwd(), 'src/data/quran/non_uthmanic/codices', fileName);

  let codexFileObj = null;
  if (existsSync(filePath)) {
    codexFileObj = await loadJsonSafely(filePath, null);
  }

  const virtues = (codexFileObj?.virtues || companion.virtues || []).slice().sort(sortHadiths);
  const rawVariants = codexFileObj?.variants || [];

  const lostVerses = [];
  const uthmanicVariants = [];
  const allVariants = [];
  const englishData = loadEnglishData();

  for (const v of rawVariants) {
    const surahStr = String(v.surah);
    const ayahStr = String(v.ayah);
    const isSpecial = surahStr === 'unknown' || surahStr === '113-114' || ayahStr === '0';
    const surahName = await getSurahName(surahStr);

    const englishTextObj = !isSpecial ? englishData[`${surahStr}:${ayahStr}`] : null;
    const uthmanicArabic = v.uthmanic_full_arabic || '';
    const uthmanicEnglish = v.uthmanic_full_english || (englishTextObj ? englishTextObj.text : '');

    const enrichedVariant = {
      ...v,
      primary_companions: [v.companion],
      uthmanic_arabic: uthmanicArabic,
      uthmanic_english: uthmanicEnglish,
      surah_name: surahName,
      is_special_passage: isSpecial
    };

    allVariants.push(enrichedVariant);
    if (isSpecial) {
      lostVerses.push(enrichedVariant);
    } else {
      uthmanicVariants.push(enrichedVariant);
    }
  }

  lostVerses.sort((a, b) => (a.global_rank || 999) - (b.global_rank || 999));
  uthmanicVariants.sort((a, b) => {
    const surahA = parseInt(a.surah, 10) || 999;
    const surahB = parseInt(b.surah, 10) || 999;
    if (surahA !== surahB) return surahA - surahB;
    const ayahA = parseInt(a.ayah, 10) || 0;
    const ayahB = parseInt(b.ayah, 10) || 0;
    return ayahA - ayahB;
  });

  allVariants.sort((a, b) => (a.global_rank || 999) - (b.global_rank || 999));

  return {
    ...companion,
    slug: companion.id || companionToSlug(companion.name),
    virtues,
    verse_id: COMPANION_VERSE_ID_MAP[companion.name] || null,
    lostVerses,
    uthmanicVariants,
    allVariants
  };
}
