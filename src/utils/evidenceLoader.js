import fs from 'node:fs';
import path from 'node:path';
import { NT_TRANSLATION_ID } from './bible_config.js';

export function loadAllEvidenceData() {
  const evidenceDir = path.join(process.cwd(), 'src/data/evidence');
  const evidenceData = [];
  if (!fs.existsSync(evidenceDir)) return evidenceData;

  const scriptureCache = {};

  const getVerseText = (book, chapter, verse, isNT) => {
    const folder = isNT ? NT_TRANSLATION_ID : 'lxx2012';
    const cacheKey = `${folder}/${book}`;

    if (scriptureCache[cacheKey] === undefined) {
      const scripturePath = path.join(process.cwd(), 'src/data/scripture', folder, `${book}.json`);
      if (!fs.existsSync(scripturePath)) {
        scriptureCache[cacheKey] = null;
      } else {
        try {
          scriptureCache[cacheKey] = JSON.parse(fs.readFileSync(scripturePath, 'utf8'));
        } catch {
          scriptureCache[cacheKey] = null;
        }
      }
    }

    const bookData = scriptureCache[cacheKey];
    if (!bookData) return null;

    const chapData = bookData[chapter];
    if (!chapData || !Array.isArray(chapData)) return null;

    const verseObj = chapData.find(v => Object.keys(v)[0] === verse);
    return verseObj ? verseObj[verse] : null;
  };

  fs.readdirSync(evidenceDir).filter(f => f.endsWith('.json')).forEach(file => {
    try {
      const evidenceId = file.replace('.json', '');
      const evidenceObj = JSON.parse(fs.readFileSync(path.join(evidenceDir, file), 'utf8'));
      const verseTexts = {};

      ['Old Testament', 'New Testament'].forEach(test => {
        const isNT = test === 'New Testament';
        const bank = evidenceObj.Scripture?.[test]?.verse_bank;
        if (bank && typeof bank === 'object') {
          Object.keys(bank).forEach(vId => {
            const p = vId.split('_');
            if (p.length >= 3) {
              const book = p[0];
              const chapter = p[1];
              const verse = p.slice(2).join('_');
              const text = getVerseText(book, chapter, verse, isNT);
              if (text) verseTexts[vId] = text;
            }
          });
        }
      });

      if (Array.isArray(evidenceObj.prophecies)) {
        evidenceObj.prophecies.forEach(prophecy => {
          (prophecy.ot_verses || []).forEach(vId => {
            const p = vId.split('_');
            if (p.length >= 3) {
              const text = getVerseText(p[0], p[1], p.slice(2).join('_'), false);
              if (text) verseTexts[vId] = text;
            }
          });
          (prophecy.nt_fulfillments || []).forEach(nt => {
            (nt.verses || []).forEach(vId => {
              const p = vId.split('_');
              if (p.length >= 3) {
                const text = getVerseText(p[0], p[1], p.slice(2).join('_'), true);
                if (text) verseTexts[vId] = text;
              }
            });
          });
        });
      }

      evidenceData.push({ evidenceId, evidenceData: evidenceObj, verseTexts });
    } catch (err) {
      console.error(`Failed to load evidence file ${file}:`, err);
    }
  });

  const quranicDeficienciesData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/quran/verse_labels.json'), 'utf8'));

  evidenceData.push({
    evidenceId: 'quranic_deficiencies',
    evidenceData: {
      name: "Quranic Deficiencies",
      Scripture: { Quran: { structure: [] } }
    },
    verseTexts: {},
    totalCount: Object.keys(quranicDeficienciesData).length
  });

  const scientificData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/quran/scientific_errors/scientific_errors.json'), 'utf8'));

  evidenceData.push({
    evidenceId: 'scientific_errors',
    evidenceData: {
      name: "Scientific Errors",
      Scripture: { Quran: { structure: [] } }
    },
    verseTexts: {},
    totalCount: Object.keys(scientificData).length
  });

  return evidenceData;
}
