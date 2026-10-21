// node --test src/utils/hadith_config.test.mjs
// Guards the /hadith navigation copy: written for a curious Muslim reader, so every topic name is a
// neutral description, never a verdict. The dataset's own names stay as keys and are never shown.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HADITH_TAXONOMY, HADITH_SEO, HADITH_INTRO, HADITH_INTRO_ASIDE, RESERVED_SLUGS } from './hadith_config.js';

/** Words that pass judgment rather than name a topic. */
const VERDICT = /\b(absurd\w*|blunder\w*|self-serving|capricious|defects?|conceded|attack\w*|misogyn\w*|scrutiny|problematic|bizarre|crude|carnal|errors?|unhygienic|chattel|exploitation|cruelty|intolerance|deceit|apologetics?|debunk\w*)\b/i;

const entries = Object.entries(HADITH_TAXONOMY).flatMap(([name, cat]) => [
  { kind: 'category', name, cfg: cat },
  ...Object.entries(cat.subcategories).map(([subName, sub]) => ({ kind: 'subcategory', name: subName, cfg: sub, parent: cat.slug })),
]);

test('every category and subcategory has a label, short label and slug', () => {
  for (const { kind, name, cfg } of entries) {
    for (const key of ['label', 'short', 'slug']) {
      assert.ok(typeof cfg[key] === 'string' && cfg[key].trim(), `${kind} "${name}" is missing ${key}`);
    }
    assert.match(cfg.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${kind} "${name}" slug "${cfg.slug}" is not kebab-case`);
  }
});

test('slugs are unique (categories globally, subcategories within their category) and not reserved', () => {
  const catSlugs = Object.values(HADITH_TAXONOMY).map(c => c.slug);
  assert.equal(new Set(catSlugs).size, catSlugs.length, 'duplicate category slug');
  for (const s of catSlugs) assert.ok(!RESERVED_SLUGS.has(s), `category slug "${s}" is reserved`);
  for (const cat of Object.values(HADITH_TAXONOMY)) {
    const subSlugs = Object.values(cat.subcategories).map(s => s.slug);
    assert.equal(new Set(subSlugs).size, subSlugs.length, `duplicate subcategory slug in "${cat.slug}"`);
  }
});

test('reader-facing labels, slugs and SEO name topics, never verdicts', () => {
  for (const { kind, name, cfg } of entries) {
    for (const key of ['label', 'short', 'slug']) {
      const hit = cfg[key].replace(/-/g, ' ').match(VERDICT);
      assert.ok(!hit, `${kind} "${name}" ${key} "${cfg[key]}" uses "${hit?.[0]}"`);
    }
  }
  for (const [where, text] of [
    ['SEO title', HADITH_SEO.hub.title], ['SEO description', HADITH_SEO.hub.description], ['SEO keywords', HADITH_SEO.hub.keywords],
    ...HADITH_INTRO.map((p, i) => [`intro paragraph ${i + 1}`, p]), ['intro aside', `${HADITH_INTRO_ASIDE.lead} ${HADITH_INTRO_ASIDE.linkLabel}`],
  ]) {
    const hit = text.match(VERDICT);
    assert.ok(!hit, `${where} uses "${hit?.[0]}"`);
  }
});
