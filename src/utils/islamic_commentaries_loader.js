import fs from 'node:fs';
import path from 'node:path';

let cache = null;

export function loadIslamicCommentaries() {
  if (cache) return cache;
  
  const defaultPath = path.join(process.cwd(), 'src/data/quran/commentary/tafsir_ibn_kathir_catena.json');
  const filePath = process.env.IBN_KATHIR_PATH || defaultPath;

  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const obj = JSON.parse(raw);
      const map = {};

      for (const [key, item] of Object.entries(obj)) {
        if (!key || !item) continue;

        const idsToMap = [];
        if (key.includes('-')) {
          const [surah, range] = key.split(':');
          if (surah && range) {
            const [startStr, endStr] = range.split('-');
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);
            if (!isNaN(start) && !isNaN(end) && start <= end) {
              for (let v = start; v <= end; v++) {
                idsToMap.push(`${surah}:${v}`);
              }
            } else {
              idsToMap.push(key);
            }
          } else {
            idsToMap.push(key);
          }
        } else {
          idsToMap.push(key);
        }

        for (const targetId of idsToMap) {
          if (!map[targetId]) {
            map[targetId] = [];
          }
          map[targetId].push(item);
        }
      }

      cache = map;
      return cache;
    } catch (e) {
      console.error(`[IslamicCommentariesLoader] Error reading or parsing ${filePath}:`, e);
      return {};
    }
  }

  return {};
}
