/**
 * Shared helpers for the "Muhammad and slavery" scripts (audit, verify, gen_arabic). Repo-relative only.
 *
 *   ROOT                     repo root (the scripts chdir here)
 *   json(p)                  reads a repo JSON file
 *   loadModel()              { model, ctx, commentaries }: the same model the pages render
 *   mirrorIndex(col, lang, { cache })
 *                            Sunnah.com number → text from the fawazahmed0 mirror of Sunnah.com
 *                            (`eng-<col>` / `ara-<col>`), Muslim through `arabicnumber` letters plus the
 *                            repo's verified SUNNAH_NUMBER_OVERRIDES (the same numbering the site uses)
 *   stripTashkil(s)          Arabic without diacritics, tatweel or spacing differences (for comparison)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG } from '../../src/utils/muhammadSlavery/config.js';
import { buildModel } from '../../src/utils/muhammadSlavery/model.js';
import { buildContext } from '../../src/utils/muhammadSlavery/context.js';
import { loadIslamicCommentaries } from '../../src/utils/islamic_commentaries_loader.js';
import { loadHadithModel } from '../../src/utils/hadithLoader.js';
import { SUNNAH_NUMBER_OVERRIDES } from '../../src/utils/hadith_config.js';
import { toSunnahNumber } from '../../src/utils/hadithText.js';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const MIRROR = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';
export const json = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

export function loadModel() {
  const commentaries = loadIslamicCommentaries();
  const ctx = buildContext({
    droge: json('src/data/quran/english/droge_translation.json'),
    meta: json('src/data/quran/arabic/meta.json'),
    commentaries,
    hadithModel: loadHadithModel(),
  });
  const model = buildModel(json('src/data/discover/islam/prophet/slavery.json'), CONFIG, ctx);
  return { model, ctx, commentaries };
}

/** One mirror edition (`eng-bukhari`, `ara-muslim`, …), from `cache` when present. */
export async function edition(name, { cache } = {}) {
  const file = `${name}.min.json`;
  const cached = cache && path.resolve(cache, file);
  if (cached && fs.existsSync(cached)) return JSON.parse(fs.readFileSync(cached, 'utf8'));
  const res = await fetch(`${MIRROR}/${file}`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const data = await res.json();
  if (cached) { fs.mkdirSync(path.dirname(cached), { recursive: true }); fs.writeFileSync(cached, JSON.stringify(data)); }
  return data;
}

export async function mirrorIndex(col, lang, opts) {
  const { hadiths } = await edition(`${lang}-${col}`, opts);
  const map = new Map();
  for (const h of hadiths) {
    if (!h.text?.trim()) continue;
    const num = String(SUNNAH_NUMBER_OVERRIDES[`${col}:${h.hadithnumber}`] || toSunnahNumber(col, h.hadithnumber, h.arabicnumber));
    map.set(num, map.has(num) ? `${map.get(num)} ${h.text}` : h.text);
  }
  return map;
}

export const stripTashkil = s => String(s ?? '')
  .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u200c-\u200f]/g, '')
  .replace(/[\s\u00a0]+/g, ' ')
  .trim();

export const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? (process.argv[i + 1] ?? true) : null; };
