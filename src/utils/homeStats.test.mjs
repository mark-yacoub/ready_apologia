import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadHomeStats, validateStats, STAT_KEYS } from './homeStats.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
process.chdir(ROOT);

test('loadHomeStats returns positive integer counts for every required stat and memoises the result', async () => {
  const stats = await loadHomeStats();
  const secondCall = await loadHomeStats();
  assert.equal(stats, secondCall, 'loadHomeStats() must return the memoised object on subsequent calls');
  assert.ok(Object.isFrozen(stats), 'returned stats object should be frozen');

  assert.ok(STAT_KEYS.length >= 40, `expected comprehensive STAT_KEYS list, got ${STAT_KEYS.length}`);
  for (const key of STAT_KEYS) {
    const val = stats[key];
    assert.equal(typeof val, 'number', `${key} must be a number`);
    assert.ok(Number.isInteger(val) && val > 0, `${key} must be a positive integer, got ${val}`);
  }

  assert.ok(Array.isArray(stats.auditTabs) && stats.auditTabs.length > 0, 'auditTabs must be a non-empty array');
  for (const tab of stats.auditTabs) {
    assert.ok(typeof tab.key === 'string' && tab.key.length > 0);
    assert.ok(typeof tab.label === 'string' && tab.label.length > 0);
    assert.ok(typeof tab.path === 'string' && tab.path.startsWith('/hadith/translation-audit/'));
    assert.ok(Number.isInteger(tab.count) && tab.count > 0, `auditTab ${tab.key} count must be > 0`);
  }

  // Consistency invariants across derived totals
  assert.equal(stats.bibleMssCount, stats.ntMssCount + stats.otMssCount);
  assert.equal(stats.bibleScansCount, stats.ntScansCount + stats.otScansCount);
  assert.equal(stats.scholarlyDefensesCount, stats.apologeticsCount - stats.patristicEntriesCount);
  assert.equal(stats.lostHubTotalCount, stats.lostPassagesCount + stats.featuredCodexCount);
  assert.equal(
    stats.auditTotalCount,
    stats.auditTabs.reduce((sum, t) => sum + t.count, 0)
  );
});

test('validateStats throws a single aggregated error listing every missing, NaN, or zero count', async () => {
  const valid = await loadHomeStats();
  const broken = {
    ...valid,
    bibleMssCount: 0,
    tabariCount: Number.NaN,
    hadithCount: undefined,
    trinityCount: -5,
    discoverArticlesCount: 3.14,
    auditTabs: [
      { key: 'softened', label: 'Softened', count: 0, path: '/hadith/translation-audit/softened' },
      { key: 'omission', label: 'Omitted', count: Number.NaN, path: 'relative-path' },
    ],
  };

  assert.throws(
    () => validateStats(broken),
    (err) => {
      assert.ok(err instanceof Error);
      assert.match(err.message, /\[homeStats\] Invalid or zero build-time counts \(8\):/);
      assert.match(err.message, /bibleMssCount: expected positive integer, got 0/);
      assert.match(err.message, /tabariCount: expected positive integer, got NaN/);
      assert.match(err.message, /hadithCount: expected positive integer, got undefined/);
      assert.match(err.message, /trinityCount: expected positive integer, got -5/);
      assert.match(err.message, /discoverArticlesCount: expected positive integer, got 3\.14/);
      assert.match(err.message, /auditTabs\[0\]\.count \(softened\): expected positive integer, got 0/);
      assert.match(err.message, /auditTabs\[1\]\.path: expected root-relative path, got relative-path/);
      assert.match(err.message, /auditTabs\[1\]\.count \(omission\): expected positive integer, got NaN/);
      return true;
    }
  );
});

test('validateStats rejects non-object or empty auditTabs', async () => {
  const valid = await loadHomeStats();
  assert.throws(() => validateStats(null), /\[homeStats\] Expected a stats object/);
  assert.throws(
    () => validateStats({ ...valid, auditTabs: [] }),
    /auditTabs: expected non-empty array/
  );
});
