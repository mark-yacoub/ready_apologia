/**
 * The repo's own corpora as the lookup functions model.js expects (no JSON imports, so plain
 * `node` can run the unit test and the static audit): sūra types (src/data/quran/arabic/meta.json),
 * Qurʾān English (Droge) and Arabic (Ḥafṣ), tafsīr (al-Ṭabarī, Ibn Kathīr) and the Bukhārī/Muslim corpus.
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadIslamicCommentaries } from '../islamic_commentaries_loader.js';
import { toSunnahNumber } from '../hadithText.js';
import { SUNNAH_NUMBER_OVERRIDES } from '../hadith_config.js';

// The repo root is the working directory (Astro builds and the scripts run from it), read at call time so
// a caller may chdir after importing this module.
const root = () => process.cwd();
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root(), rel), 'utf8'));

/** Repo corpora as the small lookup functions model.js expects (all lazy, all memoised). */
export function repoProviders() {
  const suraMeta = readJson('src/data/quran/arabic/meta.json');
  const types = new Map(suraMeta.map(s => [Number(s.id), s.type]));
  const suraCounts = { meccan: 0, medinan: 0 };
  for (const t of types.values()) if (t in suraCounts) suraCounts[t] += 1;

  let english = null;
  const arabic = new Map();
  const quranVerse = (s, a) => {
    english ||= readJson('src/data/quran/english/droge_translation.json');
    if (!arabic.has(s)) {
      const file = path.join(root(), 'src/data/quran/arabic/surahs', `${s}.json`);
      arabic.set(s, fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).verses || {} : {});
    }
    const en = english[`${s}:${a}`]?.text;
    const ar = arabic.get(s)[String(a)];
    return en || ar ? { en: en || null, ar: ar || null } : null;
  };

  const tafsir = (id, s, a) => loadIslamicCommentaries()[`${s}:${a}`]?.find(e => e.id === id)?.commentary || null;

  let corpus = null;
  const hadithCorpus = key => {
    if (!corpus) {
      corpus = new Map();
      const file = path.join(root(), 'src/data/hadith/sahih_fulltext.json');
      const raw = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
      for (const [k, h] of Object.entries(raw)) {
        const coll = k.split(':')[0];
        const num = SUNNAH_NUMBER_OVERRIDES[k] || toSunnahNumber(coll, h.hadithnumber, h.arabicnumber);
        const sk = `${coll}:${num}`;
        // Two mirror numbers can map to one Sunnah.com number (combined entries): keep the first.
        if (!corpus.has(sk)) corpus.set(sk, { english: h.english, arabic: h.arabic });
      }
    }
    return corpus.get(key) || null;
  };

  return { suraType: s => types.get(Number(s)), suraCounts, quranVerse, tafsir, hadithCorpus };
}

