/**
 * Imports the Sahih Hadith apologetics dataset into the repository so CI can build it.
 *
 * Outputs (both treated as read-only data by the app):
 *   src/data/hadith/master_hadith_dataset.json  — verbatim copy of the curated dataset
 *   src/data/hadith/sahih_fulltext.json         — full Arabic + English text (plus book metadata)
 *                                                 for every annotated hadith, every parallel reference
 *                                                 and every hadith referenced in notes / defenses
 *
 * Usage:
 *   node scripts/import_hadith.js
 *   HADITH_DATASET_PATH=/path/master.json SAHIH_CORPUS_DIR=/path/sahih_corpus node scripts/import_hadith.js
 *
 * Exits non-zero if any referenced hadith is missing from the corpus.
 */
import fs from 'node:fs';
import path from 'node:path';
import { extractHadithRefs, findRange } from '../src/utils/hadithText.js';

const DATA_ROOT = '/usr/local/google/home/markyacoub/Documents/data_collection/islamicdata';
const DATASET_PATH = process.env.HADITH_DATASET_PATH
  || path.join(DATA_ROOT, 'hadithlabels/final_output/master_hadith_dataset.json');
const CORPUS_DIR = process.env.SAHIH_CORPUS_DIR || path.join(DATA_ROOT, 'sahih_corpus');
const DEST_DIR = './src/data/hadith';
const COLLECTIONS = ['bukhari', 'muslim'];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadCorpus(collection) {
  const result = {};
  for (const lang of ['eng', 'ara']) {
    const file = path.join(CORPUS_DIR, collection, `${lang}-${collection}.json`);
    const json = readJson(file);
    const map = new Map();
    for (const h of json.hadiths) map.set(String(h.hadithnumber), h);
    result[lang] = { map, sections: json.metadata?.sections || {} };
  }
  return result;
}

function main() {
  console.log(`Dataset: ${DATASET_PATH}`);
  console.log(`Corpus:  ${CORPUS_DIR}`);
  const dataset = readJson(DATASET_PATH);
  const corpus = Object.fromEntries(COLLECTIONS.map(c => [c, loadCorpus(c)]));

  const hadithKeys = Object.keys(dataset).filter(k => k !== 'directionToLlm');
  const needed = new Set(hadithKeys);
  for (const key of hadithKeys) {
    for (const ann of dataset[key]) {
      for (const ref of ann.parallel_references || []) needed.add(ref);
      // Same patterns and same prose fields the loader links (see renderMarkdown callers in
      // hadithLoader.js), so every rendered citation has a full text.
      const proseFields = [ann.note, ann.anticipated_defense, ann.translation_issue?.explanation];
      for (const field of proseFields) {
        for (const ref of extractHadithRefs(field)) needed.add(ref);
      }
    }
  }

  const fulltext = {};
  const missing = [];
  let excerptEn = 0;
  let excerptAr = 0;
  let annotations = 0;

  for (const key of needed) {
    const [collection, num] = key.split(':');
    const col = corpus[collection];
    const en = col?.eng.map.get(num);
    const ar = col?.ara.map.get(num);
    if (!en || !ar) {
      missing.push(key);
      continue;
    }
    fulltext[key] = {
      hadithnumber: en.hadithnumber,
      arabicnumber: en.arabicnumber ?? ar.arabicnumber ?? en.hadithnumber,
      book: en.reference?.book ?? null,
      bookTitle: col.eng.sections[String(en.reference?.book)] || '',
      inBookHadith: en.reference?.hadith ?? null,
      english: en.text || '',
      arabic: ar.text || '',
    };
  }

  for (const key of hadithKeys) {
    for (const ann of dataset[key]) {
      annotations++;
      // Same matcher the loader uses to anchor excerpts, so this report predicts build-time anchoring.
      const ft = fulltext[key];
      if (ft && findRange(ft.english, ann.problematic_excerpt?.english)) excerptEn++;
      if (ft && findRange(ft.arabic, ann.problematic_excerpt?.arabic, { arabic: true })) excerptAr++;
    }
  }

  fs.mkdirSync(DEST_DIR, { recursive: true });
  fs.writeFileSync(path.join(DEST_DIR, 'master_hadith_dataset.json'), JSON.stringify(dataset, null, 2));
  fs.writeFileSync(path.join(DEST_DIR, 'sahih_fulltext.json'), JSON.stringify(fulltext));

  console.log('\n--- Hadith import report ---');
  console.log(`Annotated hadiths:        ${hadithKeys.length}`);
  console.log(`Annotations:              ${annotations}`);
  console.log(`Full texts extracted:     ${Object.keys(fulltext).length} / ${needed.size}`);
  console.log(`English excerpts matched: ${excerptEn} / ${annotations}`);
  console.log(`Arabic excerpts matched:  ${excerptAr} / ${annotations}`);
  if (missing.length) {
    console.error(`❌ Missing from corpus (${missing.length}): ${missing.slice(0, 20).join(', ')}`);
    process.exit(1);
  }
  console.log('✓ Import complete');
}

main();
