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
