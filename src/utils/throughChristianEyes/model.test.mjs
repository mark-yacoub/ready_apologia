// node --test src/utils/throughChristianEyes/model.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { inlineHtml, ownVoice, loadThroughChristianEyes } from './model.js';
import { LINKS, SECTIONS } from './content.js';

test('the copy passes every build-time check', () => {
  const m = loadThroughChristianEyes();
  assert.equal(m.sections.length, SECTIONS.length);
});

test('quotations get the quotation face, highlights stay inside them', () => {
  const html = inlineHtml('he said “the middle prayer ==and the afternoon prayer==” ([Muslim 629](https://sunnah.com/muslim:629))');
  assert.match(html, /<span class="tce-q">“the middle prayer <mark class="tce-hl">and the afternoon prayer<\/mark>”<\/span>/);
  assert.match(html, /href="https:\/\/sunnah\.com\/muslim:629" target="_blank" rel="noopener noreferrer"/);
});

test('site links are internal and keep their #anchor', () => {
  const html = inlineHtml('[2:184](/quran/codex/ibn-abbas#codex-2-184-ibn-abbas)');
  assert.match(html, /href="\/quran\/codex\/ibn-abbas#codex-2-184-ibn-abbas"/);
  assert.doesNotMatch(html, /target="_blank"/);
});

test('our voice excludes quotations, so a quoted "really" is allowed and an unquoted one is not', () => {
  assert.doesNotMatch(ownVoice('“he had not really done” ([Bukhārī 5763](/x))'), /really/);
  assert.match(ownVoice('this really happened'), /really/);
});

test('every "Go deeper" points at a known site page', () => {
  const m = loadThroughChristianEyes();
  const deepers = m.sections.flatMap((s) => s.blocks.filter((b) => b.kind === 'deeper'));
  assert.ok(deepers.length > 0);
  for (const d of [...deepers, m.aside.deeper]) assert.ok(Object.values(LINKS).includes(d.path), d.path);
});
