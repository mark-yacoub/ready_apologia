import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

let qiraatInitPromise = null;

export async function getQiraatForSurah(surahNum) {
  if (!qiraatInitPromise) {
    qiraatInitPromise = (async () => {
      const qiraatPath = path.join(process.cwd(), 'src/data/quran/qiraat/exact_diffs_combined.json');
      let data = [];
      try {
        if (existsSync(qiraatPath)) {
          const content = await fs.readFile(qiraatPath, 'utf-8');
          data = JSON.parse(content);
        }
      } catch (e) {
        console.error(`Failed to load qiraat data`, e);
        if (process.env.NODE_ENV === 'production') throw e;
      }
      
      const cache = {};
      for (const item of data) {
        const parts = item.verse_id.split(':');
        if (parts.length === 2) {
          const [surah, ayah] = parts;
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
      return cache;
    })();
  }
  
  const cache = await qiraatInitPromise;
  return cache[String(surahNum)] || {};
}
