import fs from 'node:fs';
import path from 'node:path';
import { TAFSEER_CONFIG, resolveScholarSources } from './tafseer_config.js';

let cache = null;

function processCommentaryConfig(config, map) {
  const filePath = process.env[config.envKey] || path.join(process.cwd(), config.defaultPath);
  const arabicFilePath = config.arabicPath ? path.join(process.cwd(), config.arabicPath) : null;

  if (!fs.existsSync(filePath)) {
    console.warn(`[IslamicCommentariesLoader] File not found: ${filePath}`);
    return;
  }

  try {
    const rawEn = fs.readFileSync(filePath, 'utf-8');
    const objEn = JSON.parse(rawEn);

    let objAr = {};
    if (arabicFilePath && fs.existsSync(arabicFilePath)) {
      const rawAr = fs.readFileSync(arabicFilePath, 'utf-8');
      objAr = JSON.parse(rawAr);
    } else if (arabicFilePath) {
      console.warn(`[IslamicCommentariesLoader] Arabic File not found: ${arabicFilePath}`);
    }

    const allKeys = new Set([...Object.keys(objEn), ...Object.keys(objAr)]);

    for (const key of allKeys) {
      const itemEn = objEn[key];
      const itemAr = objAr[key];
      
      if (!itemEn && !itemAr) continue;
      
      // Prefer English metadata (title, etc) but fallback to Arabic if missing
      const baseItem = itemEn || itemAr;

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
        const [s, a] = targetId.split(':');
        const resolvedSources = resolveScholarSources(config, s, a);

        const commentaryEntry = {
          ...baseItem,
          commentary: itemEn ? itemEn.commentary : undefined,
          commentary_arabic: itemAr ? itemAr.commentary : undefined,
          title_arabic: itemAr ? itemAr.title : undefined,
          id: config.id,
          hashSlug: config.hashSlug || config.id,
          name: config.name,
          title: config.displayTitle,
          scholar: config.scholar,
          date: config.date,
          era: config.era,
          era_arabic: config.era_arabic || config.era,
          authority: config.authority,
          translationNote: config.translationNote || null,
          sources: resolvedSources
        };

        if (!map[targetId]) {
          map[targetId] = [];
        }
        map[targetId].push(commentaryEntry);
      }
    }
  } catch (e) {
    console.error(`[IslamicCommentariesLoader] Error reading or parsing ${config.id}:`, e);
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
