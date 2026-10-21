// node --test src/utils/hadithReliability/validate.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateDataset } from './validate.js';

const DATA = 'src/data/discover/islam/scripture/hadith_reliability/hadith_reliability_overview.json';
const load = () => JSON.parse(fs.readFileSync(DATA, 'utf8'));
const firstCase = d => d.arguments[0].subpoints[0];

test('the imported dataset satisfies the contract', () => {
  assert.deepEqual(validateDataset(load()).errors, []);
});

test('duplicate evidence cards are rejected', () => {
  const d = load();
  const c = firstCase(d);
  c.evidence_items.push(structuredClone(c.evidence_items[0]));
  assert.ok(validateDataset(d).errors.some(e => /duplicate of evidence_items\[0\]/.test(e)));
});

test('placeholder and relative markdown link targets are rejected', () => {
  const d = load();
  firstCase(d).summary_markdown += ' See [Fatḥ](shamela-link-123).';
  assert.ok(validateDataset(d).errors.some(e => /not https:\/\/ or \/: "shamela-link-123"/.test(e)));
});

test('global_rank must follow reading order', () => {
  const d = load();
  const [a, b] = d.arguments[0].subpoints;
  [a.global_rank, b.global_rank] = [b.global_rank, a.global_rank];
  assert.ok(validateDataset(d).errors.some(e => /global_rank is/.test(e)));
});

test('missing required arrays and unknown showcase types are rejected with a path', () => {
  const d = load();
  const c = firstCase(d);
  delete c.primary_references;
  c.showcase = { type: 'pie' };
  const { errors } = validateDataset(d);
  assert.ok(errors.some(e => /primary_references: required array/.test(e)));
  assert.ok(errors.some(e => /unknown showcase type "pie"/.test(e)));
});

test('a title count that matches neither the lead number nor the sum is a warning, not an error', () => {
  const d = load();
  const c = d.arguments.flatMap(a => a.subpoints).find(s => s.showcase.type === 'witnesses');
  c.short_title = `9 ${c.short_title.replace(/^\d+\s/, '')}`;
  const r = validateDataset(d);
  assert.deepEqual(r.errors, []);
  assert.ok(r.warnings.some(w => w.includes(c.id) && /title says 9/.test(w)));
});
