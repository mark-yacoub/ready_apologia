import fs from 'node:fs';
import path from 'node:path';

let cachedEnglishData = null;

export const loadEnglishData = () => {
  if (cachedEnglishData) {
    return cachedEnglishData;
  }

  const englishFilePath = path.join(process.cwd(), 'src/data/quran/english/droge_translation.json');
  try {
    const content = fs.readFileSync(englishFilePath, 'utf-8');
    cachedEnglishData = JSON.parse(content);
    return cachedEnglishData;
  } catch (e) {
    console.error(`Failed to load English translation`, e);
    return {};
  }
};

const cachedArabicSurahs = {};

export const loadArabicSurah = (surahNum) => {
  if (!surahNum) return { verses: {}, versesHTML: {} };
  const key = String(surahNum);
  if (cachedArabicSurahs[key]) {
    return cachedArabicSurahs[key];
  }
  const arabicFilePath = path.join(process.cwd(), 'src/data/quran/arabic/surahs', `${key}.json`);
  try {
    if (fs.existsSync(arabicFilePath)) {
      const content = fs.readFileSync(arabicFilePath, 'utf-8');
      cachedArabicSurahs[key] = JSON.parse(content);
      return cachedArabicSurahs[key];
    }
  } catch (e) {
    console.error(`Failed to load Arabic surah ${key}`, e);
  }
  return { verses: {}, versesHTML: {} };
};
