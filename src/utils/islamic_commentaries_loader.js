import fs from 'node:fs';
import path from 'node:path';

let cache = null;

/**
 * Registry of Islamic commentaries to load.
 * Order matters: commentaries will be loaded and displayed in the UI in the order defined here.
 */
const TAFSEER_REGISTRY = [
  {
    name: 'Tafsir Al-Tabari',
    defaultPath: 'src/data/quran/commentary/tafsir_tabari_english.json',
    envKey: 'TABARI_PATH',
    transform: (item) => {
      // Create a shallow copy to prevent in-place mutation of the loaded JSON object
      const cloned = { ...item };
      cloned.title = 'Tafsir Al-Tabari';
      delete cloned.source_volume_page;
      return cloned;
    }
  },
  {
    name: 'Tafsir Ibn Kathir',
    defaultPath: 'src/data/quran/commentary/tafsir_ibn_kathir_catena.json',
    envKey: 'IBN_KATHIR_PATH',
    transform: (item) => ({ ...item }) // Shallow copy
  }
];

function processCommentaryFile(filePath, map, transformFn) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[IslamicCommentariesLoader] File not found: ${filePath}`);
    return;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const obj = JSON.parse(raw);

    for (const [key, item] of Object.entries(obj)) {
      if (!key || !item) continue;

      // Apply source-specific transformations safely
      const transformedItem = transformFn ? transformFn(item) : { ...item };

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
        map[targetId].push(transformedItem);
      }
    }
  } catch (e) {
    console.error(`[IslamicCommentariesLoader] Error reading or parsing ${filePath}:`, e);
  }
}

export function loadIslamicCommentaries() {
  if (cache) return cache;

  const map = {};

  for (const config of TAFSEER_REGISTRY) {
    const filePath = process.env[config.envKey] || path.join(process.cwd(), config.defaultPath);
    processCommentaryFile(filePath, map, config.transform);
  }

  cache = map;
  return cache;
}

export function clearCache() {
  cache = null;
}
