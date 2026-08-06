import fs from 'node:fs';
import path from 'node:path';
import { TAFSEER_CONFIG } from './tafseer_config.js';

let cache = null;

function processCommentaryConfig(config, map) {
  const filePath = process.env[config.envKey] || path.join(process.cwd(), config.defaultPath);
  if (!fs.existsSync(filePath)) {
    console.warn(`[IslamicCommentariesLoader] File not found: ${filePath}`);
    return;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const obj = JSON.parse(raw);

    for (const [key, item] of Object.entries(obj)) {
      if (!key || !item) continue;

      // Construct a structured immutable commentary object conforming to the L6 schema
      const commentaryEntry = {
        ...item,
        id: config.id,
        name: config.name,
        title: config.displayTitle,
        scholar: config.scholar,
        date: config.date,
        era: config.era,
        authority: config.authority,
        source_volume_page: config.id === 'tabari' ? undefined : item.source_volume_page
      };

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
        map[targetId].push(commentaryEntry);
      }
    }
  } catch (e) {
    console.error(`[IslamicCommentariesLoader] Error reading or parsing ${filePath}:`, e);
  }
}

export function loadIslamicCommentaries() {
  if (cache) return cache;

  const map = {};

  for (const config of TAFSEER_CONFIG) {
    processCommentaryConfig(config, map);
  }

  cache = map;
  return cache;
}

export function clearCache() {
  cache = null;
}
