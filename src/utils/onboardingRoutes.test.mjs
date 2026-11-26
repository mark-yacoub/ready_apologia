import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isVerseReaderPath } from './onboardingRoutes.js';

describe('isVerseReaderPath', () => {
  it('matches Bible chapter and Quran surah readers', () => {
    for (const p of ['/bible/jn/1', '/bible/jn/1/', '/bible/1co/13', '/quran/1', '/quran/114/', '/app/bible/gn/50', '/quran/2?x=1#5']) {
      assert.equal(isVerseReaderPath(p), true, p);
    }
  });

  it('rejects verse detail tabs, Lost Verses, hubs and junk', () => {
    for (const p of ['/', '/bible', '/bible/jn', '/bible/jn/1/1/manuscripts', '/quran', '/quran/0', '/quran/2/1/tafsir/tabari',
      '/quran/codex/ibn-masud', '/discover', '/evidence/trinity', '', null, undefined]) {
      assert.equal(isVerseReaderPath(p), false, String(p));
    }
  });
});
