import fs from 'node:fs';
import path from 'node:path';

let cache = null;

export function loadChristianFootnotes() {
  if (cache) return cache;
  
  // L6 Pattern: Environment variable override with internal project data fallback
  const defaultPath = path.join(process.cwd(), 'src/data/quran/commentary/nickel_annotations.json');
  const filePath = process.env.NICKEL_ANNOTATIONS_PATH || defaultPath;

  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const arr = JSON.parse(raw);
      const map = {};

      for (const item of arr) {
        const id = item.hafs_verse_id;
        if (!id) continue;

        const idsToMap = [];
        // L6 Pattern: Support range annotations (e.g., "3:3-4" -> "3:3", "3:4") for O(1) downstream lookup
        if (id.includes('-')) {
          const [surah, range] = id.split(':');
          if (surah && range) {
            const [startStr, endStr] = range.split('-');
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);
            if (!isNaN(start) && !isNaN(end) && start <= end) {
              for (let v = start; v <= end; v++) {
                idsToMap.push(`${surah}:${v}`);
              }
            } else {
              idsToMap.push(id);
            }
          } else {
            idsToMap.push(id);
          }
        } else {
          idsToMap.push(id);
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
      console.error(`[ChristianFootnotesLoader] Error reading or parsing ${filePath}:`, e);
      return {};
    }
  }

  return {};
}
