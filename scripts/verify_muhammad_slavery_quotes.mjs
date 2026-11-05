#!/usr/bin/env node
/**
 * Network check (run before shipping; record the result in the review REPORT): every hadith source the
 * "Muhammad and slavery" pages can quote must match the fawazahmed0 mirror of Sunnah.com.
 *
 *   node --experimental-sqlite scripts/verify_muhammad_slavery_quotes.mjs [--cache <dir>]
 *
 * The build already proves that every rendered hadith quote (report cards, key quotes, showcases, prose
 * quotations, Start here) is contained in an entry of the model's source map: dataset reports with
 * QUOTE_FIXES applied, plus EXTRA_TEXTS. So this script verifies the SOURCES, and every quote is covered
 * transitively (ia_r1_response.md P0-1.3, code_review.md P1-6):
 *   English  the whole source text, word-for-word in `eng-<collection>` under its Sunnah.com number
 *            (quote marks, ʿayn/backticks and spacing normalised: the fact-checkers' rule)
 *   Arabic   arabic.js / EXTRA_TEXTS Arabic contained in `ara-<collection>`, tashkīl and tatweel removed
 * Exits 1 on any mismatch.
 */
import { ROOT, arg, loadModel, mirrorIndex, stripTashkil } from './muhammad_slavery/lib.mjs';
import { containsQuote } from '../src/utils/muhammadSlavery/text.js';

process.chdir(ROOT);
const cache = arg('--cache') || undefined;
const { model } = loadModel();
const sources = [...model.hadithSources];

const indexes = {};
const index = async (col, lang) => (indexes[`${lang}-${col}`] ||= await mirrorIndex(col, lang, { cache }));
const arNorm = s => stripTashkil(s).replace(/[\u200e\u200f"'«»“”.,،؛:‏]/g, ' ').replace(/\s+/g, ' ').trim();

let bad = 0;
let arabic = 0;
for (const [key, s] of sources) {
  const [col, num] = key.split(':');
  const eng = (await index(col, 'eng')).get(num);
  if (!eng) { bad++; console.error(`  ✗ ${key}: not found in eng-${col}`); }
  else if (!containsQuote(eng, s.text)) { bad++; console.error(`  ✗ ${key}: English is not verbatim in eng-${col}: "${s.text.slice(0, 100)}…"`); }
  if (!s.arabic) continue;
  arabic++;
  const ara = (await index(col, 'ara')).get(num);
  if (!ara) { bad++; console.error(`  ✗ ${key}: not found in ara-${col}`); }
  else if (!arNorm(ara).includes(arNorm(s.arabic))) { bad++; console.error(`  ✗ ${key}: Arabic differs from ara-${col}: "${s.arabic.slice(0, 60)}…"`); }
}
const cols = [...new Set(sources.map(([key]) => key.split(':')[0]))];
console.log(`${sources.length} hadith sources (${arabic} with Arabic) checked against the fawazahmed0 mirror (${cols.join(', ')}): ${bad} mismatch(es)`);
process.exit(bad ? 1 : 0);
