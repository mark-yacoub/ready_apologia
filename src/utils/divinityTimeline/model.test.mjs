import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  ALL_LEGACY_EVENT_IDS,
  EXCLUDED_LEGACY_IDS,
  EXPECTED_DATA_SHA256,
  GROUPED_SUB_ANCHOR_IDS,
  MAX_RENDERED_IMAGE_BYTES,
  NUMBERED_SECTION_IDS,
  PRIMARY_CARD_IDS,
  validateHref,
} from './config.js';
import { extractMarkdownLinks, renderInlineMarkdown } from './markdown.js';
import {
  assertExternalSourceHref,
  buildDivinityTimelinePage,
  readJpegDimensions,
} from './model.js';
import { DATASET_OVERRIDES } from './overrides.js';
import { scanTone } from './tone.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');

const normalizeQuotes = (s) =>
  String(s)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/—/g, '-- ');

test('divinityTimeline view-model builds cleanly with locked raw dataset SHA-256 and hero framing', () => {
  const page = buildDivinityTimelinePage(REPO_ROOT);
  assert.equal(page.rawDataSha256, EXPECTED_DATA_SHA256);
  assert.equal(page.sections.length, NUMBERED_SECTION_IDS.length);
  assert.equal(page.glanceRows.length, NUMBERED_SECTION_IDS.length);
  assert.equal(page.introParagraphs.length, 3);
  assert.equal(page.framing.tiers.length, 3);
  assert.equal(PRIMARY_CARD_IDS.length, 16);
  assert.equal(GROUPED_SUB_ANCHOR_IDS.length, 12);
  assert.equal(EXCLUDED_LEGACY_IDS.length, 14);
});

test('all 42 legacy #event-<id> anchors map 1-to-1 with zero duplicates or gaps', () => {
  const page = buildDivinityTimelinePage(REPO_ROOT);
  assert.equal(page.emittedEventAnchors.length, 42);
  const unique = new Set(page.emittedEventAnchors);
  assert.equal(unique.size, 42);
  for (const id of ALL_LEGACY_EVENT_IDS) {
    assert.ok(unique.has(`event-${id}`), `missing #event-${id}`);
  }
});

test('every rendered card carries an evidentiary tier badge and plain-English What-this-shows takeaway', () => {
  const page = buildDivinityTimelinePage(REPO_ROOT);
  for (const sec of page.sections) {
    for (const card of sec.cards) {
      assert.match(card.evidenceTier, /^tier-[abc]$/);
      assert.ok(card.evidenceTierLabel.length > 10);
      assert.match(card.showsHtml, /What this shows:/);
      assert.match(card.showsHtml, /Limits:/);
    }
  }
});

test('Frankfurt Silver Inscription is pinned to Guijarro (2025) 18-line Latin reading + Scholz syntactic distinction', () => {
  const frankfurt = DATASET_OVERRIDES.frankfurt_silver_scroll;
  assert.equal(frankfurt.displayYear, 'c. AD 230–270');
  assert.equal(frankfurt.evidenceTier, 'tier-b');
  assert.match(frankfurt.editionCitation, /Guijarro[\s\S]*\*?Isidorianum\*? 34\/1 \(2025\)/);
  assert.match(frankfurt.editionCitation, /Scholz, \*?Bayerische Archäologie\*? 2 \(2025\)/);
  assert.match(frankfurt.quoteTranslation, /healed illnesses[\s\S]*Scholz/);
  assert.match(frankfurt.showsMarkdown, /Guijarro[\s\S]*Scholz/);

  const lines = frankfurt.quoteOriginal.split(' / ');
  assert.equal(lines.length, 18, `expected 18 numbered lines, got ${lines.length}`);
  assert.match(lines[0], /^\(1\) In nomine sancti Titi\.$/);
  assert.match(lines[2], /^\(3\) In nomine I\u0305H\u0305 X\u0305P\u0305 Dei f\(ilii\)\.$/);
  assert.match(lines[5], /incursionibus oponit/);
  assert.match(lines[12], /^\(13\) Quoniam I\u0305H\u0305 X\u0305P\u0305o$/);
  assert.match(lines[13], /omnes genua flec-/);
  assert.match(lines[17], /^\(18\) gua confiteatur\.$/);
  assert.doesNotMatch(frankfurt.quoteOriginal, /omne genu flectatur|caelestium|\[Iesum Christum\]/i);
  assert.doesNotMatch(frankfurt.quoteTranslation, /maker of all/i);

  const page = buildDivinityTimelinePage(REPO_ROOT);
  const sec1 = page.sections.find((s) => s.id === 'inscriptions-and-archaeology');
  const fCard = sec1.cards.find((c) => c.id === 'frankfurt_silver_scroll');
  assert.match(
    fCard.quoteOriginalHtml,
    /<span class="dtl-ns">IH<\/span> <span class="dtl-ns">XP<\/span>/,
  );
});

