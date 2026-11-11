import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clusterCatalogData } from './discoverService.ts';
import { DISCOVER_CATALOG_OVERRIDES } from './discoverCatalogOverrides.ts';
import { DISCOVER_SOURCES, LASTMOD_RULES, resolveLastmod } from './sitemap_lastmod.js';
import { PAGE_META as DTL_META } from './divinityTimeline/content.js';
import { scanTone as scanDtlTone } from './divinityTimeline/tone.js';
import { CATALOG as EBJ_CATALOG } from './extrabiblicalEvidence/content.js';
import { toneHit as ebjToneHit } from './extrabiblicalEvidence/tone.js';
import { SEO as TWB_SEO } from './trustworthinessBible/content.js';
import { toneHit as twbToneHit } from './trustworthinessBible/tone.js';

test('clusterCatalogData applies runtime catalog overrides for the 3 Christian articles', () => {
  const raw = JSON.parse(fs.readFileSync(new URL('../data/discoverCatalog.json', import.meta.url), 'utf8'));
  const groups = clusterCatalogData(raw);
  const allItems = groups.flatMap(g => g.subcategories.flatMap(s => s.articles));
  for (const [slug, expected] of Object.entries(DISCOVER_CATALOG_OVERRIDES)) {
    const found = allItems.find(item => item.slug === slug);
    assert.ok(found, `Missing ${slug} in clustered catalog`);
    assert.equal(found.title, expected.title);
    assert.equal(found.description, expected.description);
  }
});

test('clusterCatalogData ignores Object.prototype keys such as toString or constructor', () => {
  const groups = clusterCatalogData([
    {
      slug: 'toString',
      title: 'Original Title',
      description: 'Original Description',
      category: 'Test',
      subcategory: 'Sub',
    },
    {
      slug: 'constructor',
      title: 'Constructor Title',
      description: 'Constructor Description',
      category: 'Test',
      subcategory: 'Sub',
    },
  ]);
  const items = groups.flatMap(g => g.subcategories.flatMap(s => s.articles));
  assert.equal(items.length, 2);
  assert.equal(items[0].title, 'Original Title');
  assert.equal(items[1].title, 'Constructor Title');
});

test('DISCOVER_CATALOG_OVERRIDES stay synchronized with article metadata and pass academic tone gates', () => {
  assert.deepEqual(DISCOVER_CATALOG_OVERRIDES['extrabiblical-evidence-for-jesus'], EBJ_CATALOG);
  assert.equal(DISCOVER_CATALOG_OVERRIDES['trustworthiness-of-the-bible'].title, TWB_SEO.title);
  assert.equal(DISCOVER_CATALOG_OVERRIDES['trustworthiness-of-the-bible'].description, TWB_SEO.description);
  assert.ok(
    DTL_META.title.startsWith('Worship of Jesus Before Nicaea:'),
    'divinity-timeline override title prefix should align with PAGE_META.title',
  );

  for (const [slug, entry] of Object.entries(DISCOVER_CATALOG_OVERRIDES)) {
    assert.deepEqual(
      scanDtlTone(entry.title, { context: `${slug}.title`, isHeadline: true }),
      [],
    );
    assert.deepEqual(scanDtlTone(entry.description, { context: `${slug}.description` }), []);
    assert.equal(ebjToneHit(entry.title, { headline: true }), null, `${slug}.title failed ebj toneHit`);
    assert.equal(ebjToneHit(entry.description), null, `${slug}.description failed ebj toneHit`);
    assert.equal(twbToneHit(entry.title, { headline: true }), null, `${slug}.title failed twb toneHit`);
    assert.equal(twbToneHit(entry.description), null, `${slug}.description failed twb toneHit`);
  }
});

test('clusterCatalogData drops malformed rows missing a non-empty string description', () => {
  const origError = console.error;
  console.error = () => {};
  try {
    const groups = clusterCatalogData([
      { slug: 'missing-desc', title: 'Title', category: 'Cat', subcategory: 'Sub' },
      { slug: 'empty-desc', title: 'Title', description: '   ', category: 'Cat', subcategory: 'Sub' },
      { slug: 'valid-item', title: 'Title', description: 'Valid description.', category: 'Cat', subcategory: 'Sub' },
    ]);
    const items = groups.flatMap(g => g.subcategories.flatMap(s => s.articles));
    assert.equal(items.length, 1);
    assert.equal(items[0].slug, 'valid-item');
  } finally {
    console.error = origError;
  }
});

test('sitemap_lastmod tracks existing files/directories for home, discover-hub, and all Discover articles', () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  for (const [slug, srcs] of Object.entries(DISCOVER_SOURCES)) {
    for (const s of srcs) {
      assert.ok(
        fs.existsSync(path.join(repoRoot, s)),
        `DISCOVER_SOURCES['${slug}'] references nonexistent path: ${s}`,
      );
    }
  }
  for (const rule of LASTMOD_RULES) {
    if (Array.isArray(rule.sources)) {
      for (const s of rule.sources) {
        assert.ok(
          fs.existsSync(path.join(repoRoot, s)),
          `LASTMOD_RULES (${rule.id}) references nonexistent path: ${s}`,
        );
      }
    }
  }
  const prevCwd = process.cwd();
  process.chdir(repoRoot);
  try {
    for (const route of [
      '/',
      '/discover',
      '/discover/divinity-timeline',
      '/discover/extrabiblical-evidence-for-jesus',
      '/discover/trustworthiness-of-the-bible',
    ]) {
      const iso = resolveLastmod(route);
      assert.ok(iso, `resolveLastmod('${route}') returned ${iso}`);
    }
  } finally {
    process.chdir(prevCwd);
  }
});
