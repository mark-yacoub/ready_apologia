#!/usr/bin/env node
/**
 * Static output audit for v3 "Primary Sources of the Quran" (run after `astro build`).
 *
 *   node scripts/test_quran_sources.mjs [--dist dist] [--allow-sliced]
 *
 * Verifies:
 *   1. /evidence/quran_sources built HTML: SEO, JSON-LD, 3 category tabs, SSR page 1 cards,
 *      zero markdown/schema leaks, researcher tone gate on titles & connection notes, link attributes.
 *   2. Built /quran/<s>/<a>/sources/index.html pages: SEO, FAQPage JSON-LD, zero leaks, tone gate,
 *      and QuranVerseTabs order ('Primary Sources' immediately before 'Manuscripts').
 *   3. Built /quran/<s>/index.html pages: badge order ('sources' badge after footnotes/tafsir/videos
 *      and immediately before 'manuscripts'), and zero unmapped filler badges.
 *   4. Unsliced build_config.js unless --allow-sliced is passed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { BUILD_BOOKS, BUILD_SURAHS } from '../src/utils/build_config.js';
import { CATEGORIES } from '../src/utils/quranSources/contract.js';
import { SEO_EVIDENCE, UI_COPY } from '../src/utils/quranSources/config.js';

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] ?? true : null;
};
const DIST = path.resolve(arg('--dist') || 'dist');
const ALLOW_SLICED = process.argv.includes('--allow-sliced');

let failures = 0;
let checks = 0;
function group(name, page) {
  return (cond, msg) => {
    checks++;
    if (!cond) {
      failures++;
      console.error(`  ✗ ${page}: [${name}] ${msg}`);
    }
  };
}

const decode = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&amp;/g, '&');

const stripTags = (s) =>
  decode(
    s
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();

const OWN_VOICE_BANNED =
  /\b(plagiari[sz]\w*|copied|copy-paste\w*|borrow(?:s|ed|ing)|stole|stolen|really|actually|yet|only|even|admit(?:s|ted|ting)?|blunder\w*|errors?|wrong|failed|myths?|exposed|debunk\w*|supposedly|polemic\w*|contradictions?|conflicting|problematic|absurd|self-serving|defects?|conceded?|fraud\w*|whitewash\w*|made up|invented|fabricat\w*|mistak(?:e|en|es|ing)|confus(?:e|ed|es|ing|ion)|garbl\w*|mix(?:ed|es|ing)? up)\b/i;

const LEAK_PATTERNS = [
  [/\]\(https?:/, 'raw markdown link'],
  [/\*\*/, 'raw ** emphasis'],
  [/cuj_score|cuj_breakdown|rank_in_category|directionToLlm|dropped_items_log|scholarly_discussion|motif_group/, 'internal schema key'],
];

// 0. Audit V3 index & Page-1 motif diversity invariants
{
  const ok = group('v3-contract', 'src/data/quran/sources/index.json');
  const idxPath = path.resolve('src/data/quran/sources/index.json');
  ok(fs.existsSync(idxPath), 'missing src/data/quran/sources/index.json');
  if (fs.existsSync(idxPath)) {
    const idxData = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
    ok(idxData.schemaVersion === 3, `expected schemaVersion=3, got ${idxData.schemaVersion}`);
    ok(
      idxData.totalItems >= 75 && idxData.totalItems <= 115,
      `totalItems=${idxData.totalItems} outside V3 selectivity bounds 75..115`
    );
    const phrasesCat = (idxData.categories || []).find((c) => c.key === 'phrases');
    ok(
      phrasesCat && phrasesCat.cards >= 15 && phrasesCat.cards <= 26,
      `phrases cards=${phrasesCat?.cards} outside V3 bounds 15..26`
    );
    for (let a = 1; a <= 7; a++) {
      ok(!idxData.verseCounts?.[`1:${a}`], `Surah 1:${a} must NOT have Primary Sources in V3`);
    }
    ok(!idxData.verseCounts?.['19:29'], 'Quran 19:29 must NOT have Primary Sources in V3');
  }

  const p1StoriesPath = path.resolve('public/data/quran-sources/stories/all/1.json');
  ok(fs.existsSync(p1StoriesPath), 'missing public/data/quran-sources/stories/all/1.json');
  if (fs.existsSync(p1StoriesPath)) {
    const p1 = JSON.parse(fs.readFileSync(p1StoriesPath, 'utf8'));
    const motifs = (p1.cards || []).map((c) => c.motifGroup);
    ok(
      motifs.length === new Set(motifs).size,
      `Page 1 of stories contains duplicate motifGroups: ${motifs.join(', ')}`
    );
  }
}