test('Pectorius, Capernaum, Megiddo, Pereire Bloodstone, and PGM IV reflect primary-source historiography', () => {
  // 1. Pectorius grouped under Abercius with 4th-c. personal epitaph (ll. 7–11) distinguished from ll. 1–6 hymn
  const pectorius = DATASET_OVERRIDES.epitaph_of_pectorius;
  assert.equal(pectorius.disposition, 'grouped');
  assert.equal(pectorius.parentCardId, 'abercius_inscription');
  assert.equal(pectorius.datingBasis, 'composition-copy');
  assert.match(pectorius.displayYear, /Stone 4th c\. AD \(post-Nicene copy\)/);
  assert.match(pectorius.summaryMarkdown, /μνήσεο Πεκτορίοιο/);
  assert.match(pectorius.summaryMarkdown, /φῶς τὸ θανόντων/);
  assert.match(pectorius.summaryMarkdown, /ll\. 7–8/);
  assert.doesNotMatch(pectorius.summaryMarkdown, /Πεκτορίου/);
  assert.doesNotMatch(pectorius.summaryMarkdown, /11600a\.htm/);

  // 2. Capernaum grouped with explicit post-Nicene / contested pre-325 flag & Taylor (1993) critique
  const capernaum = DATASET_OVERRIDES.house_of_peter;
  assert.equal(capernaum.disposition, 'grouped');
  assert.equal(capernaum.datingBasis, 'disputed-post-nicene');
  assert.match(capernaum.displayYear, /4th c\. AD.*post-Nicene/i);
  assert.match(capernaum.summaryMarkdown, /Joan E\. Taylor/);

  // 3. Megiddo leads with sealed c. AD 305 + Bowersock (2018) + plain-English [read προσήνεγκεν, standard spelling]
  const megiddo = DATASET_OVERRIDES.megiddo_mosaic;
  assert.match(megiddo.displayYear, /^Sealed c\. AD 305.*Bowersock 2018/);
  assert.match(megiddo.quoteOriginal, /ΖΑΝ · Θ̅Ω̅ · Ι̅Υ̅ Χ̅Ω̅/);
  assert.match(megiddo.quoteOriginal, /προσήνικεν \[read προσήνεγκεν\]/);
  assert.doesNotMatch(megiddo.quoteOriginal, /ΤΩ ΘΕΩ|\[l\./);

  // 4. Pereire Bloodstone states the named Mastrocinque (2014) vs. Kotansky (2017, p. 637 n. 8) exchange
  const gem = DATASET_OVERRIDES.magic_crucifixion_gem;
  assert.match(gem.quoteOriginal, /ἀρτάννα λ̣υσίου \[υ\]ἱ\[οῦ\]/);
  assert.match(gem.showsMarkdown, /Attilio Mastrocinque[\s\S]*Roy D\. Kotansky[\s\S]*rejects/);
  assert.match(gem.analysisMarkdown, /Mastrocinque[\s\S]*unusual and unorthodox Trinitarian formula/);
  assert.ok(gem.verifyLinks.some((l) => l.href.includes('grbs.library.duke.edu')));
  assert.ok(
    DATASET_OVERRIDES.frankfurt_silver_scroll.verifyLinks.some((l) =>
      l.href.includes('web.archive.org') && l.href.includes('frankfurt-amulet-limes-germanicus'),
    ),
  );

  // 5. PGM IV grouped under Pereire Bloodstone with physical codex c. AD 300–350 & Pibechis glossed
  const pgm4 = DATASET_OVERRIDES.paris_magical_papyrus;
  assert.equal(pgm4.disposition, 'grouped');
  assert.equal(pgm4.parentCardId, 'magic_crucifixion_gem');
  assert.equal(pgm4.datingBasis, 'composition-copy');
  assert.match(pgm4.summaryMarkdown, /Pibechis.*legendary Egyptian magician/);

  // 6. P.Oxy. II 209 = P10 (Romans 1:1–7, archival context c. AD 316) & suppressed scraper images
  const p10 = DATASET_OVERRIDES.papyrus_oxyrhynchus_2;
  assert.match(p10.title, /P\.Oxy\. II 209 = 𝔓10/);
  assert.match(p10.displayYear, /Archival context c\. AD 316/);
  assert.equal(DATASET_OVERRIDES.papyrus_bodmer_xiii.image, null);
  assert.equal(DATASET_OVERRIDES.papyrus_bodmer_xx.image, null);
  assert.equal(DATASET_OVERRIDES.marcionite_inscription.image, null);
  assert.equal(DATASET_OVERRIDES.stele_of_licinia_amias.image, null);
});

test('inline Greek backticks render in serif .dtl-grc and Latin/shelfmark backticks render in .dtl-cite (zero <code>)', () => {
  const rendered = renderInlineMarkdown('Compare `Ὁ Κ̅Ϲ̅ μου` and `P.Oxy. III 405`.');
  assert.match(
    rendered,
    /<span lang="grc" class="dtl-grc">Ὁ <span class="dtl-ns">ΚϹ<\/span> μου<\/span>/,
  );
  assert.match(rendered, /<span class="dtl-cite">P\.Oxy\. III 405<\/span>/);
  assert.doesNotMatch(rendered, /<code\b/i);

  const page = buildDivinityTimelinePage(REPO_ROOT);
  const sec1 = page.sections.find((s) => s.id === 'inscriptions-and-archaeology');
  const megiddoCard = sec1.cards.find((c) => c.id === 'megiddo_mosaic');
  assert.match(megiddoCard.quoteOriginalHtml, /<span class="dtl-ns">ΙΥ<\/span>/);
  assert.match(megiddoCard.quoteOriginalHtml, /<span class="dtl-br">Ἀκεπτοῦς<\/span>/);
  assert.match(megiddoCard.quoteOriginalHtml, /Θ\(ε\)ῷ <span class="dtl-br">Ἰ\(ησο\)ῦ<\/span>/);
});

test('every rendered image (including Alexamenos archaeological tracing) exists and stays <= 600 KB', () => {
  const page = buildDivinityTimelinePage(REPO_ROOT);
  let imageCount = 0;
  for (const sec of page.sections) {
    for (const card of sec.cards) {
      for (const img of [card.image, card.secondaryImage].filter(Boolean)) {
        imageCount += 1;
        assert.ok(img.bytes > 0 && img.bytes <= MAX_RENDERED_IMAGE_BYTES);
        assert.ok(img.width > 0 && img.height > 0);
        const full = path.join(REPO_ROOT, 'public', img.src);
        assert.ok(fs.existsSync(full));
      }
    }
  }
  const sec2 = page.sections.find((s) => s.id === 'hostile-and-external-witnesses');
  const alex = sec2.cards.find((c) => c.id === 'alexamenos_graffito');
  assert.ok(alex.image && alex.secondaryImage, 'Alexamenos must pair photo + tracing');
  assert.ok(imageCount >= 10, `expected >= 10 verified artifact photos, got ${imageCount}`);
});

test('verbatim English scripture quotes in cards match local NASB corpora', () => {
  const loadBook = (b) =>
    JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, `src/data/scripture/nasb/${b}.json`), 'utf8'),
    );
  const jn = loadBook('jn');
  const phil = loadBook('phil');
  const col = loadBook('col');
  const cor1 = loadBook('1cor');
  const rv = loadBook('rv');
  const mt = loadBook('mt');
  const rom = loadBook('rom');
  const getV = (bookObj, ch, v) =>
    bookObj[String(ch)].find((o) => o[String(v)])[String(v)];

  assert.ok(
    normalizeQuotes(DATASET_OVERRIDES.papyrus_66_john_1_1.quoteTranslation).includes(
      getV(jn, 1, 1),
    ),
  );
  const p46En = normalizeQuotes(
    DATASET_OVERRIDES.papyrus_46_philippians_2_6.quoteTranslation,
  );
  assert.ok(p46En.includes(getV(phil, 2, 6)));
  assert.ok(p46En.includes(getV(col, 1, 16)));
  assert.ok(p46En.includes(getV(col, 1, 17)));
  assert.ok(
    normalizeQuotes(DATASET_OVERRIDES.papyrus_98.quoteTranslation).includes(
      `"Do not be afraid; I am the first and the last, ${getV(rv, 1, 18)}`,
    ),
  );
  const p104En = normalizeQuotes(DATASET_OVERRIDES.papyrus_104.quoteTranslation);
  assert.ok(p104En.includes(getV(mt, 21, 37).replace(/^"/, '')));
  assert.ok(p104En.includes(getV(rom, 1, 7)));

  const page = buildDivinityTimelinePage(REPO_ROOT);
  const sec3 = page.sections.find((s) => s.id === 'first-century-creeds');
  const shemaCard = sec3.cards.find((c) => c.id === 'creed-shema_1cor_8_6');
  assert.ok(normalizeQuotes(shemaCard.quoteTranslation).includes(getV(cor1, 8, 6)));
});

test('zero developer or internal-pipeline copy leaks into Methodology or Excluded entries', () => {
  const page = buildDivinityTimelinePage(REPO_ROOT);
  const combined = [
    page.methodology.leadHtml,
    ...page.methodology.principles.map((p) => `${p.title} ${p.bodyHtml}`),
    page.methodology.excludedDisclosure.summaryLabel,
    page.methodology.excludedDisclosure.introHtml,
    ...page.methodology.excludedDisclosure.items.map(
      (i) => `${i.legacyTitle} ${i.exclusionCategory} ${i.exclusionReasonHtml}`,
    ),
  ].join(' ');
  assert.doesNotMatch(
    combined,
    /legacy dataset|scraper photographs|merged legacy|inbound links|divinityTimeline\.json/i,
  );
});

test('academic register gate (tone.js) rejects unnamed strawmen, M13 rhetorical nudges, and first-person apologetics', () => {
  const mustFail = [
    'Modern skeptics claim Constantine invented this.',
    'Critics argue that John was late.',
    'Popular timelines routinely blur these dates.',
    'Popular summaries often conflate these layers.',
    'A frequent textual question is whether scribes altered this.',
    'But we have third-century manuscripts in our possession.',
    'This smoking gun shatters the myth beyond any doubt.',
    'Crucially, the graffito mocks a Christian.',
    'Notably, both manuscripts read theos.',
    'Without Christian theological coaching, the ritualist wrote this.',
    'This provides an immovable archaeological ceiling.',
    'There is zero trace of an earlier text.',
    'Melito states the paradox in stark ontological terms.',
    'Phileas affirms Christ’s deity without hesitation.',
    'Chronological candor requires distinguishing the copy.',
    'Methodological transparency requires separating the layers.',
    'Stratigraphic rigor requires separating two horizons.',
    'This separation is essential to sound historiography.',
    'Isaiah 45:23 is a fiercely monotheistic oracle.',
    'Bousset’s thesis collapsed philologically after Qumran.',
    'Paul records complete unanimity with Cephas.',
    'Outsiders of every social class perceived this.',
    'External observers consistently identified Christians thus.',
    'Far from treating it as new, Ignatius uses it unselfconsciously.',
    'These writers unequivocally placed the Son on the divine side.',
    'Here you will see why Nicaea was early.',
  ];
  for (const s of mustFail) {
    assert.ok(scanTone(s).length > 0, `expected tone.js to reject: ${s}`);
  }
  assert.ok(
    scanTone('Was Jesus God Before Nicaea?', { isHeadline: true }).length > 0,
  );

  // Named scholarly prose in third person passes cleanly:
  assert.deepEqual(
    scanTone(
      'In 1913, Wilhelm Bousset (Kyrios Christos) proposed that the title Kyrios entered Christian liturgy in Hellenistic Syria, whereas Martin Hengel (1995) pointed to Palestinian Aramaic Marana tha in 1 Corinthians 16:22.',
    ),
    [],
  );
});

test('link policy rejects Wikipedia, HTTP, external quran.com, hyphenated ibn-kathir, unbuilt books/surahs, and unknown hosts', () => {
  assert.equal(validateHref('https://en.wikipedia.org/wiki/Papyrus_66').ok, false);
  assert.equal(validateHref('http://papyri.info/dclp/64184').ok, false);
  assert.equal(validateHref('https://cudl.lib.cam.ac.uk/view/MS-ADD-04413/1').ok, false);
  assert.equal(validateHref('https://quran.com/4/171').ok, false);
  assert.equal(validateHref('/quran/4/171').ok, false);
  assert.equal(validateHref('/quran/4/171/tafsir/ibn-kathir').ok, false);
  assert.equal(validateHref('/quran/2/255/tafsir/tabari').ok, false);
  assert.equal(validateHref('/bible/heb/1#8').ok, false);
  assert.equal(validateHref('//evil.example/x').ok, false);
  assert.equal(validateHref('/bible/jn/1#1').ok, true);
  assert.equal(validateHref('/bible/ps/44#6').ok, true);
  assert.equal(validateHref('/quran/4/171/tafsir/tabari').ok, true);
  assert.equal(validateHref('/quran/4/171/tafsir/ibn_kathir').ok, true);
  assert.equal(validateHref('/quran/9/30/tafsir/tabari').ok, true);
  assert.equal(validateHref('https://papyri.info/dclp/64184').ok, true);
  assert.equal(validateHref('https://grbs.library.duke.edu/index.php/grbs/article/view/15935').ok, true);
  assert.equal(validateHref('https://www.hadashot-esi.org.il/report_detail_eng.aspx?id=363&mag_id=111').ok, true);
  assert.equal(validateHref('https://archive.org/details/orientisgraeciin02dittuoft').ok, true);
});

test('internal /bible and /quran links carry data-astro-prefetch="false" and readJpegDimensions rejects non-JPEG buffers', () => {
  assert.match(
    renderInlineMarkdown('See [John 1:1](/bible/jn/1#1) and [Qurʾān 4:171](/quran/4/171/tafsir/tabari).'),
    /<a href="\/bible\/jn\/1#1" data-astro-prefetch="false">John 1:1<\/a>[\s\S]*<a href="\/quran\/4\/171\/tafsir\/tabari" data-astro-prefetch="false">Qurʾān 4:171<\/a>/,
  );
  assert.doesNotMatch(
    renderInlineMarkdown('See [Islamic Dilemma](/discover/islamic-dilemma).'),
    /data-astro-prefetch/,
  );

  const page = buildDivinityTimelinePage(REPO_ROOT);
  assert.match(
    page.framing.hypothesesHtml,
    /href="\/quran\/4\/171\/tafsir\/tabari" data-astro-prefetch="false"/,
  );
  let internalVerifyCount = 0;
  for (const sec of page.sections) {
    for (const card of sec.cards) {
      for (const lnk of card.verifyLinks) {
        if (/^\/(bible|quran)\//.test(lnk.href)) {
          internalVerifyCount += 1;
          assert.equal(lnk.noPrefetch, true, `expected noPrefetch on ${lnk.href}`);
        } else {
          assert.equal(lnk.noPrefetch, false);
        }
      }
    }
  }
  assert.ok(internalVerifyCount >= 5, `expected >= 5 internal scripture verify links, got ${internalVerifyCount}`);

  // Non-JPEG buffers (e.g. PNG header, truncated buffer, or invalid segLen < 2) must return null immediately
  const fakePngWithMarker = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x01, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00,
  ]);
  assert.equal(readJpegDimensions(fakePngWithMarker), null);
  assert.equal(readJpegDimensions(Buffer.from([0xff])), null);
  const corruptSegLen = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x01, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x01, 0x00, 0x02, 0x00,
  ]);
  assert.equal(readJpegDimensions(corruptSegLen), null);

  // Balanced parentheses in URLs, nested editorial brackets in labels, and SOURCES_GROUPS external-only guard
  const anchors = new Set();
  const parenMd =
    'Compare [P.Bodmer XIV–XV [𝔓75]](https://doi.org/10.1000/(SICI)1097-0258) and [Line 01](#inscriptions-and-archaeology).';
  const parenHtml = renderInlineMarkdown(parenMd, 'test', anchors);
  assert.match(
    parenHtml,
    /<a href="https:\/\/doi\.org\/10\.1000\/\(SICI\)1097-0258" target="_blank" rel="noopener noreferrer">P\.Bodmer XIV–XV \[𝔓75\]<\/a>/,
  );
  assert.ok(anchors.has('inscriptions-and-archaeology'));
  assert.deepEqual(extractMarkdownLinks(parenMd), [
    { label: 'P.Bodmer XIV–XV [𝔓75]', href: 'https://doi.org/10.1000/(SICI)1097-0258' },
    { label: 'Line 01', href: '#inscriptions-and-archaeology' },
  ]);

  assert.equal(
    assertExternalSourceHref('https://papyri.info/dclp/64184', 'sources.test').kind,
    'external',
  );
  assert.throws(
    () => assertExternalSourceHref('/bible/jn/1#1', 'sources.test'),
    /SOURCES_GROUPS requires an external https:\/\/ URL/,
  );
  assert.throws(
    () => assertExternalSourceHref('#event-megiddo_mosaic', 'sources.test'),
    /SOURCES_GROUPS requires an external https:\/\/ URL/,
  );
});

