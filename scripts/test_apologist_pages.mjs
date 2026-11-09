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
 * - Featured only: the built /apologists/<slug> pages are exactly FEATURED_APOLOGISTS (src/data/apologists.js).
 *   Across the whole site, every /apologists/<slug> link points at a featured page, and every credit
 *   link on a video card points at a page whose payload lists that clip (so a folded person's clips,
 *   e.g. Seth Postell's on /apologists/one-for-israel, are checked from the verse tabs). People without
 *   a page are credited as plain text (`.video-credit-name` / `span.apologist-badge`).
 */
import fs from 'node:fs';
import path from 'node:path';
import { APOLOGIST_BY_SLUG, FEATURED_APOLOGISTS, channelUrl } from '../src/data/apologists.js';
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
const featured = FEATURED_APOLOGISTS.map((f) => f.slug).sort();
if (JSON.stringify(featured) !== JSON.stringify([...slugs].sort())) {
  fail(`built pages != FEATURED_APOLOGISTS: extra [${slugs.filter((s) => !featured.includes(s))}], missing [${featured.filter((s) => !slugs.includes(s))}]`);
}
const featuredSet = new Set(featured);
const pageClips = new Map(); // slug → Set(videoId) from the page payload

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
  pageClips.set(slug, clips);
  for (const c of payload.clips) for (const [s] of c.w || []) if (s !== null && !featuredSet.has(s)) fail(`${rel}: "with" link to non-featured ${s}`);

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

// Site-wide: links into /apologists/ and the credit line / badges on every video card.
const linkRe = /href="(?:https:\/\/readyapologia\.com)?\/apologists\/([^"/?#]+)\/?"/g;
let pagesScanned = 0;
let creditLinksChecked = 0;
let plainCredits = 0;
let foldedChecked = 0;
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith('.html')) scanPage(full);
  }
}
function scanPage(full) {
  const html = fs.readFileSync(full, 'utf8');
  pagesScanned += 1;
  const rel = path.relative(DIST, full);
  plainCredits += (html.match(/class="video-credit-name"|<span class="apologist-badge"/g) || []).length;
  if (!html.includes('/apologists/')) return;
  for (const [, slug] of html.matchAll(linkRe)) {
    if (!featuredSet.has(slug)) fail(`${rel}: links to /apologists/${slug}, which is not a featured page`);
  }
  // Video cards: every credit link's page must list that clip.
  for (const card of html.split(/class="video-card"/).slice(1)) {
    const vid = card.match(/youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]+)/)?.[1];
    if (!vid) continue;
    const credit = card.match(/<p class="video-credit"[^>]*>([\s\S]*?)<\/p>|<div class="apologist-name"[^>]*>([\s\S]*?)<\/div>/);
    if (!credit) continue;
    for (const [, slug, name] of (credit[1] || credit[2]).matchAll(/<a[^>]*href="\/apologists\/([^"/]+)\/?"[^>]*>([^<]*)<\/a>/g)) {
      creditLinksChecked += 1;
      if (/ · /.test(name)) foldedChecked += 1;
      if (featuredSet.has(slug) && !pageClips.get(slug)?.has(vid)) fail(`${rel}: credit "${decode(name)}" → /apologists/${slug}, but that page does not list clip ${vid}`);
    }
  }
}
walk(DIST);
if (!creditLinksChecked) fail('no credit links found on any video card');
if (!plainCredits) fail('no plain-text credits found: people without a page should still be named');
if (!foldedChecked) fail('no folded credit ("<name> · <page>") found, e.g. Seth Postell · ONE FOR ISRAEL');

if (failures.length) {
  for (const f of failures.slice(0, 50)) console.error(`✗ ${f}`);
  if (failures.length > 50) console.error(`… and ${failures.length - 50} more`);
  console.error(`✗ apologist pages: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log(`✓ apologist pages: ${slugs.length} pages + index (= FEATURED_APOLOGISTS); ${firstChecked} "first answer" links match their /videos tab; largest ${biggest.rel} (${biggest.bytes} bytes)`);
console.log(`✓ site-wide: ${pagesScanned} HTML files; every /apologists/ link is featured; ${creditLinksChecked} credit links list their clip (${foldedChecked} folded); ${plainCredits} plain-text credits`);
