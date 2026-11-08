#!/usr/bin/env node
/**
 * Static audit of the built apologist pages (run after `astro build`):
 *
 *   node scripts/test_apologist_pages.mjs [--dist dist] [--allow-sliced]
 *
 * - /apologists and every /apologists/<slug>: exactly one <h1>, no <iframe> (thumbnails only), every
 *   <img> lazy, HTML under the size budget.
 * - Channel buttons: exactly the registry channels of that person (src/data/apologists.js), never more.
 * - "First answer on N verses": every listed verse opens a /videos tab whose FIRST video is one of
 *   this person's clips (the claim checked against what readers see, not against the loader).
 * - Every verse link in the page payload points at a built /videos page (skipped with --allow-sliced,
 *   for BUILD_BOOKS/BUILD_SURAHS builds).
 */
import fs from 'node:fs';
import path from 'node:path';
import { APOLOGIST_BY_SLUG, channelUrl } from '../src/data/apologists.js';
import { verseHref } from '../src/components/apologists/apologistView.js';

const args = process.argv.slice(2);
const DIST = path.resolve(args.includes('--dist') ? args[args.indexOf('--dist') + 1] : 'dist');
const ALLOW_SLICED = args.includes('--allow-sliced');
const MAX_HTML_BYTES = 400_000;

const failures = [];
const fail = (msg) => failures.push(msg);
const read = (rel) => fs.readFileSync(path.join(DIST, rel), 'utf8');
const pageExists = (href) => fs.existsSync(path.join(DIST, href.replace(/^\/+|\/+$/g, ''), 'index.html'));
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

function checkCommon(rel, html) {
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fail(`${rel}: ${h1} <h1>`);
  if (/<iframe[\s>]/.test(html)) fail(`${rel}: has an <iframe> (thumbnails only; the reel loads players on tap)`);
  for (const img of html.match(/<img\b[^>]*\bsrc="https:\/\/i\.ytimg\.com\/[^>]*>/g) || []) {
    if (!/\bloading="lazy"/.test(img)) fail(`${rel}: thumbnail without loading="lazy": ${img.slice(0, 120)}`);
  }
  const bytes = Buffer.byteLength(html);
  if (bytes > MAX_HTML_BYTES) fail(`${rel}: ${bytes} bytes > budget ${MAX_HTML_BYTES}`);
  return bytes;
}

const dir = path.join(DIST, 'apologists');
if (!fs.existsSync(dir)) {
  console.error(`✗ ${dir} not found: run the build first`);
  process.exit(1);
}

const indexHtml = read('apologists/index.html');
checkCommon('apologists/index.html', indexHtml);
const slugs = fs.readdirSync(dir).filter((d) => fs.existsSync(path.join(dir, d, 'index.html')));
const indexData = JSON.parse(indexHtml.match(/<script type="application\/json" id="apg-index-data">([\s\S]*?)<\/script>/)[1]);
const indexSlugs = indexData.people.map((p) => p.s).sort();
if (JSON.stringify(indexSlugs) !== JSON.stringify([...slugs].sort())) fail('apologists/index.html: index list != built pages');

let firstChecked = 0;
let biggest = { rel: '', bytes: 0 };
for (const slug of slugs) {
  const rel = `apologists/${slug}/index.html`;
  const html = read(rel);
  const bytes = checkCommon(rel, html);
  if (bytes > biggest.bytes) biggest = { rel, bytes };

  // Channel buttons = registry channels, in order.
  const expected = (APOLOGIST_BY_SLUG.get(slug)?.channels || []).map(channelUrl);
  const actual = [...html.matchAll(/<a class="apg-channel" href="([^"]+)"/g)].map((m) => decode(m[1]));
  if (JSON.stringify(actual) !== JSON.stringify(expected)) fail(`${rel}: channel buttons ${JSON.stringify(actual)} != registry ${JSON.stringify(expected)}`);

  const m = html.match(/<script type="application\/json" id="apg-data-[^"]+">([\s\S]*?)<\/script>/);
  if (!m) { fail(`${rel}: no page payload`); continue; }
  const payload = JSON.parse(m[1]);
  const clips = new Set(payload.clips.map((c) => c.v));

  // First answers: the verse tab's first video is this person's clip.
  const section = html.match(/<section class="apg-first"[\s\S]*?<\/section>/);
  for (const [, raw] of section ? section[0].matchAll(/href="([^"]+)"/g) : []) {
    const href = decode(raw);
    firstChecked += 1;
    if (!pageExists(href)) { if (!ALLOW_SLICED) fail(`${rel}: first answer ${href} has no built page`); continue; }
    const tab = read(path.join(href, 'index.html'));
    const first = tab.match(/youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]+)/)?.[1];
    if (!first || !clips.has(first)) fail(`${rel}: "first answer" ${href}, but that tab's first video is ${first || 'none'}`);
  }

  // Every verse link the island renders resolves to a built page.
  if (!ALLOW_SLICED) {
    for (const v of payload.verses) {
      const href = verseHref(payload.books, v, '');
      if (!pageExists(href)) fail(`${rel}: verse link ${href} has no built page`);
    }
  }
}

if (failures.length) {
  for (const f of failures.slice(0, 50)) console.error(`✗ ${f}`);
  if (failures.length > 50) console.error(`… and ${failures.length - 50} more`);
  console.error(`✗ apologist pages: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log(`✓ apologist pages: ${slugs.length} pages + index; ${firstChecked} "first answer" links match their /videos tab; largest ${biggest.rel} (${biggest.bytes} bytes)`);
