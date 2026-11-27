import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  mapMtToLxx,
  mapLxxToMt,
  hasLxxEquivalent,
  hasMtEquivalent,
  isDeuterocanonical,
  mapMtChapterToLxx,
  mapLxxChapterToMt,
} from './scripture_mapper.js';
import booksMeta from '../data/books_meta.json' with { type: 'json' };
import table from './versification/lxx2012_mt.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LXX_DIR = path.resolve(__dirname, '../data/scripture/lxx2012');

function loadAllLxxVerses() {
  const byBook = new Map();
  for (const b of booksMeta.ot) {
    const raw = JSON.parse(fs.readFileSync(path.join(LXX_DIR, `${b.id}.json`), 'utf8'));
    const set = new Set();
    for (const [ch, arr] of Object.entries(raw)) {
      for (const obj of arr) set.add(`${ch}:${Object.keys(obj)[0]}`);
    }
    byBook.set(b.id, set);
  }
  return byBook;
}

function expandRanges(chObj) {
  const list = [];
  for (const [ch, ranges] of Object.entries(chObj || {})) {
    for (const r of ranges) {
      const [lo, hi] = r.split('..').map(Number);
      for (let v = lo; v <= (hi ?? lo); v++) list.push([ch, String(v)]);
    }
  }
  return list;
}

const LXX_READER = loadAllLxxVerses();

test('Jonah: MT 1:17 = LXX 2:1 and MT 2:1-10 = LXX 2:2-11', () => {
  assert.equal(hasLxxEquivalent('jon', '1', '17'), true);
  assert.deepEqual(mapMtToLxx('jon', '1', '17'), { book: 'jon', chapter: '2', verse: '1' });
  assert.deepEqual(mapLxxToMt('jon', '2', '1'), { book: 'jon', chapter: '1', verse: '17' });
  assert.equal(hasMtEquivalent('jon', '1', '17'), false); // jon 1:17 does not exist in LXX2012
  for (let v = 1; v <= 10; v++) {
    assert.deepEqual(mapMtToLxx('jon', 2, v), { book: 'jon', chapter: '2', verse: String(v + 1) });
    assert.deepEqual(mapLxxToMt('jon', 2, v + 1), { book: 'jon', chapter: '2', verse: String(v) });
  }
});

test('Genesis: 5:32 merged into 6:1; 37:1 = LXX 36:44; 37:2 = LXX 37:1; 37:34-36 = LXX 37:33-35', () => {
  // LXX2012 gn ch.5 ends at 5:31; MT 5:32 is merged into the start of LXX 6:1 (so 6:1 stays 1:1)
  assert.equal(hasLxxEquivalent('gn', '5', '31'), true);
  assert.equal(hasLxxEquivalent('gn', '5', '32'), false);
  assert.deepEqual(mapMtToLxx('gn', '5', '32'), { book: 'gn', chapter: '5', verse: '32' });
  assert.equal(hasLxxEquivalent('gn', '6', '1'), true);
  assert.deepEqual(mapMtToLxx('gn', '6', '1'), { book: 'gn', chapter: '6', verse: '1' });

  // LXX2012 gn 37 lacks verse 2: MT 37:1 is LXX 36:44, MT 37:2 is LXX 37:1
  assert.deepEqual(mapMtToLxx('gn', '37', '1'), { book: 'gn', chapter: '36', verse: '44' });
  assert.deepEqual(mapLxxToMt('gn', '36', '44'), { book: 'gn', chapter: '37', verse: '1' });
  assert.deepEqual(mapMtToLxx('gn', '37', '2'), { book: 'gn', chapter: '37', verse: '1' });
  assert.deepEqual(mapLxxToMt('gn', '37', '1'), { book: 'gn', chapter: '37', verse: '2' });
  assert.equal(hasMtEquivalent('gn', '37', '2'), false);

  // MT 37:33 merged into LXX 37:32; MT 37:34-36 = LXX 37:33-35
  assert.equal(hasLxxEquivalent('gn', '37', '33'), false);
  assert.deepEqual(mapMtToLxx('gn', '37', '34'), { book: 'gn', chapter: '37', verse: '33' });
  assert.deepEqual(mapMtToLxx('gn', '37', '36'), { book: 'gn', chapter: '37', verse: '35' });
});

