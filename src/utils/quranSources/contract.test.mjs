import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  segmentWithHighlights,
  distinctWorkSubtitle,
  langCodeFor,
  dirForLang,
  verifyLabelFor,
  validateDataset,
} from './contract.js';
import { readJson } from './loader.js';

test('segmentWithHighlights: empty or missing highlights return single unmarked segment', () => {
  assert.deepEqual(segmentWithHighlights('In the beginning', []), [
    { text: 'In the beginning', mark: false },
  ]);
  assert.deepEqual(segmentWithHighlights('In the beginning', ['nonexistent phrase']), [
    { text: 'In the beginning', mark: false },
  ]);
  assert.deepEqual(segmentWithHighlights('', ['foo']), [{ text: '', mark: false }]);
});

test('segmentWithHighlights: case-insensitive match, whitespace normalization, and overlap merge', () => {
  const text = 'Whoever destroys a single soul, Scripture accounts it as if he destroyed a full world.';
  const segs = segmentWithHighlights(text, [
    'destroys a   single',
    'SINGLE SOUL, scripture',
    'FULL WORLD',
  ]);
  assert.equal(
    segs.map((s) => s.text).join(''),
    text,
    'reconstructed text must be 100% character-identical to input'
  );
  assert.deepEqual(segs, [
    { text: 'Whoever ', mark: false },
    { text: 'destroys a single soul, Scripture', mark: true },
    { text: ' accounts it as if he destroyed a ', mark: false },
    { text: 'full world', mark: true },
    { text: '.', mark: false },
  ]);
});

test("segmentWithHighlights: Unicode 'İ' (U+0130) does not cause offset drift", () => {
  // 'İ'.toLowerCase() is 'i\u0307' (length 2 in UTF-16), which shifts subsequent indices in naive .toLowerCase() matching
  const text = 'İstanbul and İzmir are cities where clay birds were discussed.';
  const segs = segmentWithHighlights(text, ['clay birds']);
  assert.equal(segs.map((s) => s.text).join(''), text);
  assert.deepEqual(segs, [
    { text: 'İstanbul and İzmir are cities where ', mark: false },
    { text: 'clay birds', mark: true },
    { text: ' were discussed.', mark: false },
  ]);
});

test('distinctWorkSubtitle: suppresses redundant titles and extracts distinct subtitles', () => {
  assert.equal(distinctWorkSubtitle('', 'Mishnah Sanhedrin 4:5'), '');
  assert.equal(distinctWorkSubtitle('Mishnah Sanhedrin 4:5', ''), '');
  assert.equal(
    distinctWorkSubtitle('Mishnah Sanhedrin 4:5', 'Mishnah Sanhedrin 4:5'),
    ''
  );
  assert.equal(
    distinctWorkSubtitle('Mishnah Sanhedrin 4–5', 'Mishnah Sanhedrin 4-5'),
    ''
  );
  assert.equal(
    distinctWorkSubtitle('Mishnah Sanhedrin', 'Mishnah Sanhedrin 4:5'),
    ''
  );
  assert.equal(
    distinctWorkSubtitle('Genesis Rabbah (Midrash)', 'Genesis Rabbah'),
    'Midrash'
  );
  assert.equal(
    distinctWorkSubtitle('Book of Jubilees', 'Jubilees 12:1-8'),
    'Book of Jubilees'
  );
});

test('langCodeFor & dirForLang: maps all dataset and canonical languages to BCP-47 and direction', () => {
  assert.equal(langCodeFor('Hebrew'), 'he');
  assert.equal(langCodeFor('Mishnaic Hebrew'), 'he');
  assert.equal(langCodeFor('Aramaic'), 'arc');
  assert.equal(langCodeFor('Jewish Babylonian Aramaic'), 'arc');
  assert.equal(langCodeFor('Targum'), 'arc');
  assert.equal(langCodeFor('Babylonian Aramaic / Hebrew'), 'arc');
  assert.equal(langCodeFor('Arabic'), 'ar');
  assert.equal(langCodeFor('Classical Arabic'), 'ar');
  assert.equal(langCodeFor('Syriac'), 'syr');
  assert.equal(langCodeFor('Classical Syriac'), 'syr');
  assert.equal(langCodeFor('Greek'), 'grc');
  assert.equal(langCodeFor('Koine'), 'grc');
  assert.equal(langCodeFor('Koine Greek (NASB)'), 'grc');
  assert.equal(langCodeFor('Latin'), 'la');
  assert.equal(langCodeFor("Ge'ez"), 'gez');
  assert.equal(langCodeFor('Ethiopic'), 'gez');
  assert.equal(langCodeFor('Middle Persian'), 'pal');
  assert.equal(langCodeFor('Pahlavi'), 'pal');
  assert.equal(langCodeFor('Avestan'), 'ae');
  assert.equal(langCodeFor('Armenian'), 'hy');
  assert.equal(langCodeFor('Coptic'), 'cop');
  assert.equal(langCodeFor('Akkadian'), 'akk');
  assert.equal(langCodeFor('English'), 'en');
  assert.equal(langCodeFor('Unknown Ancient Dialect'), 'und');
  assert.equal(langCodeFor(''), 'und');

  for (const rtl of ['he', 'arc', 'ar', 'syr']) {
    assert.equal(dirForLang(rtl), 'rtl');
  }
  for (const ltr of ['grc', 'la', 'gez', 'pal', 'ae', 'hy', 'cop', 'akk', 'en', 'und']) {
    assert.equal(dirForLang(ltr), 'ltr');
  }
});