test('JSON-LD emits distinct 3-item BreadcrumbList and Article with scholarly citations', () => {
  const page = buildDivinityTimelinePage(REPO_ROOT);
  assert.equal(page.jsonLd.length, 2);
  const [crumbs, article] = page.jsonLd;
  assert.equal(crumbs['@type'], 'BreadcrumbList');
  assert.equal(crumbs.itemListElement.length, 3);
  const urls = new Set(crumbs.itemListElement.map((x) => x.item));
  assert.equal(urls.size, 3);
  assert.equal(article['@type'], 'Article');
  assert.ok(article.citation.length >= 16);
});

test('Pass 6 primary-source fact-check invariants hold across barcodes, folios, editions, and typography', () => {
  const page = buildDivinityTimelinePage(REPO_ROOT);

  // 1. Verified Bodmer Lab barcodes (PB 2 = 1072205287, PB C = 1072205366, PB P = 1072205358)
  assert.ok(
    DATASET_OVERRIDES.papyrus_66_john_1_1.verifyLinks.some((l) =>
      l.href.endsWith('/barcode/1072205287'),
    ),
  );
  assert.ok(
    DATASET_OVERRIDES.papyrus_bodmer_xiii.verifyLinks.some((l) =>
      l.href.endsWith('/barcode/1072205366'),
    ),
  );
  assert.ok(
    DATASET_OVERRIDES.papyrus_bodmer_xx.verifyLinks.some((l) =>
      l.href.endsWith('/barcode/1072205358'),
    ),
  );

  // 2. P66 f. 1r = John 1:1–14a and John 1:18 = f. 1v; P46 quotes extant Col 1:16–17 (not lacunose 1:15)
  assert.match(DATASET_OVERRIDES.papyrus_66_john_1_1.image.caption, /John 1:1–14a/);
  assert.match(DATASET_OVERRIDES.papyrus_66_john_1_1.quoteOriginal, /\[John 1:18 in 𝔓66 f\. 1v\]/);
  assert.doesNotMatch(DATASET_OVERRIDES.papyrus_46_philippians_2_6.quoteOriginal, /πρωτότοκος πάσης κτίσεως/);
  assert.match(DATASET_OVERRIDES.papyrus_46_philippians_2_6.quoteOriginal, /\[Col 1:16–17 in 𝔓46\]/);

  // 3. Dura-Europos Welles nos. 17–18, Solin no. ∗2, Ramsay pp. 353–395, P.Oxy. III 407 pp. 12–13
  assert.match(DATASET_OVERRIDES.dura_europos_church.editionCitation, /nos\. 17–18/);
  assert.match(DATASET_OVERRIDES.dura_europos_church.quoteOriginal, /\[Πρ\]όκλου[\s\S]*Σισέον/);
  assert.match(DATASET_OVERRIDES.alexamenos_graffito.analysisMarkdown, /no\. ∗2/);
  assert.match(DATASET_OVERRIDES.eumeneian_formula_inscriptions.summaryMarkdown, /pp\. 353–395/);
  assert.match(DATASET_OVERRIDES.papyrus_oxyrhynchus_407.summaryMarkdown, /pp\. 12–13/);

  // 4. Zero straight ASCII double quotes or raw combining overbars in rendered HTML text
  const htmlChunks = [
    ...page.introParagraphs,
    page.framing.hypothesesHtml,
    ...page.framing.tiers.map((t) => t.bodyHtml),
    ...page.timelineShowcase.events.map((e) => e.detailHtml),
    ...page.glanceRows.map((g) => g.summaryHtml),
    ...page.sections.flatMap((s) => [
      s.leadHtml,
      s.historiography.hypothesisHtml,
      ...s.historiography.assessmentItemsHtml,
      ...s.cards.flatMap((c) => [
        c.languageHtml,
        c.image?.captionHtml || '',
        c.keyExcerptHtml,
        c.quoteOriginalHtml,
        c.quoteTranslationHtml,
        c.showsHtml,
        c.editionCitationHtml,
        c.analysisHtml,
        ...c.groupedWitnesses.map((g) => g.summaryHtml),
      ]),
    ]),
    page.methodology.leadHtml,
    ...page.methodology.principles.map((p) => p.bodyHtml),
    page.methodology.excludedDisclosure.introHtml,
    ...page.methodology.excludedDisclosure.items.map((i) => i.exclusionReasonHtml),
    ...page.sourcesGroups.flatMap((g) => g.items.flatMap((it) => [it.titleHtml, it.noteHtml])),
  ];
  for (const chunk of htmlChunks) {
    const stripped = chunk.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"');
    assert.ok(!/"/.test(stripped), `straight ASCII quote found in: ${stripped.slice(0, 120)}`);
    assert.ok(!/[\u0305\u035E]/.test(stripped), `raw combining overbar found in: ${stripped.slice(0, 120)}`);
  }
});