test('Jeremiah: zero collisions in ch. 25/32 and 30/37; exact reordered blocks and omissions', () => {
  // LXX 25 only has 1-13 (MT 25:1-13) and 34-39 (MT 49:34-39); 25:15-33 does not exist in LXX 25
  for (let v = 15; v <= 33; v++) {
    assert.equal(hasMtEquivalent('jer', '25', String(v)), false);
    assert.equal(hasMtEquivalent('jer', '32', String(v)), true);
    assert.deepEqual(mapLxxToMt('jer', '32', String(v)), { book: 'jer', chapter: '25', verse: String(v) });
    assert.deepEqual(mapMtToLxx('jer', '25', String(v)), { book: 'jer', chapter: '32', verse: String(v) });
  }

  // LXX 30 only has 1-5 and 23-33 (MT 49); LXX 37 has MT 30 (omitting 10, 11, 22)
  for (let v = 10; v <= 20; v++) {
    assert.equal(hasMtEquivalent('jer', '30', String(v)), false);
  }
  assert.equal(hasLxxEquivalent('jer', '30', '10'), false);
  assert.equal(hasLxxEquivalent('jer', '30', '11'), false);
  for (const v of [12, 13, 14, 15, 16, 17, 18, 19, 20]) {
    assert.equal(hasMtEquivalent('jer', '37', String(v)), true);
    assert.deepEqual(mapLxxToMt('jer', '37', String(v)), { book: 'jer', chapter: '30', verse: String(v) });
    assert.deepEqual(mapMtToLxx('jer', '30', String(v)), { book: 'jer', chapter: '37', verse: String(v) });
  }

  // Specific Jeremiah text-verified mappings
  assert.deepEqual(mapMtToLxx('jer', '17', '5'), { book: 'jer', chapter: '17', verse: '1' });
  assert.deepEqual(mapMtToLxx('jer', '27', '2'), { book: 'jer', chapter: '34', verse: '1' });
  assert.deepEqual(mapMtToLxx('jer', '45', '1'), { book: 'jer', chapter: '51', verse: '31' });
  assert.deepEqual(mapMtToLxx('jer', '49', '34'), { book: 'jer', chapter: '25', verse: '34' });
  assert.deepEqual(mapMtToLxx('jer', '49', '1'), { book: 'jer', chapter: '30', verse: '1' });
  assert.deepEqual(mapMtToLxx('jer', '47', '7'), { book: 'jer', chapter: '29', verse: '7' });
  assert.equal(hasLxxEquivalent('jer', '49', '7'), false); // merged into LXX 29:7
  assert.equal(hasMtEquivalent('jer', '26', '1'), false); // split Elam tail, MT 46:1 omitted
});

test('Genuine LXX omissions report hasLxxEquivalent === false and safely return identity', () => {
  const omissions = [
    ['jer', '10', '10'],
    ['jer', '8', '11'],
    ['jer', '33', '17'],
    ['jer', '27', '1'],
    ['prv', '22', '6'],
    ['1kgs', '8', '12'],
    ['1kgs', '11', '3'],
    ['1kgs', '11', '7'],
    ['1kgs', '11', '8'],
    ['1kgs', '14', '1'],
    ['1kgs', '14', '20'],
    ['1chr', '1', '11'],
    ['1chr', '1', '24'],
    ['is', '2', '22'],
  ];
  for (const [b, c, v] of omissions) {
    assert.equal(hasLxxEquivalent(b, c, v), false, `${b} ${c}:${v} should have no LXX equivalent`);
    assert.deepEqual(mapMtToLxx(b, c, v), { book: b, chapter: c, verse: v });
  }
});

