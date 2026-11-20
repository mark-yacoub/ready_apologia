#!/usr/bin/env node
/**
 * Static built-HTML audit for Quick Points (`npm run audit:quick-points`).
 *
 * Usage:
 *   node scripts/test_quick_points.mjs [--dist <dir>]
 *
 * Checks across all 11 supported Discover articles:
 *   (a) When `src/utils/quickPoints/<slug>.json` exists: EVERY built HTML page of that article
 *       has exactly one Quick Points toggle (`data-qk-root` / `data-qk-open`), located strictly
 *       before the first `<h1>`, plus one empty `<dialog class="qk-sheet">` shell and one
 *       `<script type="application/json" data-qk-data>` whose JSON parses and matches `loadQuickPoints(slug)`.
 *       When the JSON file is absent: zero Quick Points markup is emitted on that article's pages.
 *   (b) For EVERY point across all articles, the target page exists in `dist/` and, when `#hash` is
 *       present, an element with `id="<hash>"` exists in that target page's HTML (outside scripts/styles).
 *   (c) Point data JSON lives ONLY inside `<script type="application/json" data-qk-data>` — never in
 *       visible rendered page text, and the SSR `<dialog>` shell is empty before client open.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadQuickPoints, BASE } from '../src/utils/quickPoints/loader.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const distFlagIdx = args.indexOf('--dist');
const DIST = path.resolve(
  ROOT,
  distFlagIdx >= 0 && args[distFlagIdx + 1] ? args[distFlagIdx + 1] : 'dist',
);

export const QUICK_POINTS_ARTICLES = [
  'origins-of-revelation',
  'through-christian-eyes',
  'convenient-revelations',
  'islamic-dilemma',
  'from-mecca-to-medina',
  'quran-preservation',
  'hadith-reliability',
  'divinity-timeline',
  'extrabiblical-evidence-for-jesus',
  'muhammad-and-slavery',
  'trustworthiness-of-the-bible',
];

function stripBasePrefix(routePath) {
  if (BASE && routePath.startsWith(BASE)) {
    return routePath.slice(BASE.length) || '/';
  }
  return routePath;
}

function resolveDistHtmlFile(routePath) {
  const rel = stripBasePrefix(routePath).replace(/^\/+/, '').replace(/\/+$/, '');
  const indexCandidate = path.join(DIST, rel, 'index.html');
  if (fs.existsSync(indexCandidate)) return indexCandidate;
  const htmlCandidate = path.join(DIST, `${rel}.html`);
  if (fs.existsSync(htmlCandidate)) return htmlCandidate;
  return null;
}

function collectArticlePages(slug) {
  const pages = [];
  const dir = path.join(DIST, 'discover', slug);
  const flatFile = path.join(DIST, 'discover', `${slug}.html`);
  if (fs.existsSync(flatFile)) pages.push(flatFile);

  function walk(d) {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.isFile() && entry.name.endsWith('.html')) pages.push(p);
    }
  }
  walk(dir);
  return pages.sort();
}

function stripScriptsAndStyles(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
}

const idSetCache = new Map();
function getIdsInFile(filePath) {
  if (idSetCache.has(filePath)) return idSetCache.get(filePath);
  const html = fs.readFileSync(filePath, 'utf8');
  const clean = stripScriptsAndStyles(html);
  const ids = new Set();
  for (const m of clean.matchAll(/\bid=(?:"([^"]+)"|'([^']+)')/g)) {
    ids.add(m[1] ?? m[2]);
  }
  idSetCache.set(filePath, ids);
  return ids;
}

if (!fs.existsSync(DIST)) {
  console.error(`✗ dist directory not found at ${DIST}. Run astro build first.`);
  process.exit(1);
}

const failures = [];
let articlesWithData = 0;
let totalPagesChecked = 0;
let totalPointsChecked = 0;
let totalPointsResolved = 0;

for (const slug of QUICK_POINTS_ARTICLES) {
  let expected = null;
  try {
    expected = loadQuickPoints(slug);
  } catch (err) {
    failures.push(`${slug}: loader validation threw: ${err.message}`);
    continue;
  }

  const pages = collectArticlePages(slug);
  if (pages.length === 0) {
    failures.push(`${slug}: no built HTML pages found under ${path.join(DIST, 'discover', slug)}`);
    continue;
  }

  if (!expected) {
    // Graceful no-data mode: verify no pill/toggle is rendered
    for (const pageFile of pages) {
      totalPagesChecked += 1;
      const rel = path.relative(DIST, pageFile);
      const html = fs.readFileSync(pageFile, 'utf8');
      if (/data-qk-root|data-qk-open|data-qk-data/.test(html)) {
        failures.push(`${rel}: Quick Points JSON is missing for "${slug}", yet Quick Points markup rendered`);
      }
    }
    continue;
  }

  articlesWithData += 1;
  const expectedJsonStr = JSON.stringify(expected);

  // (a) & (c): Check every page of this article
  for (const pageFile of pages) {
    totalPagesChecked += 1;
    const rel = path.relative(DIST, pageFile);
    const html = fs.readFileSync(pageFile, 'utf8');

    const rootMatches = [...html.matchAll(/<div\b[^>]*\bdata-qk-root\b[^>]*>/g)];
    const openMatches = [...html.matchAll(/<button\b[^>]*\bdata-qk-open\b[^>]*>/g)];
    const dialogMatches = [
      ...html.matchAll(/<dialog\b[^>]*\bclass="[^"]*\bqk-sheet\b[^"]*"[^>]*>([\s\S]*?)<\/dialog>/g),
    ];
    const scriptMatches = [
      ...html.matchAll(
        /<script\b[^>]*\btype="application\/json"[^>]*\bdata-qk-data\b[^>]*>([\s\S]*?)<\/script>/g,
      ),
    ];

    if (rootMatches.length !== 1) {
      failures.push(`${rel}: expected 1 [data-qk-root] toggle container, found ${rootMatches.length}`);
    }
    if (openMatches.length !== 1) {
      failures.push(`${rel}: expected 1 [data-qk-open] toggle button, found ${openMatches.length}`);
    }
    if (dialogMatches.length !== 1) {
      failures.push(`${rel}: expected 1 <dialog class="qk-sheet">, found ${dialogMatches.length}`);
    } else if (dialogMatches[0][1].trim() !== '') {
      failures.push(`${rel}: SSR <dialog class="qk-sheet"> must be empty before client open`);
    }

    const h1Match = html.match(/<h1\b[^>]*>/i);
    if (!h1Match) {
      failures.push(`${rel}: page has no <h1>`);
    } else if (openMatches.length === 1) {
      const toggleIdx = openMatches[0].index;
      const h1Idx = h1Match.index;
      if (!(toggleIdx < h1Idx)) {
        failures.push(
          `${rel}: Quick Points toggle (offset ${toggleIdx}) must appear before the first <h1> (offset ${h1Idx})`,
        );
      }
    }

    if (scriptMatches.length !== 1) {
      failures.push(
        `${rel}: expected 1 <script type="application/json" data-qk-data>, found ${scriptMatches.length}`,
      );
    } else {
      const rawInline = scriptMatches[0][1];
      if (/<\/script/i.test(rawInline)) {
        failures.push(`${rel}: unescaped </script sequence in data-qk-data`);
      }
      try {
        const parsed = JSON.parse(rawInline);
        if (JSON.stringify(parsed) !== expectedJsonStr) {
          failures.push(`${rel}: inline data-qk-data payload does not match loadQuickPoints("${slug}")`);
        }
      } catch (err) {
        failures.push(`${rel}: failed to JSON.parse data-qk-data: ${err.message}`);
      }
    }

    // (c) Verify JSON never leaked outside <script type="application/json">
    const visibleHtml = stripScriptsAndStyles(html);
    const visibleText = visibleHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    if (visibleText.includes('"groups":[') || visibleText.includes('"statement":')) {
      failures.push(`${rel}: raw Quick Points JSON leaked into visible page text`);
    }
  }

  // (b) Check every point target & anchor in dist/
  for (const group of expected.groups) {
    for (const pt of group.points) {
      totalPointsChecked += 1;
      const targetFile = resolveDistHtmlFile(pt.path);
      if (!targetFile) {
        failures.push(
          `${slug} #${pt.n} (${pt.id}): target page not found in dist for path "${pt.path}" (href="${pt.href}")`,
        );
        continue;
      }
      if (pt.hash) {
        const ids = getIdsInFile(targetFile);
        if (!ids.has(pt.hash)) {
          failures.push(
            `${slug} #${pt.n} (${pt.id}): missing anchor id="${pt.hash}" in ${path.relative(DIST, targetFile)} (href="${pt.href}")`,
          );
          continue;
        }
      }
      totalPointsResolved += 1;
    }
  }
}

if (failures.length > 0) {
  console.error(
    `✗ Quick Points audit failed (${failures.length} issue(s); ${totalPointsResolved}/${totalPointsChecked} targets resolved):\n` +
      failures.map((f) => `  - ${f}`).join('\n'),
  );
  process.exit(1);
}

console.log(
  `✓ Quick Points audit passed: ${articlesWithData}/${QUICK_POINTS_ARTICLES.length} articles with data, ` +
    `${totalPagesChecked} pages verified, ${totalPointsResolved}/${totalPointsChecked} point targets resolved.`,
);
