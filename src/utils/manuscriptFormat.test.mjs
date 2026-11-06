import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDate,
  formatMsDateRange,
  cleanMsName,
  conciseMsName,
  shortMsNameForTitle,
  conciseLocation,
  getUniqueManuscripts,
  buildManuscriptLocationAndDates,
  buildManuscriptTitle
} from './manuscriptFormat.js';

test('formatDate formats negative integers as BC and non-negative integers as AD', () => {
  assert.equal(formatDate(-150), '150 BC');
  assert.equal(formatDate('-250'), '250 BC');
  assert.equal(formatDate(0), 'AD 0');
  assert.equal(formatDate(200), 'AD 200');
  assert.equal(formatDate('325'), 'AD 325');
  assert.equal(formatDate(null), 'Unknown');
  assert.equal(formatDate(undefined), 'Unknown');
  assert.equal(formatDate(''), 'Unknown');
  assert.equal(formatDate('ancient'), 'ancient');
});

test('formatMsDateRange handles BC-only, AD-only, ranges crossing 0, single dates, and fallbacks', () => {
  assert.equal(
    formatMsDateRange({ earliest_date: -250, latest_date: -150 }),
    'c. 250–150 BC'
  );
  assert.equal(
    formatMsDateRange({ earliest_date: 175, latest_date: 225 }),
    'c. AD 175–225'
  );
  // Range crossing year 0 (BC to AD)
  assert.equal(
    formatMsDateRange({ earliest_date: -50, latest_date: 50 }),
    'c. 50 BC–AD 50'
  );
  assert.equal(
    formatMsDateRange({ earliest_date: 200, latest_date: 200 }),
    'c. AD 200'
  );
  assert.equal(
    formatMsDateRange({ earliest_date: -125, latest_date: null }),
    'c. 125 BC'
  );
  assert.equal(
    formatMsDateRange({ earliest_date: null, latest_date: 645 }),
    'c. AD 645'
  );
  assert.equal(
    formatMsDateRange({ earliest_date: null, latest_date: null, date_range_english: '7th century AD' }),
    '7th century AD'
  );
  assert.equal(
    formatMsDateRange({}),
    'ancient period'
  );
});

test('cleanMsName, conciseMsName, and shortMsNameForTitle shorten manuscript names cleanly', () => {
  const parisino = { name: 'Codex Parisino-petropolitanus (Scan 1)' };
  assert.equal(cleanMsName(parisino), 'Codex Parisino-petropolitanus');
  assert.equal(conciseMsName(parisino), 'Codex Parisino-petropolitanus');
  assert.equal(shortMsNameForTitle(parisino), 'Codex Parisino-petropolitanus');

  const palimpsest = {
    name: 'Sanaa Palimpsest [Scriptio Inferior] [= DAM 01-27.1] (Lower Text Reconstruction Across Multiple Folios) (Scan 2)'
  };
  assert.equal(
    cleanMsName(palimpsest),
    'Sanaa Palimpsest [Scriptio Inferior] [= DAM 01-27.1] (Lower Text Reconstruction Across Multiple Folios)'
  );
  assert.equal(conciseMsName(palimpsest), 'Sanaa Palimpsest');
  assert.equal(shortMsNameForTitle(palimpsest), 'Sanaa Palimpsest');

  const dashTailShort = { name: 'Papyrus 66 — Bodmer II' };
  assert.equal(conciseMsName(dashTailShort), 'Papyrus 66 (Bodmer II)');
  assert.equal(shortMsNameForTitle(dashTailShort), 'Papyrus 66');

  const dashTailLong = { name: 'Codex Sinaiticus — British Library Add. MS 43725' };
  assert.equal(conciseMsName(dashTailLong), 'Codex Sinaiticus');
  assert.equal(shortMsNameForTitle(dashTailLong), 'Codex Sinaiticus');

  const commaParts = {
    name: 'Dead Sea Scrolls, Qumran Cave 4, 4QIsa-a, Great Isaiah Scroll Fragment'
  };
  assert.equal(conciseMsName(commaParts), 'Dead Sea Scrolls, Great Isaiah Scroll Fragment');
  assert.equal(shortMsNameForTitle(commaParts), 'Dead Sea Scrolls Great Isaiah Scroll Fragment');
});