test('Major OT versification differences across Psalms, Exodus, 1 Kings, Daniel, Malachi, Minor Prophets, etc.', () => {
  // Psalms (Brenton LXX2012)
  assert.deepEqual(mapMtToLxx('ps', '10', '1'), { book: 'ps', chapter: '9', verse: '21' });
  assert.deepEqual(mapMtToLxx('ps', '11', '2'), { book: 'ps', chapter: '10', verse: '3' });
  assert.equal(hasMtEquivalent('ps', '10', '2'), false); // split tail of MT 11:1
  assert.deepEqual(mapMtToLxx('ps', '23', '1'), { book: 'ps', chapter: '22', verse: '1' });
  assert.deepEqual(mapMtToLxx('ps', '110', '1'), { book: 'ps', chapter: '109', verse: '1' });
  assert.deepEqual(mapMtToLxx('ps', '147', '12'), { book: 'ps', chapter: '147', verse: '1' });
  assert.equal(hasMtEquivalent('ps', '151', '1'), false);

  // Exodus Decalogue, 21:16-17 swap, and Tabernacle ch. 36-39
  assert.deepEqual(mapMtToLxx('ex', '20', '13'), { book: 'ex', chapter: '20', verse: '15' });
  assert.deepEqual(mapMtToLxx('ex', '20', '14'), { book: 'ex', chapter: '20', verse: '13' });
  assert.deepEqual(mapMtToLxx('ex', '20', '15'), { book: 'ex', chapter: '20', verse: '14' });
  assert.deepEqual(mapMtToLxx('ex', '21', '16'), { book: 'ex', chapter: '21', verse: '17' });
  assert.deepEqual(mapMtToLxx('ex', '21', '17'), { book: 'ex', chapter: '21', verse: '16' });
  assert.deepEqual(mapMtToLxx('ex', '39', '2'), { book: 'ex', chapter: '36', verse: '9' });

  // 1 Kings ch. 20 <-> 21 swap + 4:27-28 + 22:50-53
  assert.deepEqual(mapMtToLxx('1kgs', '20', '1'), { book: '1kgs', chapter: '21', verse: '1' });
  assert.deepEqual(mapMtToLxx('1kgs', '21', '1'), { book: '1kgs', chapter: '20', verse: '1' });
  assert.deepEqual(mapMtToLxx('1kgs', '4', '27'), { book: '1kgs', chapter: '4', verse: '20' });
  assert.deepEqual(mapMtToLxx('1kgs', '22', '53'), { book: '1kgs', chapter: '22', verse: '54' });

  // Daniel 3-4 shift + LXX additions 13-14
  assert.deepEqual(mapMtToLxx('dn', '4', '1'), { book: 'dn', chapter: '3', verse: '31' });
  assert.deepEqual(mapMtToLxx('dn', '4', '4'), { book: 'dn', chapter: '4', verse: '1' });
  assert.deepEqual(mapMtToLxx('dn', '4', '37'), { book: 'dn', chapter: '4', verse: '34' });
  assert.equal(hasMtEquivalent('dn', '13', '1'), false);
  assert.equal(hasMtEquivalent('dn', '14', '1'), false);

  // Malachi 4:4-6 reorder & Joel identity (Brenton LXX2012 matches English Joel)
  assert.deepEqual(mapMtToLxx('mal', '4', '4'), { book: 'mal', chapter: '4', verse: '6' });
  assert.deepEqual(mapMtToLxx('mal', '4', '5'), { book: 'mal', chapter: '4', verse: '4' });
  assert.deepEqual(mapMtToLxx('mal', '4', '6'), { book: 'mal', chapter: '4', verse: '5' });
  assert.deepEqual(mapMtToLxx('jl', '2', '28'), { book: 'jl', chapter: '2', verse: '28' });
  assert.deepEqual(mapMtToLxx('jl', '3', '12'), { book: 'jl', chapter: '3', verse: '12' });

  // Other verified boundary/within-chapter shifts
  assert.deepEqual(mapMtToLxx('lv', '7', '1'), { book: 'lv', chapter: '6', verse: '31' });
  assert.deepEqual(mapMtToLxx('nm', '12', '16'), { book: 'nm', chapter: '13', verse: '1' });
  assert.deepEqual(mapMtToLxx('nm', '26', '15'), { book: 'nm', chapter: '26', verse: '24' });
  assert.deepEqual(mapMtToLxx('dt', '23', '24'), { book: 'dt', chapter: '24', verse: '2' });
  assert.deepEqual(mapMtToLxx('dt', '23', '25'), { book: 'dt', chapter: '24', verse: '1' });
  assert.deepEqual(mapMtToLxx('jo', '19', '47'), { book: 'jo', chapter: '19', verse: '48' });
  assert.deepEqual(mapMtToLxx('1sm', '23', '29'), { book: '1sm', chapter: '24', verse: '1' });
  assert.deepEqual(mapMtToLxx('jb', '40', '1'), { book: 'jb', chapter: '39', verse: '31' });
  assert.deepEqual(mapMtToLxx('eccl', '5', '1'), { book: 'eccl', chapter: '4', verse: '17' });
  assert.deepEqual(mapMtToLxx('sg', '6', '1'), { book: 'sg', chapter: '5', verse: '17' });
  assert.deepEqual(mapMtToLxx('hos', '13', '16'), { book: 'hos', chapter: '14', verse: '1' });
  assert.deepEqual(mapMtToLxx('hg', '2', '1'), { book: 'hg', chapter: '2', verse: '2' });
  assert.deepEqual(mapMtToLxx('zec', '3', '2'), { book: 'zec', chapter: '3', verse: '3' });
  assert.deepEqual(mapMtToLxx('ez', '7', '3'), { book: 'ez', chapter: '7', verse: '7' });
  assert.deepEqual(mapMtToLxx('ez', '7', '6'), { book: 'ez', chapter: '7', verse: '3' });
  assert.deepEqual(mapMtToLxx('ez', '11', '13'), { book: 'ez', chapter: '11', verse: '11' });
});

