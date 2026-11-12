#!/usr/bin/env node
/**
 * Built-HTML audit for Discover audio (npm run audit:discover-audio, after `astro build`).
 *   For every registry entry: the page exists in dist, renders exactly one player root with the
 *   right <audio src>, has a way to open it (bar icon or floating button), and keeps one <h1>.
 *   For Discover pages without an entry: no player markup at all.
 *   usage: node scripts/test_discover_audio.mjs [--dist <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { DISCOVER_AUDIO, episodeFor } from '../src/utils/discoverAudio.js';
import { ROOT } from './lib/discover_audio.mjs';

const i = process.argv.indexOf('--dist');
const DIST = path.resolve(i > 0 ? process.argv[i + 1] : path.join(ROOT, 'dist'));
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const count = (s, re) => (s.match(re) || []).length;
const htmlFor = key => {
  for (const f of [path.join(DIST, 'discover', key, 'index.html'), path.join(DIST, 'discover', `${key}.html`)]) if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
  return null;
};

let checked = 0;
for (const key of Object.keys(DISCOVER_AUDIO)) {
  const ep = episodeFor(key);
  const html = htmlFor(key);
  ok(html, `/discover/${key}: not in ${path.relative(ROOT, DIST)} (wrong page-path, or a sliced build skipped it)`);
  if (!html) continue;
  checked++;
  ok(count(html, /data-ra-audio(?=[\s>])/g) === 1, `/discover/${key}: expected exactly one player root`);
  ok(new RegExp(`<audio[^>]+src="[^"]*${ep.src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(html), `/discover/${key}: <audio src> is not ${ep.src}`);
  ok(html.includes(`data-id="${ep.id}"`), `/discover/${key}: data-id is not ${ep.id}`);
  const barButtons = count(html, /class="hrv-iconbtn rap-open"/g);
  const listenButtons = count(html, /class="rap-listen"(?=[^>]*data-ra-audio-open)/g) - count(html, /<template data-rap-listen-tpl>/g);
  ok(barButtons <= 1, `/discover/${key}: ${barButtons} bar icons (wrap only the page's main copy-link button)`);
  ok(listenButtons <= 1, `/discover/${key}: ${listenButtons} <AudioListen> buttons (use one, under the <h1>)`);
  ok(barButtons + listenButtons >= 1,
    `/discover/${key}: no server-rendered open button. Wrap the bar's copy-link button in <AudioButton>, or put <AudioListen /> right under the <h1> (the JS fallback works but shifts the layout).`);
  ok(count(html, /<h1[\s>]/g) === 1, `/discover/${key}: must keep exactly one <h1>`);
  console.log(`  ${barButtons ? 'bar icon        ' : 'under the <h1>  '} /discover/${key}`);
}

// Discover pages without an entry must not carry player markup.
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : e.name === 'index.html' ? [path.join(d, e.name)] : []);
const discoverDir = path.join(DIST, 'discover');
if (fs.existsSync(discoverDir)) {
  for (const f of walk(discoverDir)) {
    const key = path.relative(discoverDir, path.dirname(f)).replace(/\\/g, '/');
    if (!key || DISCOVER_AUDIO[key]) continue;
    const html = fs.readFileSync(f, 'utf8');
    ok(!/data-ra-audio/.test(html), `/discover/${key}: has player markup but no registry entry`);
  }
} else fails.push(`no ${path.relative(ROOT, discoverDir)}: build first`);

if (fails.length) { console.error(`\n✗ ${fails.length} problem(s):\n  - ${fails.join('\n  - ')}`); process.exit(1); }
console.log(`\n✓ discover audio: ${checked} episode page(s) OK, other Discover pages clean`);
