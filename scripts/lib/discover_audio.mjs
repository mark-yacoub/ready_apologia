// Shared by scripts/add_discover_audio.mjs and src/utils/discoverAudio.test.mjs.
// Knows the on-disk contract of the Discover audio registry (src/utils/discoverAudio.js).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const REGISTRY = path.join(ROOT, 'src/utils/discoverAudio.js');
export const START = '// @audio-entries-start';
export const END = '// @audio-entries-end';
/** Exactly the line shape the script writes; the unit test fails on any other shape. */
export const ENTRY_RE = /^  '([a-z0-9-]+(?:\/[a-z0-9-]+)*)': \{ durationSec: (\d+), version: (\d+)(?:, cover: '(\/[^']+)')? \},$/;
export const KEY_RE = /^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/;

export const mediaFileFor = key => path.join(ROOT, 'public/media/audio', `${key}.m4a`);

/** Page source for a /discover/<key> URL: 'static' file, 'dynamic' ([param].astro sibling), or null. */
export function pageSourceFor(key) {
  const base = path.join(ROOT, 'src/pages/discover', key);
  if (fs.existsSync(`${base}.astro`) || fs.existsSync(path.join(base, 'index.astro'))) return 'static';
  const dir = path.dirname(base);
  if (dir !== path.join(ROOT, 'src/pages/discover') && fs.existsSync(dir)
      && fs.readdirSync(dir).some(f => /^\[[^\]]+\]\.astro$/.test(f))) return 'dynamic';
  return null;
}

/** Split the registry into [before, entryLines, after]; throws if the markers are missing. */
export function readBlock(src = fs.readFileSync(REGISTRY, 'utf8')) {
  const a = src.indexOf(START), b = src.indexOf(END);
  if (a < 0 || b < a) throw new Error(`registry markers missing in ${REGISTRY}`);
  const startEol = src.indexOf('\n', a) + 1;
  const endSol = src.lastIndexOf('\n', b) + 1;
  const lines = src.slice(startEol, endSol).split('\n').filter(l => l.trim() !== '');
  return { before: src.slice(0, startEol), lines, after: src.slice(endSol) };
}

export function parseEntries(lines) {
  return lines.map(l => {
    const m = ENTRY_RE.exec(l);
    if (!m) throw new Error(`registry line has an unexpected shape (run the script instead of hand-editing): ${l}`);
    return { key: m[1], durationSec: Number(m[2]), version: Number(m[3]), cover: m[4] || null };
  });
}

export const formatEntry = e =>
  `  '${e.key}': { durationSec: ${e.durationSec}, version: ${e.version}${e.cover ? `, cover: '${e.cover}'` : ''} },`;

export function probe(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,bit_rate:stream=codec_name,channels',
    '-of', 'json', file], { encoding: 'utf8' });
  const j = JSON.parse(out);
  const st = (j.streams || []).find(s => s.codec_name) || {};
  return { duration: Number(j.format?.duration), bitRate: Number(j.format?.bit_rate), codec: st.codec_name, channels: st.channels };
}

export function hasFfprobe() {
  try { execFileSync('ffprobe', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; }
}

/** The index (moov) must precede the audio data (mdat) so playback starts before the download ends. */
export function isFaststart(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const buf = Buffer.alloc(16);
    let off = 0;
    const size = fs.fstatSync(fd).size;
    while (off < size) {
      fs.readSync(fd, buf, 0, 16, off);
      let len = buf.readUInt32BE(0);
      const type = buf.toString('latin1', 4, 8);
      if (type === 'moov') return true;
      if (type === 'mdat') return false;
      if (len === 1) len = Number(buf.readBigUInt64BE(8));
      if (len < 8) return false;
      off += len;
    }
    return false;
  } finally { fs.closeSync(fd); }
}
