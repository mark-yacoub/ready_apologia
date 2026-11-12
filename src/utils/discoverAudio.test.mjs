// node --test src/utils/discoverAudio.test.mjs   (npm run test:discover-audio)
// Contract of the Discover audio registry. Every check names the fix.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DISCOVER_AUDIO, AUDIO_LABELS, episodeFor, audioKeyFromPath, fmtClock, fmtMinutes } from './discoverAudio.js';
import { BODY, HEADLINE } from './quranPreservation/tone.js';
import { ROOT, readBlock, parseEntries, mediaFileFor, pageSourceFor, probe, hasFfprobe, isFaststart } from '../../scripts/lib/discover_audio.mjs';

const FIX = 're-encode with the ffmpeg command in the header of src/utils/discoverAudio.js';

test('managed block is script-shaped and matches the exported registry', () => {
  const entries = parseEntries(readBlock().lines);
  assert.deepEqual(entries.map(e => e.key), Object.keys(DISCOVER_AUDIO), 'registry object and managed block disagree');
  assert.deepEqual(entries.map(e => e.key), [...entries.map(e => e.key)].sort(), 'entries must be in alphabetical order (see the registry header)');
});

test('every entry points at a real Discover page', () => {
  for (const key of Object.keys(DISCOVER_AUDIO)) assert.ok(pageSourceFor(key), `/discover/${key}: no such page in src/pages/discover`);
});

test('every entry has its audio file, encoded mono AAC with faststart, and the right duration', { skip: !hasFfprobe() && 'ffprobe not installed' }, () => {
  for (const [key, e] of Object.entries(DISCOVER_AUDIO)) {
    const f = mediaFileFor(key);
    assert.ok(fs.existsSync(f), `${key}: missing public/media/audio/${key}.m4a (${FIX})`);
    const p = probe(f);
    assert.equal(p.codec, 'aac', `${key}: codec ${p.codec} (${FIX})`);
    assert.equal(p.channels, 1, `${key}: must be MONO, got ${p.channels} channels (${FIX})`);
    assert.ok(p.bitRate <= 80_000, `${key}: ${Math.round(p.bitRate / 1000)} kbps; expected ~64 (${FIX})`);
    assert.ok(isFaststart(f), `${key}: not faststart (${FIX})`);
    assert.ok(Math.abs(p.duration - e.durationSec) <= 1, `${key}: durationSec ${e.durationSec} vs file ${p.duration.toFixed(1)} (${FIX})`);
  }
});

test('covers exist; no stray audio files', () => {
  for (const [key, e] of Object.entries(DISCOVER_AUDIO)) {
    const ep = episodeFor(key);
    assert.ok(fs.existsSync(path.join(ROOT, 'public', ep.cover)), `${key}: cover ${ep.cover} not found`);
    assert.ok(Number.isInteger(e.version) && e.version >= 1, `${key}: version`);
  }
  const dir = path.join(ROOT, 'public/media/audio');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).filter(f => String(f).endsWith('.m4a')) : [];
  for (const f of files) {
    const key = String(f).replace(/\\/g, '/').replace(/\.m4a$/, '');
    assert.ok(DISCOVER_AUDIO[key], `public/media/audio/${f} is not in the registry (delete it or register it)`);
  }
});

test('URL → key', () => {
  assert.equal(audioKeyFromPath('/discover/quran-preservation', ''), 'quran-preservation');
  assert.equal(audioKeyFromPath('/discover/quran-preservation/', ''), 'quran-preservation');
  assert.equal(audioKeyFromPath('/ready_apologia/discover/hadith-reliability/x/', '/ready_apologia'), 'hadith-reliability/x');
  assert.equal(audioKeyFromPath('/discover', ''), null);
  assert.equal(audioKeyFromPath('/quran/1', ''), null);
  const ep = episodeFor(Object.keys(DISCOVER_AUDIO)[0]);
  assert.match(ep.id, /@v\d+$/);
  assert.equal(ep.src, `/media/audio/${ep.key}.m4a`);
});

test('labels pass the tone gate', () => {
  for (const [k, v] of Object.entries(AUDIO_LABELS)) assert.ok(!BODY.test(v) && !HEADLINE.test(v), `AUDIO_LABELS.${k}: "${v}"`);
});

test('time formatting', () => {
  assert.equal(fmtClock(0), '0:00');
  assert.equal(fmtClock(2267), '37:47');
  assert.equal(fmtClock(3700), '1:01:40');
  assert.equal(fmtMinutes(2267), '38 min');
});