test('verifyLabelFor: formats bible, tafsir, and external hostname labels', () => {
  assert.equal(
    verifyLabelFor({ linkKind: 'bible', href: '/bible/ps/36#29' }),
    'Read in our Bible reader'
  );
  assert.equal(
    verifyLabelFor({ linkKind: 'tafsir', href: '/quran/2/158/tafsir/tabari' }),
    'Read in our Tafsir reader'
  );
  assert.equal(
    verifyLabelFor({
      linkKind: 'external',
      href: 'https://www.sefaria.org/Sanhedrin.37a',
    }),
    'Verify at sefaria.org'
  );
  assert.equal(
    verifyLabelFor({
      linkKind: 'external',
      href: 'https://sunnah.com/bukhari:1648',
    }),
    'Verify at sunnah.com'
  );
});

function makeValidItem(overrides = {}) {
  return {
    id: 'stories-5-32-life-equals-world',
    category: 'stories',
    motif_group: 'cain_abel_sanhedrin',
    is_primary_in_motif: true,
    rank_in_category: 1,
    global_rank: 1,
    cuj_score: 98,
    surah: 5,
    start_ayah: 32,
    end_ayah: 32,
    verse_range: '5:32',
    verse_ids: ['5:32'],
    short_title: 'Saving One Life as Saving a Whole World',
    connection_note: 'Both texts move from Cain and Abel to the maxim on saving a single life.',
    scholarly_discussion: {
      classical_harmonization: 'Classical commentators note the address to the Children of Israel.',
      primary_source_evaluation: 'Mishnah Sanhedrin 4:5 frames the maxim as a scribal reflection.',
    },
    quran_highlights: ['as if he had killed the people altogether'],
    sources: [
      {
        tradition: 'Rabbinic Judaism (Mishnah, Talmud & Midrash)',
        source_title: 'Mishnah Sanhedrin',
        source_reference: 'Mishnah Sanhedrin 4:5',
        source_date: 'c. 200 CE',
        source_language: 'Mishnaic Hebrew',
        source_quote_english:
          'Therefore Adam was created alone, to teach you that whoever destroys a single soul, Scripture accounts it to him as if he had destroyed a full world.',
        quote_highlights: ['whoever destroys a single soul', 'destroyed a full world'],
        source_quote_original: 'לְפִיכָךְ נִבְרָא אָדָם יְחִידִי',
        source_url: 'https://www.sefaria.org/Mishnah_Sanhedrin.4.5',
      },
    ],
    ...overrides,
  };
}

test('validateDataset: accepts valid item and rejects mismatched quote_highlights or non-contiguous verse_ids', () => {
  const okRes = validateDataset([makeValidItem()]);
  assert.deepEqual(okRes.errors, []);
  assert.deepEqual(okRes.warnings, []);

  const badHighlightItem = makeValidItem({
    sources: [
      {
        ...makeValidItem().sources[0],
        quote_highlights: ['phrase not present in quote'],
      },
    ],
  });
  const badHlRes = validateDataset([badHighlightItem]);
  assert.equal(badHlRes.errors.length, 1);
  assert.match(badHlRes.errors[0], /not found in source_quote_english/);

  const badVerseIdsItem = makeValidItem({
    start_ayah: 32,
    end_ayah: 34,
    verse_ids: ['5:32', '5:34'],
  });
  const badVidRes = validateDataset([badVerseIdsItem]);
  assert.equal(badVidRes.errors.length, 1);
  assert.match(badVidRes.errors[0], /must be contiguous and match 5:32\.\.34/);

  const unknownLangItem = makeValidItem({
    sources: [
      {
        ...makeValidItem().sources[0],
        source_language: 'Sumerian Cuneiform',
      },
    ],
  });
  const warnRes = validateDataset([unknownLangItem]);
  assert.deepEqual(warnRes.errors, []);
  assert.equal(warnRes.warnings.length, 1);
  assert.match(warnRes.warnings[0], /unmapped source_language/);
});

test('readJson: returns fallback only on ENOENT and throws with path on malformed JSON', () => {
  const missing = path.join(os.tmpdir(), `nonexistent-${ process.pid }-${ Date.now() }.json`);
  assert.deepEqual(readJson(missing, { ok: true }), { ok: true });

  const tmpBad = path.join(os.tmpdir(), `bad-json-${ process.pid }-${ Date.now() }.json`);
  fs.writeFileSync(tmpBad, '{ invalid json');
  try {
    assert.throws(
      () => readJson(tmpBad, {}),
      (err) => err instanceof Error && err.message.includes(tmpBad)
    );
  } finally {
    fs.rmSync(tmpBad, { force: true });
  }
});
