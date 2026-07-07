import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadEnglishData } from './quran_loader.js';

let qiraatRawDataPromise = null;

// L6 Pattern: Pure helper function for slugification (DRY)
export const slugifyQiraatFilter = (type, text) => {
  return `${type}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
};

// L6 Pattern: Single globally memoized raw data loader
async function getRawQiraatData() {
  if (!qiraatRawDataPromise) {
    qiraatRawDataPromise = (async () => {
      const qiraatPath = path.join(process.cwd(), 'src/data/quran/qiraat/exact_diffs_combined.json');
      try {
        if (existsSync(qiraatPath)) {
          const content = await fs.readFile(qiraatPath, 'utf-8');
          return JSON.parse(content);
        }
      } catch (e) {
        console.error(`[qiraatLoader] Failed to load qiraat data`, e);
        if (process.env.NODE_ENV === 'production') throw e;
      }
      return [];
    })();
  }
  return qiraatRawDataPromise;
}

export async function getQiraatForSurah(surahNum) {
  const data = await getRawQiraatData();
  const cache = {};
  
  for (const item of data) {
    const parts = item.verse_id.split(':');
    if (parts.length === 2) {
      const [surah, ayah] = parts;
      if (parseInt(surah) === parseInt(surahNum)) {
        if (!cache[surah]) {
          cache[surah] = {};
        }
        const validVariants = (item.variants || []).filter(v => {
          const cat = (v.category || '').toLowerCase();
          const eff = (v.effect || '').toLowerCase();
          return cat !== 'other' && eff !== 'other';
        });
        cache[surah][ayah] = validVariants;
      }
    }
  }
  return cache[String(surahNum)] || {};
}

export async function getAllQiraatCategoriesAndEffects() {
  const data = await getRawQiraatData();

  const effects = new Map();
  const categories = new Map();

  for (const item of data) {
    for (const v of (item.variants || [])) {
      const cat = (v.category || '');
      const eff = (v.effect || '');
      
      if (cat.toLowerCase() !== 'other' && eff.toLowerCase() !== 'other') {
        if (eff) {
          const effSlug = slugifyQiraatFilter('effect', eff);
          if (!effects.has(effSlug)) effects.set(effSlug, { slug: effSlug, title: eff, type: 'effect', count: 0 });
          effects.get(effSlug).count++;
        }
        if (cat) {
          const catSlug = slugifyQiraatFilter('category', cat);
          if (!categories.has(catSlug)) categories.set(catSlug, { slug: catSlug, title: cat, type: 'category', count: 0 });
          categories.get(catSlug).count++;
        }
      }
    }
  }

  return [...Array.from(effects.values()), ...Array.from(categories.values())];
}

export async function getVersesForQiraatSlug(slug) {
  const data = await getRawQiraatData();
  const matches = [];

  for (const item of data) {
    const parts = item.verse_id.split(':');
    if (parts.length === 2) {
      const [surah, ayah] = parts;
      const validVariants = (item.variants || []).filter(v => {
        const cat = (v.category || '');
        const eff = (v.effect || '');
        if (cat.toLowerCase() === 'other' || eff.toLowerCase() === 'other') return false;
        
        const effSlug = slugifyQiraatFilter('effect', eff);
        const catSlug = slugifyQiraatFilter('category', cat);
        
        return (slug === effSlug || slug === catSlug);
      });
      
      if (validVariants.length > 0) {
        matches.push({
          surah: parseInt(surah),
          ayah: parseInt(ayah),
          qiraatVariants: validVariants
        });
      }
    }
  }

  const englishData = loadEnglishData();
  const surahCache = {};

  // L6 Pattern: Resolve all unique surahs in parallel first
  const neededSurahs = [...new Set(matches.map(m => String(m.surah)))];
  await Promise.all(neededSurahs.map(async (surahStr) => {
    const arabicFilePath = path.join(process.cwd(), 'src/data/quran/arabic/surahs', `${surahStr}.json`);
    let arabicData = { verses: {} };
    try {
      if (existsSync(arabicFilePath)) {
        const content = await fs.readFile(arabicFilePath, 'utf-8');
        arabicData = JSON.parse(content);
      }
    } catch (e) {
      console.warn(`[qiraatLoader] Failed to read Arabic surah file: ${surahStr}`, e);
    }
    surahCache[surahStr] = arabicData;
  }));

  for (const match of matches) {
    const surahStr = String(match.surah);
    const ayahStr = String(match.ayah);

    const arabicText = surahCache[surahStr].verses[ayahStr] || '';
    const englishTextObj = englishData[`${surahStr}:${ayahStr}`];
    const englishText = englishTextObj ? englishTextObj.text : '';

    match.uthmanic_arabic = arabicText;
    match.uthmanic_english = englishText;
    match.surah_name = surahCache[surahStr].transliteration || `Surah ${surahStr}`;
  }

  return matches.sort((a, b) => {
    if (a.surah !== b.surah) return a.surah - b.surah;
    return a.ayah - b.ayah;
  });
}
