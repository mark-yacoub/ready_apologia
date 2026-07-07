import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadEnglishData } from './quran_loader.js';

/**
 * Sorts hadiths by collection (Bukhari first, then Muslim) and then by reference number.
 */
export function sortHadiths(a, b) {
  const refA = a.source_reference || a.reference || '';
  const refB = b.source_reference || b.reference || '';

  const isBukhariA = refA.toLowerCase().includes('bukhari');
  const isBukhariB = refB.toLowerCase().includes('bukhari');

  if (isBukhariA && !isBukhariB) return -1;
  if (!isBukhariA && isBukhariB) return 1;

  // Extract first sequence of digits for numeric sorting
  const numA = parseInt(refA.match(/\b\d+/)?.[0] || '0', 10);
  const numB = parseInt(refB.match(/\b\d+/)?.[0] || '0', 10);

  if (numA !== numB) {
    return numA - numB;
  }
  
  return refA.localeCompare(refB);
}

/**
 * Safely loads and parses a JSON file.
 * In production builds, it will throw errors to fail the build if critical data is missing or corrupt.
 */
async function loadJsonSafely(filePath, fallback = []) {
  try {
    if (existsSync(filePath)) {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error(`[NonUthmanicLoader] Failed to load/parse JSON from ${filePath}`, e);
    // Fail-fast in production builds
    if (process.env.NODE_ENV === 'production') {
      throw e;
    }
  }
  return fallback;
}

let masterVariantsCache = null;
let variantsBySurahCache = null;

async function getMasterVariants() {
  if (!masterVariantsCache) {
    const masterVariantsPath = path.join(process.cwd(), 'src/data/quran/non_uthmanic/master_variants.json');
    masterVariantsCache = await loadJsonSafely(masterVariantsPath, []);
  }
  return masterVariantsCache;
}

/**
 * Returns pre-grouped and sorted active variants for a specific Surah in O(1) time after initial cache load.
 */
export async function getVariantsForSurah(surahNum) {
  if (!variantsBySurahCache) {
    const masterVariants = await getMasterVariants();
    variantsBySurahCache = {};
    for (const entry of masterVariants) {
      const surahStr = String(entry.surah);
      if (!variantsBySurahCache[surahStr]) {
        variantsBySurahCache[surahStr] = {};
      }
      const ayahStr = String(entry.ayah);
      if (!variantsBySurahCache[surahStr][ayahStr]) {
        variantsBySurahCache[surahStr][ayahStr] = [];
      }
      const activeVariants = (entry.variants || []).filter(v => v.is_abrogated_in_recitation !== true);
      activeVariants.sort(sortHadiths);
      variantsBySurahCache[surahStr][ayahStr].push(...activeVariants);
    }
  }
  return variantsBySurahCache[String(surahNum)] || {};
}

/**
 * Loads, filters, groups, and sorts non-Uthmanic Quran data for superstars companions.
 * Reads files in parallel to optimize build performance.
 * 
 * @param {'lost' | 'abrogated'} type 
 * @returns {Promise<Array<Object>>} Resolved companion data list
 */
export const loadNonUthmanicData = async (type) => {
  const isLost = type === 'lost';

  const companionsPath = path.join(process.cwd(), 'src/data/quran/non_uthmanic/companions.json');
  const companionsData = await loadJsonSafely(companionsPath, []);

  // Filter to Superstar (excluding placeholder 'Unknown') and sort by importance rank
  const superstars = companionsData
    .filter(c => c.tier === 'Superstar' && c.name !== 'Unknown')
    .sort((a, b) => a.importance_rank - b.importance_rank);

  const masterVariants = await getMasterVariants();

  const filteredVariantsByCompanion = {};

  // Group variants by companion
  masterVariants.forEach((entry) => {
    const isSurahLost = entry.surah === 'unknown' || entry.surah === 0 || entry.surah === '0';
    const isAyahLost = entry.ayah === 'unknown' || entry.ayah === 0 || entry.ayah === '0' || entry.ayah === null;

    const matchType = isLost 
      ? (isSurahLost && isAyahLost) 
      : true;

    if (matchType) {
      entry.variants.forEach((v) => {
        const isAbrogated = v.is_abrogated_in_recitation === true;
        const keep = isLost ? !isAbrogated : isAbrogated;

        if (keep) {
          const companionName = v.companion_codex;
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

  // Sort variants for each companion
  for (const key in filteredVariantsByCompanion) {
    filteredVariantsByCompanion[key].sort(sortHadiths);
  }

  // Load individual virtues in parallel (L6 performance pattern)
  const companionsWithData = await Promise.all(superstars.map(async (companion) => {
    const fileName = companion.name.replace(/\s+/g, '_') + '.json';
    const filePath = path.join(process.cwd(), 'src/data/quran/non_uthmanic/codices', fileName);
    let virtues = [];
    
    try {
      if (existsSync(filePath)) {
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        virtues = parsed.virtues || [];
        virtues.sort(sortHadiths);
      }
    } catch (e) {
      console.error(`[NonUthmanicLoader] Failed to load virtues for ${companion.name} from ${filePath}`, e);
      if (process.env.NODE_ENV === 'production') {
        throw e;
      }
    }

    return {
      ...companion,
      virtues,
      variants: filteredVariantsByCompanion[companion.name] || []
    };
  }));

  return companionsWithData;
};

export async function loadCompanionCodex(companionName) {
  const companionsPath = path.join(process.cwd(), 'src/data/quran/non_uthmanic/companions.json');
  const companionsData = await loadJsonSafely(companionsPath, []);
  const companion = companionsData.find(c => c.name === companionName);

  if (!companion) {
    return null;
  }

  // Load virtues
  const fileName = companion.name.replace(/\s+/g, '_') + '.json';
  const filePath = path.join(process.cwd(), 'src/data/quran/non_uthmanic/codices', fileName);
  let virtues = [];
  try {
    if (existsSync(filePath)) {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      virtues = parsed.virtues || [];
      virtues.sort(sortHadiths);
    }
  } catch (e) {
    console.error(`[NonUthmanicLoader] Failed to load virtues for ${companion.name}`, e);
  }

  // Load variants
  const masterVariants = await getMasterVariants();

  const lostVerses = [];
  const uthmanicVariants = [];

  masterVariants.forEach((entry) => {
    const isSurahLost = entry.surah === 'unknown' || entry.surah === 0 || entry.surah === '0';
    const isAyahLost = entry.ayah === 'unknown' || entry.ayah === 0 || entry.ayah === '0' || entry.ayah === null;

    entry.variants.forEach((v) => {
      if (v.companion_codex === companionName) {
        const variantWithSurahAyah = {
          ...v,
          surah: entry.surah,
          ayah: entry.ayah
        };

        if (v.is_abrogated_in_recitation !== true) {
          if (isSurahLost && isAyahLost) {
            lostVerses.push(variantWithSurahAyah);
          } else {
            uthmanicVariants.push(variantWithSurahAyah);
          }
        }
      }
    });
  });

  lostVerses.sort(sortHadiths);
  uthmanicVariants.sort((a, b) => {
    const surahA = parseInt(a.surah);
    const surahB = parseInt(b.surah);
    if (surahA !== surahB) return surahA - surahB;
    const ayahA = parseInt(a.ayah);
    const ayahB = parseInt(b.ayah);
    return ayahA - ayahB;
  });

  const surahCache = {};
  const englishData = loadEnglishData();

  for (const variant of uthmanicVariants) {
    const surahStr = String(variant.surah);
    const ayahStr = String(variant.ayah);

    if (!surahCache[surahStr]) {
      const arabicFilePath = path.join(process.cwd(), 'src/data/quran/arabic/surahs', `${surahStr}.json`);
      let arabicData = { verses: {} };
      try {
        if (existsSync(arabicFilePath)) {
          const content = await fs.readFile(arabicFilePath, 'utf-8');
          arabicData = JSON.parse(content);
        }
      } catch (e) {
        console.error(`Failed to load Arabic data for surah ${surahStr}`, e);
      }
      surahCache[surahStr] = arabicData;
    }

    const arabicText = surahCache[surahStr].verses[ayahStr] || '';
    const englishTextObj = englishData[`${surahStr}:${ayahStr}`];
    const englishText = englishTextObj ? englishTextObj.text : '';

    variant.uthmanic_arabic = arabicText;
    variant.uthmanic_english = englishText;
    variant.surah_name = surahCache[surahStr].transliteration || `Surah ${surahStr}`;
  }

  return {
    ...companion,
    virtues,
    lostVerses,
    uthmanicVariants
  };
}