// 1. Audit /evidence/quran_sources
const evPath = path.join(DIST, 'evidence/quran_sources/index.html');
{
  const ok = group('evidence', '/evidence/quran_sources');
  ok(fs.existsSync(evPath), 'missing built /evidence/quran_sources/index.html');
  if (fs.existsSync(evPath)) {
    const html = fs.readFileSync(evPath, 'utf8');
    const text = stripTags(html);
    ok(decode(html).includes(`<title>${SEO_EVIDENCE.title}`), `title mismatch (expected "${SEO_EVIDENCE.title}")`);
    ok(html.includes('"@type":"CollectionPage"'), 'missing CollectionPage JSON-LD');
    for (const c of CATEGORIES) {
      ok(decode(html).includes(c.short), `missing category tab "${c.short}"`);
    }
    ok(html.includes('class="qs-card"'), 'SSR page 1 cards did not render');
    ok(!html.includes('qs-clamp-btn'), 'SSR cards must NOT clamp quotes behind Read full passage');
    ok(html.includes('class="qs-hl"'), 'SSR cards missing <mark class="qs-hl"> phrase highlights');
    for (const [re, what] of LEAK_PATTERNS) {
      ok(!re.test(text), `leak: ${what}`);
    }
    for (const [, inner] of html.matchAll(/<h3 class="qs-card__title">([\s\S]*?)<\/h3>/g)) {
      const clean = stripTags(inner);
      ok(!OWN_VOICE_BANNED.test(clean), `banned voice word in card title: "${clean}"`);
    }
    for (const [, inner] of html.matchAll(/<p class="qs-card__note">([\s\S]*?)<\/p>/g)) {
      const clean = stripTags(inner);
      ok(!OWN_VOICE_BANNED.test(clean), `banned voice word in connection_note: "${clean}"`);
    }
    ok(html.includes('class="qs-discussion"'), 'SSR cards missing collapsible .qs-discussion block');
    // Intro: every segment renders in order (text verbatim, verse refs as links), in our voice.
    {
      const m = html.match(/<p class="qs-intro">([\s\S]*?)<\/p>/);
      ok(!!m, 'missing intro paragraph (.qs-intro)');
      if (m) {
        const introText = stripTags(m[1].replace(/<\/?a\b[^>]*>/g, ''));
        const expected = UI_COPY.intro
          .map((seg) => (typeof seg === 'string' ? seg : seg.label))
          .join('')
          .replace(/\s+/g, ' ')
          .trim();
        ok(introText === expected, `intro text mismatch:\n      got:      ${introText}\n      expected: ${expected}`);
        const links = [...m[1].matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((a) => ({
          href: decode(a[1]),
          label: stripTags(a[2]),
        }));
        const expectedLinks = UI_COPY.intro.filter((s) => typeof s !== 'string');
        ok(
          links.length === expectedLinks.length,
          `intro link count ${links.length} !== expected ${expectedLinks.length}`
        );
        expectedLinks.forEach((seg, idx) => {
          const actual = links[idx];
          ok(
            actual && actual.label === seg.label && actual.href.endsWith(seg.path),
            `intro link #${idx + 1}: expected label="${seg.label}" path="*${seg.path}", got ${JSON.stringify(actual)}`
          );
        });
        ok(!OWN_VOICE_BANNED.test(introText), `banned voice word in intro: "${introText}"`);
      }
    }
    for (const [, inner] of html.matchAll(/<p class="qs-discussion__text">([\s\S]*?)<\/p>/g)) {
      const clean = stripTags(inner);
      ok(!OWN_VOICE_BANNED.test(clean), `banned voice word in qs-discussion: "${clean}"`);
    }
    const qsBody = html.slice(html.indexOf('class="qs"'));
    for (const [, attrs] of qsBody.matchAll(/<a\b([^>]*)>/g)) {
      const href = decode((attrs.match(/href="([^"]*)"/) || [])[1] || '');
      if (/^https?:/.test(href)) {
        ok(
          /target="_blank"/.test(attrs) && /rel="noopener noreferrer"/.test(attrs),
          `external link missing target/rel: ${href}`
        );
      }
    }
  }
}

// 2. Audit built /quran/<s> and /quran/<s>/<a>/sources pages
const quranDist = path.join(DIST, 'quran');
let auditedDrawers = 0;
let auditedSurahs = 0;

if (fs.existsSync(quranDist)) {
  for (const sDir of fs.readdirSync(quranDist)) {
    if (!/^\d+$/.test(sDir)) continue;
    const surahIndex = path.join(quranDist, sDir, 'index.html');
    if (fs.existsSync(surahIndex)) {
      auditedSurahs++;
      const ok = group('surah-reader', `/quran/${sDir}`);
      const sHtml = fs.readFileSync(surahIndex, 'utf8');
      if (sDir === '1') {
        ok(!sHtml.includes('data-tab-id="sources"'), 'Surah 1 reader page must have zero Primary Sources badges');
      }
      if (sDir === '19') {
        ok(
          !fs.existsSync(path.join(quranDist, '19/29/sources/index.html')),
          '/quran/19/29/sources/index.html must NOT be generated in V3'
        );
      }
      for (const [, tray] of sHtml.matchAll(/<div class="verse-badge-tray">([\s\S]*?)<\/div>/g)) {
        const ids = [...tray.matchAll(/data-tab-id="([^"]+)"/g)].map((m) => m[1]);
        const sIdx = ids.indexOf('sources');
        const mIdx = ids.indexOf('manuscripts');
        if (sIdx !== -1 && mIdx !== -1) {
          ok(sIdx < mIdx, `sources badge must precede manuscripts badge (got: ${ids.join(', ')})`);
        }
        for (const earlier of ['debunking-miracles', 'contradictions', 'scientific-errors', 'christian-footnotes', 'tafsir', 'videos']) {
          const eIdx = ids.indexOf(earlier);
          if (sIdx !== -1 && eIdx !== -1) {
            ok(eIdx < sIdx, `${earlier} badge must precede sources badge (got: ${ids.join(', ')})`);
          }
        }
      }
    }

    const sPath = path.join(quranDist, sDir);
    for (const aDir of fs.readdirSync(sPath)) {
      if (!/^\d+$/.test(aDir)) continue;
      const drawerHtmlPath = path.join(sPath, aDir, 'sources/index.html');
      if (!fs.existsSync(drawerHtmlPath)) continue;
      auditedDrawers++;
      const route = `/quran/${sDir}/${aDir}/sources`;
      const ok = group('drawer', route);
      const dHtml = fs.readFileSync(drawerHtmlPath, 'utf8');
      const panelIdx = dHtml.indexOf('class="qsd"');
      ok(panelIdx > -1, 'missing .qsd panel');
      ok(dHtml.includes('"@type":"FAQPage"'), 'missing FAQPage JSON-LD');

      // Check tab bar order on SSR QuranVerseTabs
      const tabBarMatch = dHtml.match(/class="tab-segmented-bar[^"]*"[\s\S]*?<\/div>/);
      if (tabBarMatch) {
        const labels = [...tabBarMatch[0].matchAll(/>([^<]+)</g)].map((m) => m[1].trim()).filter(Boolean);
        const pIdx = labels.findIndex((l) => l.startsWith('Primary Sources'));
        const msIdx = labels.findIndex((l) => l.startsWith('Manuscripts'));
        if (pIdx !== -1 && msIdx !== -1) {
          ok(pIdx < msIdx, `Primary Sources tab must precede Manuscripts tab (got: ${labels.join(' | ')})`);
        }
      }

      if (panelIdx > -1) {
        const panelHtml = dHtml.slice(panelIdx);
        const panelText = stripTags(panelHtml);
        for (const [re, what] of LEAK_PATTERNS) {
          ok(!re.test(panelText), `leak: ${what}`);
        }
        for (const [, inner] of panelHtml.matchAll(/<h4 class="qsd-entry-title">([\s\S]*?)<\/h4>/g)) {
          const clean = stripTags(inner);
          ok(!OWN_VOICE_BANNED.test(clean), `banned voice word in drawer title: "${clean}"`);
        }
        for (const [, inner] of panelHtml.matchAll(/<p class="qsd-entry-note">([\s\S]*?)<\/p>/g)) {
          const clean = stripTags(inner);
          ok(!OWN_VOICE_BANNED.test(clean), `banned voice word in drawer note: "${clean}"`);
        }
        ok(panelHtml.includes('class="qsd-discussion"'), 'drawer entry missing collapsible .qsd-discussion block');
        ok(panelHtml.includes('class="qsd-compare"'), 'drawer entry missing side-by-side .qsd-compare block');
        ok(panelHtml.includes('class="qs-hl"'), 'drawer entry missing <mark class="qs-hl"> phrase highlights');
        ok(!panelHtml.includes('class="qsd-more"'), 'drawer entry must NOT truncate quotes behind .qsd-more');
        if (route === '/quran/5/32/sources') {
          const origLangs = [
            ...panelHtml.matchAll(/<details class="qsd-orig[^"]*"[^>]*>[\s\S]*?<p\b[^>]*\blang="([^"]+)"/g),
          ].map((m) => m[1]);
          ok(
            origLangs.length > 0 && origLangs.every((l) => l && l !== 'und'),
            `/quran/5/32/sources original-text <p> must have non-"und" lang (got: ${origLangs.join(', ')})`
          );
          ok(
            origLangs.includes('he'),
            `/quran/5/32/sources original-text <p> must include lang="he" for Mishnah (got: ${origLangs.join(', ')})`
          );
          const sourceBlocks = [
            ...panelHtml.matchAll(/<div class="qsd-source"[^>]*>([\s\S]*?)<\/a>\s*<\/div>/g),
          ].map((m) => m[1]);
          ok(sourceBlocks.length > 0, '/quran/5/32/sources must have at least one .qsd-source block');
          ok(
            sourceBlocks.every((b) => !/Genesis\s+4:10/i.test(stripTags(b))),
            '/quran/5/32/sources .qsd-source blocks must NOT contain pruned "Genesis 4:10" source'
          );
        }
        if (route === '/quran/3/49/sources') {
          ok(!/Luke\s+7\b/i.test(panelText), '/quran/3/49/sources must NOT contain pruned filler source "Luke 7"');
        }
        for (const [, inner] of panelHtml.matchAll(/<div class="qsd-discussion-row[^"]*">[\s\S]*?<p>([\s\S]*?)<\/p>/g)) {
          const clean = stripTags(inner);
          ok(!OWN_VOICE_BANNED.test(clean), `banned voice word in drawer discussion: "${clean}"`);
        }
      }
    }
  }
  const ok = group('drawer-count', 'dist/quran');
  ok(auditedDrawers > 0, 'expected at least 1 built /quran/<s>/<a>/sources drawer page');
}

{
  const ok = group('build-config', 'src/utils/build_config.js');
  if (!ALLOW_SLICED) {
    ok(BUILD_BOOKS === null && BUILD_SURAHS === null, 'BUILD_BOOKS and BUILD_SURAHS must be null before commit/deploy');
  }
}

if (failures > 0) {
  console.error(`\n✖ ${failures} failure(s) across ${checks} checks (${auditedSurahs} surah pages, ${auditedDrawers} drawer pages).`);
  process.exit(1);
}
console.log(`✔ All ${checks} checks passed across /evidence/quran_sources, ${auditedSurahs} surah pages, and ${auditedDrawers} drawer pages.`);
