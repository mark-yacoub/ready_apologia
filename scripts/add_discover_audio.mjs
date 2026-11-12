#!/usr/bin/env node
/**
 * Add or replace a Discover page's audio overview. The ONE command for new episodes:
 *
 *   node scripts/add_discover_audio.mjs <page-path> <input-audio-file> [--cover /media/…jpg]
 *
 *   <page-path>  the page URL after /discover/, e.g. quran-preservation, hadith-reliability/<case>
 *
 * Converts to AAC MONO 64 kbps / 44.1 kHz / -16 LUFS / +faststart, writes
 * public/media/audio/<page-path>.m4a, and upserts the entry in src/utils/discoverAudio.js
 * (durationSec from ffprobe; version 1 if new, +1 if replacing). Exits non-zero, changing nothing,
 * on any problem. See the header of src/utils/discoverAudio.js.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  ROOT, REGISTRY, KEY_RE, mediaFileFor, pageSourceFor, readBlock, parseEntries, formatEntry, probe, hasFfprobe, isFaststart,
} from './lib/discover_audio.mjs';

const die = msg => { console.error(`✗ ${msg}`); process.exit(1); };
const args = process.argv.slice(2);
const coverIdx = args.indexOf('--cover');
const cover = coverIdx >= 0 ? args.splice(coverIdx, 2)[1] : null;
const [rawKey, input] = args;
if (!rawKey || !input) die('usage: node scripts/add_discover_audio.mjs <page-path> <input-audio-file> [--cover /media/…]');

const key = rawKey.replace(/^\/?(discover\/)?/, '').replace(/\/$/, '');
if (!KEY_RE.test(key)) die(`page-path "${rawKey}" must look like quran-preservation or hadith-reliability/<case> (lowercase, a-z 0-9 -)`);
const kind = pageSourceFor(key);
if (!kind) die(`no Discover page for /discover/${key} (looked in src/pages/discover/)`);
const inputAbs = path.resolve(input.replace(/^~(?=\/)/, process.env.HOME));
if (!fs.existsSync(inputAbs)) die(`input file not found: ${inputAbs}`);
if (cover && !fs.existsSync(path.join(ROOT, 'public', cover))) die(`cover not found: public${cover}`);
if (!hasFfprobe()) die('ffmpeg/ffprobe are required (sudo apt install ffmpeg)');

// Parse the registry before touching anything, so a malformed registry changes nothing.
const block = readBlock();
const entries = parseEntries(block.lines);

const out = mediaFileFor(key);
const tmp = `${out}.tmp.m4a`;
fs.mkdirSync(path.dirname(out), { recursive: true });
// A killed earlier run (Ctrl-C, cancelled agent) can leave temp files behind; remove them first.
for (const f of fs.readdirSync(path.join(ROOT, 'public/media/audio'), { recursive: true })) {
  if (String(f).endsWith('.tmp.m4a')) fs.rmSync(path.join(ROOT, 'public/media/audio', String(f)), { force: true });
}
console.log(`• encoding ${path.basename(inputAbs)} → public/media/audio/${key}.m4a (AAC mono 64 kbps, -16 LUFS, faststart)…`);
try {
  execFileSync('ffmpeg', ['-nostdin', '-loglevel', 'error', '-y', '-i', inputAbs,
    '-vn', '-ac', '1', '-c:a', 'aac', '-b:a', '64k', '-ar', '44100',
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
    '-movflags', '+faststart', '-map_metadata', '-1', tmp], { stdio: 'inherit' });
} catch { fs.rmSync(tmp, { force: true }); die('ffmpeg failed'); }

const info = probe(tmp);
const problems = [];
if (info.codec !== 'aac') problems.push(`codec ${info.codec} (want aac)`);
if (info.channels !== 1) problems.push(`${info.channels} channels (want mono)`);
if (!(info.duration > 0)) problems.push('no duration');
if (!isFaststart(tmp)) problems.push('moov atom not before mdat (faststart)');
if (problems.length) { fs.rmSync(tmp, { force: true }); die(`encoded file failed checks: ${problems.join(', ')}`); }
fs.renameSync(tmp, out);
fs.chmodSync(out, 0o644);

const durationSec = Math.round(info.duration);
const prev = entries.find(e => e.key === key);
const next = { key, durationSec, version: prev ? prev.version + 1 : 1, cover: cover || prev?.cover || null };
const all = [...entries.filter(e => e.key !== key), next].sort((a, b) => a.key.localeCompare(b.key));
fs.writeFileSync(REGISTRY, block.before + all.map(formatEntry).join('\n') + '\n' + block.after);

const mb = (fs.statSync(out).size / 1e6).toFixed(1);
console.log(`✓ public/media/audio/${key}.m4a  ${mb} MB, ${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}, mono`);
console.log(`✓ ${path.relative(ROOT, REGISTRY)}: ${prev ? `replaced (version ${prev.version} → ${next.version}; listeners' old resume points are dropped)` : 'added (version 1)'}`);
if (!next.cover) console.log('  (no --cover: the lock screen shows the site logo)');
if (kind === 'dynamic') console.log(`  /discover/${key} is a dynamic route: the audit after the build confirms the page exists.`);
console.log(`
Next:
  npm run test:discover-audio
  NODE_OPTIONS=--experimental-sqlite astro build   (see AGENTS.md for the node path)
  npm run audit:discover-audio`);
