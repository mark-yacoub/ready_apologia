#!/usr/bin/env node
/**
 * Imports the "How Reliable Are the Hadith?" dataset into the repository.
 *
 * This is the ONLY sanctioned way to refresh src/data/discover/islam/scripture/hadith_reliability/.
 * The data-collection agent owns the source file; never hand-edit the copy.
 *
 *   source: ~/Documents/data_collection/islamicdata/articles/hadithreliability/final_output/
 *             hadith_reliability_overview.json   (self-contained: every layer of every case)
 *             verification_report.json            (optional: link verdicts from the verification workflow)
 *   target: src/data/discover/islam/scripture/hadith_reliability/
 *
 * Usage: node scripts/import_hadith_reliability.js [--src <dir>] [--report <verification_report.json>]
 *   --report  use a link-verification report from elsewhere (e.g. the verification workflow's
 *             scratch output) instead of the one in --src.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDataset, printValidation } from '../src/utils/hadithReliability/validate.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcFlag = process.argv.indexOf('--src');
const SRC = srcFlag > -1
  ? path.resolve(process.argv[srcFlag + 1])
  : path.join(os.homedir(), 'Documents/data_collection/islamicdata/articles/hadithreliability/final_output');
const DEST = path.join(ROOT, 'src/data/discover/islam/scripture/hadith_reliability');

const FILES = [
  { name: 'hadith_reliability_overview.json', required: true },
  { name: 'verification_report.json', required: false },
];
/** Files written by earlier imports that the article no longer reads. */
const OBSOLETE = ['hadith_reliability_overview_core.json', 'hadith_reliability_deep_dives.json'];

fs.mkdirSync(DEST, { recursive: true });

const reportFlag = process.argv.indexOf('--report');
const REPORT_OVERRIDE = reportFlag > -1 ? path.resolve(process.argv[reportFlag + 1]) : null;

for (const { name, required } of FILES) {
  const from = name === 'verification_report.json' && REPORT_OVERRIDE ? REPORT_OVERRIDE : path.join(SRC, name);
  if (!fs.existsSync(from)) {
    if (required) {
      console.error(`[import_hadith_reliability] missing required source file: ${from}`);
      process.exit(1);
    }
    console.log(`  skip   ${name} (not present in source)`);
    continue;
  }
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(from, 'utf8'));
  } catch (e) {
    console.error(`[import_hadith_reliability] ${name} is not valid JSON: ${e.message}`);
    process.exit(1);
  }
  // Enforce the dataset contract BEFORE anything lands in src/data (see src/utils/hadithReliability/validate.js).
  if (name === 'hadith_reliability_overview.json') {
    const result = validateDataset(parsed);
    if (!printValidation(result)) {
      console.error(`\n[import_hadith_reliability] ${result.errors.length} contract error(s); nothing was imported. Send these to the data agent.`);
      process.exit(1);
    }
    if (result.warnings.length) console.log(`  ${result.warnings.length} warning(s) above: check them on the rendered pages.`);
  }
  fs.copyFileSync(from, path.join(DEST, name));
  console.log(`  copy   ${name}`);
}

for (const name of OBSOLETE) {
  const p = path.join(DEST, name);
  if (fs.existsSync(p)) {
    fs.rmSync(p);
    console.log(`  prune  ${name}`);
  }
}

const data = JSON.parse(fs.readFileSync(path.join(DEST, 'hadith_reliability_overview.json'), 'utf8'));
const subpoints = data.arguments.flatMap(a => a.subpoints);
const has = key => subpoints.filter(s => s[key] != null).length;
const structuredQuotes = subpoints.flatMap(s => s.evidence_items || []).filter(e => e.key_arabic_quote_structured).length;
console.log(`\n  schema_version  ${data.schema_version}`);
console.log(`  arguments       ${data.arguments.length} (reader_question: ${data.arguments.filter(a => a.reader_question).length})`);
console.log(`  cases           ${subpoints.length} (showcase: ${has('showcase')}, takeaway: ${has('takeaway')})`);
const reportPath = path.join(DEST, 'verification_report.json');
if (fs.existsSync(reportPath)) {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  console.log(`  link report     ${report.generated_at} ${JSON.stringify(report.counts)} (broken links render as plain text; mismatches fail the static audit)`);
}
console.log(`  evidence items  ${subpoints.reduce((n, s) => n + (s.evidence_items?.length || 0), 0)} (structured quotes: ${structuredQuotes})`);
const sha256 = crypto.createHash('sha256').update(fs.readFileSync(path.join(DEST, 'hadith_reliability_overview.json'))).digest('hex');
console.log(`  sha256          ${sha256}  (confirm against the data agent's hash)`);
