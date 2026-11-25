import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import discoverCatalog from '../data/discoverCatalog.json' with { type: 'json' };
import { resolveSectionTheme } from './sectionTheme.js';

describe('resolveSectionTheme', () => {
  it('resolves explicit theme prop overrides', () => {
    assert.equal(resolveSectionTheme('/', 'quran'), 'islamic');
    assert.equal(resolveSectionTheme('/', 'hadith'), 'islamic');
    assert.equal(resolveSectionTheme('/', 'islamic'), 'islamic');
    assert.equal(resolveSectionTheme('/', 'christian'), 'christian');
    assert.equal(resolveSectionTheme('/', 'bible'), 'christian');
    assert.equal(resolveSectionTheme('/bible/jn/1', 'neutral'), 'neutral');
  });

  it('resolves Christian section routes from pathname', () => {
    assert.equal(resolveSectionTheme('/bible/jn/1'), 'christian');
    assert.equal(resolveSectionTheme('/bible/jn/1/1/manuscripts'), 'christian');
    assert.equal(resolveSectionTheme('/apologists'), 'christian');
    assert.equal(resolveSectionTheme('/apologists/wes-huff'), 'christian');
    assert.equal(resolveSectionTheme('/evidence/trinity'), 'christian');
    assert.equal(resolveSectionTheme('/evidence/prophecies'), 'christian');
    assert.equal(resolveSectionTheme('/discover/trustworthiness-of-the-bible'), 'christian');
    assert.equal(resolveSectionTheme('/discover/through-christian-eyes'), 'christian');
  });

  it('resolves Islamic section routes from pathname', () => {
    assert.equal(resolveSectionTheme('/quran'), 'islamic');
    assert.equal(resolveSectionTheme('/quran/2/255/tafsir/tabari'), 'islamic');
    assert.equal(resolveSectionTheme('/quran/0'), 'islamic');
    assert.equal(resolveSectionTheme('/hadith/bukhari/111'), 'islamic');
    assert.equal(resolveSectionTheme('/evidence/quran_sources'), 'islamic');
    assert.equal(resolveSectionTheme('/evidence/scientific_errors'), 'islamic');
    assert.equal(resolveSectionTheme('/discover/hadith-reliability/at-a-glance'), 'islamic');
    assert.equal(resolveSectionTheme('/discover/islamic-dilemma'), 'islamic');
  });

  it('keeps shared hubs neutral and guards against partial prefix collisions', () => {
    assert.equal(resolveSectionTheme('/'), 'neutral');
    assert.equal(resolveSectionTheme('/discover'), 'neutral');
    assert.equal(resolveSectionTheme('/discover/statistics'), 'neutral');
    assert.equal(resolveSectionTheme('/evidence'), 'neutral');
    assert.equal(resolveSectionTheme('/404'), 'neutral');
    assert.equal(resolveSectionTheme('/bible-studies'), 'neutral');
    assert.equal(resolveSectionTheme('/quranic-art'), 'neutral');
  });

  it('handles trailing slashes, query strings, uppercase, and base prefixes', () => {
    assert.equal(resolveSectionTheme('/BIBLE/jn/1/?foo=1#v1'), 'christian');
    assert.equal(resolveSectionTheme('/app/quran/1/', undefined, '/app'), 'islamic');
  });

  it('covers every Discover catalog entry without falling back to neutral', () => {
    for (const item of discoverCatalog) {
      const expected = item.category === 'Christianity' ? 'christian' : 'islamic';
      assert.equal(
        resolveSectionTheme(`/discover/${item.slug}`),
        expected,
        `expected /discover/${item.slug} to resolve to ${expected}`
      );
    }
  });
});
