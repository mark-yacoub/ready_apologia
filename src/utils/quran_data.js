import fs from 'node:fs';
import path from 'node:path';

// Cache the datasets in memory during build
let drogeCache = null;
let hafsCache = null;
let masterVariantsCache = null;
let canonicalCache = null; // Map of hafs_id to canonical variants

import { companionDisplayNameMap, STATIC_RECITATIONS, normalizeCompanionFilename } from './quranConstants.js';
export { companionDisplayNameMap };

export function getQuranDatasets() {
  if (drogeCache && hafsCache && masterVariantsCache && canonicalCache) {
    return { droge: drogeCache, hafs: hafsCache, codices: masterVariantsCache, canonical: canonicalCache };
  }

  try {
    const cwd = process.cwd();
    drogeCache = JSON.parse(fs.readFileSync(path.join(cwd, 'src/data/quran_datasets/droge_translation.json'), 'utf-8'));
    hafsCache = JSON.parse(fs.readFileSync(path.join(cwd, 'src/data/scripture/hafs_arabic.json'), 'utf-8'));
    masterVariantsCache = JSON.parse(fs.readFileSync(path.join(cwd, 'src/data/quran_datasets/master_variants.json'), 'utf-8'));
    
    // Validate master variants against constants
    const uniqueCompanions = new Set();
    masterVariantsCache.forEach(v => {
      if (v.variants) {
        v.variants.forEach(variant => {
          if (variant.companion_codex) {
            uniqueCompanions.add(variant.companion_codex);
          }
        });
      }
    });

    for (const comp of uniqueCompanions) {
      if (!companionDisplayNameMap[comp]) {
        throw new Error(`VALIDATION ERROR: Unknown companion '${comp}' found in master_variants.json. Please add it to companionDisplayNameMap in src/utils/quranConstants.js!`);
      }
    }
    
    // Validate all JSON files in the dataset directory
    const datasetDir = path.join(cwd, 'src/data/quran_datasets');
    const allFiles = fs.readdirSync(datasetDir).filter(f => f.endsWith('.json'));

    const whitelistedFiles = new Set(['droge_translation.json', 'master_variants.json', 'bridges_raw_extraction.json', 'surahs_metadata.json']);
    const definedQaris = new Set(STATIC_RECITATIONS.map(r => r.qari));
    definedQaris.add('kisai'); // 'kisai' JSON maps to 'al-kisai'

    // We allow any filename that matches a known companion display name, or a raw companion name, or the normalized name.
    const validCompanionNames = new Set();
    Object.keys(companionDisplayNameMap).forEach(raw => {
      validCompanionNames.add(raw.replace(/\s+/g, '_').replace(/[']/g, ''));
      const normalized = companionDisplayNameMap[raw];
      validCompanionNames.add(normalized.replace(/\s+/g, '_').replace(/[']/g, ''));
      validCompanionNames.add(normalizeCompanionFilename(raw));
      validCompanionNames.add(normalizeCompanionFilename(normalized));
    });

    allFiles.forEach(file => {
      if (whitelistedFiles.has(file)) return;
      const basename = file.replace('.json', '');
      if (definedQaris.has(basename)) return;
      if (validCompanionNames.has(basename)) return;
      if (validCompanionNames.has(basename.replace(/_/g, ' '))) return;

      throw new Error(`VALIDATION ERROR: Unknown dataset file '${file}' found in src/data/quran_datasets. It is neither a known canonical recitation, a known companion codex, nor a whitelisted metadata file.`);
    });

    // Load canonical JSONs based strictly on STATIC_RECITATIONS
    canonicalCache = {};
    const qarisToLoad = Array.from(definedQaris);
    qarisToLoad.forEach(qari => {
      const qariPath = path.join(cwd, `src/data/quran_datasets/${qari}.json`);
      if (fs.existsSync(qariPath)) {
        const data = JSON.parse(fs.readFileSync(qariPath, 'utf-8'));
        for (const [hafsId, variant] of Object.entries(data)) {
          if (!canonicalCache[hafsId]) canonicalCache[hafsId] = [];
          
          // Find all rawis in this variant
          Object.keys(variant).forEach(key => {
            if (key.endsWith('_reason_of_change') && variant[key]) {
              const rawi = key.replace('_reason_of_change', '');
              canonicalCache[hafsId].push({
                qari,
                rawi,
                arabic: variant[rawi + '_ar_text'] || "",
                english: variant[rawi + '_text'] || "",
                reason: variant[key],
                category: variant[rawi + '_change_category'] || ""
              });
            }
          });
        }
      }
    });

  } catch (err) {
    if (err.message && err.message.includes("VALIDATION ERROR")) {
      throw err; // DO NOT Swallow validation errors during build!
    }
    console.error("Error loading Quran datasets:", err);
    drogeCache = {}; hafsCache = {}; masterVariantsCache = []; canonicalCache = {};
  }

  return { droge: drogeCache, hafs: hafsCache, codices: masterVariantsCache, canonical: canonicalCache };
}

export function getSurahVerses(surahIndex) {
  const { droge, hafs, codices, canonical } = getQuranDatasets();
  
  let surahKey = String(surahIndex);
  if (surahKey === '0') surahKey = 'unknown';

  // 1. Gather all verse numbers for this Surah from all datasets
  const verseSet = new Set();
  
  Object.keys(droge).forEach(k => {
    if (k.startsWith(`${surahKey}:`)) verseSet.add(parseInt(k.split(':')[1]));
  });
  
  Object.keys(hafs).forEach(k => {
    if (k.startsWith(`${surahKey}:`)) verseSet.add(parseInt(k.split(':')[1]));
  });
  
  codices.forEach(c => {
    if (String(c.surah) === surahKey) verseSet.add(parseInt(c.ayah));
  });

  const sortedVerses = Array.from(verseSet).sort((a, b) => a - b);

  // 2. Build the verse objects
  return sortedVerses.map(vNum => {
    const hafsId = `${surahKey}:${vNum}`;
    
    // Find codices for this verse
    const verseCodices = codices.find(c => String(c.surah) === surahKey && parseInt(c.ayah) === vNum);
    const codexVariants = verseCodices ? verseCodices.variants : [];
    
    // Find canonical for this verse
    const canonicalVariants = canonical[hafsId] || [];
    const uniqueCanonicalTexts = new Set(canonicalVariants.map(cv => cv.arabic));

    return {
      verseNum: vNum,
      hafsId: hafsId,
      baseEnglish: droge[hafsId] ? droge[hafsId].text : "No standard translation available.",
      baseArabic: hafs[hafsId] || "",
      canonicalCount: uniqueCanonicalTexts.size,
      codexCount: codexVariants.length,
      canonicalVariants,
      codexVariants
    };
  });
}
