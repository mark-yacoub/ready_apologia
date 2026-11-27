import test from 'node:test';
import assert from 'node:assert/strict';
import { query } from '../db.js';
import { getAllEvidenceVerseSets } from './path_generator.js';
import { mtIdsForReaderRoute, readerAnchorForMt, readerRouteForMt } from './verseRouting.js';
import { mapMtToLxx, mtOnlyHostVerse } from './scripture_mapper.js';

test('the three placement rules', () => {
  // 1. LXX equivalent
  assert.equal(readerRouteForMt('jon_1_17'), 'jon_2_1');
  assert.equal(readerRouteForMt('ps_23_1'), 'ps_22_1');
  // 2. LXX lacks it, number free in the reader -> own page
  assert.equal(readerRouteForMt('prv_22_6'), 'prv_22_6');
  // 3. LXX lacks it, number used by another reader verse -> host verse page
  const host = mtOnlyHostVerse('gn', '37', '33');
  assert.deepEqual(host, { book: 'gn', chapter: '37', verse: '32' });
  const m = mapMtToLxx('gn', '37', '32');
  assert.equal(readerRouteForMt('gn_37_33'), `gn_${m.chapter}_${m.verse}`);
  // NT / deuterocanon / malformed
  assert.equal(readerRouteForMt('jn_3_16'), 'jn_3_16');
  assert.equal(readerRouteForMt('bar_3_35'), 'bar_3_35');
  assert.equal(readerRouteForMt('gospels'), null);
});

test('anchors only point at verses the reader has', () => {
  assert.deepEqual(readerAnchorForMt('jon_1_17'), { book: 'jon', chapter: '2', verse: '1' });
  assert.deepEqual(readerAnchorForMt('prv_22_6'), { book: 'prv', chapter: '22', verse: undefined });
});

test('no Bible evidence id is dropped: each lands on a built page that queries it', () => {
  const sets = getAllEvidenceVerseSets();
  const sources = [
    ['contradictions', "SELECT verse1 v FROM contradictions UNION SELECT verse2 FROM contradictions", sets.ctSet],
    ['apologetics', 'SELECT DISTINCT verse v FROM apologetics', sets.apSet],
    ['videos', "SELECT DISTINCT verse_id v FROM short_per_verse WHERE verse_id <> 'gospels'", sets.vdSet],
    ['manuscripts (MT rows)', "SELECT DISTINCT verse_id v FROM manuscript_per_verse_ot WHERE v11n_type = 'MT'", sets.msSet],
  ];
  for (const [name, sql, routeSet] of sources) {
    const problems = [];
    for (const { v } of query(sql).filter(r => /^[0-9a-z]*[a-z][0-9a-z]*_\d+_\d+$/.test(r.v))) { // Bible ids only
      const route = readerRouteForMt(v);
      if (!route) problems.push(`${v}: no route`);
      else if (!routeSet.has(route)) problems.push(`${v}: ${route} not built`);
      else if (!mtIdsForReaderRoute(route).includes(v)) problems.push(`${v}: ${route} doesn't query it`);
    }
    assert.deepEqual(problems, [], name);
  }
});