test('Deuterocanonical and NT books behave consistently', () => {
  assert.equal(isDeuterocanonical('bar'), true);
  assert.equal(isDeuterocanonical('2mc'), true);
  assert.equal(isDeuterocanonical('gn'), false);
  assert.equal(isDeuterocanonical('jn'), false);

  assert.equal(hasLxxEquivalent('bar', '3', '35'), true);
  assert.equal(hasMtEquivalent('bar', '3', '35'), false);
  assert.deepEqual(mapMtToLxx('bar', '3', '35'), { book: 'bar', chapter: '3', verse: '35' });

  assert.equal(hasLxxEquivalent('jn', '3', '16'), true);
  assert.equal(hasMtEquivalent('jn', '3', '16'), true);
  assert.deepEqual(mapMtToLxx('JN', 3, 16), { book: 'jn', chapter: '3', verse: '16' });
});

test('Chapter-level helpers handle missing verse 1 and boundary shifts', () => {
  assert.equal(mapLxxChapterToMt('jer', '32'), '25');
  assert.equal(mapMtChapterToLxx('jer', '27'), '34');
  assert.equal(mapMtChapterToLxx('jer', '33'), '40');
  assert.equal(mapMtChapterToLxx('gn', '37'), '37');
  assert.equal(mapMtChapterToLxx('dn', '4'), '4');
  assert.equal(mapMtChapterToLxx('1kgs', '20'), '21');
  assert.equal(mapLxxChapterToMt('1kgs', '20'), '21');
  assert.equal(mapLxxChapterToMt('hg', '2'), '2');
  assert.equal(mapMtChapterToLxx('ps', '23'), '22');
});