test('conciseLocation strips secondary slash locations and parentheticals', () => {
  assert.equal(
    conciseLocation('Bibliothèque nationale de France (Paris) / Russian National Library (St. Petersburg)'),
    'Bibliothèque nationale de France'
  );
  assert.equal(conciseLocation('Chester Beatty Library (Dublin, Ireland)'), 'Chester Beatty Library');
  assert.equal(conciseLocation(''), '');
});

test('getUniqueManuscripts deduplicates by ms_id preserving first occurrence order', () => {
  const input = [
    { ms_id: 'P66', name: 'Papyrus 66 (Scan 1)' },
    { ms_id: 'P66', name: 'Papyrus 66 (Scan 2)' },
    { ms_id: 'P75', name: 'Papyrus 75 (Scan 1)' },
    { ms_id: '01', name: 'Codex Sinaiticus' }
  ];
  const unique = getUniqueManuscripts(input);
  assert.deepEqual(unique.map(m => m.ms_id), ['P66', 'P75', '01']);
});

test('buildManuscriptTitle never exceeds 60 chars across short, multiple, and long manuscript names', () => {
  const fallback = 'John 1:1 Manuscripts & Earliest Copies';
  assert.equal(buildManuscriptTitle('John 1:1', [], fallback), fallback);

  const single = [{ ms_id: 'P66', name: 'Papyrus 66 (Scan 1)' }];
  const tSingle = buildManuscriptTitle('John 1:1', single, fallback);
  assert.equal(tSingle, 'John 1:1 Manuscripts: Papyrus 66');
  assert.ok(tSingle.length <= 60);

  const two = [
    { ms_id: 'P66', name: 'Papyrus 66' },
    { ms_id: 'P75', name: 'Papyrus 75' }
  ];
  const tTwo = buildManuscriptTitle('John 1:1', two, fallback);
  assert.equal(tTwo, 'John 1:1 Manuscripts: Papyrus 66 & Papyrus 75');
  assert.ok(tTwo.length <= 60);

  const many = [
    { ms_id: 'P66', name: 'Papyrus 66' },
    { ms_id: 'P75', name: 'Papyrus 75' },
    { ms_id: '01', name: 'Codex Sinaiticus' },
    { ms_id: '02', name: 'Codex Alexandrinus' },
    { ms_id: '03', name: 'Codex Vaticanus' },
    { ms_id: '04', name: 'Codex Ephraemi Rescriptus' },
    { ms_id: '05', name: 'Codex Bezae' }
  ];
  const tMany = buildManuscriptTitle('John 1:1', many, fallback);
  assert.equal(tMany, 'John 1:1 Manuscripts: Papyrus 66, Papyrus 75 & 5 More');
  assert.ok(tMany.length <= 60);

  // Long manuscript name that forces stripping leading "Codex " or fitting
  const longMs = [
    { ms_id: 'CPP', name: 'Codex Parisino-petropolitanus (Scan 1)' },
    { ms_id: 'BL', name: 'British Library Or. 2165' },
    { ms_id: 'TUB', name: 'Tübingen Fragment Ma VI 165' }
  ];
  const tLong = buildManuscriptTitle('Quran 24:35', longMs, 'Quran 24:35 Manuscripts');
  assert.ok(tLong.length <= 60, `Expected <= 60 chars, got ${tLong.length}: "${tLong}"`);

  // Extremely long verse reference + manuscript name
  const extremeMs = [
    { ms_id: 'X1', name: 'Codex Constantinopolitanus Palimpsestus Antiquissimus' },
    { ms_id: 'X2', name: 'Fragment B' }
  ];
  const tExtreme = buildManuscriptTitle('2 Thessalonians 3:17', extremeMs, 'Fallback');
  assert.ok(tExtreme.length <= 60, `Expected <= 60 chars, got ${tExtreme.length}: "${tExtreme}"`);
});

test('buildManuscriptLocationAndDates formats OT and NT manuscript details', () => {
  const otMs = {
    language: 'Hebrew',
    form: 'Scroll',
    material: 'Parchment',
    earliest_date: -150,
    latest_date: -100,
    found_location: 'Qumran Cave 1',
    current_location: 'Israel Museum'
  };
  assert.equal(
    buildManuscriptLocationAndDates(otMs, false),
    ' It is written in Hebrew, was crafted as a scroll from parchment, and dates to c. 150–100 BC. Originally discovered in Qumran Cave 1, it is currently housed at Israel Museum.'
  );
});