test('EXHAUSTIVE: every LXX2012 verse with an MT equivalent round-trips mtToLxx(lxxToMt(x)) === x and is strictly injective', () => {
  let checkedLxx = 0;
  for (const b of booksMeta.ot) {
    const lxxSet = LXX_READER.get(b.id);
    const seenMtTargets = new Map();

    for (const key of lxxSet) {
      const [c, v] = key.split(':');
      if (!hasMtEquivalent(b.id, c, v)) continue;
      checkedLxx++;

      const mt = mapLxxToMt(b.id, c, v);
      assert.equal(typeof mt.book, 'string');
      assert.equal(typeof mt.chapter, 'string');
      assert.equal(typeof mt.verse, 'string');
      assert.equal(mt.book, b.id);

      const mtKey = `${mt.chapter}:${mt.verse}`;
      assert.equal(
        seenMtTargets.has(mtKey),
        false,
        `LXX->MT collision in ${b.id}: ${seenMtTargets.get(mtKey)} and ${key} both map to MT ${mtKey}`
      );
      seenMtTargets.set(mtKey, key);

      assert.equal(hasLxxEquivalent(mt.book, mt.chapter, mt.verse), true, `${b.id} MT ${mtKey} should have LXX equivalent`);
      const roundTrip = mapMtToLxx(mt.book, mt.chapter, mt.verse);
      assert.deepEqual(roundTrip, { book: b.id, chapter: c, verse: v }, `Round-trip failed for LXX ${b.id} ${key}`);
    }
  }
  assert.ok(checkedLxx > 22000, `Expected >22,000 paired LXX verses, checked ${checkedLxx}`);
});

test('EXHAUSTIVE: every MT verse with an LXX equivalent is strictly injective and lands on an existing LXX2012 reader verse', () => {
  let checkedMt = 0;
  for (const book of table.canonicalOtBooks) {
    const lxxSet = LXX_READER.get(book);
    assert.ok(lxxSet, `Missing LXX2012 reader JSON for ${book}`);
    const seenLxxTargets = new Map();

    for (const [c, v] of expandRanges(table.mtVerses[book])) {
      if (!hasLxxEquivalent(book, c, v)) continue;
      checkedMt++;

      const lxx = mapMtToLxx(book, c, v);
      assert.equal(lxx.book, book);
      assert.equal(typeof lxx.chapter, 'string');
      assert.equal(typeof lxx.verse, 'string');

      const lxxKey = `${lxx.chapter}:${lxx.verse}`;
      assert.equal(
        lxxSet.has(lxxKey),
        true,
        `Mapped LXX target ${book} ${lxxKey} (from MT ${c}:${v}) does not exist in lxx2012/${book}.json`
      );
      assert.equal(
        seenLxxTargets.has(lxxKey),
        false,
        `MT->LXX collision in ${book}: MT ${seenLxxTargets.get(lxxKey)} and MT ${c}:${v} both map to LXX ${lxxKey}`
      );
      seenLxxTargets.set(lxxKey, `${c}:${v}`);

      assert.equal(hasMtEquivalent(lxx.book, lxx.chapter, lxx.verse), true, `${book} LXX ${lxxKey} should have MT equivalent`);
      const back = mapLxxToMt(lxx.book, lxx.chapter, lxx.verse);
      assert.deepEqual(back, { book, chapter: c, verse: v }, `Round-trip failed for MT ${book} ${c}:${v}`);
    }
  }
  assert.ok(checkedMt > 22000, `Expected >22,000 paired MT verses, checked ${checkedMt}`);
});

test('versification table was generated from the current LXX2012 reader text', () => {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/scripture/lxx2012');
  const h = createHash('sha256');
  for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.json')).sort()) {
    h.update(f).update('\0').update(fs.readFileSync(path.join(dir, f))).update('\0');
  }
  assert.equal(table.inputs?.lxx2012Sha256, h.digest('hex'),
    'src/data/scripture/lxx2012 changed: re-run `node scripts/gen_versification_map.mjs` (needs ~/Documents/data_collection for the ESV input)');
});
